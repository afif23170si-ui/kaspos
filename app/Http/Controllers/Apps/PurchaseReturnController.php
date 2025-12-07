<?php

namespace App\Http\Controllers\Apps;

use App\Models\Stock;
use App\Models\Setting;
use App\Models\Supplier;
use App\Models\OrderDetail;
use Illuminate\Http\Request;
use App\Models\StockMovement;
use App\Models\PurchaseReturn;
use Illuminate\Support\Carbon;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Support\Facades\DB;
use App\Http\Controllers\Controller;
use App\Http\Requests\PurchaseReturnRequest;
use Illuminate\Routing\Controllers\Middleware;
use Illuminate\Routing\Controllers\HasMiddleware;

class PurchaseReturnController extends Controller implements HasMiddleware
{
    /**
     * Define middleware for the PurchaseReturnController.
     */
    public static function middleware()
    {
        return [
            new Middleware('permission:purchase-returns-data', only: ['index']),
            new Middleware('permission:purchase-returns-create', only: ['store', 'create']),
            new Middleware('blockIfOpname', only: ['store', 'create']),
            new Middleware('permission:purchase-returns-update', only: ['update', 'edit']),
            new Middleware('blockIfOpname', only: ['update', 'edit']),
            new Middleware('permission:purchase-returns-delete', only: ['destroy']),
            new Middleware('permission:purchase-returns-show', only: ['show']),
        ];
    }

    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        // request page data
        $currentPage = $request->input('page', 1);
        $perPage = $request->input('per_page', 10);

        // get all purchase return
        $purchaseReturns = PurchaseReturn::query()
            ->with('order', 'order.supplier')
            ->select('id', 'order_id', 'return_code', 'return_date', 'grand_total', 'status', 'refund_method', 'notes', 'created_by')
            ->when($request->search, fn($search) => $search->where('order_code', 'like', "%{$request->search}%"))
            ->latest()
            ->paginate($perPage, ['*'], 'page', $currentPage)->withQueryString();

        $purchaseReturns->getCollection()->transform(function($order){
            $order->grand_total = number_format($order->grand_total, 0);

            return $order;
        });

        // render view
        return inertia('apps/purchase-returns/index', [
            'purchaseReturns' => $purchaseReturns,
            'currentPage' => $currentPage,
            'perPage' => $perPage,
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        // get all suppliers
        $suppliers = Supplier::orderBy('name')->get();

        // generate return code
        $randomNumber = str_pad(rand(0, 9999), 4, '0', STR_PAD_LEFT);
        $return_code = 'RPB' . Carbon::today()->format('dmY') . $randomNumber;

        // render view
        return inertia('apps/purchase-returns/create', [
            'suppliers' => $suppliers,
            'returnCode' => $return_code
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(PurchaseReturnRequest $request)
    {
        DB::transaction(function() use($request){
            // create purchase return
            $purchase = PurchaseReturn::create([
                'order_id' => $request->selectedOrder,
                'return_code' => $request->return_code,
                'return_date' => $request->purchase_return_date,
                'notes' => $request->note,
                'refund_method' => $request->refund_method,
                'status' => $request->status,
                'grand_total' => $request->sub_total,
                'created_by' => $request->user()->id,
            ]);

            // loop selected return
            collect($request->selectedReturn)->each(function ($item) use($purchase, $request){
                // create new purchase return detail
                $purchase->details()->create([
                    'order_detail_id' => $item['id'],
                    'quantity' => $item['retur_quantity'],
                    'reason' => $item['reason'],
                    'expired_at' => $item['expired_at'],
                ]);

                // get order detail data
                $order_detail = OrderDetail::findOrFail($item['id']);

                // get order data
                $order = $order_detail->order;

                // do when status confirmed
                if($request->status == 'confirmed'){
                    // generate batch code
                    $batchCode = 'PBLN-'.Carbon::parse($order->order_date)->format('Ymd').'-'.strtoupper($order->order_code);

                    // get stock by batch code and product id
                    $stock = Stock::where('batch_code', $batchCode)
                        ->where('stockable_id', $item['product_id'])
                        ->first();

                    // do when have stock
                    if($stock){
                        if($purchase->refund_method == 'debt_reduction')
                            $description = 'Debt reduction stock for return '.$purchase->return_code.' (Order '.$order->order_code.')';
                        elseif($purchase->refund_method == 'refund')
                            $description = 'Refund stock for return '.$purchase->return_code.' (Order '.$order->order_code.')';
                        else
                            $description = 'Replacement stock for return '.$purchase->return_code.' (Order '.$order->order_code.')';

                        // create movement stock
                        StockMovement::create([
                            'stock_id' => $stock->id,
                            'type' => 'out',
                            'quantity' => $item['retur_quantity'],
                            'description' => $description
                        ]);

                        // do when refund method replacement
                        if($request->refund_method == 'replacement'){
                            // create new stock
                            $stock = $order_detail->items->stocks()->create([
                                'batch_code' => 'RTPB-'.Carbon::parse($request->return_date)->format('Ymd').'-'.strtoupper($purchase->return_code),
                                'quantity' => $item['quantity'],
                                'expired_at' => $item['expired_at'],
                            ]);

                            // create new stock movements
                            $stock->movements()->create([
                                'type' => 'in',
                                'quantity' => $item['retur_quantity'],
                                'description' => 'Replacement stock for return '.$purchase->return_code.' (Order '.$order->order_code.')',
                            ]);
                        }
                    }

                    // do when refund method debt_reduction
                    if($request->refund_method == 'debt_reduction')
                        $order->order_payments()->create([
                            'paid_at' => Carbon::now()->format('Y-m-d'),
                            'amount' => $request->sub_total,
                            'payment_method' => 'retur'
                        ]);
                }
            });
        });

        // render view
        return to_route('apps.purchase-returns.index');
    }

    /**
     * Display the specified resource.
     */
    public function show(PurchaseReturn $purchaseReturn)
    {
        // load relationship
        $purchaseReturn->load([
            'order',
            'order.supplier',
            'details',
            'details.order_detail',
            'details.order_detail.order',
            'details.order_detail.items' => function ($morphTo) {
                $morphTo->morphWith([
                    \App\Models\ProductVariant::class => ['product', 'unit', 'product_variant_values', 'product_variant_values.variant_value', 'product_variant_values.variant_value.variant_option'],
                    \App\Models\Material::class => ['unit'],
                ]);
            },
        ]);

        $purchaseReturn->grand_total = number_format($purchaseReturn->grand_total, 0);
        $purchaseReturn->details->each(function($item){
            $item->total_price = number_format($item->quantity * $item->order_detail->price, 0);
            $item->order_detail->price = number_format($item->order_detail->price, 0);
        });

        // render view
        return inertia('apps/purchase-returns/show', [
            'purchaseReturn' => $purchaseReturn,
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(PurchaseReturn $purchaseReturn)
    {
        // get all suppliers
        $suppliers = Supplier::orderBy('name')->get();

        // load relationship
        $purchaseReturn->load([
            'order',
            'order.supplier',
            'details',
            'details.order_detail',
            'details.order_detail.order',
            'details.order_detail.items' => function ($morphTo) {
                $morphTo->morphWith([
                    \App\Models\ProductVariant::class => ['product', 'unit', 'product_variant_values', 'product_variant_values.variant_value', 'product_variant_values.variant_value.variant_option'],
                    \App\Models\Material::class => ['unit'],
                ]);
            },
        ]);

        // render view
        return inertia('apps/purchase-returns/edit', [
            'purchaseReturn' => $purchaseReturn,
            'suppliers' => $suppliers,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(PurchaseReturnRequest $request, PurchaseReturn $purchaseReturn)
    {
        DB::transaction(function() use($request, $purchaseReturn){
            // update purchase return
            $purchaseReturn->update([
                'order_id' => $request->selectedOrder,
                'return_code' => $request->return_code,
                'return_date' => $request->purchase_return_date,
                'notes' => $request->note,
                'refund_method' => $request->refund_method,
                'grand_total' => $request->sub_total,
                'created_by' => $request->user()->id,
            ]);

            // current items and pluck
            $currentItems = collect($request->selectedReturn)->pluck('id')->toArray();

            // delete order_details where not in request
            $purchaseReturn->details()->whereNotIn('order_detail_id', $currentItems)->delete();

            // loop selected return
            collect($request->selectedReturn)->each(function ($item) use($purchaseReturn, $request){
                // create new purchase return detail
                $purchaseReturn->details()->updateOrCreate([
                    'order_detail_id' => $item['id']
                ],[
                    'order_detail_id' => $item['id'],
                    'quantity' => $item['retur_quantity'],
                    'reason' => $item['reason'],
                    'expired_at' => $item['expired_at'],
                ]);

                // get order detail data
                $order_detail = OrderDetail::findOrFail($item['id']);

                // get order data
                $order = $order_detail->order;

                // do when status confirmed
                if($request->status == 'confirmed' && $purchaseReturn->status != 'confirmed'){
                    // generate batch code
                    $batchCode = 'PBLN-'.Carbon::parse($order->order_date)->format('Ymd').'-'.strtoupper($order->order_code);

                    // get stock by batch code and product id
                    $stock = Stock::where('batch_code', $batchCode)
                        ->where('stockable_id', $item['product_id'])
                        ->first();

                    // do when have stock
                    if($stock){
                        if($purchaseReturn->refund_method == 'debt_reduction')
                            $description = 'Debt reduction stock for return '.$purchaseReturn->return_code.' (Order '.$order->order_code.')';
                        elseif($purchaseReturn->refund_method == 'refund')
                            $description = 'Refund stock for return '.$purchaseReturn->return_code.' (Order '.$order->order_code.')';
                        else
                            $description = 'Replacement stock for return '.$purchaseReturn->return_code.' (Order '.$order->order_code.')';

                        // create movement stock
                        StockMovement::create([
                            'stock_id' => $stock->id,
                            'type' => 'out',
                            'quantity' => $item['retur_quantity'],
                            'description' => $description
                        ]);

                        // do when refund method replacement
                        if($request->refund_method == 'replacement'){
                            // create new stock
                            $stock = $order_detail->items->stocks()->create([
                                'batch_code' => 'RTPB-'.Carbon::parse($request->return_date)->format('Ymd').'-'.strtoupper($purchaseReturn->return_code),
                                'quantity' => $item['quantity'],
                                'expired_at' => $item['expired_at'],
                            ]);

                            // create new stock movements
                            $stock->movements()->create([
                                'type' => 'in',
                                'quantity' => $item['retur_quantity'],
                                'description' => 'Replacement stock for return '.$purchaseReturn->return_code.' (Order '.$order->order_code.')',
                            ]);
                        }
                    }

                    // do when refund method debt_reduction
                    if($request->refund_method == 'debt_reduction')
                        $order->order_payments()->create([
                            'paid_at' => Carbon::now()->format('Y-m-d'),
                            'amount' => $request->sub_total,
                            'payment_method' => 'retur'
                        ]);
                }
            });

            $purchaseReturn->update([
                'status' => $request->status,
            ]);
        });

        // render view
        return to_route('apps.purchase-returns.index');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(PurchaseReturn $purchaseReturn)
    {
        // delete purchase order
        $purchaseReturn->delete();

        // render view
        return back();
    }

    public function downloadInvoice(PurchaseReturn $purchaseReturn)
    {
        $purchaseReturn->load([
            'order',
            'order.supplier',
            'details',
            'details.order_detail',
            'details.order_detail.order',
            'details.order_detail.items' => function ($morphTo) {
                $morphTo->morphWith([
                    \App\Models\ProductVariant::class => [
                        'product',
                        'unit',
                        'product_variant_values',
                        'product_variant_values.variant_value',
                        'product_variant_values.variant_value.variant_option'
                    ],
                    \App\Models\Material::class => ['unit'],
                ]);
            },
        ]);

        $purchaseReturn->details->each(function ($item) {
            $item->total_price = $item->quantity * $item->order_detail->price;
        });

        $codes = ['NAME', 'ADDRESS', 'PHONE', 'LOGO'];
        $settings = Setting::query()
            ->where('is_active', true)
            ->whereIn('code', $codes)
            ->pluck('value', 'code');

        $logoValue = $settings['LOGO'] ?? null;

        $logoAbsPath = null;
        if ($logoValue) {
            $maybePath = parse_url($logoValue, PHP_URL_PATH) ?: $logoValue;
            $maybePath = ltrim($maybePath, '/');
            $absPath   = public_path($maybePath);
            if (is_file($absPath)) {
                $logoAbsPath = $absPath;
            }
        }

        $logoFile = $logoAbsPath ?: public_path('NoImage.png');
        $logoDataUri = null;
        if (is_file($logoFile)) {
            $mime = mime_content_type($logoFile) ?: 'image/png';
            $logoDataUri = 'data:' . $mime . ';base64,' . base64_encode(file_get_contents($logoFile));
        }

        $store = [
            'name'          => $settings['NAME']    ?? 'Wioos',
            'addr'          => $settings['ADDRESS'] ?? '-',
            'phone'         => $settings['PHONE']   ?? '-',
            'logo_data_uri' => $logoDataUri,
        ];

        $pdf = Pdf::setOptions([
                'isRemoteEnabled' => true,
            ])
            ->loadView('pdf.invoice-returns', [
                'purchaseReturn' => $purchaseReturn,
                'store'          => $store,
            ]);

        return $pdf->download("Invoice-Retur-{$purchaseReturn->return_code}.pdf");
    }
}

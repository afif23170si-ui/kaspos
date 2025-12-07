<?php

namespace App\Http\Controllers\Apps;

use App\Models\Order;
use App\Models\Stock;
use App\Models\Setting;
use App\Models\Material;
use App\Models\Supplier;
use App\Models\BankAccount;
use Illuminate\Support\Str;
use Illuminate\Http\Request;
use App\Models\ProductVariant;
use Illuminate\Support\Carbon;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Support\Facades\DB;
use App\Http\Requests\OrderRequest;
use App\Http\Controllers\Controller;
use Illuminate\Routing\Controllers\Middleware;
use Illuminate\Routing\Controllers\HasMiddleware;

class OrderController extends Controller implements HasMiddleware
{
    /**
     * Define middleware for the OrderController.
     */
    public static function middleware()
    {
        return [
            new Middleware('permission:orders-data', only: ['index']),
            new Middleware('permission:orders-create', only: ['store', 'create']),
            new Middleware('blockIfOpname', only: ['store', 'create']),
            new Middleware('permission:orders-update', only: ['update', 'edit']),
            new Middleware('blockIfOpname', only: ['update', 'edit']),
            new Middleware('permission:orders-delete', only: ['destroy']),
            new Middleware('permission:orders-show', only: ['show']),
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

        // get all orders
        $orders = Order::query()
            ->select('id', 'order_code', 'supplier_id', 'order_date', 'type', 'grand_total', 'order_status', 'payment_status')
            ->with('supplier')
            ->when($request->search, fn($search) => $search->where('order_code', 'like', "%{$request->search}%"))
            ->latest()
            ->paginate($perPage, ['*'], 'page', $currentPage)->withQueryString();

        $orders->getCollection()->transform(function($order){
            $order->grand_total = number_format($order->grand_total, 0);

            return $order;
        });

        // render view
        return inertia('apps/orders/index', [
            'orders' => $orders,
            'currentPage' => $currentPage,
            'perPage' => $perPage,
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        // get all suppliers data
        $suppliers = Supplier::select('id', 'name', 'code')->orderBy('name')->get();

        // get all materials data
        $materials = Material::with('unit')->select('id', 'name', 'unit_id', 'price')->orderBy('name')->get();

        // get all products data
        $products = ProductVariant::with('product', 'unit', 'product_variant_values', 'product_variant_values.variant_value', 'product_variant_values.variant_value.variant_option')->get();

        // get all banks account
        $banks = BankAccount::select('id', 'bank_name', 'account_name', 'account_number')->get();

        // generate order code
        $randomNumber = str_pad(rand(0, 9999), 4, '0', STR_PAD_LEFT);
        $order_code = 'PB' . Carbon::today()->format('dmY') . $randomNumber;

        // render view
        return inertia('apps/orders/create', [
            'suppliers' => $suppliers,
            'materials' => $materials,
            'products' => $products,
            'banks' => $banks,
            'orderCode' => $order_code
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(OrderRequest $request)
    {
        DB::transaction(function() use($request){
            // create order
            $order = Order::create([
                'order_code' => $request->order_code,
                'supplier_id' => $request->supplier_id,
                'order_date' => $request->order_date,
                'type' => $request->type,
                'discount' => $request->discount,
                'discount_type' => $request->discount_type,
                'subtotal' => $request->sub_total,
                'grand_total' => $request->grand_total,
                'order_status' => $request->order_status,
                'notes' => $request->notes,
                'created_by' => $request->user()->id,
            ]);

            // create order details
            collect($request->items)->each(function ($item) use ($order, $request) {
                $model = null;
                $itemId = $item['item'];

                if ($request->type == 'products')
                    $model = \App\Models\ProductVariant::class;
                else
                    $model = \App\Models\Material::class;

                $order_detail = $order->order_details()->create([
                    'items_type' => $model,
                    'items_id' => $itemId,
                    'quantity' => $item['quantity'],
                    'price' => $item['price'],
                    'expired_at' => $item['expired_at'] ?? null,
                ]);

                if($request->order_status == 'received'){
                    // create new stock
                    $stock = $order_detail->items->stocks()->create([
                        'batch_code' => 'PBLN-'.Carbon::parse($request->order_date)->format('Ymd').'-'.strtoupper($order->order_code),
                        'quantity' => $item['quantity'],
                        'expired_at' => $item['expired_at'],
                    ]);

                    // create new stock movements
                    $stock->movements()->create([
                        'type' => 'in',
                        'quantity' => $stock->quantity,
                        'description' => 'Order Stock ' . $order->order_code,
                    ]);
                }
            });

            if($request->withPayment){
                // create order payments
                collect($request->payments)->each(function($item) use($order){
                    $order->order_payments()->create([
                        'bank_account_id' => $item['payment_account'],
                        'paid_at' => $item['payment_date'],
                        'amount' => $item['total_pay'],
                        'payment_method' => $item['payment_method']
                    ]);
                });

                // update order payment status
                if($request->total_payment == $request->grand_total)
                    $order->update(['payment_status' => 'paid']);
                elseif($request->total_payment < $request->grand_total)
                    $order->update(['payment_status' => 'partial']);
            }
        });

        // render view
        return to_route('apps.orders.index');
    }


    /**
     * Display the specified resource.
     */
    public function show(Order $order)
    {
        // load relationship
        $order->load([
            'supplier',
            'order_details',
            'order_details.items' => function ($morphTo) {
                $morphTo->morphWith([
                    \App\Models\ProductVariant::class => ['product', 'unit', 'product_variant_values', 'product_variant_values.variant_value', 'product_variant_values.variant_value.variant_option'],
                    \App\Models\Material::class => ['unit'],
                ]);
            },
            'order_payments',
            'order_payments.bank_account',
            'purchase_return',
            'purchase_return.details',
            'purchase_return.details.order_detail',
            'purchase_return.details.order_detail.items' => function($morphTo) {
                $morphTo->morphWith([
                    \App\Models\ProductVariant::class => ['product', 'unit', 'product_variant_values', 'product_variant_values.variant_value', 'product_variant_values.variant_value.variant_option'],
                    \App\Models\Material::class => ['unit'],
                ]);
            }
        ]);
        if($order->purchase_return){
            $order->purchase_return->grand_total = number_format($order->purchase_return->grand_total, 0);
            $order->purchase_return->details->each(function($item){
                $item->total_price = number_format($item->quantity * $item->order_detail->price);
                $item->order_detail->price = number_format($item->order_detail->price, 0);
            });
        }
        $order->remaining_payment = number_format($order->grand_total - $order->order_payments->sum('amount'), 0);
        $order->discount = $order->discount_type == 'rupiah' ? number_format($order->discount, 0) : $order->discount;
        $order->subtotal = number_format($order->subtotal, 0);
        $order->grand_total = number_format($order->grand_total, 0);
        $order->order_details->each(function($item){
            $item->expired_at = $item->expired_at ? Carbon::parse($item->expired_at)->format('d/m/Y') : '-';
            $item->total_price = number_format($item->price * $item->quantity, 0);
            $item->price = number_format($item->price, 0);

            return $item;
        });
        $order->total_payment = number_format($order->order_payments->sum('amount'), 0);
        $order->order_payments->each(function($item){
            $item->amount = number_format($item->amount, 0);

            return $item;
        });

        // render view
        return inertia('apps/orders/show', [
            'order' => $order
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Order $order)
    {
        // get all suppliers data
        $suppliers = Supplier::select('id', 'name', 'code')->orderBy('name')->get();

        // get all materials data
        $materials = Material::with('unit')->select('id', 'name', 'unit_id', 'price')->orderBy('name')->get();
        // get all products data
        $products = ProductVariant::with('product', 'unit', 'product_variant_values', 'product_variant_values.variant_value', 'product_variant_values.variant_value.variant_option')->get();

        // get all banks account
        $banks = BankAccount::select('id', 'bank_name', 'account_name', 'account_number')->get();

        // load relationship
        $order->load([
            'order_details',
            'order_details.items' => function ($morphTo) {
                $morphTo->morphWith([
                    \App\Models\ProductVariant::class => ['product', 'unit', 'product_variant_values', 'product_variant_values.variant_value', 'product_variant_values.variant_value.variant_option'],
                    \App\Models\Material::class => ['unit'],
                ]);
            },
            'order_payments'
        ]);

        // render view
        return inertia('apps/orders/edit', [
            'suppliers' => $suppliers,
            'materials' => $materials,
            'products' => $products,
            'order' => $order,
            'banks' => $banks,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(OrderRequest $request, Order $order)
    {
        DB::transaction(function() use($request, $order){
            if ($request->type == 'products')
                $model = \App\Models\ProductVariant::class;
            else
                $model = \App\Models\Material::class;

            // create order
            $order->update([
                'order_code' => $request->order_code,
                'supplier_id' => $request->supplier_id,
                'order_date' => $request->order_date,
                'type' => $request->type,
                'discount' => $request->discount,
                'discount_type' => $request->discount_type,
                'subtotal' => $request->sub_total,
                'grand_total' => $request->grand_total,
                'notes' => $request->notes,
                'created_by' => $request->user()->id,
            ]);

            // current items and pluck
            $currentItems = collect($request->items)->pluck('item')->toArray();

            // delete order_details where not in request
            $order->order_details()->whereNotIn('items_id', $currentItems)->where('items_type', $model)->delete();

            if($request->order_status != 'received'){
                // Generate batch code
                $batchCode = 'PBLN-'.Carbon::parse($order->order_date)->format('Ymd').'-'.strtoupper($order->order_code);

                // delete stock
                Stock::where('batch_code', $batchCode)->delete();
            }

            // create order details
            collect($request->items)->each(function ($item) use ($order, $request, $model) {
                $itemId = $item['item'];

                $order_detail = $order->order_details()->updateOrCreate([
                    'items_id' => $itemId,
                    'items_type' => $model
                ],[
                    'items_type' => $model,
                    'items_id' => $itemId,
                    'quantity' => $item['quantity'],
                    'price' => $item['price'],
                    'expired_at' => $item['expired_at'] ?? null,
                ]);

                if($request->order_status == 'received' && $order->order_status != 'received'){
                    // create new stock
                    $stock = $order_detail->items->stocks()->create([
                        'batch_code' => 'PBLN-'.Carbon::parse($request->order_date)->format('Ymd').'-'.strtoupper($order->order_code),
                        'quantity' => $item['quantity'],
                        'expired_at' => $item['expired_at'],
                    ]);

                    // create new stock movements
                    $stock->movements()->create([
                        'type' => 'in',
                        'quantity' => $stock->quantity,
                        'description' => 'Order Stock ' . $order->order_code,
                    ]);
                }
            });

            if($request->withPayment){
                // create order payments
                collect($request->payments)->each(function ($item) use($order){
                    $order->order_payments()->updateOrCreate([
                        'paid_at' => $item['payment_date'],
                        'payment_method' => $item['payment_method']
                    ], [
                        'paid_at' => $item['payment_date'],
                        'payment_method' => $item['payment_method'],
                        'bank_account_id' => $item['payment_account'] ?? null,
                        'amount' => $item['total_pay'],
                    ]);
                });

                // update order payment status
                if($request->total_payment == $request->grand_total)
                    $order->update(['payment_status' => 'paid']);
                elseif($request->total_payment < $request->grand_total)
                    $order->update(['payment_status' => 'partial']);
            }

            $order->update([
                'order_status' => $request->order_status
            ]);
        });

        // render view
        return to_route('apps.orders.index');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Order $order)
    {
        // delete order
        $order->delete();

        // delete stock
        Stock::where('batch_code', 'PBLN-'.Carbon::parse($order->order_date)->format('Ymd').'-'.strtoupper($order->order_code))->delete();

        // render view
        return back();
    }

    public function downloadInvoice(Order $order)
    {
        $order->load([
            'order_details',
            'order_payments.bank_account',
        ]);

        $order->order_details->each(function ($item) {
            $item->total_price = $item->price * $item->quantity;
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

        $logoUrl = $logoValue
            ? (Str::startsWith($logoValue, ['http://', 'https://']) ? $logoValue : asset($logoValue))
            : asset('NoImage.png');

        $logoFileForEmbedding = $logoAbsPath ?: public_path('NoImage.png');
        $logoDataUri = null;
        if (is_file($logoFileForEmbedding)) {
            $mime = mime_content_type($logoFileForEmbedding) ?: 'image/png';
            $logoDataUri = 'data:' . $mime . ';base64,' . base64_encode(file_get_contents($logoFileForEmbedding));
        }

        $store = [
            'name'          => $settings['NAME']    ?? 'Wioos',
            'addr'          => $settings['ADDRESS'] ?? '-',
            'phone'         => $settings['PHONE']   ?? '-',
            'logo_url'      => $logoUrl,
            'logo_path'     => $logoAbsPath ?: public_path('NoImage.png'),
            'logo_data_uri' => $logoDataUri,
        ];

        $pdf = Pdf::setOptions([
                'isRemoteEnabled' => true,
            ])
            ->loadView('pdf.invoice-orders', compact('order', 'store'));

        return $pdf->download("Invoice-{$order->order_code}.pdf");
    }
}

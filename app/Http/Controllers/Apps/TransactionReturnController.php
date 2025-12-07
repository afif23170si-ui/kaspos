<?php

namespace App\Http\Controllers\Apps;

use App\Models\Stock;
use App\Models\Setting;
use App\Models\Customer;
use Illuminate\Http\Request;
use App\Models\StockMovement;
use Illuminate\Support\Carbon;
use Barryvdh\DomPDF\Facade\Pdf;
use App\Models\TransactionDetail;
use App\Models\TransactionReturn;
use Illuminate\Support\Facades\DB;
use App\Http\Controllers\Controller;
use App\Models\TransactionReturnDetail;
use Illuminate\Routing\Controllers\Middleware;
use App\Http\Requests\TransactionReturnRequest;
use Illuminate\Routing\Controllers\HasMiddleware;

class TransactionReturnController extends Controller implements HasMiddleware
{
    /**
     * Define middleware for the PurchaseReturnController.
     */
    public static function middleware()
    {
        return [
            new Middleware('permission:transaction-returns-data', only: ['index']),
            new Middleware('permission:transaction-returns-create', only: ['store', 'create']),
            new Middleware('blockIfOpname', only: ['store', 'create']),
            new Middleware('permission:transaction-returns-update', only: ['update', 'edit']),
            new Middleware('blockIfOpname', only: ['update', 'edit']),
            new Middleware('permission:transaction-returns-delete', only: ['destroy']),
            new Middleware('permission:transaction-returns-show', only: ['show']),
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

        // get all transaction return
        $transactionReturns = TransactionReturn::query()
            ->with('transaction', 'transaction.customer')
            ->when($request->search, fn($search) => $search->where('order_code', 'like', "%{$request->search}%"))
            ->latest()
            ->paginate($perPage, ['*'], 'page', $currentPage)->withQueryString();

        $transactionReturns->getCollection()->transform(function($order){
            $order->grand_total = number_format($order->grand_total, 0);

            return $order;
        });

        // render view
        return inertia('apps/transaction-returns/index', [
            'transactionReturns' => $transactionReturns,
            'currentPage' => $currentPage,
            'perPage' => $perPage,
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        // get all customers
        $customers = Customer::orderBy('name')->get();
        $customers->prepend([
            'id' => 0,
            'name' => 'Umum',
            'phone' => '-',
        ]);

        // generate return code
        $randomNumber = str_pad(rand(0, 9999), 4, '0', STR_PAD_LEFT);
        $return_code = 'RPJ' . Carbon::today()->format('dmY') . $randomNumber;

        // render view
        return inertia('apps/transaction-returns/create', [
            'customers' => $customers,
            'returnCode' => $return_code
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(TransactionReturnRequest $request)
    {
        DB::transaction(function() use($request){
            // create transaction return
            $returnTransaction = TransactionReturn::create([
                'transaction_id' => $request->selectedTransaction,
                'return_code' => $request->return_code,
                'return_date' => $request->purchase_return_date,
                'notes' => $request->note,
                'refund_method' => $request->refund_method,
                'status' => $request->status,
                'grand_total' => $request->sub_total,
                'created_by' => $request->user()->id,
            ]);

            // loop selected return
            collect($request->selectedReturn)->each(function ($item) use($returnTransaction, $request){
                // create new purchase return detail
                $returnTransaction->details()->create([
                    'transaction_detail_id' => $item['id'],
                    'quantity' => $item['retur_quantity'],
                    'reason' => $item['reason'],
                ]);

                // get order detail data
                $transaction_detail = TransactionDetail::findOrFail($item['id']);

                // get order data
                $transaction = $transaction_detail->transaction;

                // do when status confirmed
                if($request->status == 'confirmed' && $request->refund_method == 'replacement'){
                    // create new stock
                    $stock = $transaction_detail->items->stocks()->create([
                        'batch_code' => 'RTPJ-'.Carbon::parse($request->return_date)->format('Ymd').'-'.strtoupper($returnTransaction->return_code),
                        'quantity' => $item['retur_quantity'],
                    ]);

                    // create new stock movements
                    $stock->movements()->create([
                        'type' => 'in',
                        'quantity' => $item['retur_quantity'],
                        'description' => 'Replacement stock for return '.$returnTransaction->return_code.' (Transaction '.$transaction->invoice.')',
                    ]);
                }
            });
        });

        // render view
        return to_route('apps.transaction-returns.index');
    }

    /**
     * Display the specified resource.
     */
    public function show(TransactionReturn $transactionReturn)
    {
        // load relationship
        $transactionReturn->load([
            'transaction',
            'transaction.customer',
            'details',
            'details.transaction_detail',
            'details.transaction_detail.transaction',
            'details.transaction_detail.items' => function ($morphTo) {
                $morphTo->morphWith([
                    \App\Models\ProductVariant::class => ['product', 'unit', 'product_variant_values', 'product_variant_values.variant_value', 'product_variant_values.variant_value.variant_option'],
                    \App\Models\Material::class => ['unit'],
                    \App\Models\DiscountPackage::class => [
                            'discount_package_items.items' => function ($morphTo) {
                                $morphTo->morphWith([
                                    \App\Models\ProductVariant::class => [
                                        'product',
                                        'unit',
                                        'product_variant_values',
                                        'product_variant_values.variant_value',
                                        'product_variant_values.variant_value.variant_option'
                                    ],
                                    \App\Models\Material::class => [
                                        'unit'
                                    ]
                                ]);
                            }
                        ]
                ]);
            },
        ]);

        $transactionReturn->grand_total = number_format($transactionReturn->grand_total, 0);
        $transactionReturn->details->each(function($item){
            $item->total_price = number_format($item->quantity * $item->transaction_detail->price, 0);
            $item->transaction_detail->price = number_format($item->transaction_detail->price, 0);
        });

        // render view
        return inertia('apps/transaction-returns/show', [
            'transactionReturn' => $transactionReturn,
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(TransactionReturn $transactionReturn)
    {
        // get all customers
        $customers = Customer::orderBy('name')->get();
        $customers->prepend([
            'id' => 0,
            'name' => 'Umum',
            'phone' => '-',
        ]);

        // load relationship
        $transactionReturn->load([
            'transaction',
            'transaction.customer',
            'details',
            'details.transaction_detail',
            'details.transaction_detail.transaction',
            'details.transaction_detail.items' => function ($morphTo) {
                $morphTo->morphWith([
                    \App\Models\ProductVariant::class => ['product', 'unit', 'product_variant_values', 'product_variant_values.variant_value', 'product_variant_values.variant_value.variant_option'],
                    \App\Models\Menu::class => ['category'],
                    \App\Models\DiscountPackage::class => [
                            'discount_package_items.items' => function ($morphTo) {
                                $morphTo->morphWith([
                                    \App\Models\ProductVariant::class => [
                                        'product',
                                        'unit',
                                        'product_variant_values',
                                        'product_variant_values.variant_value',
                                        'product_variant_values.variant_value.variant_option'
                                    ],
                                    \App\Models\Menu::class => [
                                        'category'
                                    ]
                                ]);
                            }
                        ]
                ]);
            },
        ]);

        // render view
        return inertia('apps/transaction-returns/edit', [
            'transactionReturn' => $transactionReturn,
            'customers' => $customers,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(TransactionReturnRequest $request, TransactionReturn $transactionReturn)
    {
        DB::transaction(function() use($request, $transactionReturn){
            // update transaction return
            $transactionReturn->update([
                'transaction_id' => $request->selectedTransaction,
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
            $transactionReturn->details()->whereNotIn('transaction_detail_id', $currentItems)->delete();

            // loop selected return
            collect($request->selectedReturn)->each(function ($item) use($transactionReturn, $request){
                // create new purchase return detail
                $transactionReturn->details()->updateOrCreate([
                    'transaction_detail_id' => $item['id']
                ],[
                    'transaction_detail_id' => $item['id'],
                    'quantity' => $item['retur_quantity'],
                    'reason' => $item['reason'],
                ]);

                // get transaction detail data
                $transaction_detail = TransactionDetail::findOrFail($item['id']);

                // get order data
                $transaction = $transaction_detail->transaction;

                // do when status confirmed
                if($request->status == 'confirmed' && $transactionReturn->status != 'confirmed'){
                    // do when refund method replacement
                    if($request->refund_method == 'replacement'){
                        // create new stock
                        $stock = $transaction_detail->items->stocks()->create([
                            'batch_code' => 'RTPJ-'.Carbon::parse($request->return_date)->format('Ymd').'-'.strtoupper($transactionReturn->return_code),
                            'quantity' => $item['retur_quantity'],
                        ]);

                        // create new stock movements
                        $stock->movements()->create([
                            'type' => 'in',
                            'quantity' => $item['retur_quantity'],
                            'description' => 'Replacement stock for return '.$transactionReturn->return_code.' (Transaction '.$transaction->invoice.')',
                        ]);
                    }
                }
            });

            // update transaction status
            $transactionReturn->update([
                'status' => $request->status
            ]);
        });

        // render view
        return to_route('apps.transaction-returns.index');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(TransactionReturn $transactionReturn)
    {
        // delete transaction order
        $transactionReturn->delete();

        // render view
        return back();
    }

    public function downloadInvoice(TransactionReturn $transactionReturn)
    {
        $transactionReturn->load([
            'transaction',
            'transaction.customer',
            'details',
            'details.transaction_detail',
            'details.transaction_detail.transaction',
            'details.transaction_detail.items' => function ($morphTo) {
                $morphTo->morphWith([
                    \App\Models\ProductVariant::class => [
                        'product',
                        'unit',
                        'product_variant_values',
                        'product_variant_values.variant_value',
                        'product_variant_values.variant_value.variant_option'
                    ],
                    \App\Models\Material::class => ['unit'],
                    \App\Models\DiscountPackage::class => [
                        'discount_package_items.items' => function ($morphTo) {
                            $morphTo->morphWith([
                                \App\Models\ProductVariant::class => [
                                    'product',
                                    'unit',
                                    'product_variant_values',
                                    'product_variant_values.variant_value',
                                    'product_variant_values.variant_value.variant_option'
                                ],
                                \App\Models\Material::class => ['unit']
                            ]);
                        }
                    ]
                ]);
            },
        ]);

        $transactionReturn->details->each(function ($item) {
            $item->total_price = $item->quantity * $item->transaction_detail->price;
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
            ->loadView('pdf.invoice-return-transactions', [
                'transactionReturn' => $transactionReturn,
                'store'             => $store,
            ]);

        return $pdf->download("Invoice-Retur-{$transactionReturn->return_code}.pdf");
    }
}

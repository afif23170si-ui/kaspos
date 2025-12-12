<?php

namespace App\Http\Controllers\Apps;

use App\Models\Menu;
use App\Models\User;
use App\Models\Shift;
use App\Models\Table;
use App\Models\Coupon;
use App\Models\Setting;
use App\Traits\Helpers;
use App\Models\Category;
use App\Models\Customer;
use Mike42\Escpos\Printer;
use App\Models\BankAccount;
use App\Models\Transaction;
use App\Models\CashierShift;
use Illuminate\Http\Request;
use App\Models\ProductVariant;
use Illuminate\Support\Carbon;
use App\Models\DiscountPackage;
use App\Models\DiscountProduct;
use App\Models\TransactionReturn;
use App\Models\TransactionKitchen;
use Illuminate\Support\Facades\DB;
use App\Models\DiscountProductItem;
use App\Http\Controllers\Controller;
use App\Models\CustomerPointSetting;
use App\Models\TransactionKitchenItem;
use App\Models\DiscountProductCustomer;
use Illuminate\Routing\Controllers\Middleware;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Routing\Controllers\HasMiddleware;
use Mike42\Escpos\PrintConnectors\CupsPrintConnector;
use Mike42\Escpos\PrintConnectors\NetworkPrintConnector;
use Mike42\Escpos\PrintConnectors\WindowsPrintConnector;

class PosController extends Controller implements HasMiddleware
{
    public static function middleware()
    {
        return [
            new Middleware('blockIfOpname', only: ['index']),
        ];
    }

    use Helpers;

    function paginateCollection($items, $perPage = 18, $page = null)
    {
        $page = $page ?: (LengthAwarePaginator::resolveCurrentPage() ?: 1);
        $items = $items instanceof \Illuminate\Support\Collection ? $items : collect($items);
        $pagedItems = $items->forPage($page, $perPage)->values();

        return new LengthAwarePaginator(
            $pagedItems,
            $items->count(),
            $perPage,
            $page,
            ['path' => request()->url(), 'query' => request()->query()]
        );
    }

    private function buildTransactionData($request, $cashierShift, $coupon, $bank)
    {
        return [
            'cashier_shift_id' => $cashierShift->id,
            'customer_id' => $request->selectedCustomer['id'] ?? null,
            'payment_method' => $request->selectedPaymentMethod === 'tunai' ? 'cash' : 'transfer',
            'waiter_id' => $request->cashierId,
            'transaction_type' => $request->selectedOrderType ?? 'takeaway',
            'table_id' => $request->selectedTable,
            'platform' => $request->selectedPlatform,
            'coupon_id' => $coupon?->id,
            'notes_noref' => $request->notes['no_ref'] ?? null,
            'notes_transaction_source' => $request->notes['transaction_source'] ?? null,
            'notes_note' => $request->notes['note'] ?? null,
            'shipping_name' => $request->delivery['name'] ?? null,
            'shipping_ref' => $request->delivery['no_resi'] ?? null,
            'shipping_address' => $request->delivery['address'] ?? null,
            'shipping_note' => $request->delivery['note'] ?? null,
            'shipping_status' => $request->delivery['status'] ?? null,
            'subtotal' => $request->subTotal,
            'ppn' => $request->ppn,
            'other' => $request->other,
            'grand_total' => $request->grandTotal,
            'pay' => $request->pay,
            'change' => $request->return,
            'transaction_date' => Carbon::today(),
            'bank_account_id' => $bank?->id,
            'discount' => $request->discount,
        ];
    }

    private function saveTransactionDetails($transaction, $carts)
    {
        DB::transaction(function () use ($transaction, $carts) {
            $modelMap = [
                'package' => \App\Models\DiscountPackage::class,
                'product' => \App\Models\ProductVariant::class,
                'menu' => \App\Models\Menu::class,
            ];

            $discountType = [
                'nominal' => 'rupiah',
                'percentage' => 'percentage',
            ];

            foreach ($carts as $item) {
                $transaction->transaction_details()->create([
                    'items_id' => $item['id'],
                    'items_type' => $modelMap[$item['type']] ?? null,
                    'price' => $item['price'],
                    'quantity' => $item['quantity'],
                    'discount_type' => $discountType[$item['discount_type']] ?? null,
                    'discount' => $item['discount'],
                    'note' => $item['note'] ?? null,
                ]);

                if ($transaction->status != 'pending') {
                    if ($item['type'] === 'product') {
                        $this->consumeStockFifo(
                            $modelMap[$item['type']],
                            $item['id'],
                            $item['quantity'],
                            'Transaction ' . $transaction->invoice
                        );
                    } elseif ($item['type'] === 'menu') {
                        $this->consumeMenuFifo((int)$item['id'], (float)$item['quantity'],  'Transaction ' . $transaction->invoice);
                    } elseif ($item['type'] === 'package') {
                        $packageItems = DB::table('discount_package_items')
                            ->where('discount_package_id', $item['id'])
                            ->select('items_type', 'items_id')
                            ->get();

                        foreach ($packageItems as $pi) {
                            if ($pi->items_type === ProductVariant::class)
                                $this->consumeStockFifo(
                                    $pi->items_type,
                                    (int)$pi->items_id,
                                    (float)$item['quantity'],
                                    'Transaction ' . $transaction->invoice
                                );
                            elseif ($pi->items_type === Menu::class)
                                $this->consumeMenuFifo((int)$item['id'], (float)$item['quantity'],  'Transaction ' . $transaction->invoice);
                            else
                                throw new \RuntimeException("jenis items tidak ditemukan");
                        }
                    }
                }
            }
        });
    }

    private function updatePaymentStatus($request, $transaction, $pay, $grandTotal)
    {
        if ($pay >= $grandTotal) {
            $transaction->update(['status' => 'paid']);
        } elseif ($pay > 0) {
            $transaction->update(['status' => 'partial']);
        } elseif ($request->isPendingOrder) {
            $transaction->update(['status' => 'pending']);
        }
    }

    private function updateTableStatus($request)
    {
        if ($request->selectedTable) {
            $table = \App\Models\Table::find($request->selectedTable);

            $table->update([
                'status' => 'occupied',
            ]);
        }
    }

    public function index(Request $request)
    {
        $user = request()->user();
        $isWaiter = $user->hasRole('waiter');
        
        // get cashier shift
        // For waiter: use any active cashier shift (from cashier role users)
        // For cashier: use their own shift only
        if ($isWaiter) {
            $cashierShift = CashierShift::query()
                ->with(['user', 'shift'])
                ->whereHas('user.roles', function ($q) {
                    $q->where('name', 'cashier');
                })
                ->where('status', 'open')
                ->latest()
                ->first();
        } else {
            $cashierShift = CashierShift::query()
                ->with(['user', 'shift'])
                ->where('user_id', $user->id)
                ->where('status', 'open')
                ->latest()
                ->first();
        }

        // get all shifts
        $shifts = Shift::query()
            ->select('id', 'name', 'code', 'start_time', 'end_time')
            ->orderBy('name')
            ->get();

        // get all banks
        $banks = BankAccount::query()
            ->select('id', 'bank_name', 'account_number', 'account_name')
            ->orderBy('bank_name')
            ->get();

        // get all users with their id and name, ordered by name
        $cashiers = User::query()
            ->whereHas('roles', function ($q) {
                $q->whereIn('name', ['cashier', 'waiter']);
            })
            ->orderBy('name')
            ->get();

        // get all categories with their id and name, ordered by name
        $categories = Category::query()
            ->select('id', 'name')
            ->orderBy('name')
            ->get();

        // get search and category query from request
        $filters = [
            'search' => $request->search,
            'category' => $request->category,
        ];

        // get all product variants with their product and variant values
        $variants = ProductVariant::with(['product', 'product_variant_values.variant_value'])
            ->when(
                $filters['search'] ?? null,
                fn($q) =>
                $q->where('barcode', 'like', "%{$filters['search']}%")
                    ->orWhereHas('product', fn($q) => $q->where('name', 'like', "%{$filters['search']}%")
                        ->orWhere('sku', 'like', "%{$filters['search']}%"))
                    ->orWhereHas('product_variant_values.variant_value', fn($q) => $q->where('name', 'like', "%{$filters['search']}%"))
            )
            ->when($filters['category'] ?? null, fn($q) => $q->whereHas('product', fn($q) => $q->where('category_id', $filters['category'])))
            ->get();

        $menus = Menu::select('id', 'name', 'category_id', 'image', 'created_at', 'capital_price', 'selling_price', 'margin')
            ->when($filters['search'] ?? null, fn($q) => $q->where('name', 'like', "%{$filters['search']}%"))
            ->when($filters['category'] ?? null, fn($q) => $q->where('category_id', $filters['category']))
            ->get()
            ->map(function ($item) {
                $item->type = 'menu';
                return $item;
            });

        $discount_packages = DiscountPackage::query()
            ->with([
                'discount_package_items' => function ($query) {
                    $query->with(['items' => function ($morphTo) {
                        $morphTo->morphWith([
                            \App\Models\ProductVariant::class => ['product', 'unit', 'product_variant_values.variant_value.variant_option'],
                            \App\Models\Menu::class,
                        ]);
                    }]);
                }
            ])
            ->where('is_active', true)
            ->get();

        $pvType   = (new ProductVariant)->getMorphClass();
        $menuType = (new Menu)->getMorphClass();

        $variantIds = $variants->pluck('id')->all();
        $menuIds    = $menus->pluck('id')->all();

        $pkgPvIds = $discount_packages->flatMap(fn($p) => $p->discount_package_items->where('items_type', $pvType)->pluck('items_id'))->all();
        $pkgMenuIds = $discount_packages->flatMap(fn($p) => $p->discount_package_items->where('items_type', $menuType)->pluck('items_id'))->all();

        $allPvIds   = array_values(array_unique(array_merge($variantIds, $pkgPvIds)));
        $allMenuIds = array_values(array_unique(array_merge($menuIds, $pkgMenuIds)));

        $pvStockMap   = $this->getStock($pvType, $allPvIds);
        $menuStockMap = $this->getMenuStockFromMaterials($allMenuIds);

        $variantList = $variants->map(function ($variant) use ($pvStockMap) {
            $variantValues = $variant->product_variant_values
                ->map(fn($v) => $v->variant_value->name)
                ->implode(' ');

            return [
                'type'          => 'product',
                'id'            => $variant->id,
                'name'          => trim($variant->product->name . ' ' . $variantValues),
                'price'         => $variant->price,
                'capital_price' => $variant->capital_price,
                'image'         => $variant->product->image,
                'category_id'   => $variant->product->category_id,
                'created_at'    => $variant->created_at,
                'stock'         => (float)($pvStockMap[$variant->id] ?? 0),
            ];
        });

        $menus = $menus->map(function ($item) use ($menuStockMap) {
            $item->stock = (float)($menuStockMap[$item->id] ?? 0);
            return $item;
        });

        $discount_packages = $discount_packages->map(function ($package) use ($pvType, $menuType, $pvStockMap, $menuStockMap) {
            $package->type = 'package';

            $package->discount_package_items->transform(function ($item) {
                $model = $item->items;
                if ($model instanceof \App\Models\ProductVariant) {
                    $variantValues = $model->product_variant_values
                        ->map(fn($v) => $v->variant_value->name)
                        ->implode(' ');
                    $item->name = trim($model->product->name . ' ' . $variantValues);
                } elseif ($model instanceof \App\Models\Menu) {
                    $item->name = $model->name;
                } else {
                    $item->name = '-';
                }
                return $item;
            });

            $availablePerItem = $package->discount_package_items->map(function ($it) use ($pvType, $menuType, $pvStockMap, $menuStockMap) {
                if ($it->items_type === $pvType) {
                    return (int) floor((float)($pvStockMap[$it->items_id] ?? 0));
                }
                if ($it->items_type === $menuType) {
                    return (int) floor((float)($menuStockMap[$it->items_id] ?? 0));
                }
                return 0;
            });

            $package->stock = $availablePerItem->count() > 0 ? (int) $availablePerItem->min() : 0;
            return $package;
        });

        // merge collection dan urutkan
        $merged = $variantList->concat($menus)->concat($discount_packages)->sortByDesc('created_at')->values();

        // paginate the merged collection
        $data = $this->paginateCollection($merged);

        // get settings
        $settings = Setting::get();

        // get tables
        $tables = Table::get();

        // get pending transaction count
        $pendingTransactionCount = Transaction::where('status', 'pending')->count();

        // render view
        return inertia('apps/pos/index', [
            'cashiers' => $cashiers,
            'categories' => $categories,
            'tables' => $tables,
            'banks' => $banks,
            'items' => $data,
            'filters' => $filters,
            'cashierShift' => $cashierShift,
            'shifts' => $shifts,
            'settings' => $settings,
            'pendingTransactionCount' => $pendingTransactionCount,
            'isWaiter' => $isWaiter,
        ]);
    }

    public function openCashierShift(Request $request)
    {
        // validate request
        $request->validate([
            'cashierShift.shift_id' => 'required',
            'cashierShift.cash' => 'required|numeric|min:1',
        ], [
            'cashierShift.shift_id.required' => 'Kolom Shift harus dipilih.',
            'cashierShift.cash.required' => 'Kolom uang kembalian harus diisi.',
            'cashierShift.cash.numeric' => 'Kolom uang kembalian harus berupa angka.',
            'cashierShift.cash.min' => 'Kolom uang kembalian harus lebih dari 1.',
        ]);

        // create cashier shift
        CashierShift::create([
            'user_id' => $request->user()->id,
            'shift_id' => $request->cashierShift['shift_id'],
            'starting_cash' => $request->cashierShift['cash'],
            'opened_at' => now(),
            'status' => 'open',
        ]);

        // render view
        return back();
    }

    public function closeCashierShift(Request $request)
    {
        $cashierShiftId = $request->cashier_shift_id;
        $endCash = $request->end_cash;

        $cashierShift = CashierShift::find($cashierShiftId);

        $cashierShift->update([
            'ending_cash' => $endCash,
            'closed_at' => Carbon::today(),
            'status' => 'closed',
        ]);

        return to_route('apps.pos.index');
    }

    public function store(Request $request)
    {
        DB::transaction(function () use ($request) {
            $user = $request->user();
            $isWaiter = $user->hasRole('waiter');
            
            // get active shift cashier
            // For waiter: use any active cashier shift
            // For cashier: use their own shift
            if ($isWaiter) {
                $cashierShift = CashierShift::whereHas('user.roles', function ($q) {
                    $q->where('name', 'cashier');
                })->where('status', 'open')->firstOrFail();
            } else {
                $cashierShift = CashierShift::where('user_id', $user->id)->where('status', 'open')->firstOrFail();
            }

            // get coupon and bank
            $coupon = Coupon::where('code', $request->discounts['code'] ?? null)->first();
            $bank = BankAccount::where('bank_name', $request->selectedBank ?? null)->first();

            // loyalty program
            $loyalty = CustomerPointSetting::where('is_active', true)->orderByDesc('spend_amount')->get();

            // update transaction
            if ($request->filled('invoice')) {
                $transaction = Transaction::where('invoice', $request->invoice)->firstOrFail();
                $transaction->update($this->buildTransactionData($request, $cashierShift, $coupon, $bank));
                
                // Cek apakah transaksi sudah memiliki kitchen items
                // Jika sudah, JANGAN hapus transaction_details karena akan merusak relasi kitchen items
                $hasKitchenItems = TransactionKitchen::where('transaction_id', $transaction->id)
                    ->whereHas('transaction_kitchen_items')
                    ->exists();
                
                if (!$hasKitchenItems) {
                    // Transaksi belum masuk dapur, boleh update items
                    $transaction->transaction_details()->delete();
                    $this->saveTransactionDetails($transaction, $request->carts);
                }
                // Jika sudah ada kitchen items, kita hanya update data transaksi utama (payment, status, dll)
                // tanpa mengubah detail items untuk menjaga integritas data kitchen display
                
            } else {
                // create new transaction
                $randomNumber = str_pad(rand(0, 9999), 4, '0', STR_PAD_LEFT);
                $invoiceCode = 'PJ' . now()->format('dmY') . $randomNumber;

                $transaction = Transaction::create(array_merge(
                    ['invoice' => $invoiceCode],
                    $this->buildTransactionData($request, $cashierShift, $coupon, $bank)
                ));

                // create detail transaction (hanya untuk transaksi baru)
                $this->saveTransactionDetails($transaction, $request->carts);
            }

            // update status payment
            $this->updatePaymentStatus($request, $transaction, $request->pay, $request->grandTotal);

            // update status table
            $this->updateTableStatus($request);

            if ($transaction->status != 'pending' && $request->selectedCustomer['id'] != null) {
                $customer = Customer::findOrFail($request->selectedCustomer['id']);

                $eligible = collect($loyalty ?? [])->filter(fn($loyal) => $request->grandTotal >= $loyal->spend_amount);

                $earned = (int) $eligible->sum('point_earned');

                $expiredAt = $eligible
                    ->map(fn($loyal) => Carbon::today()->addDays((int) $loyal->expired_date)->startOfDay())
                    ->min();

                if ($earned > 0) {
                    $transaction->customer_points()->create([
                        'customer_id'  => $customer->id,
                        'point'        => $earned,
                        'status'       => 'active',
                        'expired_date' => $expiredAt,
                    ]);
                }
            }

            if ($transaction->status != 'pending' && !empty($request->transaction_taxs) && is_array($request->transaction_taxs)) {
                foreach ($request->transaction_taxs as $row) {
                    if (!isset($row['name'])) continue;
                    $val = isset($row['value']) ? (float) $row['value'] : 0;

                    $transaction->transaction_taxs()->create([
                        'code'  => $row['code'],
                        'name'  => $row['name'],
                        'value' => $val,
                    ]);
                }
            }
        });

        return back();
    }

    public function historyTransaction(Request $request)
    {
        $data = Transaction::query()
            ->whereMonth('transaction_date', date('m'))
            ->where('status', 'paid')
            ->with('customer', 'transaction_details', 'table')
            ->when($request->search, function ($query) use ($request) {
                $query->where('invoice', 'like', '%' . $request->search . '%')
                    ->orWhereHas('customer', function ($query) use ($request) {
                        $query->where('name', 'like', '%' . $request->search . '%');
                    })
                    ->orWhereHas('table', function ($query) use ($request) {
                        $query->where('number', 'like', '%' . $request->search . '%');
                    });
            })->latest()->paginate(10);

        return response()->json($data);
    }

    public function pendingTransaction(Request $request)
    {
        $data = Transaction::query()
            ->with([
                'transaction_details.items' => function ($morphTo) {
                    $morphTo->morphWith([
                        \App\Models\ProductVariant::class => ['product', 'product_variant_values.variant_value'],
                        \App\Models\Menu::class,
                        \App\Models\DiscountPackage::class => ['discount_package_items']
                    ]);
                },
                'customer',
                'table'
            ])
            ->where('status', 'pending')
            ->when($request->search, function ($query) use ($request) {
                $query->where('invoice', 'like', '%' . $request->search . '%')
                    ->orWhereHas('customer', function ($query) use ($request) {
                        $query->where('name', 'like', '%' . $request->search . '%');
                    })
                    ->orWhereHas('table', function ($query) use ($request) {
                        $query->where('number', 'like', '%' . $request->search . '%');
                    });
            })
            ->latest()
            ->get()
            ->map(function ($item) {
                $item->transaction_details = $item->transaction_details->map(function ($detail) {
                    $model = $detail->items;

                    if ($model instanceof \App\Models\ProductVariant) {
                        $variantValues = $model->product_variant_values
                            ->map(fn($v) => $v->variant_value->name)
                            ->implode(' ');

                        $detail->type = 'product';
                        $detail->id = $model->id; // ID Product Variant (Bukan ID Detail)
                        $detail->name = $model->product->name . ' ' . $variantValues;
                        $detail->price = $detail->price;
                        $detail->capital_price = $detail->capital_price;
                        $detail->image = $model->product->image;
                        $detail->category_id = $model->product->category_id;
                        $detail->created_at = $detail->created_at;
                    } elseif ($model instanceof \App\Models\Menu) {
                        $detail->type = 'menu';
                        $detail->id = $model->id; // ID Menu (Bukan ID Detail)
                        $detail->name = $model->name;
                        $detail->price = $detail->price;
                        $detail->capital_price = $detail->capital_price;
                        $detail->image = $model->image;
                        $detail->category_id = $model->category_id;
                        $detail->created_at = $detail->created_at;
                    } elseif ($model instanceof \App\Models\DiscountPackage) {
                        $detail->type = 'package';
                        $detail->name = $model->name;
                        $packageItems = $model->discount_package_items->transform(function ($item) use ($detail) {
                            $modelItem = $item->items;

                            if ($modelItem instanceof \App\Models\ProductVariant) {
                                $variantValues = $modelItem->product_variant_values
                                    ->map(fn($v) => $v->variant_value->name)
                                    ->implode(' ');

                                $item->name = $modelItem->product->name . ' ' . $variantValues;
                            } elseif ($modelItem instanceof \App\Models\Menu) {
                                $item->name = $modelItem->name;
                            } else {
                                $item->name = '-';
                            }

                            return $item;
                        });
                        $detail->discount_package_items = $packageItems;
                    }
                    return $detail;
                });

                return $item;
            });

        return response()->json($data);
    }

    public function searchByBarcode(Request $request)
    {
        $product = ProductVariant::with([
            'product',
            'product_variant_values.variant_value'
        ])
            ->where('barcode', $request->barcode)
            ->first();

        if ($product) {
            $variantValues = $product->product_variant_values
                ->map(function ($v) {
                    return $v->variant_value->name;
                })
                ->implode(' ');

            $productData = [
                'type' => 'product',
                'id' => $product->id,
                'name' => $product->product->name . ' ' . $variantValues,
                'price' => $product->price,
                'capital_price' => $product->capital_price,
                'image' => $product->product->image,
                'category_id' => $product->product->category_id,
                'created_at' => $product->created_at,
            ];
        }

        if (!$product) {
            return response()->json(['message' => 'Produk tidak ditemukan'], 404);
        }

        return response()->json(['product' => $productData]);
    }

    public function cashierTransaction(Request $request)
    {
        $cashierShiftId = $request->cashier_shift_id;

        $cashierShift = CashierShift::findOrFail($cashierShiftId);

        $transactions = Transaction::query()
            ->with(['transaction_payments', 'bank_account'])
            ->where('cashier_shift_id', $cashierShiftId)
            ->get();

        $transactionIds = $transactions->pluck('id');

        $directTx = $transactions->filter(fn($t) => $t->transaction_payments->isEmpty());

        $directCashTotal = $directTx
            ->where('payment_method', 'cash')
            ->sum('grand_total');

        $directTransferByBank = $directTx
            ->where('payment_method', 'transfer')
            ->groupBy('bank_account_id')
            ->map(fn($rows, $bankId) => [
                'bank_account_id' => $bankId,
                'total' => $rows->sum('grand_total'),
            ]);

        $paymentAgg = DB::table('transaction_payments')
            ->selectRaw('payment_method, bank_account_id, SUM(amount) as total')
            ->whereIn('transaction_id', $transactionIds)
            ->groupBy('payment_method', 'bank_account_id')
            ->get();

        $paymentCashTotal = $paymentAgg
            ->where('payment_method', 'cash')
            ->sum('total');

        $paymentTransferByBank = $paymentAgg
            ->where('payment_method', 'transfer')
            ->groupBy('bank_account_id')
            ->map(fn($rows, $bankId) => [
                'bank_account_id' => $bankId,
                'total' => $rows->sum('total'),
            ]);

        $allBankIds = $directTransferByBank->keys()
            ->merge($paymentTransferByBank->keys())
            ->unique();

        $mergedTransferByBank = $allBankIds->mapWithKeys(function ($bankId) use ($directTransferByBank, $paymentTransferByBank) {
            $direct = $directTransferByBank->get($bankId)['total'] ?? 0;
            $fromPayments = $paymentTransferByBank->get($bankId)['total'] ?? 0;
            $total = $direct + $fromPayments;
            return [
                (string)$bankId => [
                    'bank_account_id' => $bankId,
                    'total' => $total,
                ]
            ];
        });

        $grouped = collect([
            'cash' => [
                'total' => ($directCashTotal + $paymentCashTotal),
            ],
            'transfer' => $mergedTransferByBank,
        ]);

        $totalDirect = $directTx->sum('grand_total');
        $totalFromPayments = $paymentAgg->sum('total');

        $totalTransaction = $totalDirect + $totalFromPayments;

        $transactionReturn = TransactionReturn::whereIn('transaction_id', $transactionIds)
            ->sum('grand_total');

        $data = [
            'totalTransaction' => $totalTransaction,
            'byPaymentMethod' => $grouped,
            'totalReturn' => $transactionReturn,
            'total' => $cashierShift->starting_cash + $totalTransaction - $transactionReturn,
        ];

        return response()->json($data);
    }

    public function receipt(Request $request)
    {
        $request->validate(['invoice' => ['required', 'string']]);

        $transaction = Transaction::with([
            'transaction_details.items' => function ($morphTo) {
                $morphTo->morphWith([
                    ProductVariant::class => [
                        'product',
                        'unit',
                        'product_variant_values',
                        'product_variant_values.variant_value',
                        'product_variant_values.variant_value.variant_option',
                    ],
                    Menu::class => ['category'],
                    DiscountPackage::class => [
                        'discount_package_items.items' => function ($morphTo) {
                            $morphTo->morphWith([
                                ProductVariant::class => [
                                    'product',
                                    'unit',
                                    'product_variant_values',
                                    'product_variant_values.variant_value',
                                    'product_variant_values.variant_value.variant_option',
                                ],
                            ]);
                        },
                    ],
                ]);
            },
            'transaction_taxs',
            'table',
            'cashier_shift.user',
            'customer',
        ])->where('invoice', $request->invoice)->firstOrFail();

        $codes = ['PRNT', 'NAME', 'ADDRESS', 'PHONE'];
        $settings = Setting::where('is_active', true)
            ->whereIn('code', $codes)
            ->pluck('value', 'code');

        $printerName = $settings['PRNT'] ?? null;
        $W = (int) (config('printer.width') ?? 42);

        $idr   = fn(int $n) => 'Rp ' . number_format($n, 0, ',', '.');
        $sep   = fn() => str_repeat('-', $W) . "\n";
        $wrap  = fn(string $t) => wordwrap($t, $W, "\n", true) . "\n";
        $cols2 = function (string $left, string $right) use ($W) {
            $left  = preg_replace('/\s+/', ' ', $left);
            $right = preg_replace('/\s+/', ' ', $right);
            $rLen  = mb_strlen($right);
            $lMax  = max(0, $W - $rLen);
            $lTrim = mb_substr($left, 0, $lMax);
            return str_pad($lTrim, $lMax, ' ') . $right . "\n";
        };
        $variantLabel = function (ProductVariant $pv) {
            $parts = $pv->product_variant_values
                ->map(fn($v) => ($v->variant_value->variant_option->name ?? '') . ': ' . ($v->variant_value->name ?? ''))
                ->filter()
                ->values();
            return $parts->isNotEmpty() ? ' [' . $parts->implode(', ') . ']' : '';
        };

        $lines = $transaction->transaction_details->map(function ($d) use ($variantLabel) {
            $name = '';
            if ($d->items_type === ProductVariant::class) {
                $pv   = $d->items;
                $name = ($pv->product->name ?? 'Variant') . $variantLabel($pv);
            } elseif ($d->items_type === Menu::class) {
                $name = $d->items->name ?? 'Menu';
            } elseif ($d->items_type === DiscountPackage::class) {
                $name = $d->items->name ?? 'Paket';
            } else {
                $name = class_basename($d->items_type);
            }

            $price = (int) $d->price;

            // Hitung diskon per item
            if ($d->discount_type == 'percentage') {
                $discountPerItem = floor($price * ((int) $d->discount) / 100);
            } else {
                $discountPerItem = (int) $d->discount;
            }

            // Harga setelah diskon per item
            $finalPrice = max(0, $price - $discountPerItem);

            // Total = harga setelah diskon × jumlah
            $totalAmount = $finalPrice * (int) $d->quantity;

            return [
                'name'   => $name,
                'qty'    => (int) $d->quantity,
                'price'  => $finalPrice,
                'amount' => $totalAmount,
            ];
        })->values()->all();

        $subtotal = array_reduce($lines, fn($c, $i) => $c + $i['amount'], 0);
        $discount = (int) ($transaction->discount ?? 0);

        $taxes = collect($transaction->transaction_taxs ?? [])
            ->map(function ($t) {
                $label = $t->name;
                $value = (int) $t->value;
                return ['label' => $label, 'value' => $value];
            })
            ->values()
            ->all();

        $total  = (int) $transaction->grand_total;
        $paid   = (int) $transaction->pay;
        $change = (int) $transaction->change;

        $store = [
            'name'  => $settings['NAME'] ?? 'TOKO',
            'addr'  => $settings['ADDRESS'] ?? '',
            'phone' => $settings['PHONE'] ?? '',
        ];

        $orderType = (string) $transaction->transaction_type;
        $tableNo = $transaction->table->number ?? null;
        $customerName = $transaction->customer->name ?? 'Umum';

        switch ($orderType) {
            case 'dine_in':
                $statusOrder = 'Makan ditempat';
                break;
            case 'platform':
                $statusOrder = ucfirst((string) $transaction->platform);
                break;
            case 'takeaway':
                $statusOrder = 'Takeaway';
                break;
            default:
                $statusOrder = ucfirst($orderType);
        }

        $driver = env('PRINT_DRIVER');
        $queue  = ($printerName ?: env('PRINT_NAME'));
        $host   = env('PRINT_HOST');
        $port   = (int) env('PRINT_PORT', 9100);

        if (!$driver) {
            $family = PHP_OS_FAMILY;
            $driver = ($family === 'Windows') ? 'windows' : 'cups';
        }

        $p = null;
        try {
            switch ($driver) {
                case 'windows':
                    if (empty($queue)) {
                        throw new \RuntimeException('Printer name (PRNT/PRINT_NAME) kosong untuk WindowsPrintConnector');
                    }
                    $connector = new WindowsPrintConnector($queue);
                    break;

                case 'cups':
                    if (empty($queue)) {
                        throw new \RuntimeException('CUPS queue (PRNT/PRINT_NAME) kosong untuk CupsPrintConnector');
                    }
                    $connector = new CupsPrintConnector($queue);
                    break;

                case 'network':
                    if (empty($host)) {
                        throw new \RuntimeException('PRINT_HOST belum diisi untuk NetworkPrintConnector');
                    }
                    $connector = new NetworkPrintConnector($host, $port ?: 9100);
                    break;

                default:
                    throw new \RuntimeException("PRINT_DRIVER tidak dikenal: {$driver}");
            }

            $p = new Printer($connector);
            $p->initialize();

            $printKVP = function (Printer $printer, string $label, string $value) use ($W) {
                static $keyWidth = null;
                if ($keyWidth === null) {
                    $labels   = ['Invoice', 'Tanggal', 'Jenis', 'Pelanggan', 'Meja', 'Kasir'];
                    $keyWidth = max(array_map(fn($l) => mb_strlen($l), $labels));
                }

                $left = str_pad($label, $keyWidth, ' ', STR_PAD_RIGHT) . ' : ';
                $right = (string) $value;

                $avail = $W - mb_strlen($left);
                $first = mb_substr($right, 0, $avail);
                $printer->text($left . $first . "\n");

                $rest = mb_substr($right, $avail);
                while ($rest !== '') {
                    $chunk = mb_substr($rest, 0, $avail);
                    $printer->text(str_repeat(' ', mb_strlen($left)) . $chunk . "\n");
                    $rest = mb_substr($rest, mb_strlen($chunk));
                }
            };

            $p->setJustification(Printer::JUSTIFY_CENTER);
            $p->setEmphasis(true);
            $p->text(($store['name'] ?: 'TOKO') . "\n");
            $p->setEmphasis(false);
            if (!empty($store['addr'])) {
                $p->text($store['addr'] . "\n");
            }
            if (!empty($store['phone'])) {
                $p->text('Telp: ' . $store['phone'] . "\n");
            }
            $p->text($sep());

            $p->setJustification(Printer::JUSTIFY_LEFT);
            $printKVP($p, 'Invoice', $transaction->invoice);
            $printKVP($p, 'Tanggal', now()->format('d/m/Y H:i'));
            $printKVP($p, 'Jenis',   (string) $statusOrder);
            if ($tableNo)          $printKVP($p, 'Meja',   (string) $tableNo);
            if ($customerName)     $printKVP($p, 'Pelanggan',   (string) $customerName);
            if ($transaction->cashier_shift && $transaction->cashier_shift->user) {
                $printKVP($p, 'Kasir',   (string) $transaction->cashier_shift->user->name);
            }
            $p->text($sep());

            foreach ($lines as $it) {
                $p->text($wrap($it['name']));
                $p->text($cols2("{$it['qty']} x " . $idr($it['price']), $idr($it['amount'])));
            }

            $p->text($sep());
            $p->text($cols2('Subtotal', $idr($subtotal)));
            if ($discount) {
                $p->text($cols2('Diskon', '-' . $idr($discount)));
            }

            foreach ($taxes as $t) {
                $p->text($cols2($t['label'], $idr($t['value'])));
            }

            $p->setEmphasis(true);
            $p->text($cols2('TOTAL', $idr($total)));
            $p->setEmphasis(false);

            $p->text($sep());
            $labelBayar = 'Bayar ' . ($transaction->payment_method == 'cash' ? 'Cash' : 'Transfer');
            $p->text($cols2($labelBayar, $idr($paid)));
            $p->text($cols2('Kembali', $idr($change)));

            $p->feed(2);
            $p->setJustification(Printer::JUSTIFY_CENTER);
            $p->text("Terima kasih!\n");
            $p->feed(1);

            try {
                $p->cut(Printer::CUT_PARTIAL);
            } catch (\Throwable $e) {
            }

            return response()->json(['message' => 'Struk berhasil dicetak']);
        } catch (\Throwable $e) {
            return response()->json([
                'message' => 'Gagal mencetak: ' . $e->getMessage(),
                'hint'    => 'Pastikan PRINT_DRIVER & PRNT/PRINT_NAME benar. Di macOS gunakan CupsPrintConnector dengan queue CUPS; atau gunakan PRINT_DRIVER=network (port 9100).',
            ], 500);
        } finally {
            if ($p) {
                try {
                    $p->close();
                } catch (\Throwable $e) {
                }
            }
        }
    }

    public function receiptBluetooth(Request $request)
    {
        $request->validate(['invoice' => ['required', 'string']]);

        $transaction = Transaction::with([
            'transaction_details.items' => function ($morphTo) {
                $morphTo->morphWith([
                    ProductVariant::class => [
                        'product',
                        'unit',
                        'product_variant_values',
                        'product_variant_values.variant_value',
                        'product_variant_values.variant_value.variant_option',
                    ],
                    Menu::class => ['category'],
                    DiscountPackage::class => [
                        'discount_package_items.items' => function ($morphTo) {
                            $morphTo->morphWith([
                                ProductVariant::class => [
                                    'product',
                                    'unit',
                                    'product_variant_values',
                                    'product_variant_values.variant_value',
                                    'product_variant_values.variant_value.variant_option',
                                ],
                            ]);
                        },
                    ],
                ]);
            },
            'transaction_taxs',
            'table',
            'cashier_shift.user',
            'customer',
        ])->where('invoice', $request->invoice)->firstOrFail();

        $codes = ['PRNT', 'NAME', 'ADDRESS', 'PHONE'];
        $settings = Setting::where('is_active', true)
            ->whereIn('code', $codes)
            ->pluck('value', 'code');

        $printerName = (string) ($settings['PRNT'] ?? '');
        $storeName   = (string) ($settings['NAME'] ?? 'TOKO');
        $storeAddr   = (string) ($settings['ADDRESS'] ?? '');
        $storePhone  = (string) ($settings['PHONE'] ?? '');

        $W   = (int) (config('printer.width') ?? 32);
        $idr = fn(int|float $n) => 'Rp ' . number_format((float)$n, 0, ',', '.');

        $cols2 = function (string $left, string $right, int $Wuse = null) {
            $Wuse = $Wuse ?? $GLOBALS['__ESC_W__'] ?? 32;
            $left  = preg_replace('/\s+/', ' ', $left);
            $right = preg_replace('/\s+/', ' ', $right);
            $rLen  = mb_strlen($right);
            $lMax  = max(0, $Wuse - $rLen);
            $lTrim = mb_substr($left, 0, $lMax);
            return str_pad($lTrim, $lMax, ' ') . $right . "\n";
        };

        $wrap = function (string $t, int $Wuse = null) {
            $Wuse = $Wuse ?? $GLOBALS['__ESC_W__'] ?? 32;
            return wordwrap($t, $Wuse, "\n", true) . "\n";
        };

        $variantLabel = function (ProductVariant $pv) {
            $parts = $pv->product_variant_values
                ->map(fn($v) => ($v->variant_value->variant_option->name ?? '') . ': ' . ($v->variant_value->name ?? ''))
                ->filter()
                ->values();
            return $parts->isNotEmpty() ? ' [' . $parts->implode(', ') . ']' : '';
        };

        $lines = $transaction->transaction_details->map(function ($d) use ($variantLabel, $idr) {
            if ($d->items_type === ProductVariant::class) {
                $pv   = $d->items;
                $name = ($pv->product->name ?? 'Variant') . $variantLabel($pv);
            } elseif ($d->items_type === Menu::class) {
                $name = $d->items->name ?? 'Menu';
            } elseif ($d->items_type === DiscountPackage::class) {
                $name = $d->items->name ?? 'Paket';
            } else {
                $name = class_basename($d->items_type);
            }

            $price  = (int) $d->price;

            if ($d->discount_type == 'percentage') {
                $discountPerItem = floor($price * ((int) $d->discount) / 100);
            } else {
                $discountPerItem = (int) $d->discount;
            }

            $finalPrice = max(0, $price - $discountPerItem);

            $totalAmount = $finalPrice * (int) $d->quantity;

            return [
                'name'   => $name,
                'qty'    => (int) $d->quantity,
                'price'  => $finalPrice,
                'amount' => $totalAmount,
            ];
        })->values()->all();

        $subtotal = array_reduce($lines, fn($c, $i) => $c + $i['amount'], 0);
        $discount = (int) ($transaction->discount ?? 0);

        $taxes = collect($transaction->transaction_taxs ?? [])
            ->map(fn($t) => ['label' => (string)$t->name, 'value' => (int)$t->value])
            ->values()
            ->all();

        $total  = (int) $transaction->grand_total;
        $paid   = (int) ($transaction->pay ?? 0);
        $change = (int) ($transaction->change ?? max(0, $paid - $total));

        $orderType = match ($transaction->transaction_type) {
            'dine_in'  => 'Makan ditempat',
            'platform' => ucfirst((string) $transaction->platform),
            'takeaway' => 'Takeaway',
            default    => ucfirst((string) $transaction->transaction_type),
        };

        $tableNo      = $transaction->table->number ?? null;
        $customerName = $transaction->customer->name ?? 'Umum';
        $cashierName  = optional($transaction->cashier_shift?->user)->name ?? '-';

        $ESC = "\x1B";
        $GS = "\x1D";
        $buf = "";

        $buf .= $ESC . "@";
        $buf .= $ESC . "a" . chr(1);
        $buf .= $storeName . "\n";
        if ($storeAddr)  $buf .= $storeAddr . "\n";
        if ($storePhone) $buf .= "Telp: " . $storePhone . "\n";
        $buf .= str_repeat("-", $W) . "\n";

        $buf .= $ESC . "a" . chr(0);
        $labels   = ['Invoice', 'Tanggal', 'Jenis', 'Pelanggan', 'Meja', 'Kasir'];
        $keyWidth = max(array_map('mb_strlen', $labels));

        $kvp = function (string $label, string $value) use ($W, $keyWidth) {
            $left  = str_pad($label, $keyWidth, ' ', STR_PAD_RIGHT) . ' : ';
            $avail = $W - mb_strlen($left);
            $out   = $left . mb_substr($value, 0, $avail) . "\n";
            $rest  = mb_substr($value, $avail);
            while ($rest !== '') {
                $chunk = mb_substr($rest, 0, $avail);
                $out  .= str_repeat(' ', mb_strlen($left)) . $chunk . "\n";
                $rest  = mb_substr($rest, mb_strlen($chunk));
            }
            return $out;
        };

        $buf .= $kvp('Invoice',  (string) $transaction->invoice);
        $buf .= $kvp('Tanggal',  now()->format('d/m/Y H:i'));
        $buf .= $kvp('Jenis',    (string) $orderType);
        if ($tableNo)      $buf .= $kvp('Meja',     (string) $tableNo);
        if ($customerName) $buf .= $kvp('Pelanggan', (string) $customerName);
        $buf .= $kvp('Kasir',    (string) $cashierName);

        $buf .= str_repeat("-", $W) . "\n";

        foreach ($lines as $it) {
            $buf .= $wrap($it['name'], $W);
            $buf .= $cols2("{$it['qty']} x " . $idr($it['price']), $idr($it['amount']), $W);
        }

        $buf .= str_repeat("-", $W) . "\n";
        $buf .= $cols2('Subtotal', $idr($subtotal), $W);
        if ($discount) {
            $buf .= $cols2('Diskon', '-' . $idr($discount), $W);
        }
        foreach ($taxes as $t) {
            $buf .= $cols2($t['label'], $idr($t['value']), $W);
        }

        $buf .= $ESC . "E" . chr(1);
        $buf .= $cols2('TOTAL', $idr($total), $W);
        $buf .= $ESC . "E" . chr(0);

        $buf .= str_repeat("-", $W) . "\n";
        $payLabel = 'Bayar ' . ($transaction->payment_method === 'cash' ? 'Cash' : 'Transfer');
        $buf .= $cols2($payLabel, $idr($paid), $W);
        $buf .= $cols2('Kembali', $idr($change), $W);

        $buf .= "\nTerima kasih!\n";
        $buf .= "\n";
        $buf .= $GS . "V" . chr(1);

        return response()->json([
            'printer' => $printerName,
            'width'   => $W,
            'raw'     => base64_encode($buf),
            'meta'    => [
                'invoice'   => (string) $transaction->invoice,
                'created_at' => now()->toIso8601String(),
                'cashier'   => $cashierName,
            ],
        ]);
    }

    public function kitchenReceiptBluetooth(Request $request)
    {
        $request->validate(['invoice' => ['required', 'string']]);

        $transaction = Transaction::with([
            'transaction_details.items' => function ($morphTo) {
                $morphTo->morphWith([
                    ProductVariant::class => [
                        'product',
                        'product_variant_values',
                        'product_variant_values.variant_value',
                        'product_variant_values.variant_value.variant_option',
                    ],
                    Menu::class => ['category'],
                    DiscountPackage::class => [
                        'discount_package_items.items' => function ($morphTo) {
                            $morphTo->morphWith([
                                ProductVariant::class => [
                                    'product',
                                    'product_variant_values',
                                    'product_variant_values.variant_value',
                                ],
                            ]);
                        },
                    ],
                ]);
            },
            'table',
            'customer',
        ])->where('invoice', $request->invoice)->firstOrFail();

        $codes = ['PRNT_KITCHEN', 'NAME'];
        $settings = Setting::where('is_active', true)
            ->whereIn('code', $codes)
            ->pluck('value', 'code');

        $printerName = (string) ($settings['PRNT_KITCHEN'] ?? '');
        $storeName   = (string) ($settings['NAME'] ?? 'DAPUR');

        $W = (int) (config('printer.width') ?? 32);

        $variantLabel = function (ProductVariant $pv) {
            $parts = $pv->product_variant_values
                ->map(fn($v) => ($v->variant_value->variant_option->name ?? '') . ': ' . ($v->variant_value->name ?? ''))
                ->filter()
                ->values();
            return $parts->isNotEmpty() ? ' [' . $parts->implode(', ') . ']' : '';
        };

        $lines = $transaction->transaction_details->map(function ($d) use ($variantLabel) {
            $name = '';
            if ($d->items_type === ProductVariant::class) {
                $pv   = $d->items;
                $name = ($pv->product->name ?? 'Variant') . $variantLabel($pv);
            } elseif ($d->items_type === Menu::class) {
                $name = $d->items->name ?? 'Menu';
            } elseif ($d->items_type === DiscountPackage::class) {
                $name = $d->items->name ?? 'Paket';
            } else {
                $name = class_basename($d->items_type);
            }

            return [
                'qty'  => (int) $d->quantity,
                'name' => $name,
                'note' => $d->note ?? '',
            ];
        })->values()->all();

        $orderType = match ($transaction->transaction_type) {
            'dine_in'  => 'Makan ditempat',
            'platform' => ucfirst((string) $transaction->platform),
            'takeaway' => 'Takeaway',
            default    => ucfirst((string) $transaction->transaction_type),
        };

        $tableNo      = $transaction->table->number ?? null;
        $customerName = $transaction->customer->name ?? 'Umum';

        $ESC = "\x1B";
        $GS  = "\x1D";
        $buf = "";

        // Initialize and center
        $buf .= $ESC . "@";
        $buf .= $ESC . "a" . chr(1); // center

        // Header
        $buf .= $ESC . "E" . chr(1); // bold on
        $buf .= "*** PESANAN DAPUR ***\n";
        $buf .= $ESC . "E" . chr(0); // bold off
        $buf .= str_repeat("-", $W) . "\n";

        // Left align
        $buf .= $ESC . "a" . chr(0);

        // Order info
        $kvp = function (string $label, string $value) use ($W) {
            $keyWidth = 10;
            $left  = str_pad($label, $keyWidth, ' ', STR_PAD_RIGHT) . ': ';
            $avail = $W - mb_strlen($left);
            return $left . mb_substr($value, 0, $avail) . "\n";
        };

        $buf .= $kvp('Invoice', (string) $transaction->invoice);
        $buf .= $kvp('Waktu', now()->format('d/m/Y H:i'));
        $buf .= $kvp('Jenis', $orderType);
        if ($tableNo)      $buf .= $kvp('Meja', (string) $tableNo);
        if ($customerName) $buf .= $kvp('Pelanggan', $customerName);

        $buf .= str_repeat("-", $W) . "\n";

        // Items - bigger emphasis
        $buf .= $ESC . "E" . chr(1); // bold
        foreach ($lines as $idx => $it) {
            $num = $idx + 1;
            $buf .= "{$num}. {$it['qty']}x {$it['name']}\n";
            if (!empty($it['note'])) {
                $buf .= $ESC . "E" . chr(0); // bold off for note
                $buf .= "   >> {$it['note']}\n";
                $buf .= $ESC . "E" . chr(1); // bold on again
            }
        }
        $buf .= $ESC . "E" . chr(0); // bold off

        $buf .= str_repeat("-", $W) . "\n";

        // Total items
        $totalQty = array_reduce($lines, fn($c, $i) => $c + $i['qty'], 0);
        $buf .= "Total Item: {$totalQty}\n";

        $buf .= "\n";
        $buf .= $ESC . "a" . chr(1); // center
        $buf .= "[ ] Selesai\n";
        $buf .= "\n";

        // Cut
        $buf .= $GS . "V" . chr(1);

        return response()->json([
            'printer' => $printerName,
            'width'   => $W,
            'raw'     => base64_encode($buf),
            'meta'    => [
                'invoice'    => (string) $transaction->invoice,
                'created_at' => now()->toIso8601String(),
                'table'      => $tableNo,
            ],
        ]);
    }

    public function openTable(Request $request)
    {
        $request->validate(['invoice' => ['required', 'string']]);
        $transaction = Transaction::where('invoice', $request->invoice)->first();

        if ($transaction->transaction_type == 'dine_in')
            $transaction->table->update([
                'status' => 'available'
            ]);
    }

    public function sendKitchen(Request $request)
    {
        $data = $request->validate(['invoice' => ['required', 'string']]);
        $transaction = Transaction::with(['transaction_details:id,transaction_id'])
            ->where('invoice', $data['invoice'])
            ->firstOrFail();

        DB::transaction(function () use ($transaction) {
            $existing = TransactionKitchen::where('transaction_id', $transaction->id)
                ->lockForUpdate()
                ->first();

            if (!$existing) {
                $kitchen = TransactionKitchen::create([
                    'transaction_id'   => $transaction->id,
                    'transaction_date' => now(),
                    'status'           => 'pending',
                ]);

                $now = now();
                $items = $transaction->transaction_details->map(function ($detail) use ($kitchen, $now) {
                    return [
                        'transaction_kitchen_id' => $kitchen->id,
                        'transaction_detail_id'  => $detail->id,
                        'is_done'                => false,
                        'created_at'             => $now,
                        'updated_at'             => $now,
                    ];
                })->all();

                if (!empty($items)) {
                    TransactionKitchenItem::insert($items);
                }
            }
        });
    }

    public function discountPerItem(Request $request)
    {
        $data = $request->validate([
            'customer_id'       => ['nullable', 'integer'],
            'carts'             => ['required', 'array'],
            'carts.*.id'        => ['required'],
            'carts.*.type'      => ['required', 'string'],
            'carts.*.price'     => ['required', 'numeric'],
            'carts.*.quantity'  => ['required', 'integer', 'min:1'],
        ]);

        $customerId = $data['customer_id'] ?? null;
        $cartItems  = $data['carts'];

        $typeMap = [
            'product' => \App\Models\ProductVariant::class,
            'menu'    => \App\Models\Menu::class,
            'package' => \App\Models\DiscountPackage::class,
        ];

        $cartIndex = [];
        $qtyPerKey = [];
        foreach ($cartItems as $ci) {
            $fqcn = $typeMap[$ci['type']] ?? null;
            if (!$fqcn) {
                continue;
            }
            $key = $fqcn . ':' . $ci['id'];
            $cartIndex[$key] = [
                'price' => (float) $ci['price'],
                'qty'   => (int) $ci['quantity'],
            ];
            $qtyPerKey[$key] = (int) $ci['quantity'];
        }

        $result = ['lines' => []];
        foreach (array_keys($cartIndex) as $key) {
            $result['lines'][$key] = [
                'applied'       => null,
                'discount_type' => null,
                'discount'      => null,
            ];
        }

        $discounts = DiscountProduct::query()
            ->where('is_active', 1)
            ->get();

        foreach ($discounts as $disc) {
            $customerOk = false;

            if ((int)($disc->all_customers ?? 0) === 1) {
                $customerOk = true;
            } elseif ($customerId) {
                $customerOk = DiscountProductCustomer::query()
                    ->where('discount_product_id', $disc->id)
                    ->where('customer_id', $customerId)
                    ->exists();
            }

            if (!$customerOk) {
                continue;
            }

            $eligibleKeys = [];

            if ((int)($disc->all_products ?? 0) === 1) {
                $eligibleKeys = array_keys($cartIndex);
            } else {
                $discItems = DiscountProductItem::query()
                    ->where('discount_product_id', $disc->id)
                    ->get();

                foreach ($discItems as $it) {
                    $k = $it->items_type . ':' . $it->items_id;
                    if (isset($cartIndex[$k])) {
                        $eligibleKeys[] = $k;
                    }
                }
            }

            if (empty($eligibleKeys)) {
                continue;
            }

            $totalEligibleQty = 0;
            foreach ($eligibleKeys as $k) {
                $totalEligibleQty += ($qtyPerKey[$k] ?? 0);
            }
            $qtyMin = (int) ($disc->discount_quantity ?? 0);
            if ($qtyMin > 0 && $totalEligibleQty < $qtyMin) {
                continue;
            }

            foreach ($eligibleKeys as $k) {
                $unitPrice = $cartIndex[$k]['price'] ?? 0.0;
                if ($unitPrice <= 0) continue;

                $candidateType  = $disc->discount_type;
                $candidateValue = (float) $disc->discount_value;
                $candidateAmount = 0.0;
                if ($candidateType === 'nominal') {
                    $candidateAmount = min($candidateValue, $unitPrice);
                } else {
                    $candidateAmount = ($unitPrice * $candidateValue) / 100.0;
                }

                $current = $result['lines'][$k];
                $currentAmount = 0.0;
                if ($current['discount_type'] && $current['discount'] !== null) {
                    if ($current['discount_type'] === 'nominal') {
                        $currentAmount = min((float) $current['discount'], $unitPrice);
                    } else {
                        $currentAmount = ($unitPrice * (float) $current['discount']) / 100.0;
                    }
                }

                if ($candidateAmount > $currentAmount) {
                    $result['lines'][$k] = [
                        'applied' => [
                            'id'    => $disc->id,
                            'name'  => $disc->discount_name,
                            'type'  => $disc->discount_type,
                            'value' => $candidateValue,
                        ],
                        'discount_type' => $candidateType,
                        'discount'      => $candidateValue,
                    ];
                }
            }
        }

        return response()->json($result);
    }
}

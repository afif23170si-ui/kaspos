<?php

namespace App\Http\Controllers\Apps;

use App\Models\Menu;
use App\Models\Table;
use App\Traits\Helpers;
use App\Models\Category;
use App\Models\Customer;
use App\Models\Transaction;
use App\Models\CashierShift;
use Illuminate\Http\Request;
use App\Models\ProductVariant;
use Illuminate\Support\Carbon;
use App\Models\DiscountPackage;
use App\Models\TransactionKitchen;
use Illuminate\Support\Facades\DB;
use App\Http\Controllers\Controller;
use App\Models\CustomerPointSetting;
use Illuminate\Pagination\LengthAwarePaginator;

class HomeController extends Controller
{
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

    public function index(Request $request)
    {
        $table = null;
        if ($request->session()->has('table_id')) {
            $table = [
                'id'     => $request->session()->get('table_id'),
                'number' => $request->session()->get('table_number'),
            ];
        }

        $filters = [
            'search' => $request->search,
            'category' => $request->category,
        ];

        // get all product variants with their product and variant values
        $variants = ProductVariant::with(['product', 'product_variant_values.variant_value'])
            ->when($filters['search'] ?? null, fn($q) =>
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
                $item->price = $item->selling_price;
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
            $package->price = $package->total_price;

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

        $categories = Category::query()->select('id', 'name', 'image')->orderBy('name')->get();

        return inertia('apps/home/index', [
            'categories' => $categories,
            'items'      => $data,
            'filters'    => $filters,
            'table'      => $table,
        ]);
    }

    public function store(Request $request)
    {
        DB::transaction(function () use ($request) {
            // get active shift cashier
            $cashierShift = CashierShift::where('status', 'open')->firstOrFail();

            // get cutomer
            $customer = Customer::firstOrCreate(
                ['name' => $request->customer_name],
                ['name' => $request->customer_name]
            );

            // create new transaction
            $randomNumber = str_pad(rand(0, 9999), 4, '0', STR_PAD_LEFT);
            $invoiceCode = 'PJ' . now()->format('dmY') . $randomNumber;

            $transaction = Transaction::create([
                'invoice' => $invoiceCode,
                'cashier_shift_id' => $cashierShift->id,
                'customer_id' => $customer->id,
                'transaction_type' => 'dine_in',
                'table_id' => $request->table_id,
                'subtotal' => $request->totals['subtotal'],
                'grand_total' => $request->totals['total'],
                'transaction_date' => Carbon::today(),
                'shipping_status' => null,
                'payment_method' => null,
                'status' => 'pending',
            ]);

            $modelMap = [
                'package' => \App\Models\DiscountPackage::class,
                'product' => \App\Models\ProductVariant::class,
                'menu' => \App\Models\Menu::class,
            ];

            foreach ($request->items as $item) {
                $transaction->transaction_details()->create([
                    'items_id' => $item['id'],
                    'items_type' => $modelMap[$item['type']] ?? null,
                    'price' => $item['price'],
                    'quantity' => $item['qty'],
                    'note' => $item['note'] ?? null,
                ]);
            }

            $table = Table::find($request->table_id);
            $table->update([
                'status' => 'occupied',
            ]);

            $transaction->load('transaction_details');

            $alreadyInKitchen = TransactionKitchen::with('transaction_details')->where('transaction_id', $transaction->id)->first();

            if(!$alreadyInKitchen){
                $transactionKitchen = TransactionKitchen::create([
                    'transaction_id' => $transaction->id,
                    'transaction_date' => Carbon::now(),
                    'status' => 'pending',
                ]);

                foreach($transaction->transaction_details as $detail)
                    $transactionKitchen->transaction_kitchen_items()->create([
                        'transaction_detail_id' => $detail->id,
                        'is_done' => false,
                    ]);
            }
        });
    }

    public function table(Request $request, Table $table)
    {
        if (!$request->session()->has('table_id')) {
            $request->session()->put('table_id', $table->id);
            $request->session()->put('table_number', $table->number);
        }

        return to_route('home');
    }
}

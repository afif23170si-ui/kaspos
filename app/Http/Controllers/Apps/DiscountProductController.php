<?php

namespace App\Http\Controllers\Apps;

use App\Models\Menu;
use App\Models\Customer;
use Illuminate\Http\Request;
use App\Models\ProductVariant;
use App\Models\DiscountPackage;
use App\Models\DiscountProduct;
use Illuminate\Support\Facades\DB;
use App\Http\Controllers\Controller;
use App\Http\Requests\DiscountProductRequest;
use Illuminate\Routing\Controllers\Middleware;
use Illuminate\Routing\Controllers\HasMiddleware;

class DiscountProductController extends Controller implements HasMiddleware
{
    /**
     * Define middleware for the DiscountPackageController.
     */
    public static function middleware()
    {
        return [
            new Middleware('permission:discount-products-data', only: ['index']),
            new Middleware('permission:discount-products-create', only: ['store', 'create']),
            new Middleware('permission:discount-products-update', only: ['update', 'edit']),
            new Middleware('permission:discount-products-delete', only: ['destroy']),
            new Middleware('permission:discount-products-show', only: ['show']),
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

        // get all discount products
        $discountProducts = DiscountProduct::query()
            ->when($request->search, fn($search) => $search->where('discount_name', 'like', "%{$request->search}%"))
            ->latest()
            ->paginate($perPage, ['*'], 'page', $currentPage)->withQueryString();

        // render view
        return inertia('apps/discount-products/index', [
           'discountProducts' => $discountProducts,
           'currentPage' => $currentPage,
           'perPage' => $perPage,
       ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        // get all product variants with their product and variant values
        $variants = ProductVariant::query()
            ->with(['product', 'product_variant_values.variant_value'])
            ->get();

        // map the variants values
        $variantList = $variants->map(function ($variant) {
            $variantValues = $variant->product_variant_values->map(function ($v) {
                return $v->variant_value->name;
            })->implode(' ');

            return [
                'type' => 'product',
                'id' => $variant->id,
                'name' => $variant->product->name . ' ' . $variantValues,
                'price' => $variant->price,
                'capital_price' => $variant->capital_price,
                'image' => $variant->product->image,
                'category_id' => $variant->product->category_id,
                'created_at' => $variant->created_at,
            ];
        });

        // get all menu items
        $menus = Menu::select('id', 'name', 'category_id', 'image', 'created_at', 'capital_price', 'selling_price', 'margin')
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
            ->get()
            ->map(function ($package) {
                $package->type = 'package';

                $package->discount_package_items->transform(function ($item) {
                    $model = $item->items;

                    if ($model instanceof \App\Models\ProductVariant) {
                        $variantValues = $model->product_variant_values
                            ->map(fn($v) => $v->variant_value->name)
                            ->implode(' ');

                        $item->name = $model->product->name . ' ' . $variantValues;
                    } elseif ($model instanceof \App\Models\Menu) {
                        $item->name = $model->name;
                    } else {
                        $item->name = '-';
                    }

                    return $item;
                });

                return $package;
        });

        // merge collection dan urutkan
        $items = $variantList->concat($menus)->concat($discount_packages)->sortByDesc('created_at')->values();

        // customers
        $customers = Customer::query()->orderBy('name')->get();

        // render view
        return inertia('apps/discount-products/create', [
            'items' => $items,
            'customers' => $customers
        ]);
    }

    /**
     * Display the specified resource.
     */
    public function show(DiscountProduct $discountProduct)
    {
        // load relationship
        $discountProduct->load([
            'discount_product_items',
            'discount_product_items.items' => function($morphTo) {
                $morphTo->morphWith([
                    \App\Models\ProductVariant::class => ['product', 'unit', 'product_variant_values', 'product_variant_values.variant_value', 'product_variant_values.variant_value.variant_option'],
                    \App\Models\Menu::class,
                    \App\Models\DiscountPackage::class
                ]);
            },
            'discount_product_customers.customer'
        ]);

        $discountProduct->discount_product_items->transform(function ($item) {
            $model = $item->items;

            if ($model instanceof \App\Models\ProductVariant) {
                $variantValues = $model->product_variant_values
                    ->map(fn ($v) => $v->variant_value->name)
                    ->implode(' ');

                $item->type = 'product';
                $item->id = $model->id;
                $item->name = $model->product->name . ' ' . $variantValues;
            } elseif ($model instanceof \App\Models\Menu) {
                $item->type = 'menu';
                $item->id = $model->id;
                $item->name = $model->name;
            } elseif ($model instanceof \App\Models\DiscountPackage) {
                $item->type = 'package';
                $item->id = $model->id;
                $item->name = $model->name;
            }

            return $item;
        });

        // render view
        return inertia('apps/discount-products/show', [
            'discountProduct' => $discountProduct
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(DiscountProductRequest $request)
    {
        DB::transaction(function() use($request){
            // create discount package
            $discount_product = DiscountProduct::create([
                'discount_name' => $request->discount_name,
                'discount_value' => $request->discount_value,
                'discount_type' => $request->discount_type == 'percent' ? 'percentage' : 'nominal',
                'discount_quantity' => $request->discount_quantity,
                'is_active' => $request->is_active == '1' ? true : false,
                'all_products' => $request->is_all_products == 'semua' ? true : false,
                'all_customers' => $request->is_all_customers == 'semua' ? true : false
            ]);

            // create discount package items
            collect($request->selectedItems)->each(function($item) use($discount_product){
                if ($item['type'] == 'menu')
                    $model = \App\Models\Menu::class;
                elseif($item['type'] == 'product')
                    $model = \App\Models\ProductVariant::class;
                else
                    $model = \App\Models\DiscountPackage::class;

                $discount_product->discount_product_items()->create([
                    'items_type' => $model,
                    'items_id' => $item['id'],
                ]);
            });

            collect($request->selectedCustomers)->each(function($item) use($discount_product){
                $discount_product->discount_product_customers()->create([
                    'customer_id' => $item['id'],
                ]);
            });
        });

        // render view
        return to_route('apps.discount-products.index');
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(DiscountProduct $discountProduct)
    {
        $discountProduct->load([
             'discount_product_items.items' => function($morphTo) {
                $morphTo->morphWith([
                    \App\Models\ProductVariant::class => ['product', 'unit', 'product_variant_values', 'product_variant_values.variant_value', 'product_variant_values.variant_value.variant_option'],
                    \App\Models\Menu::class,
                    \App\Models\DiscountPackage::class,
                ]);
            },
            'discount_product_customers.customer'
        ]);

        $discountProduct->discount_product_items->transform(function ($item) {
            $model = $item->items;

            if ($model instanceof \App\Models\ProductVariant) {
                $variantValues = $model->product_variant_values
                    ->map(fn ($v) => $v->variant_value->name)
                    ->implode(' ');

                $item->type = 'product';
                $item->id = $model->id;
                $item->name = $model->product->name . ' ' . $variantValues;
            } elseif ($model instanceof \App\Models\Menu) {
                $item->type = 'menu';
                $item->id = $model->id;
                $item->name = $model->name;
            } elseif ($model instanceof \App\Models\DiscountPackage) {
                $item->type = 'package';
                $item->id = $model->id;
                $item->name = $model->name;
            }

            return $item;
        });

        // get all product variants with their product and variant values
        $variants = ProductVariant::query()
            ->with(['product', 'product_variant_values.variant_value'])
            ->get();

        // map the variants values
        $variantList = $variants->map(function ($variant) {
            $variantValues = $variant->product_variant_values->map(function ($v) {
                return $v->variant_value->name;
            })->implode(' ');

            return [
                'type' => 'product',
                'id' => $variant->id,
                'name' => $variant->product->name . ' ' . $variantValues,
                'price' => $variant->price,
                'capital_price' => $variant->capital_price,
                'image' => $variant->product->image,
                'category_id' => $variant->product->category_id,
                'created_at' => $variant->created_at,
            ];
        });

        // get all menu items
        $menus = Menu::select('id', 'name', 'category_id', 'image', 'created_at', 'capital_price', 'selling_price', 'margin')
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
            ->get()
            ->map(function ($package) {
                $package->type = 'package';

                $package->discount_package_items->transform(function ($item) {
                    $model = $item->items;

                    if ($model instanceof \App\Models\ProductVariant) {
                        $variantValues = $model->product_variant_values
                            ->map(fn($v) => $v->variant_value->name)
                            ->implode(' ');

                        $item->name = $model->product->name . ' ' . $variantValues;
                    } elseif ($model instanceof \App\Models\Menu) {
                        $item->name = $model->name;
                    } else {
                        $item->name = '-';
                    }

                    return $item;
                });

                return $package;
        });

        // merge collection dan urutkan
        $items = $variantList->concat($menus)->concat($discount_packages)->sortByDesc('created_at')->values();

        // customers
        $customers = Customer::query()->orderBy('name')->get();

        // render view
        return inertia('apps/discount-products/edit', [
            'items' => $items,
            'customers' => $customers,
            'discountProduct' => $discountProduct
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(DiscountProductRequest $request, DiscountProduct $discountProduct)
    {
         DB::transaction(function() use($request, $discountProduct){
            // update discount product
            $discountProduct->update([
                'discount_name' => $request->discount_name,
                'discount_value' => $request->discount_value,
                'discount_type' => $request->discount_type == 'percent' ? 'percentage' : 'nominal',
                'discount_quantity' => $request->discount_quantity,
                'is_active' => $request->is_active == '1' ? true : false,
                'all_products' => $request->is_all_products == 'semua' ? true : false,
                'all_customers' => $request->is_all_customers == 'semua' ? true : false
            ]);

            // delete discount product items
            $discountProduct->discount_product_items()->delete();
            // delete discount product customer
            $discountProduct->discount_product_customers()->delete();

            // create discount product items
            collect($request->selectedItems)->each(function($item) use($discountProduct){
                if ($item['type'] == 'menu')
                    $model = \App\Models\Menu::class;
                elseif($item['type'] == 'product')
                    $model = \App\Models\ProductVariant::class;
                else
                    $model = \App\Models\DiscountPackage::class;

                $discountProduct->discount_product_items()->create([
                    'items_type' => $model,
                    'items_id' => $item['id'],
                ]);
            });

            // create discount product customers
            collect($request->selectedCustomers)->each(function($item) use($discountProduct){
                $discountProduct->discount_product_customers()->create([
                    'customer_id' => $item['id'],
                ]);
            });
        });

        // render view
        return to_route('apps.discount-products.index');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(DiscountProduct $discountProduct)
    {
        // delete discount product
        $discountProduct->delete();

        // render view
        return back();
    }

}

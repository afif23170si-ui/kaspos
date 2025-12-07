<?php

namespace App\Http\Controllers\Apps;

use App\Models\Menu;
use Illuminate\Http\Request;
use App\Models\ProductVariant;
use App\Models\DiscountPackage;
use Illuminate\Support\Facades\DB;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Storage;
use App\Http\Requests\DiscountPackageRequest;
use Illuminate\Routing\Controllers\Middleware;
use Illuminate\Routing\Controllers\HasMiddleware;

class DiscountPackageController extends Controller implements HasMiddleware
{
    /**
     * Define middleware for the DiscountPackageController.
     */
    public static function middleware()
    {
        return [
            new Middleware('permission:discount-packages-data', only: ['index']),
            new Middleware('permission:discount-packages-create', only: ['store', 'create']),
            new Middleware('permission:discount-packages-update', only: ['update', 'edit']),
            new Middleware('permission:discount-packages-delete', only: ['destroy']),
            new Middleware('permission:discount-packages-show', only: ['show']),
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

        // get all discount packages
        $discountPackages = DiscountPackage::query()
            ->select('id', 'name', 'image', 'total_price', 'is_active')
            ->when($request->search, fn($search) => $search->where('name', 'like', "%{$request->search}%"))
            ->latest()
            ->paginate($perPage, ['*'], 'page', $currentPage)->withQueryString();

        // render view
        return inertia('apps/discount-packages/index', [
           'discountPackages' => $discountPackages,
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

        // merge collection dan urutkan
        $items = $variantList->concat($menus)->sortByDesc('created_at')->values();

        // render view
        return inertia('apps/discount-packages/create', [
            'items' => $items,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(DiscountPackageRequest $request)
    {
        DB::transaction(function() use($request){
             // upload file
            if($request->hasFile('image')){
                $image = $request->file('image');
                $image->storeAs('discount-packages', $image->hashName());
            }

            // create discount package
            $discount_package = DiscountPackage::create([
                'name' => $request->name,
                'image' => $image->hashName(),
                'total_price' => collect($request->selectedItems)->sum('estimate_price'),
                'is_active' => $request->is_active == '1' ? true : false,
            ]);

            // create discount package items
            collect($request->selectedItems)->each(function($item) use($discount_package){
                if ($item['type'] == 'menu')
                    $model = \App\Models\Menu::class;
                else
                    $model = \App\Models\ProductVariant::class;

                $discount_package->discount_package_items()->create([
                    'items_type' => $model,
                    'items_id' => $item['id'],
                    'estimate_price' => $item['estimate_price'],
                ]);
            });
        });

        // render view
        return to_route('apps.discount-packages.index');
    }

    /**
     * Display the specified resource.
     */
    public function show(DiscountPackage $discountPackage)
    {
        // load relationship
        $discountPackage->load([
            'discount_package_items',
            'discount_package_items.items' => function($morphTo) {
                $morphTo->morphWith([
                    \App\Models\ProductVariant::class => ['product', 'unit', 'product_variant_values', 'product_variant_values.variant_value', 'product_variant_values.variant_value.variant_option'],
                    \App\Models\Menu::class
                ]);
            }
        ]);

        // render view
        return inertia('apps/discount-packages/show', [
            'discountPackage' => $discountPackage
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(DiscountPackage $discountPackage)
    {
        // load relationship
        $discountPackage->load([
            'discount_package_items',
            'discount_package_items.items' => function($morphTo) {
                $morphTo->morphWith([
                    \App\Models\ProductVariant::class => ['product', 'unit', 'product_variant_values', 'product_variant_values.variant_value', 'product_variant_values.variant_value.variant_option'],
                    \App\Models\Menu::class
                ]);
            }
        ]);

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

        // merge collection dan urutkan
        $items = $variantList->concat($menus)->sortByDesc('created_at')->values();

        // render view
        return inertia('apps/discount-packages/edit', [
            'discountPackage' => $discountPackage,
            'items' => $items
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(DiscountPackageRequest $request, DiscountPackage $discountPackage)
    {
         DB::transaction(function() use($request, $discountPackage){
            // upload file
            if($request->hasFile('image')){
                Storage::disk('public')->delete('discount-packages/'.basename($discountPackage->image));

                $image = $request->file('image');
                $image->storeAs('discount-packages', $image->hashName());

                $discountPackage->update([
                    'image' => $image->hashName()
                ]);
            }

            // update discount package
            $discountPackage->update([
                'name' => $request->name,
                'total_price' => collect($request->selectedItems)->sum('estimate_price'),
                'is_active' => $request->is_active == '1' ? true : false,
            ]);

            $currentIds = collect($request->selectedItems)->map(function ($item) {
                return [
                    'items_type' => $item['type'] === 'product'
                        ? \App\Models\ProductVariant::class
                        : \App\Models\Menu::class,
                    'items_id' => $item['id'],
                ];
            });

            // delete discount package items
            $discountPackage->discount_package_items()->delete();

            // create discount package items
            collect($request->selectedItems)->each(function($item) use($discountPackage){
                if ($item['type'] == 'product')
                    $model = \App\Models\ProductVariant::class;
                else
                    $model = \App\Models\Menu::class;

                $discountPackage->discount_package_items()->create([
                    'items_type' => $model,
                    'items_id' => $item['id'],
                    'estimate_price' => $item['estimate_price'],
                ]);
            });
        });

        // render view
        return to_route('apps.discount-packages.index');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(DiscountPackage $discountPackage)
    {
        // delete discount package
        $discountPackage->delete();

        // render view
        return back();
    }
}

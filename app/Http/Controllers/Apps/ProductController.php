<?php

namespace App\Http\Controllers\Apps;

use App\Models\Unit;
use App\Models\Product;
use App\Models\Category;
use Illuminate\Http\Request;
use App\Models\VariantOption;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use App\Http\Controllers\Controller;
use App\Http\Requests\ProductRequest;
use Illuminate\Support\Facades\Storage;
use Illuminate\Routing\Controllers\Middleware;
use Illuminate\Routing\Controllers\HasMiddleware;

class ProductController extends Controller implements HasMiddleware
{
    /**
     * Define middleware for the ProductController.
     */
    public static function middleware()
    {
        return [
            new Middleware('permission:products-data', only: ['index']),
            new Middleware('permission:products-create', only: ['store', 'create']),
            new Middleware('permission:products-update', only: ['update', 'edit']),
            new Middleware('permission:products-delete', only: ['destroy']),
            new Middleware('permission:products-show', only: ['show']),
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

        // get all products
        $products = Product::query()
            ->with('category')
            ->select('id', 'name', 'sku', 'image', 'category_id', 'description', 'has_variant')
            ->when($request->search, fn($search) => $search->where('name', 'like', "%{$request->search}%"))
            ->latest()
            ->paginate($perPage, ['*'], 'page', $currentPage)->withQueryString();

        // render view
        return inertia('apps/products/index', [
            'products' => $products,
            'currentPage' => $currentPage,
            'perPage' => $perPage,
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        // get categories data
        $categories = Category::select('id', 'name')->orderBy('name')->get();

        // get units data
        $units = Unit::select('id', 'name')->orderBy('name')->get();

        // render view
        return inertia('apps/products/create', [
            'categories' => $categories,
            'units' => $units
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(ProductRequest $request)
    {
        DB::transaction(function() use($request){
            // upload file
            if($request->hasFile('image')){
                $image = $request->file('image');
                $image->storeAs('products', $image->hashName());
            }

            // create new product
            $product = Product::create([
                'sku' => $request->sku,
                'name' => $request->name,
                'category_id' => $request->category_id,
                'description' => $request->description,
                'image' => $request->hasFile('image') ? $image->hashName() : null,
                'has_variant' => $request->hasVariant,
                'has_stock' => $request->hasStock,
            ]);

            if($request->hasVariant){
                $variantOptionMap = [];
                foreach ($request->variantOptions as $item) {
                    $variantOption = VariantOption::updateOrCreate(['name' => $item['name']]);

                    $variantOptionMap[$item['name']] = $variantOption;
                }

                foreach ($request->variants as $item) {
                    $variant = $product->variants()->create([
                        'barcode' => $item['barcode'],
                        'price' => $item['price'],
                        'capital_price' => $item['capital_price'],
                        'unit_id' => $item['unit'],
                        'minimum_quantity' => $item['minimum_quantity'],
                    ]);

                    if($request->hasStock){
                        // create new stock
                        $stock = $variant->stocks()->create([
                            'batch_code' => 'PRDV-'.now()->format('Ymd').'-'.strtoupper(str()->random(4)),
                            'quantity' => $item['quantity'],
                            'expired_at' => $item['expired'],
                        ]);

                        // create new stock movements
                        $stock->movements()->create([
                            'type' => 'in',
                            'quantity' => $stock->quantity,
                            'description' => 'Initial Stock',
                        ]);
                    }

                    foreach ($item['combination'] as $index => $value) {
                        $optionName = $request->variantOptions[$index]['name'];
                        $variantOption = $variantOptionMap[$optionName] ?? null;
                        if ($variantOption) {
                            $variantValue = $variantOption->variant_values()->updateOrCreate([
                                'name' => $value
                            ]);
                            $variant->product_variant_values()->create([
                                'variant_value_id' => $variantValue->id
                            ]);
                        }
                    }
                }
            }else{
                // create new variant product
                $variant = $product->variants()->create([
                    'barcode' => $request->barcode,
                    'capital_price' => $request->capital_price,
                    'price' => $request->price,
                    'unit_id' => $request->unit,
                    'minimum_quantity' => $request->minimum_quantity,
                ]);

                if($request->hasStock){
                    // create new stock
                    $stock = $variant->stocks()->create([
                        'batch_code' => 'PRDV-'.now()->format('Ymd').'-'.strtoupper(str()->random(4)),
                        'quantity' => $request->quantity,
                        'expired_at' => $request->expired,
                    ]);

                    // create new stock movements
                    $stock->movements()->create([
                        'type' => 'in',
                        'quantity' => $stock->quantity,
                        'description' => 'Initial Stock',
                    ]);
                }
            }
        });

        // render view
        return to_route('apps.products.index');
    }

    /**
     * Display the specified resource.
     */
    public function show(Product $product)
    {
        // load relationship
        $product->load(
            'category', 'variants', 'variants.initial_stock', 'variants.unit', 'variants.product_variant_values',
            'variants.product_variant_values.variant_value', 'variants.product_variant_values.variant_value.variant_option'
        );

        // get variant options name
        $variantOptions = $product->variants
            ->flatMap(function ($variant) {
                return $variant->product_variant_values->map(function ($item) {
                    return $item->variant_value->variant_option;
                });
            })
            ->unique('id')
            ->values();

        // format collection
        $product->variants->each(function($item){

            $item->price = number_format($item->price, 0);
            $item->capital_price = number_format($item->capital_price, 0);
            $item->expired_at = $item->expired_at ? Carbon::parse($item->expired_at)->format('d/m/Y') : '-';

            return $item;
        });

        // render view
        return inertia('apps/products/show', [
            'product' => $product,
            'variantOptions' => $variantOptions
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Product $product)
    {
        // get categories data
        $categories = Category::select('id', 'name')->orderBy('name')->get();

        // get units data
        $units = Unit::select('id', 'name')->orderBy('name')->get();

        // load relationship
        $product->load('variants', 'variants.initial_stock');

        // get variant options name
        $variantOptions = $product->variants
            ->flatMap(function ($variant) {
                return $variant->product_variant_values->map(function ($item) {
                    return $item->variant_value->variant_option;
                });
            })
            ->unique('id')
            ->values();

        // get variant value name
        $variantValues = $product->variants
            ->flatMap(function ($variant) {
                return $variant->product_variant_values->map(function ($item) {
                    return $item->variant_value;
                });
            })
            ->unique('id')
            ->groupBy('variant_option_id')
            ->map(function ($group) {
                return $group->pluck('name')->toArray();
            });

        // render view
        return inertia('apps/products/edit', [
            'product' => $product,
            'categories' => $categories,
            'units' => $units,
            'variantOptions' => $variantOptions,
            'variantValues' => $variantValues
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(ProductRequest $request, Product $product)
    {
        DB::transaction(function() use($request, $product){
            // update product by id
            $product->update([
                'sku' => $request->sku,
                'name' => $request->name,
                'category_id' => $request->category_id,
                'description' => $request->description,
                'has_variant' => $request->hasVariant,
                'has_stock' => $request->hasStock
            ]);

            // upload file
            if($request->hasFile('image')){
                Storage::disk('public')->delete('products/'.basename($product->image));

                $image = $request->file('image');
                $image->storeAs('products', $image->hashName());

                $product->update([
                    'image' => $image->hashName()
                ]);
            }

            if($request->hasVariant){
                $variantOptionMap = [];
                foreach ($request->variantOptions as $item) {
                    $variantOption = VariantOption::updateOrCreate(['name' => $item['name']]);

                    $variantOptionMap[$item['name']] = $variantOption;
                }

                // delete all product variants
                $product->variants()->delete();

                // create new variant
                foreach ($request->variants as $item) {
                    $variant = $product->variants()->create([
                        'barcode' => $item['barcode'],
                        'price' => $item['price'],
                        'capital_price' => $item['capital_price'],
                        'unit_id' => $item['unit'],
                        'minimum_quantity' => $item['minimum_quantity'],
                    ]);

                    if($request->hasStock){
                        // create new stock
                        $stock = $variant->stocks()->create([
                            'batch_code' => 'PRDV-'.now()->format('Ymd').'-'.strtoupper(str()->random(4)),
                            'quantity' => $item['quantity'],
                            'expired_at' => $item['expired'],
                        ]);

                        // create new stock movements
                        $stock->movements()->create([
                            'type' => 'in',
                            'quantity' => $stock->quantity,
                            'description' => 'Initial Stock',
                        ]);
                    }

                    foreach ($item['combination'] as $index => $value) {
                        $optionName = $request->variantOptions[$index]['name'];
                        $variantOption = $variantOptionMap[$optionName] ?? null;
                        if ($variantOption) {
                            $variantValue = $variantOption->variant_values()->updateOrCreate([
                                'name' => $value
                            ]);
                            $variant->product_variant_values()->create([
                                'variant_value_id' => $variantValue->id
                            ]);
                        }
                    }
                }
            }else{
                // delete all variant product
                $product->variants()->delete();
                // create new variant product
                $variant = $product->variants()->create([
                    'barcode' => $request->barcode,
                    'price' => $request->price,
                    'capital_price' => $request->capital_price,
                    'unit_id' => $request->unit,
                    'minimum_quantity' => $request->minimum_quantity
                ]);

                if($request->hasStock){
                    // create new stock
                    $stock = $variant->stocks()->create([
                        'batch_code' => 'PRDV-'.now()->format('Ymd').'-'.strtoupper(str()->random(4)),
                        'quantity' => $request->quantity,
                        'expired_at' => $request->expired,
                    ]);

                    // create new stock movements
                    $stock->movements()->create([
                        'type' => 'in',
                        'quantity' => $stock->quantity,
                        'description' => 'Initial Stock',
                    ]);
                }
            }
        });

        // render view
        return to_route('apps.products.index');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Product $product)
    {
        // delete image
        Storage::disk('public')->delete('products/'.basename($product->image));

        // delete product by id
        $product->variants()->delete();
        $product->delete();

        // render view
        return back();
    }
}

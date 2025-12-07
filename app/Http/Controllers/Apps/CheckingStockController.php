<?php

namespace App\Http\Controllers\Apps;

use Carbon\Carbon;
use App\Models\User;
use App\Models\Stock;
use App\Models\Material;
use Illuminate\Http\Request;
use App\Models\CheckingStock;
use App\Models\ProductVariant;
use Illuminate\Support\Facades\DB;
use App\Http\Controllers\Controller;
use App\Http\Requests\CheckingStockRequest;
use Illuminate\Routing\Controllers\Middleware;
use Illuminate\Routing\Controllers\HasMiddleware;

class CheckingStockController extends Controller implements HasMiddleware
{
     /**
     * Define middleware for the CheckingStockController.
     */
    public static function middleware()
    {
        return [
            new Middleware('permission:checking-stocks-data', only: ['index']),
            new Middleware('permission:checking-stocks-create', only: ['store', 'create']),
            new Middleware('permission:checking-stocks-update', only: ['update', 'edit']),
            new Middleware('permission:checking-stocks-show', only: ['show']),
            new Middleware('permission:checking-stocks-delete', only: ['destroy']),
        ];
    }

    protected function adjustStockFromChecking(Request $request, $checkingStock): void
    {
        collect($request->items)->each(function ($item) use ($request, $checkingStock) {
            $model = $request->type == 'products'
                ? \App\Models\ProductVariant::class
                : \App\Models\Material::class;

            $itemId = $item['item'];
            $realQty = $item['real_quantity'];
            $quantity = $item['quantity'];

            $diff = $realQty - $quantity;

            if ($diff > 0) {
                $newStock = \App\Models\Stock::create([
                    'stockable_type' => $model,
                    'stockable_id' => $itemId,
                    'batch_code' => 'ADJT-'.Carbon::parse($checkingStock->due_date)->format('Ymd').'-'.strtoupper($checkingStock->no_ref),
                    'quantity' => $diff,
                    'expired_at' => null,
                ]);

                \App\Models\StockMovement::create([
                    'stock_id' => $newStock->id,
                    'type' => 'in',
                    'quantity' => $diff,
                    'description' => 'Stock opname adjustment '. $checkingStock->no_ref,
                ]);
            } elseif ($diff < 0) {
                $newStock = \App\Models\Stock::create([
                    'stockable_type' => $model,
                    'stockable_id' => $itemId,
                    'batch_code' => 'ADJT-'.Carbon::parse($checkingStock->due_date)->format('Ymd').'-'.strtoupper($checkingStock->no_ref),
                    'quantity' => abs($diff),
                    'expired_at' => null,
                ]);

                \App\Models\StockMovement::create([
                    'stock_id' => $newStock->id,
                    'type' => 'out',
                    'quantity' => abs($diff),
                    'description' => 'Stock opname adjustment '. $checkingStock->no_ref,
                ]);
            }
        });
    }


    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        // request page data
        $currentPage = $request->input('page', 1);
        $perPage = $request->input('per_page', 10);

        // get all checking stock
        $checkingStocks = CheckingStock::query()
            ->with('user')
            ->withCount('details')
            ->when($request->search, fn($search) => $search->where('name', 'like', "%{$request->search}%"))
            ->latest()
            ->paginate($perPage, ['*'], 'page', $currentPage)->withQueryString();

        // render view
        return inertia('apps/checking-stocks/index', [
           'checkingStocks' => $checkingStocks,
           'currentPage' => $currentPage,
           'perPage' => $perPage,
       ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        // get all materials data
        $materials = Material::with('unit')->select('id', 'name', 'unit_id', 'price')->orderBy('name')->get();

        // get all products data
        $products = ProductVariant::with('product', 'unit', 'product_variant_values', 'product_variant_values.variant_value', 'product_variant_values.variant_value.variant_option')->get();

        // get all users data
        $users = User::orderBy('name')->get();

        // generate no ref
        $randomNumber = str_pad(rand(0, 9999), 4, '0', STR_PAD_LEFT);
        $no_ref = 'SO' . Carbon::today()->format('dmY') . $randomNumber;

        // reder view
        return inertia('apps/checking-stocks/create', [
            'materials' => $materials,
            'products' => $products,
            'users' => $users,
            'noRef' => $no_ref
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(CheckingStockRequest $request)
    {
        DB::transaction(function() use($request){
            // create checking stocks
            $checkingStock = CheckingStock::create([
                'no_ref' => $request->no_ref,
                'user_id' => $request->user_id,
                'due_date' => $request->due_date,
                'type' => $request->type,
                'status' => $request->status,
                'note' => $request->note
            ]);

            // create checking stock details
            collect($request->items)->each(function ($item) use ($checkingStock, $request) {
                $model = null;
                $itemId = $item['item'];

                if ($request->type == 'products')
                    $model = \App\Models\ProductVariant::class;
                else
                    $model = \App\Models\Material::class;

                $checkingStock->details()->create([
                    'items_type' => $model,
                    'items_id' => $itemId,
                    'stock' => $item['quantity'],
                    'quantity' => $item['real_quantity'],
                    'price' => $item['price'],
                    'note' => $item['note'] ?? null,
                ]);
            });

            // adjust stock
            if ($request->status == 'done')
                $this->adjustStockFromChecking($request, $checkingStock);
        });

        // render view
        return to_route('apps.checking-stocks.index');
    }

    /**
     * Display the specified resource.
     */
    public function show(CheckingStock $checkingStock)
    {
        // load relationship
        $checkingStock->load([
            'user',
            'details',
            'details.checking_stock',
            'details.items' => function ($morphTo) {
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

        // define summary data
        $total_checked = 0;
        $item_with_difference = 0;
        $potential_loss = 0;
        $potential_gain = 0;

        // loop checking stock details
        collect($checkingStock->details)->each(function($item) use($checkingStock, &$total_checked, &$item_with_difference, &$potential_loss, &$potential_gain) {
            $item->diffrence = $item->quantity - $item->stock;
            $item->diffrence_price_raw = $item->diffrence * $item->price;
            $item->diffrence_price = number_format($item->diffrence_price_raw, 0);
            $item->price_raw = $item->price;
            $item->price = number_format($item->price, 0);

            $total_checked++;

            if ($item->diffrence != 0)
                $item_with_difference++;

            if ($item->diffrence > 0)
                $potential_gain += $item->diffrence * $item->price_raw;

            if ($item->diffrence < 0)
                $potential_loss += abs($item->diffrence * $item->price_raw);
        });

        // attach new key in checking stock
        $checkingStock->diffrence = $checkingStock->details->sum('diffrence');
        $checkingStock->diffrence_price = number_format($checkingStock->details->sum('diffrence_price_raw'), 0);
        $checkingStock->summary = [
            'total_checked' => $total_checked,
            'item_with_difference' => $item_with_difference,
            'potential_loss' => number_format($potential_loss, 0),
            'potential_gain' => number_format($potential_gain, 0),
        ];

        // render view
        return inertia('apps/checking-stocks/show', [
            'checkingStock' => $checkingStock,
        ]);
    }


    /**
     * Show the form for editing the specified resource.
     */
    public function edit(CheckingStock $checkingStock)
    {
        // load relatinship
        $checkingStock->load([
            'user',
            'details',
            'details.checking_stock',
            'details.items' => function ($morphTo) {
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

        collect($checkingStock->details)->each(function($item){
            $item->diffrence = $item->quantity - $item->stock;
            $item->diffrence_price = $item->diffrence * $item->price;
        });

        // get all materials data
        $materials = Material::with('unit')->select('id', 'name', 'unit_id', 'price')->orderBy('name')->get();

        // get all products data
        $products = ProductVariant::with('product', 'unit', 'product_variant_values', 'product_variant_values.variant_value', 'product_variant_values.variant_value.variant_option')->get();

        // get all users data
        $users = User::orderBy('name')->get();

        // reder view
        return inertia('apps/checking-stocks/edit', [
            'materials' => $materials,
            'products' => $products,
            'users' => $users,
            'checkingStock' => $checkingStock
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(CheckingStockRequest $request, CheckingStock $checkingStock)
    {
        DB::transaction(function() use($request, $checkingStock){
            if ($request->type == 'products')
                $model = \App\Models\ProductVariant::class;
            else
                $model = \App\Models\Material::class;

            // update checking stock data
            $checkingStock->update([
                'no_ref' => $request->no_ref,
                'user_id' => $request->user_id,
                'due_date' => $request->due_date,
                'type' => $request->type,
                'status' => $request->status,
                'note' => $request->note,
            ]);

            // current items and pluck
            $currentItems = collect($request->items)->pluck('item')->toArray();

            // delete checking stock details where not in request
            $checkingStock->details()->whereNotIn('items_id', $currentItems)->where('items_type', $model)->delete();

            // updated checking stock details
            collect($request->items)->each(function ($item) use ($checkingStock, $model) {
                $itemId = $item['item'];

                $checkingStock->details()->updateOrCreate([
                    'items_id' => $itemId,
                    'items_type' => $model,
                ],[
                    'items_type' => $model,
                    'items_id' => $itemId,
                    'stock' => $item['quantity'],
                    'quantity' => $item['real_quantity'],
                    'price' => $item['price'],
                    'note' => $item['note'] ?? null,
                ]);
            });

            // adjust stock
            if ($request->status == 'done' && $checkingStock->status != 'done')
                $this->adjustStockFromChecking($request, $checkingStock);
        });

        // render view
        return to_route('apps.checking-stocks.index');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(CheckingStock $checkingStock)
    {
        // delete checking stock data
        $checkingStock->delete();

        // render view
        return back();
    }
}

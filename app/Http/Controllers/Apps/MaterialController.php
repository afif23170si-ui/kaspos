<?php

namespace App\Http\Controllers\Apps;

use App\Models\Unit;
use App\Models\Material;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Http\Controllers\Controller;
use App\Http\Requests\MaterialRequest;
use App\Models\StockMovement;
use Illuminate\Routing\Controllers\Middleware;
use Illuminate\Routing\Controllers\HasMiddleware;

class MaterialController extends Controller implements HasMiddleware
{
    /**
     * Define middleware for the PermissionController.
     */
    public static function middleware()
    {
        return [
            new Middleware('permission:materials-data', only: ['index']),
            new Middleware('permission:materials-create', only: ['store', 'create']),
            new Middleware('permission:materials-update', only: ['update', 'edit']),
            new Middleware('permission:materials-delete', only: ['destroy']),
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

        // get all material data
        $materials = Material::query()
            ->with('unit', 'initial_stock')
            ->select('id', 'name', 'unit_id', 'minimum_qty', 'price')
            ->when($request->search, fn($search) => $search->where('name', 'like', '%' . $request->search . '%'))
            ->latest()
            ->paginate($perPage, ['*'], 'page', $currentPage)->withQueryString();

        // render view
        return inertia('apps/ingredients/index', [
            'materials' => $materials,
            'currentPage' => $currentPage,
            'perPage' => $perPage,
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        // get all units data
        $units = Unit::select('id', 'name')->orderBy('name')->get();

        // render view
        return inertia('apps/ingredients/create', ['units' => $units]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(MaterialRequest $request)
    {
        DB::transaction(function () use($request){
            // create new material
            $material = Material::create([
                'name' => $request->name,
                'unit_id' => $request->unit_id,
                'minimum_qty' => $request->minimum_qty,
                'price' => $request->price
            ]);

            // create new stock
            $stock = $material->stocks()->create([
                'batch_code' => 'MTRL-'.now()->format('Ymd').'-'.strtoupper(str()->random(4)),
                'quantity' => $request->initial_qty,
                'expired_at' => $request->expired_at,
            ]);

            // create new stock movements
            $stock->movements()->create([
                'type' => 'in',
                'quantity' => $stock->quantity,
                'description' => 'Initial Stock',
            ]);
        });

        // render view
        return to_route('apps.materials.index');
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Material $material)
    {
        // get all units data
        $units = Unit::select('id', 'name')->orderBy('name')->get();

        // load relationship
        $material->load('initial_stock');

        // render view
        return inertia('apps/ingredients/edit', [
            'material' => $material,
            'units' => $units
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(MaterialRequest $request, Material $material)
    {
        DB::transaction(function () use($request, $material){
            // update material data by id
            $material->update([
                'name' => $request->name,
                'unit_id' => $request->unit_id,
                'initial_qty' => $request->initial_qty,
                'minimum_qty' => $request->minimum_qty,
                'price' => $request->price
            ]);

            // update initial stock
            $material->initial_stock()->update([
                'quantity' => $request->initial_qty,
                'expired_at' => $request->expired_at,
            ]);

            // update stock movements
            StockMovement::where('stock_id', $material->initial_stock->id)->update(['quantity' => $request->initial_qty]);
        });

        // render view
        return to_route('apps.materials.index');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Material $material)
    {
        // delete material by id
        $material->delete();

        // render view
        return back();
    }
}

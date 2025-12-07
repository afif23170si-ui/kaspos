<?php

namespace App\Http\Controllers\Apps;

use App\Models\Unit;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use App\Http\Requests\UnitRequest;
use Illuminate\Routing\Controllers\Middleware;
use Illuminate\Routing\Controllers\HasMiddleware;

class UnitController extends Controller implements HasMiddleware
{
    /**
     * Define middleware for the UnitController.
     */
    public static function middleware()
    {
        return [
            new Middleware('permission:units-data', only: ['index']),
            new Middleware('permission:units-create', only: ['store']),
            new Middleware('permission:units-update', only: ['update']),
            new Middleware('permission:units-delete', only: ['destroy']),
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

        // get all units
        $units = Unit::query()
            ->select('id', 'name', 'description')
            ->when($request->search, fn($search) => $search->where('name', 'like', "%{$request->search}%"))
            ->latest()
            ->paginate($perPage, ['*'], 'page', $currentPage)->withQueryString();

        // render view
        return inertia('apps/units/index', [
           'units' => $units,
           'currentPage' => $currentPage,
           'perPage' => $perPage,
       ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(UnitRequest $request)
    {
        // create new unit
        Unit::create([
            'name' => $request->name,
            'description' => $request->description
        ]);

        // render view
        return to_route('apps.units.index');
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UnitRequest $request, Unit $unit)
    {
        // update unit by id
        $unit->update([
            'name' => $request->name,
            'description' => $request->description
        ]);

        // render view
        return to_route('apps.units.index');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Unit $unit)
    {
        // delete unit by id
        $unit->delete();

        // render view
        return back();
    }
}

<?php

namespace App\Http\Controllers\Apps;

use App\Models\Table;
use Illuminate\Http\Request;
use App\Http\Requests\TableRequest;
use App\Http\Controllers\Controller;
use SimpleSoftwareIO\QrCode\Facades\QrCode;
use Illuminate\Routing\Controllers\Middleware;
use Illuminate\Routing\Controllers\HasMiddleware;

class TableController extends Controller implements HasMiddleware
{
    public static function middleware()
    {
        return [
            new Middleware('permission:tables-data', only: ['index', 'qrcode']),
            new Middleware('permission:tables-create', only: ['store']),
            new Middleware('permission:tables-update', only: ['update']),
            new Middleware('permission:tables-delete', only: ['destroy']),
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

        // get all tables
        $tables = Table::query()
            ->select('id', 'number', 'status', 'capacity')
            ->when($request->search, fn($search) => $search->where('number', 'like', "%{$request->search}%"))
            ->latest()
            ->paginate($perPage, ['*'], 'page', $currentPage)->withQueryString();

        // render view
        return inertia('apps/tables/index', [
           'tables' => $tables,
           'currentPage' => $currentPage,
           'perPage' => $perPage,
       ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(TableRequest $request)
    {
        // create new table
        Table::create([
            'number' => $request->number,
            'capacity' => $request->capacity,
            'status' => $request->status,
        ]);

        // render view
        return back();
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(TableRequest $request, Table $table)
    {
        // update table by id
        $table->update([
            'number' => $request->number,
            'capacity' => $request->capacity,
            'status' => $request->status,
        ]);

        // render view
        return back();
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Table $table)
    {
        // delete table by id
        $table->delete();

        // render view
        return back();
    }

    public function qrcode(Table $table)
    {
        // URL yang akan di-embed ke QR (customer scan)
        $url = route('tables.enter', $table->id);

        // generate qrcode with url
        $png = QrCode::format('svg')
            ->size(800)
            ->margin(2)
            ->generate($url);

        // return response json
        return response($png, 200, [
            'Content-Type'        => 'image/svg+xml',
            'Content-Disposition' => 'inline; filename="table-'.$table->number.'.svg"',
        ]);;
    }

    public function openTable(Table $table, Request $request)
    {
        // forget session
        $request->session()->forget(['table_id', 'table_number']);
        // update table status
        $table->update([
            'status' => 'available'
        ]);

        return back();
    }
}

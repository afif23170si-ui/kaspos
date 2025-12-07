<?php

namespace App\Http\Controllers\Apps;

use App\Models\Coupon;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use App\Http\Requests\CouponRequest;
use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Routing\Controllers\Middleware;

class CouponController extends Controller implements HasMiddleware
{
    /**
     * Define middleware for the PermissionController.
     */
    public static function middleware()
    {
        return [
            new Middleware('permission:coupons-data', only: ['index']),
            new Middleware('permission:coupons-create', only: ['store', 'create']),
            new Middleware('permission:coupons-update', only: ['update', 'edit']),
            new Middleware('permission:coupons-delete', only: ['destroy']),
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

        // get all coupons
        $coupons = Coupon::query()
            ->select('id', 'code', 'value', 'type', 'is_active')
            ->when($request->search, fn($search) => $search->where('code', 'like', "%{$request->search}%"))
            ->latest()
            ->paginate($perPage, ['*'], 'page', $currentPage)->withQueryString();

        // render view
        return inertia('apps/coupons/index', [
           'coupons' => $coupons,
           'currentPage' => $currentPage,
           'perPage' => $perPage,
       ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return inertia('apps/coupons/create');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(CouponRequest $request)
    {
        // create new coupun
        Coupon::create([
            'code' => $request->code,
            'value' => $request->value,
            'type' => $request->type,
            'is_active' => $request->is_active == 'active' ? true : false,
        ]);

        // render view
        return to_route('apps.coupons.index');
    }

    /**
     * Show the form for edition specified resource.
     */
    public function edit(Coupon $coupon)
    {
        // render view
        return inertia('apps/coupons/edit', [
            'coupon' => $coupon
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(CouponRequest $request, Coupon $coupon)
    {
        // update coupon data by id
        $coupon->update([
            'code' => $request->code,
            'value' => $request->value,
            'type' => $request->type,
            'is_active' => $request->is_active == 'active' ? true : false,
        ]);

        // render view
        return to_route('apps.coupons.index');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Coupon $coupon)
    {
        // delete coupon data
        $coupon->delete();

        // render view
        return back();
    }
}

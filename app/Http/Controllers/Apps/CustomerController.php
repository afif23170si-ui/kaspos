<?php

namespace App\Http\Controllers\Apps;

use Carbon\Carbon;
use App\Models\Customer;
use Illuminate\Http\Request;
use App\Models\CustomerPoint;
use App\Http\Controllers\Controller;
use Illuminate\Routing\Controllers\Middleware;
use Illuminate\Routing\Controllers\HasMiddleware;

class CustomerController extends Controller implements HasMiddleware
{
    public static function middleware()
    {
        return [
            new Middleware('permission:customers-data', only: ['index']),
            new Middleware('permission:customers-create', only: ['store', 'create']),
            new Middleware('permission:customers-update', only: ['update', 'edit']),
            new Middleware('permission:customers-delete', only: ['destroy']),
            new Middleware('permission:customers-show', only: ['show'])
        ];
    }

    public function listCustomerByRequest(Request $request)
    {
        $selectedCustomer = $request->selectedCustomer;

        $data = Customer::whereAny(['name', 'phone'], 'like', '%'.$selectedCustomer.'%')->get();

        return response()->json($data, 200);
    }

    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        // request page data
        $currentPage = $request->input('page', 1);
        $perPage = $request->input('per_page', 10);

        // get all customers
        $customers = Customer::query()
           ->withSum([
                'customer_points as available_points' => function ($q) {
                    $q->where('status', 'active');
                }
            ], 'point')
            ->when($request->search, fn($search) => $search->where('name', 'like', "%{$request->search}%"))
            ->latest()
            ->paginate($perPage, ['*'], 'page', $currentPage)->withQueryString();

        // update customer point
        CustomerPoint::whereDate('expired_date', '<', Carbon::today())->update([
            'status' => 'expired',
            'change_date' => Carbon::today()
        ]);

        // render view
        return inertia('apps/customers/index', [
           'customers' => $customers,
           'currentPage' => $currentPage,
           'perPage' => $perPage,
       ]);
    }

    public function create()
    {
        return inertia('apps/customers/create');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'name'    => ['required','string','max:150'],
            'email'   => ['nullable','email','max:150'],
            'phone'   => ['nullable','string','max:50'],
            'address' => ['nullable','string','max:255'],
        ], [
            'name.required' => 'Kolom nama pelanggan tidak boleh kosong',
        ]);

        $customer = Customer::create($request->only(['name', 'email', 'phone', 'address', 'is_admin']));

        if(!$request->is_admin)
            return response()->json([
                'message' => 'Data berhasil disimpan',
                'customer' => $customer,
            ]);
        else
            return to_route('apps.customers.index');
    }

    public function edit(Customer $customer)
    {
        return inertia('apps/customers/edit', [
            'customer' => $customer
        ]);
    }

    public function update($id, Request $request)
    {
        if(!$request->is_admin){
            $customerPoint = CustomerPoint::findOrFail($id);

            $customerPoint->update([
                'status' => $request->status,
                'change_date' => Carbon::now(),
            ]);

            return back();
        }else{
            $customer = Customer::findOrFail($id);

            $customer->update([
                'name' => $request->name,
                'email' => $request->email,
                'phone' => $request->phone,
                'address' => $request->address
            ]);

            return to_route('apps.customers.index');
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(Customer $customer)
    {
        $customer->load([
            'customer_points' => function ($q) {
                $q->with(['transaction:id,invoice,transaction_type,grand_total,transaction_date'])->latest();
            }
        ]);

        $customer->customer_points->map(function ($cp) {
            $cp->transaction->grand_total = number_format((float) $cp->transaction->grand_total, 0);

            $cp->transaction->transaction_date = Carbon::parse($cp->transaction->transaction_date)->format('d/m/Y');
            return $cp;
        });

        return inertia('apps/customers/show', [
            'customer' => $customer,
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Customer $customer)
    {
        // delete customer data
        $customer->delete();

        // render view
        return back();
    }
}

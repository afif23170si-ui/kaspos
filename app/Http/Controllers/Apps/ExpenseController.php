<?php

namespace App\Http\Controllers\Apps;

use Carbon\Carbon;
use App\Models\Expense;
use App\Models\BankAccount;
use Illuminate\Http\Request;
use App\Models\ExpenseCategory;
use Illuminate\Support\Facades\DB;
use App\Http\Controllers\Controller;
use App\Http\Requests\ExpenseRequest;
use Illuminate\Routing\Controllers\Middleware;

class ExpenseController extends Controller
{
     /**
     * Define middleware for the CategoryController.
     */
    public static function middleware()
    {
        return [
            new Middleware('permission:expenses-data', only: ['index']),
            new Middleware('permission:expenses-create', only: ['create','store']),
            new Middleware('permission:expenses-update', only: ['edit', 'update']),
            new Middleware('permission:expenses-delete', only: ['destroy']),
            new Middleware('permission:expenses-show', only: ['show']),
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

        // get list data expense
        $expenses = Expense::query()
            ->with('expense_category', 'expense_subcategory')
            ->select('id', 'expensee_number', 'reference_number', 'date', 'expense_category_id', 'expense_subcategory_id', 'amount', 'payment_status', 'description', 'file')
            ->when($request->search, fn($search) => $search->where('expensee_number', 'like', '%' . $request->search . '%'))
            ->latest()
            ->paginate($perPage, ['*'], 'page', $currentPage)->withQueryString();

        $expenses->getCollection()->transform(function($expense){
            $expense->amount = number_format($expense->amount, 0);
            $expense->date = Carbon::parse($expense->date)->format('d/m/Y');

            return $expense;
        });

        // render view
        return inertia('apps/expenses/index', [
            'expenses' => $expenses,
            'currentPage' => $currentPage,
            'perPage' => $perPage,
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        // get all expenses categories
        $expenses_categories = ExpenseCategory::select('id', 'name')->get();

        // get all banks account
        $banks = BankAccount::select('id', 'bank_name', 'account_name', 'account_number')->get();

        // generate order code
        $randomNumber = str_pad(rand(0, 9999), 4, '0', STR_PAD_LEFT);
        $expensee_number = 'BY' . Carbon::today()->format('dmY') . $randomNumber;

        // render view
        return inertia('apps/expenses/create', [
            'expensee_number' => $expensee_number,
            'expenses_categories' => $expenses_categories,
            'banks' => $banks
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(ExpenseRequest $request)
    {
        DB::transaction(function() use($request){
            $fileName = null;

            // upload file
            if ($request->hasFile('file')) {
                $file = $request->file('file');
                $fileName = $file->hashName();
                $file->storeAs('expense', $fileName);
            }

            // create expense
            $expense = Expense::create([
                'expensee_number' => $request->expensee_number,
                'reference_number' => $request->reference_number,
                'date' => $request->date,
                'expense_category_id' => $request->expense_category_id,
                'expense_subcategory_id' => $request->expense_subcategory_id,
                'amount' => $request->amount,
                'description' => $request->description,
                'file' => $fileName,
                'created_by' => $request->user()->id
            ]);

            if($request->withPayment){
                // create expense payments
                collect($request->payments)->each(function($item) use($expense){
                    $expense->expense_payments()->create([
                        'bank_account_id' => $item['payment_account'],
                        'paid_at' => $item['payment_date'],
                        'amount' => $item['total_pay'],
                        'payment_method' => $item['payment_method']
                    ]);
                });

                // update expense payment status
                if($request->total_payment == $request->amount)
                    $expense->update(['payment_status' => 'paid']);
                elseif($request->total_payment < $request->amount)
                    $expense->update(['payment_status' => 'partial']);
            }
        });

        // render view
        return to_route('apps.expenses.index');
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Expense $expense)
    {
        // get all expenses categories
        $expenses_categories = ExpenseCategory::select('id', 'name')->get();

        // get all banks account
        $banks = BankAccount::select('id', 'bank_name', 'account_name', 'account_number')->get();

        // load relationship
        $expense->load([
            'expense_category',
            'expense_subcategory',
            'expense_payments'
        ]);

        // render view
        return inertia('apps/expenses/edit', [
            'expenses_categories' => $expenses_categories,
            'expense' => $expense,
            'banks' => $banks,
        ]);
    }

    /**
     * Display the specified resource.
     */
    public function show(Expense $expense)
    {
        // load relationship
        $expense->load([
            'expense_category',
            'expense_subcategory',
            'expense_payments',
            'expense_payments.bank_account',
            'user_created'
        ]);

        $expense->date = Carbon::parse($expense->date)->format('d F Y');
        $expense->remaining_payment = number_format($expense->amount - $expense->expense_payments()->sum('amount'), 0);
        $expense->total_payment = number_format($expense->expense_payments()->sum('amount'), 0);
        $expense->amount = number_format($expense->amount, 0);
        $expense->expense_payments->each(function($item){
            $item->amount = number_format($item->amount, 0);
            $item->paid_at = Carbon::parse($item->paid_at)->format('d/m/Y');
            return $item;
        });

        // render view
        return inertia('apps/expenses/show', [
            'expense' => $expense
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(ExpenseRequest $request, Expense $expense)
    {
        DB::transaction(function() use($request, $expense){
            $fileName = null;

            // upload file
            if ($request->hasFile('file')) {
                $file = $request->file('file');
                $fileName = $file->hashName();
                $file->storeAs('expense', $fileName);
            }

            // create expense
            $expense->update([
                'expensee_number' => $request->expensee_number,
                'reference_number' => $request->reference_number,
                'date' => $request->date,
                'expense_category_id' => $request->expense_category_id,
                'expense_subcategory_id' => $request->expense_subcategory_id,
                'amount' => $request->amount,
                'description' => $request->description,
                'file' => $fileName
            ]);

            if($request->withPayment){
                // create expense payments
                collect($request->payments)->each(function($item) use($expense){
                    $expense->expense_payments()->updateOrCreate([
                        'paid_at' => $item['payment_date'],
                        'payment_method' => $item['payment_method'],
                        'amount' => $item['total_pay'],
                    ], [
                        'paid_at' => $item['payment_date'],
                        'payment_method' => $item['payment_method'],
                        'bank_account_id' => $item['payment_account'] ?? null,
                        'amount' => $item['total_pay'],
                    ]);
                });

                // update expense payment status
                if($request->total_payment == $request->amount)
                    $expense->update(['payment_status' => 'paid']);
                elseif($request->total_payment < $request->amount)
                    $expense->update(['payment_status' => 'partial']);
            }
        });

        // render view
        return to_route('apps.expenses.index');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Expense $expense)
    {
        // delete expense by id
        $expense->delete();

        // render view
        return to_route('apps.expenses.index');
    }
}

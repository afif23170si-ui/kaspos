<?php

namespace App\Http\Controllers\Apps;

use Illuminate\Http\Request;
use App\Models\ExpenseCategory;
use App\Models\ExpenseSubcategory;
use App\Http\Controllers\Controller;
use Illuminate\Routing\Controllers\Middleware;
use App\Http\Requests\ExpenseSubcategoryRequest;
use Illuminate\Routing\Controllers\HasMiddleware;

class ExpenseSubcategoryController extends Controller implements HasMiddleware
{
        /**
     * Define middleware for the CategoryController.
     */
    public static function middleware()
    {
        return [
            new Middleware('permission:expense-subcategories-data', only: ['index']),
            new Middleware('permission:expense-subcategories-create', only: ['store']),
            new Middleware('permission:expense-subcategories-update', only: ['update']),
            new Middleware('permission:expense-subcategories-delete', only: ['destroy']),
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

        // get list data expense categories
        $expenseCategories = ExpenseCategory::query()->select('id', 'name')->orderBy('name')->get();

        // get list data expense sub categories
        $expenseSubcategories = ExpenseSubcategory::query()
            ->with('expense_category')
            ->select('id', 'expense_category_id', 'name')
            ->when($request->search, fn($search) => $search->where('name', 'like', '%' . $request->search . '%'))
            ->latest()
            ->paginate($perPage, ['*'], 'page', $currentPage)->withQueryString();

        // render view
        return inertia('apps/expense-subcategories/index', [
            'expenseCategories' => $expenseCategories,
            'expenseSubcategories' => $expenseSubcategories,
            'currentPage' => $currentPage,
            'perPage' => $perPage,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(ExpenseSubcategoryRequest $request)
    {
        // create new expense sub category
        ExpenseSubcategory::create([
            'expense_category_id' => $request->expense_category_id,
            'name' => $request->name
        ]);

        // render view
        return to_route('apps.expense-subcategories.index');
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(ExpenseSubcategoryRequest $request, ExpenseSubcategory $expenseSubcategory)
    {
        // update expense sub category by id
        $expenseSubcategory->update([
            'expense_category_id' => $request->expense_category_id,
            'name' => $request->name
        ]);

        // render view
        return to_route('apps.expense-subcategories.index');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(ExpenseSubcategory $expenseSubcategory)
    {
        // delete expense sub category by id
        $expenseSubcategory->delete();

        // render view
        return back();
    }
}

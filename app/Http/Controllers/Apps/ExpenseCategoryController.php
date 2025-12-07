<?php

namespace App\Http\Controllers\Apps;

use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use App\Http\Requests\ExpenseCategoryRequest;
use App\Models\ExpenseCategory;
use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Routing\Controllers\Middleware;

class ExpenseCategoryController extends Controller implements HasMiddleware
{
    /**
     * Define middleware for the CategoryController.
     */
    public static function middleware()
    {
        return [
            new Middleware('permission:expense-categories-data', only: ['index']),
            new Middleware('permission:expense-categories-create', only: ['store']),
            new Middleware('permission:expense-categories-update', only: ['update']),
            new Middleware('permission:expense-categories-delete', only: ['destroy']),
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
        $expenseCategories = ExpenseCategory::query()
            ->select('id', 'name')
            ->when($request->search, fn($search) => $search->where('name', 'like', '%' . $request->search . '%'))
            ->latest()
            ->paginate($perPage, ['*'], 'page', $currentPage)->withQueryString();

        // render view
        return inertia('apps/expense-categories/index', [
            'expenseCategories' => $expenseCategories,
            'currentPage' => $currentPage,
            'perPage' => $perPage,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(ExpenseCategoryRequest $request)
    {
        // create new expense category
        ExpenseCategory::create(['name' => $request->name]);

        // render view
        return to_route('apps.expense-categories.index');
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(ExpenseCategoryRequest $request, ExpenseCategory $expenseCategory)
    {
        // update expense category by id
        $expenseCategory->update(['name' => $request->name]);

        // render view
        return to_route('apps.expense-categories.index');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(ExpenseCategory $expenseCategory)
    {
        // delete expense category by id
        $expenseCategory->delete();

        // render view
        return to_route('apps.expense-categories.index');
    }
}

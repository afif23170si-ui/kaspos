<?php

namespace App\Http\Controllers\Apps;

use App\Models\Category;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use App\Http\Requests\CategoryRequest;
use Illuminate\Support\Facades\Storage;
use Illuminate\Routing\Controllers\Middleware;
use Illuminate\Routing\Controllers\HasMiddleware;

class CategoryController extends Controller implements HasMiddleware
{
    /**
     * Define middleware for the PermissionController.
     */
    public static function middleware()
    {
        return [
            new Middleware('permission:categories-data', only: ['index']),
            new Middleware('permission:categories-create', only: ['store']),
            new Middleware('permission:categories-update', only: ['update']),
            new Middleware('permission:categories-delete', only: ['destroy']),
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

        // get all categories
        $categories = Category::query()
            ->select('id', 'name', 'slug', 'image')
            ->when($request->search, fn($search) => $search->where('name', 'like', "%{$request->search}%"))
            ->latest()
            ->paginate($perPage, ['*'], 'page', $currentPage)->withQueryString();

        // render view
        return inertia('apps/categories/index', [
           'categories' => $categories,
           'currentPage' => $currentPage,
           'perPage' => $perPage,
       ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(CategoryRequest $request)
    {
        // upload file
        if($request->hasFile('image')){
            $image = $request->file('image');
            $image->storeAs('categories', $image->hashName(), 'public');
        }

        // create new category
        Category::create([
            'name' => $request->name,
            'slug' => str()->slug($request->name),
            'image' => $request->hasFile('image') ? $image->hashName() : null,
        ]);

        // render view
        return back();
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(CategoryRequest $request, Category $category)
    {
        // upload file
        if($request->hasFile('image')){
            Storage::disk('public')->delete('categories/'.basename($category->image));

            $image = $request->file('image');
            $image->storeAs('categories', $image->hashName(), 'public');

            $category->update([
                'image' => $image->hashName()
            ]);
        }

        // update category by id
        $category->update([
            'name' => $request->name,
            'slug' => str()->slug($request->name),
        ]);

        // render view
        return back();
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Category $category)
    {
        // delete image
        Storage::disk('public')->delete('categories/'.basename($category->image));

        // delete category by id
        $category->delete();

        // render view
        return back();
    }
}

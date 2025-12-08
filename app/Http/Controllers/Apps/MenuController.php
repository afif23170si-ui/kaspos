<?php

namespace App\Http\Controllers\Apps;

use App\Models\Menu;
use App\Models\Category;
use App\Models\Material;
use Illuminate\Http\Request;
use App\Http\Requests\MenuRequest;
use App\Http\Controllers\Controller;
use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Support\Facades\Storage;
use Illuminate\Routing\Controllers\Middleware;

class MenuController extends Controller implements HasMiddleware
{
    /**
     * Define middleware for the UnitController.
     */
    public static function middleware()
    {
        return [
            new Middleware('permission:menus-data', only: ['index']),
            new Middleware('permission:menus-create', only: ['store', 'create']),
            new Middleware('permission:menus-update', only: ['update', 'edit']),
            new Middleware('permission:menus-delete', only: ['destroy']),
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

        // get all menus
        $menus = Menu::query()
            ->select('id', 'name', 'image', 'category_id', 'capital_price', 'selling_price', 'margin')
            ->with('category')
            ->when($request->search, fn($search) => $search->where('name', 'like', "%{$request->search}%"))
            ->latest()
            ->paginate($perPage, ['*'], 'page', $currentPage)->withQueryString();

        // render view
        return inertia('apps/menus/index', [
            'menus' => $menus,
            'currentPage' => $currentPage,
            'perPage' => $perPage,
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        // get categories data
        $categories = Category::select('id', 'name')->orderBy('name')->get();

        // get ingredients data
        $ingredients = Material::with('unit')->select('id', 'name', 'unit_id', 'price')->orderBy('name')->get();

        // render view
        return inertia('apps/menus/create', [
            'categories' => $categories,
            'ingredients' => $ingredients
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(MenuRequest $request)
    {
        // upload file
        if($request->hasFile('image')){
            $image = $request->file('image');
            $image->storeAs('menus', $image->hashName(), 'public');
        }

        // create new menu
        $menu = Menu::create([
            'name' => $request->name,
            'category_id' => $request->category_id,
            'capital_price' => $request->grand_price,
            'selling_price' => $request->selling_price,
            'margin' => $request->margin,
            'image' => $request->hasFile('image') ? $image->hashName() : null,
        ]);

        // loop request items
        collect($request->items)->each(function($item) use($menu){
            $menu->receipes()->create([
                'material_id' => $item['ingredient'],
                'quantity' => $item['quantity'],
                'price' => $item['price'],
                'total_price' => $item['total_price'],
            ]);
        });

        return to_route('apps.menus.index');
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Menu $menu)
    {
       // get categories data
       $categories = Category::select('id', 'name')->orderBy('name')->get();

       // get ingredients data
       $ingredients = Material::with('unit')->select('id', 'name', 'unit_id', 'price')->orderBy('name')->get();

       // load receipes
       $menu->load('receipes', 'receipes.material');

       // render view
       return inertia('apps/menus/edit', [
           'categories' => $categories,
           'ingredients' => $ingredients,
           'menu' => $menu
       ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(MenuRequest $request, Menu $menu)
    {
        // update menu by id
        $menu->update([
            'name' => $request->name,
            'category_id' => $request->category_id,
            'capital_price' => $request->grand_price,
            'selling_price' => $request->selling_price,
            'margin' => $request->margin
        ]);

        // get request items and pluck key ingredients
        $currentMaterialIds = collect($request->items)->pluck('ingredient')->toArray();

        // delete receipes where not in request
        $menu->receipes()
            ->whereNotIn('material_id', $currentMaterialIds)
            ->delete();

        // loop request items
        foreach ($request->items as $item) {
            $menu->receipes()->updateOrCreate(
                ['material_id' => $item['ingredient']],
                [
                    'quantity' => $item['quantity'],
                    'price' => $item['price'],
                    'total_price' => $item['total_price']
                ]
            );
        }

        // upload file
        if($request->hasFile('image')){
            Storage::disk('public')->delete('categories/'.basename($menu->image));

            $image = $request->file('image');
            $image->storeAs('menus', $image->hashName(), 'public');

            $menu->update([
                'image' => $image->hashName()
            ]);
        }

        // render view
        return to_route('apps.menus.index');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Menu $menu)
    {
        // delete image
        Storage::disk('public')->delete('menus/'.basename($menu->image));

        // delete menu by id
        $menu->delete();

        // render view
        return back();
    }
}

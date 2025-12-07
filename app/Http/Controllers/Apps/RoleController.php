<?php

namespace App\Http\Controllers\Apps;

use Illuminate\Http\Request;
use App\Http\Requests\RoleRequest;
use Illuminate\Routing\Controllers\HasMiddleware;
use \Spatie\Permission\Models\Role;
use App\Http\Controllers\Controller;
use Spatie\Permission\Models\Permission;
use Illuminate\Routing\Controllers\Middleware;

class RoleController extends Controller implements HasMiddleware
{
    /**
     * Define middleware for the RoleController.
     *
     * @return array
     */
    public static function middleware()
    {
        return [
            new Middleware('permission:roles-data', only: ['index']),
            new Middleware('permission:roles-create', only: ['create', 'store']),
            new Middleware('permission:roles-update', only: ['edit', 'update']),
            new Middleware('permission:roles-destroy', only: ['destroy']),
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

        // get all role data
        $roles = Role::query()
            ->with('permissions')
            ->select('id', 'name')
            ->where('name', '!=', 'super-admin')
            ->when($request->search, fn($search) => $search->where('name', 'like', '%' . $request->search . '%'))
            ->latest()
            ->paginate($perPage, ['*'], 'page', $currentPage)->withQueryString();

        // render view
        return inertia('apps/roles/index', [
            'roles' => $roles,
            'currentPage' => $currentPage,
            'perPage' => $perPage,
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        // get all permission data
        $permissions = Permission::query()->select('id', 'name')->get();

        // render view
        return inertia('apps/roles/create', ['permissions' => $permissions]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(RoleRequest $request)
    {
        // create new role
        $role = Role::create(['name' => $request->name]);

        // assign permission to role
        $role->givePermissionTo($request->selectedPermissions);

        // render view
        return to_route('apps.roles.index');
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Role $role)
    {
        // get all permission data
        $permissions = Permission::query()->select('id', 'name')->get();

        // load relationship
        $role->load('permissions');

        // render view
        return inertia('apps/roles/edit', [
            'role' => $role,
            'permissions' => $permissions
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(RoleRequest $request, Role $role)
    {
        // update role data name
        $role->update(['name' => $request->name]);

        // assign permission to role
        $role->syncPermissions($request->selectedPermissions);

        // render view
        return to_route('apps.roles.index');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Role $role)
    {
        // delete role data
        $role->delete();

        // render view
        return back();
    }
}

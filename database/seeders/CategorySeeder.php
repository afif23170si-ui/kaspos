<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;

class CategorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $permissions = Permission::where('name', 'like', '%categories%')->get();

        if(count($permissions) == 0)
            $data = collect([
                'categories-data',
                'categories-create',
                'categories-update',
                'categories-delete',
                'categories-show'
            ])->each(fn($item) => Permission::create(['name' => $item]));
        else
            $data = $permissions;

        $role = Role::create([
            'name' => 'categories-full-access',
        ]);

        $role->givePermissionTo($data);
    }
}

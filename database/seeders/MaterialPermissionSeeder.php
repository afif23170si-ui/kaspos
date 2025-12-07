<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;

class MaterialPermissionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        collect([
            'materials-data',
            'materials-create',
            'materials-update',
            'materials-delete',
            'materials-show'
        ])->each(function ($permission) {
            Permission::create([
                'name' => $permission,
            ]);
        });

        collect([
            'materials-full-access',
        ])->each(function($role){
            $role = Role::create([
                'name' => $role
            ]);

            $role->givePermissionTo([
                'materials-data',
                'materials-create',
                'materials-update',
                'materials-delete',
                'materials-show'
            ]);
        });
    }
}

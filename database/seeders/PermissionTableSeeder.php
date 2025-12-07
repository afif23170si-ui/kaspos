<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;

class PermissionTableSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // users permissions
        Permission::create(['name' => 'users-data']);
        Permission::create(['name' => 'users-create']);
        Permission::create(['name' => 'users-update']);
        Permission::create(['name' => 'users-delete']);
        Permission::create(['name' => 'users-show']);

        // roles permissions
        Permission::create(['name' => 'roles-data']);
        Permission::create(['name' => 'roles-create']);
        Permission::create(['name' => 'roles-update']);
        Permission::create(['name' => 'roles-delete']);

        // permissions permissions
        Permission::create(['name' => 'permissions-data']);
        Permission::create(['name' => 'permissions-create']);
        Permission::create(['name' => 'permissions-update']);
        Permission::create(['name' => 'permissions-delete']);

        // // categories permissions
        // Permission::create(['name' => 'categories-data']);
        // Permission::create(['name' => 'categories-create']);
        // Permission::create(['name' => 'categories-update']);
        // Permission::create(['name' => 'categories-delete']);
        // Permission::create(['name' => 'categories-show']);
    }
}

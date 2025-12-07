<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;

class MenuSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $data = collect([
            'menus-data',
            'menus-create',
            'menus-update',
            'menus-delete',
        ])->each(fn($item) => Permission::create(['name' => $item]));

        $role = Role::create([
            'name' => 'menus-full-access',
        ]);

        $role->givePermissionTo($data);
    }
}

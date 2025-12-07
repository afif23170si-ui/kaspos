<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;

class TableSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $data = collect([
            'tables-data',
            'tables-create',
            'tables-update',
            'tables-delete',
        ])->each(fn($item) => Permission::create(['name' => $item]));

        $role = Role::create([
            'name' => 'tables-full-access',
        ]);

        $role->givePermissionTo($data);
    }
}

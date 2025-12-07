<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;

class PurchaseReturnSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $data = collect([
            'purchase-returns-data',
            'purchase-returns-create',
            'purchase-returns-update',
            'purchase-returns-delete',
            'purchase-returns-show',
        ])->each(fn($item) => Permission::create(['name' => $item]));

        $role = Role::create([
            'name' => 'purchase-returns-full-access',
        ]);

        $role->givePermissionTo($data);
    }
}

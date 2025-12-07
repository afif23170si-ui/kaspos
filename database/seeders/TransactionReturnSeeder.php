<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;

class TransactionReturnSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $data = collect([
            'transaction-returns-data',
            'transaction-returns-create',
            'transaction-returns-update',
            'transaction-returns-delete',
            'transaction-returns-show',
        ])->each(fn($item) => Permission::create(['name' => $item]));

        $role = Role::create([
            'name' => 'transaction-returns-full-access',
        ]);

        $role->givePermissionTo($data);
    }
}

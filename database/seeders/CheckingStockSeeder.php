<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;

class CheckingStockSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $data = collect([
            'checking-stocks-data',
            'checking-stocks-create',
            'checking-stocks-update',
            'checking-stocks-delete',
            'checking-stocks-show',
        ])->each(fn($item) => Permission::create(['name' => $item]));

        $role = Role::create([
            'name' => 'checking-stocks-full-access',
        ]);

        $role->givePermissionTo($data);
    }
}

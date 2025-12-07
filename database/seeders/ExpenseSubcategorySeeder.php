<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;

class ExpenseSubcategorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $data = collect([
            'expense-subcategories-data',
            'expense-subcategories-create',
            'expense-subcategories-update',
            'expense-subcategories-delete',
        ])->each(fn($item) => Permission::create(['name' => $item]));

        $role = Role::create([
            'name' => 'expense-subcategories-full-access',
        ]);

        $role->givePermissionTo($data);
    }
}

<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;

class DiscountPackageSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $data = collect([
            'discount-packages-data',
            'discount-packages-create',
            'discount-packages-update',
            'discount-packages-delete',
            'discount-packages-show',
        ])->each(fn($item) => Permission::create(['name' => $item]));

        $role = Role::create([
            'name' => 'discount-packages-full-access',
        ]);

        $role->givePermissionTo($data);
    }
}

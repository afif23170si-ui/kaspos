<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;

class ReportSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $data = collect([
            'report-cash-flow',
            'report-purchase',
            'report-sale',
            'report-stock',
            'report-card-stock',
            'report-profit-loss',
        ])->each(fn($item) => Permission::create(['name' => $item]));

        $role = Role::create([
            'name' => 'reports-full-access',
        ]);

        $role->givePermissionTo($data);
    }
}

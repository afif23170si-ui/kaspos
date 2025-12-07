<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;

class ReportAuditSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $data = collect([
            'report-audit-logs',
        ])->each(fn($item) => Permission::create(['name' => $item]));

        $role = Role::where('name', 'reports-full-access')->first();

        $role->givePermissionTo($data);
    }
}

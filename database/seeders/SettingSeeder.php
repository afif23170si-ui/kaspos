<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;

class SettingSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $data = collect([
            'settings-data',
            'settings-bank',
            'settings-shifts',
            'settings-setting',
            'settings-loyalty',
        ])->each(fn($item) => Permission::create(['name' => $item]));

        $role = Role::create([
            'name' => 'settings-full-access',
        ]);

        $role->givePermissionTo($data);
    }
}

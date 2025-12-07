<?php

namespace Database\Seeders;

use Illuminate\Support\Carbon;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;

class UnitSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $units = [
            ['name' => 'pcs', 'description' => 'Pieces / buah'],
            ['name' => 'kg', 'description' => 'Kilogram'],
            ['name' => 'g', 'description' => 'Gram'],
            ['name' => 'liter', 'description' => 'Liter'],
            ['name' => 'ml', 'description' => 'Milliliter'],
            ['name' => 'bungkus', 'description' => 'Bungkus / pack'],
            ['name' => 'botol', 'description' => 'Botol'],
            ['name' => 'kaleng', 'description' => 'Kaleng'],
            ['name' => 'pak', 'description' => 'Pack'],
        ];

        foreach ($units as $unit) {
            DB::table('units')->insert([
                'name' => $unit['name'],
                'description' => $unit['description'],
                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now(),
            ]);
        }

        $data = collect([
            'units-data',
            'units-create',
            'units-update',
            'units-delete',
        ])->each(fn($item) => Permission::create(['name' => $item]));

        $role = Role::create([
            'name' => 'units-full-access',
        ]);

        $role->givePermissionTo($data);
    }
}

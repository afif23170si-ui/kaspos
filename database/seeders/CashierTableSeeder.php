<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;

class CashierTableSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $cashier = Role::create(['name' => 'cashier']);
        $waiter = Role::create(['name' => 'waiter']);

        $data = collect([
            'pos-data',
        ])->each(fn($item) => Permission::create(['name' => $item]));

        $cashier->givePermissionTo($data);

        $user = User::create([
            'username' => 'cashier-dev',
            'name' => 'Cashier-dev',
            'email' => 'cashier@dev.com',
            'password' => bcrypt('password'),
        ]);

        $user->assignRole($cashier);
    }
}

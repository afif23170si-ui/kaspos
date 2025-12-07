<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;

class AdditionalUsersSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // =============================================
        // 1. KITCHEN USER
        // =============================================
        $kitchenRole = Role::firstOrCreate(['name' => 'kitchen']);
        $kitchenPermissions = Permission::whereIn('name', [
            'transaction-kitchens-data',
            'transaction-kitchens-update',
        ])->get();
        $kitchenRole->syncPermissions($kitchenPermissions);

        $kitchen = User::firstOrCreate(
            ['username' => 'kitchen'],
            [
                'name' => 'Kitchen Staff',
                'email' => 'kitchen@kaspos.com',
                'password' => bcrypt('password'),
            ]
        );
        $kitchen->assignRole($kitchenRole);

        // =============================================
        // 2. WAITER USER
        // =============================================
        $waiterRole = Role::where('name', 'waiter')->first();
        if (!$waiterRole) {
            $waiterRole = Role::create(['name' => 'waiter']);
        }
        
        // Give waiter permission to access POS and tables
        $waiterPermissions = Permission::whereIn('name', [
            'pos-data',
            'tables-data',
        ])->get();
        $waiterRole->syncPermissions($waiterPermissions);

        $waiter = User::firstOrCreate(
            ['username' => 'waiter'],
            [
                'name' => 'Waiter Staff',
                'email' => 'waiter@kaspos.com',
                'password' => bcrypt('password'),
            ]
        );
        $waiter->assignRole($waiterRole);

        // =============================================
        // 3. MANAGER USER
        // =============================================
        $managerRole = Role::firstOrCreate(['name' => 'manager']);
        $managerPermissions = Permission::whereIn('name', [
            'dashboard-data',
            'transactions-data',
            'transactions-payment',
            'transactions-receipt',
            'transactions-invoice',
            'products-data',
            'products-show',
            'categories-data',
            'report-cash-flow',
            'report-sale',
            'report-stock',
            'report-purchase',
            'customers-data',
            'customers-show',
        ])->get();
        $managerRole->syncPermissions($managerPermissions);

        $manager = User::firstOrCreate(
            ['username' => 'manager'],
            [
                'name' => 'Manager',
                'email' => 'manager@kaspos.com',
                'password' => bcrypt('password'),
            ]
        );
        $manager->assignRole($managerRole);

        // =============================================
        // 4. ACCOUNTING USER
        // =============================================
        $accountingRole = Role::firstOrCreate(['name' => 'accounting']);
        $accountingPermissions = Permission::whereIn('name', [
            'dashboard-data',
            'expenses-data',
            'expenses-create',
            'expenses-update',
            'expenses-show',
            'expense-categories-data',
            'expense-subcategories-data',
            'report-cash-flow',
            'report-sale',
            'report-purchase',
        ])->get();
        $accountingRole->syncPermissions($accountingPermissions);

        $accounting = User::firstOrCreate(
            ['username' => 'accounting'],
            [
                'name' => 'Accounting Staff',
                'email' => 'accounting@kaspos.com',
                'password' => bcrypt('password'),
            ]
        );
        $accounting->assignRole($accountingRole);

        // =============================================
        // 5. INVENTORY USER
        // =============================================
        $inventoryRole = Role::firstOrCreate(['name' => 'inventory']);
        $inventoryPermissions = Permission::whereIn('name', [
            'dashboard-data',
            'products-data',
            'products-create',
            'products-update',
            'products-show',
            'materials-data',
            'materials-create',
            'materials-update',
            'materials-show',
            'checking-stocks-data',
            'checking-stocks-create',
            'checking-stocks-update',
            'suppliers-data',
            'suppliers-show',
            'categories-data',
            'report-stock',
        ])->get();
        $inventoryRole->syncPermissions($inventoryPermissions);

        $inventory = User::firstOrCreate(
            ['username' => 'inventory'],
            [
                'name' => 'Inventory Staff',
                'email' => 'inventory@kaspos.com',
                'password' => bcrypt('password'),
            ]
        );
        $inventory->assignRole($inventoryRole);

        // =============================================
        // 6. ADDITIONAL CASHIER USERS (for shifts)
        // =============================================
        $cashierRole = Role::where('name', 'cashier')->first();
        
        // Cashier 1 - Shift Pagi
        $cashier1 = User::firstOrCreate(
            ['username' => 'cashier-1'],
            [
                'name' => 'Cashier Shift 1',
                'email' => 'cashier1@kaspos.com',
                'password' => bcrypt('password'),
            ]
        );
        $cashier1->assignRole($cashierRole);

        // Cashier 2 - Shift Sore
        $cashier2 = User::firstOrCreate(
            ['username' => 'cashier-2'],
            [
                'name' => 'Cashier Shift 2',
                'email' => 'cashier2@kaspos.com',
                'password' => bcrypt('password'),
            ]
        );
        $cashier2->assignRole($cashierRole);

        // Cashier 3 - Backup
        $cashier3 = User::firstOrCreate(
            ['username' => 'cashier-3'],
            [
                'name' => 'Cashier Backup',
                'email' => 'cashier3@kaspos.com',
                'password' => bcrypt('password'),
            ]
        );
        $cashier3->assignRole($cashierRole);

        $this->command->info('✅ Additional users created successfully!');
        $this->command->table(
            ['Username', 'Email', 'Role', 'Password'],
            [
                ['kitchen', 'kitchen@kaspos.com', 'kitchen', 'password'],
                ['waiter', 'waiter@kaspos.com', 'waiter', 'password'],
                ['manager', 'manager@kaspos.com', 'manager', 'password'],
                ['accounting', 'accounting@kaspos.com', 'accounting', 'password'],
                ['inventory', 'inventory@kaspos.com', 'inventory', 'password'],
                ['cashier-1', 'cashier1@kaspos.com', 'cashier', 'password'],
                ['cashier-2', 'cashier2@kaspos.com', 'cashier', 'password'],
                ['cashier-3', 'cashier3@kaspos.com', 'cashier', 'password'],
            ]
        );
    }
}

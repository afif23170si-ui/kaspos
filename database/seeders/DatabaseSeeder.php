<?php

namespace Database\Seeders;

// use Illuminate\Database\Console\Seeds\WithoutModelEvents;

use App\Models\PurchaseReturn;
use App\Models\TransactionReturn;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call([
            PermissionTableSeeder::class,
            RoleTableSeeder::class,
            UserTableSeeder::class,
            MaterialPermissionSeeder::class,
            UnitSeeder::class,
            CashierTableSeeder::class,
            CheckingStockSeeder::class,
            CouponSeeder::class,
            CustomerSeeder::class,
            DiscountPackageSeeder::class,
            DiscountProductSeeder::class,
            ExpenseCategorySeeder::class,
            ExpenseSeeder::class,
            ExpenseSubcategorySeeder::class,
            MenuSeeder::class,
            OrderSeeder::class,
            ProductSeeder::class,
            PurchaseReturnSeeder::class,
            ReportSeeder::class,
            SupplierSeeder::class,
            TransactionKitchenSeeder::class,
            TransactionReturnSeeder::class,
            TransactionSeeder::class,
            SettingSeeder::class,
            DashboardSeeder::class,
            TableSeeder::class,
            CategorySeeder::class,
            ReportAuditSeeder::class,
        ]);
    }
}

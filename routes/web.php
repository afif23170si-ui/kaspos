<?php

use Inertia\Inertia;
use App\Models\Transaction;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Apps\PosController;
use App\Http\Controllers\Apps\HomeController;
use App\Http\Controllers\Apps\MenuController;
use App\Http\Controllers\Apps\RoleController;
use App\Http\Controllers\Apps\UnitController;
use App\Http\Controllers\Apps\UserController;
use App\Http\Controllers\Apps\OrderController;
use App\Http\Controllers\Apps\TableController;
use App\Http\Controllers\Apps\CouponController;
use App\Http\Controllers\Apps\OptionController;
use App\Http\Controllers\Apps\ReportController;
use App\Http\Controllers\Apps\ExpenseController;
use App\Http\Controllers\Apps\ProductController;
use App\Http\Controllers\Apps\AuditLogController;
use App\Http\Controllers\Apps\CategoryController;
use App\Http\Controllers\Apps\CustomerController;
use App\Http\Controllers\Apps\MaterialController;
use App\Http\Controllers\Apps\SupplierController;
use App\Http\Controllers\Apps\DashboardController;
use App\Http\Controllers\Apps\PermissionController;
use App\Http\Controllers\Apps\TransactionController;
use App\Http\Controllers\Apps\SettingStoreController;
use App\Http\Controllers\Apps\CheckingStockController;
use App\Http\Controllers\Apps\PurchaseReturnController;
use App\Http\Controllers\Apps\DiscountPackageController;
use App\Http\Controllers\Apps\DiscountProductController;
use App\Http\Controllers\Apps\ExpenseCategoryController;
use App\Http\Controllers\Apps\TransactionReturnController;
use App\Http\Controllers\Apps\ExpenseSubcategoryController;
use App\Http\Controllers\Apps\TransactionKitchenController;

Route::controller(HomeController::class)->group(function(){
    Route::get('/', 'index')->name('home');
    Route::get('/table/{table}', 'table')->name('tables.enter');
    Route::post('/', 'store')->name('store');
});

Route::group(['as' => 'apps.', 'middleware' => ['auth']], function(){
    // dashboard route
    Route::get('dashboard', DashboardController::class)->name('dashboard');
    // pos route
    Route::controller(PosController::class)->prefix('pos')->as('pos.')->group(function(){
        Route::get('/', 'index')->name('index');
        Route::post('/', 'store')->name('store');
        Route::post('/open-cashier-shift', 'openCashierShift')->name('open-cashier-shift');
        Route::post('/close-cashiers', 'closeCashierShift')->name('close-cashier-shift');
        Route::get('/products/search-barcode', 'searchByBarcode')->name('search-by-barcode');
        Route::get('/pending-transactions', 'pendingTransaction')->name('pending-transactions');
        Route::get('/history-transactions', 'historyTransaction')->name('history-transactions');
        Route::get('/cashier-transactions', 'cashierTransaction')->name('cashier-transactions');
        Route::post('/print-receipt', 'receipt')->name('print-receipt');
        Route::get('/print-receipt-bluetooth', 'receiptBluetooth')->name('print-receipt-bluetooth');
        Route::get('/print-kitchen-bluetooth', 'kitchenReceiptBluetooth')->name('print-kitchen-bluetooth');
        Route::post('/update-table', 'openTable')->name('update-table');
        Route::post('/send-kitchen', 'sendKitchen')->name('send-kitchen');
        Route::post('/discount-per-item', 'discountPerItem')->name('dicount-per-items');
    });
    // kitchen route
    Route::controller(TransactionKitchenController::class)->as('kitchen.')->prefix('kitchen')->group(function(){
        Route::get('/list-orders', 'listOrders')->name('list-orders');
        Route::get('/', 'index')->name('index');
        Route::put('/{transactionKitchen}/update', 'update')->name('update');
    });
    // coupon route
    Route::resource('coupons', CouponController::class);
    // discount package
    Route::resource('discount-packages', DiscountPackageController::class);
    // discount products
    Route::resource('discount-products', DiscountProductController::class);
    // customer route
    Route::get('customers/list-customers', [CustomerController::class, 'ListCustomerByRequest'])->name('customers.list-customer-by-request');
    Route::resource('customers', CustomerController::class);
    // units route
    Route::resource('units', UnitController::class);
    // categories route
    Route::resource('categories', CategoryController::class);
    // tables route
    Route::controller(TableController::class)->prefix('tables')->as('tables.')->group(function(){
        Route::get('/{table}/qrcode', 'qrcode')->name('qrcode');
        Route::post('/{table}/open-table', 'openTable')->name('open-tables');
    });
    Route::resource('tables', TableController::class);
    // suppliers route
    Route::resource('suppliers', SupplierController::class);
    // materials route
    Route::resource('materials', MaterialController::class)->except(['show']);
    // products route
    Route::resource('products', ProductController::class);
    // menus route
    Route::resource('menus', MenuController::class);
    // orders route
    Route::controller(OrderController::class)->prefix('orders')->as('orders.')->group(function(){
        Route::get('/{order}/invoice', 'downloadInvoice')->name('invoices');
    });
    Route::resource('orders', OrderController::class);
    // purchase return route
    Route::controller(PurchaseReturnController::class)->prefix('purchase-returns')->as('purchase-returns.')->group(function(){
        Route::get('/{purchaseReturn}/invoice', 'downloadInvoice')->name('invoices');
    });
    Route::resource('purchase-returns', PurchaseReturnController::class);
    // transaction route
    Route::controller(TransactionController::class)->prefix('transactions')->as('transactions.')->group(function(){
        Route::post('/{transaction}/print-receipt', 'receipt')->name('print-receipt');
        Route::get('/{transaction}/print-invoice', 'invoice')->name('print-invoice');
        Route::post('/{transaction}/payment', 'payment')->name('payments');
        Route::get('/export-all', 'exportAllTransactions')->name('export-all');
        Route::post('/reset-all', 'resetAllTransactions')->name('reset-all');
    });
    Route::resource('transactions', TransactionController::class);
    // transaction return route
    Route::controller(TransactionReturnController::class)->prefix('transaction-returns')->as('transaction-returns.')->group(function(){
        Route::get('/{transactionReturn}/invoice', 'downloadInvoice')->name('invoices');
    });
    Route::resource('transaction-returns', TransactionReturnController::class);
    // checking stocks route
    Route::resource('checking-stocks', CheckingStockController::class);
    // expense category route
    Route::resource('expense-categories', ExpenseCategoryController::class);
    // expense sub category route
    Route::resource('expense-subcategories', ExpenseSubcategoryController::class);
    // expense route
    Route::resource('expenses', ExpenseController::class);
    // report route
    Route::controller(ReportController::class)->prefix('reports')->as('reports.')->group(function(){
        Route::get('/cash-flow', 'cashFlowView')->name('cash-flows');
        Route::get('/cash-flow-reports', 'cashFlowReport')->name('cash-flow-reports');
        Route::get('/purchase', 'purchaseView')->name('purchases');
        Route::get('/purchase-reports', 'purchaseReport')->name('purchase-reports');
        Route::get('/sale', 'saleView')->name('sales');
        Route::get('/sale-reports', 'salesReport')->name('sale-reports');
        Route::get('/sale-reports/export', 'salesExport')->name('sale-reports-export');
        Route::get('/stock', 'stockView')->name('stocks');
        Route::get('/stock-reports', 'stocksReport')->name('stock-reports');
        Route::get('/card-stock', 'cardStockView')->name('card-stocks');
        Route::get('/card-stock-reports', 'cardStockReport')->name('card-stock-reports');
        Route::get('/profit-loss', 'profitLossView')->name('profit-loss');
        Route::get('/profit-loss-reports', 'profitLossReport')->name('profit-loss-reports');
    });
    // permissions route
    Route::resource('permissions', PermissionController::class);
    // roles route
    Route::resource('roles', RoleController::class);
    // users route
    Route::resource('users', UserController::class);
    // setting store route
    Route::controller(SettingStoreController::class)->prefix('setting-stores')->as('setting-stores.')->group(function(){
        Route::get('/', 'index')->name('index');
        Route::post('/banks', 'storeBank')->name('store-banks');
        Route::post('/shifts', 'storeShift')->name('store-shifts');
        Route::post('/settings', 'storeSetting')->name('store-settings');
        Route::post('/customer-loyalty', 'storeCustomerLoyalty')->name('store-loyalty');
    });
    // options route
    Route::controller(OptionController::class)->prefix('option')->as('options.')->group(functioN(){
        Route::get('/{supplier}/get-orders', 'getOrders')->name('get-orders');
        Route::get('/{id}/get-transactions', 'getTransactions')->name('get-transactions');
        Route::get('/{order}/get-order-details', 'getOrderDetails')->name('get-order-details');
        Route::get('/{transaction}/get-transaction-details', 'getTransactionDetails')->name('get-transaction-details');
        Route::get('/get-stocks', 'getStocks')->name('get-stocks');
        Route::get('/{expense_category}/get-expense-subcategories', 'getExpenseSubcategories')->name('get-expense-subcategories');
        Route::get('/get-coupon', 'getCoupon')->name('get-coupons');
        Route::get('/last-transaction', 'getLastTransaction')->name('get-last-transactions');
    });
    // log route
    Route::controller(AuditLogController::class)->prefix('audit-logs')->as('audit-logs.')->group(function(){
        Route::get('/',  'index')->name('index');
        Route::get('/{activity}',  'show')->name('show');
    });
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';

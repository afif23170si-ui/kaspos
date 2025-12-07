<?php

namespace App\Http\Controllers\Auth;

use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Support\Str;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Auth;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Route;
use App\Http\Requests\Auth\LoginRequest;

class AuthenticatedSessionController extends Controller
{
    /**
     * Show the login page.
     */
    public function create(Request $request): Response
    {
        return Inertia::render('auth/login', [
            'canResetPassword' => Route::has('password.request'),
            'status' => $request->session()->get('status'),
        ]);
    }

    /**
     * Handle an incoming authentication request.
     */
    public function store(LoginRequest $request): RedirectResponse
    {
        $request->authenticate();
        $request->session()->regenerate();

        $user = $request->user();

        $routeMap = [
            'pos-data'                      => 'apps.pos.index',
            'transaction-kitchens-data'     => 'apps.kitchen.index',
            'dashboard-data'                => 'apps.dashboard',
            'setting-stores-data'           => 'apps.setting-stores.index',
            'orders-data'                   => 'apps.orders.index',
            'transactions-data'             => 'apps.transactions.index',
            'products-data'                 => 'apps.products.index',
            'menus-data'                    => 'apps.menus.index',
            'customers-data'                => 'apps.customers.index',
            'suppliers-data'                => 'apps.suppliers.index',
            'materials-data'                => 'apps.materials.index',
            'categories-data'               => 'apps.categories.index',
            'units-data'                    => 'apps.units.index',
            'tables-data'                   => 'apps.tables.index',
            'discount-products-data'        => 'apps.discount-products.index',
            'discount-packages-data'        => 'apps.discount-packages.index',
            'coupons-data'                  => 'apps.coupons.index',
            'purchase-returns-data'         => 'apps.purchase-returns.index',
            'transaction-returns-data'      => 'apps.transaction-returns.index',
            'checking-stocks-data'          => 'apps.checking-stocks.index',
            'expense-categories-data'       => 'apps.expense-categories.index',
            'expense-subcategories-data'    => 'apps.expense-subcategories.index',
            'expenses-data'                 => 'apps.expenses.index',
            'permissions-data'              => 'apps.permissions.index',
            'roles-data'                    => 'apps.roles.index',
            'users-data'                    => 'apps.users.index',
            'reports-data'                  => 'apps.reports.sales',
        ];

        $preferredOrder = [
            'pos', 'kitchen', 'orders', 'transactions', 'reports',
            'products', 'menus', 'customersr', 'suppliers', 'materials',
            'categories', 'units', 'tables', 'discount-products', 'discount-packages',
            'coupons', 'purchase-returns', 'transaction-returns',
            'checking-stocks', 'expense-categories', 'expense-subcategories', 'expenses',
            'permissions', 'roles', 'users', 'setting-stores',
            'promo', 'dashboard1',
        ];

        $permissions = $user->getAllPermissions()
            ->pluck('name')
            ->filter(fn (string $p) => Str::endsWith($p, '-data'))
            ->values();

        $candidates = [];

        foreach ($permissions as $perm) {
            if (array_key_exists($perm, $routeMap)) {
                $name = $routeMap[$perm];
                if (Route::has($name)) {
                    $candidates[$this->moduleKeyFromRoute($name)] = $name;
                }
                continue;
            }

            $module = Str::beforeLast($perm, '-data');
            if (!empty($module)) {
                $routeName = "apps.$module.index";
                if (Route::has($routeName)) {
                    $candidates[$module] = $routeName;
                }
            }
        }

        $targetRoute = 'apps.dashboard';
        foreach ($preferredOrder as $module) {
            if (isset($candidates[$module])) {
                $targetRoute = $candidates[$module];
                break;
            }
        }

        return redirect()->intended(route($targetRoute, absolute: false));
    }

    private function moduleKeyFromRoute(string $routeName): string
    {
        return Str::of($routeName)
            ->after('apps.')
            ->before('.index')
            ->value();
    }

    /**
     * Destroy an authenticated session.
     */
    public function destroy(Request $request): RedirectResponse
    {
        Auth::guard('web')->logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect('/');
    }
}

<?php

namespace App\Http\Middleware;

use App\Models\BankAccount;
use App\Models\Table;
use App\Models\Setting;
use Inertia\Middleware;
use Tighten\Ziggy\Ziggy;
use App\Models\Transaction;
use App\Models\CashierShift;
use Illuminate\Http\Request;
use App\Models\CheckingStock;
use Illuminate\Foundation\Inspiring;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     *
     * @see https://inertiajs.com/server-side-setup#root-template
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determines the current asset version.
     *
     * @see https://inertiajs.com/asset-versioning
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @see https://inertiajs.com/shared-data
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        $brand = Setting::where('is_active', 1)->where('code', 'NAME')->first()->value ?? config('app.name');
        $quotes = collect([
            "Kasir modern, solusi masa depan.",
            "Waktu lebih efisien, usaha makin jalan.",
            "Jualan lancar, karena sistem pintar.",
            "Kontrol usaha lebih mudah, kapan saja.",
            "$brand, teman setia pelaku usaha.",
        ]);

        $quote = $quotes->random() . " - $brand";
        [$message, $author] = explode(' - ', $quote);

        $shiftCashier = $request->user() ? CashierShift::with('shift', 'user')->where('user_id', request()->user()->id)->where('status', 'open')->latest()->first() : null;

        return [
            ...parent::share($request),
            'name' => Setting::where('is_active', 1)->where('code', 'NAME')->first()->value ?? config('app.name'),
            'quote' => ['message' => trim($message), 'author' => trim($author)],
            'auth' => [
                'user' => $request->user(),
                'permissions' => $request->user() ? $request->user()->getUserPermissions() : [],
                'super' => $request->user() ? $request->user()->isSuperAdmin() : false,
            ],
            'ziggy' => fn (): array => [
                ...(new Ziggy)->toArray(),
                'location' => $request->url(),
            ],
            'sidebarOpen' => $request->cookie('sidebar_state') === 'true',
            'tables' => Table::select('id', 'number', 'capacity', 'status')->get(),
            'settings' => Setting::select('id', 'code', 'name', 'value', 'is_active')->where('is_active', true)->get(),
            'shiftCashier' => $shiftCashier,
            'pendingTransactionCount' => $shiftCashier ? Transaction::where('cashier_shift_id', $shiftCashier->id)->where('status', 'pending')->count() : 0,
            'bank_accounts' => BankAccount::orderBy('bank_name')->get(),
        ];
    }
}

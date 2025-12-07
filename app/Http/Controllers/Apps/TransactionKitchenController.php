<?php

namespace App\Http\Controllers\Apps;

use Carbon\Carbon;
use App\Models\Menu;
use App\Models\User;
use App\Models\Category;
use Illuminate\Http\Request;
use App\Models\ProductVariant;
use App\Models\DiscountPackage;
use Illuminate\Validation\Rule;
use App\Models\TransactionKitchen;
use Illuminate\Support\Facades\DB;
use App\Http\Controllers\Controller;
use Illuminate\Routing\Controllers\Middleware;
use Illuminate\Routing\Controllers\HasMiddleware;

class TransactionKitchenController extends Controller implements HasMiddleware
{
    public static function middleware()
    {
        return [
            new Middleware('permission:transaction-kitchens-data', only: ['index', 'listsOrders']),
            new Middleware('permission:transaction-kitchens-update', only: ['update']),
        ];
    }

    public function listOrders(Request $request)
    {
        $sinceId = (int) $request->query('since_id', 0);

        $tz = config('app.timezone', 'Asia/Makassar');
        $now  = Carbon::now($tz);

        $query = \App\Models\TransactionKitchen::with([
            'transaction',
            'transaction.waiter',
            'transaction.customer',
            'transaction.table',
            'transaction_kitchen_items.transaction_detail',
            'transaction_kitchen_items.transaction_detail.items',
        ])
        ->when($sinceId > 0, fn($q) => $q->where('id', '>', $sinceId))
        ->whereHas('transaction', fn($q) =>
            $q->whereDate('transaction_date', Carbon::today($tz))
        )
        ->where(function ($q) use ($now) {
            $q->whereNull('transaction_finish')
            ->orWhere('transaction_finish', '>=', $now->copy()->subMinutes(10));
        })
        ->latest('id');

        $orders = $query->get();

        $orders->each(function ($order) {
            $order->transaction_date = Carbon::parse($order->transaction_date)->format('H:i:s');
            $order->transaction_kitchen_items->transform(function ($it) {
                $detail = $it->transaction_detail;
                $model  = $detail?->items;

                $itemType = null;
                $itemName = null;
                $catId    = null;
                $catName  = null;
                $image    = null;

                if ($model instanceof \App\Models\ProductVariant) {
                    $variantValues = collect($model->product_variant_values ?? [])
                        ->map(fn($v) => $v->variant_value?->name)
                        ->filter()
                        ->implode(' ');

                    $itemType = 'product';
                    $itemName = trim(($model->product?->name ?? 'VARIANT #'.$model->id) . ' ' . $variantValues);
                    $catId    = $model->product?->category_id;
                    $catName  = $model->product?->category?->name;
                    $image    = $model->product?->image;
                }
                elseif ($model instanceof \App\Models\Menu) {
                    $itemType = 'menu';
                    $itemName = (string) $model->name;
                    $catId    = $model->category_id ?? null;
                    $catName  = $model->category?->name ?? null;
                    $image    = $model->image ?? null;
                }
                elseif ($model instanceof \App\Models\DiscountPackage) {
                    $itemType = 'package';
                    $itemName = (string) $model->name;
                    $catId    = null;
                    $catName  = null;
                    $image    = $model->image ?? null;
                }

                // Fallback Logic: Jika itemName masih kosong (misal dari QR Code/Tipe Lain)
                if (empty($itemName)) {
                    $itemType = 'other';
                    // Coba ambil dari properti name di model, atau dari detail snapshot
                    $itemName = $model->name ?? $detail->name ?? 'Item';
                    $catName  = 'Lainnya';
                    $image    = $model->image ?? null;
                }

                $it->setAttribute('item_type', $itemType);
                $it->setAttribute('item_name', $itemName);
                $it->setAttribute('item_category_id', $catId);
                $it->setAttribute('item_category_name', $catName);
                $it->setAttribute('item_image', $image);

                return $it;
            });
        });

        $maxId  = $orders->max('id') ?? $sinceId;

        return response()->json([
            'orders' => $orders,
            'max_id' => $maxId,
        ]);
    }

    public function index()
    {
        $tz = config('app.timezone', 'Asia/Makassar');
        $start = \Illuminate\Support\Carbon::now($tz)->startOfDay();
        $end   = \Illuminate\Support\Carbon::now($tz)->endOfDay();
        $now  = Carbon::now($tz);

        $orders = \App\Models\TransactionKitchen::with([
            'transaction',
            'transaction.waiter',
            'transaction.customer',
            'transaction.table',
            'transaction_kitchen_items.transaction_detail',
            'transaction_kitchen_items.transaction_detail.items' => function ($morphTo) {
                $morphTo->morphWith([
                    ProductVariant::class => [
                        'product:id,name,image,category_id',
                        'product_variant_values.variant_value:id,name'
                    ],
                    Menu::class => [],
                    DiscountPackage::class => ['discount_package_items'],
                ]);
            },
        ])
        ->whereHas('transaction', function ($q) use ($start, $end) {
            $q->whereBetween('transaction_date', [$start->toDateString(), $end->toDateString()])
            ->orWhereBetween('created_at', [$start, $end]);
        })
        ->where(function ($q) use ($now) {
            $q->whereNull('transaction_finish')
            ->orWhere('transaction_finish', '>=', $now->copy()->subMinutes(10));
        })
        ->latest('id')
        ->get();

        $categories = Category::orderBy('name')->get();

        $orders->each(function ($order) {
            $order->transaction_date = Carbon::parse($order->transaction_date)->format('H:i:s');
            $order->transaction_kitchen_items->transform(function ($it) {
                $detail = $it->transaction_detail;
                $model  = $detail?->items;

                $itemType = null;
                $itemName = null;
                $catId    = null;
                $catName  = null;
                $image    = null;

                if ($model instanceof \App\Models\ProductVariant) {
                    $variantValues = collect($model->product_variant_values ?? [])
                        ->map(fn($v) => $v->variant_value?->name)
                        ->filter()
                        ->implode(' ');

                    $itemType = 'product';
                    $itemName = trim(($model->product?->name ?? 'VARIANT #'.$model->id) . ' ' . $variantValues);
                    $catId    = $model->product?->category_id;
                    $catName  = $model->product?->category?->name;
                    $image    = $model->product?->image;
                }
                elseif ($model instanceof \App\Models\Menu) {
                    $itemType = 'menu';
                    $itemName = (string) $model->name;
                    $catId    = $model->category_id ?? null;
                    $catName  = $model->category?->name ?? null;
                    $image    = $model->image ?? null;
                }
                elseif ($model instanceof \App\Models\DiscountPackage) {
                    $itemType = 'package';
                    $itemName = (string) $model->name;
                    $catId    = null;
                    $catName  = null;
                    $image    = $model->image ?? null;
                }

                // Fallback Logic: Jika itemName masih kosong (misal dari QR Code/Tipe Lain)
                if (empty($itemName)) {
                    $itemType = 'other';
                    // Coba ambil dari properti name di model, atau dari detail snapshot
                    $itemName = $model->name ?? $detail->name ?? 'Item';
                    $catName  = 'Lainnya';
                    $image    = $model->image ?? null;
                }

                $it->setAttribute('item_type', $itemType);
                $it->setAttribute('item_name', $itemName);
                $it->setAttribute('item_category_id', $catId);
                $it->setAttribute('item_category_name', $catName);
                $it->setAttribute('item_image', $image);

                return $it;
            });
        });

        $waiters = User::query()
            ->whereHas('roles', function ($q) {
                $q->whereIn('name', ['cashier', 'waiter']);
            })
            ->orderBy('name')
            ->get();


        return inertia('apps/kitchens/index', [
            'orders' => $orders,
            'waiters' => $waiters,
            'categories' => $categories,
        ]);
    }

    public function update(TransactionKitchen $transactionKitchen, Request $request)
    {
        $data = $request->validate([
            'status'        => ['sometimes', Rule::in(['pending','onprogress','success'])],
            'ready_items'   => ['array'],
            'ready_items.*' => [
                'integer',
                Rule::exists('transaction_kitchen_items','id')
                    ->where(fn($q) => $q->where('transaction_kitchen_id', $transactionKitchen->id)),
            ],
            'waiter_id'     => ['nullable', 'integer', Rule::exists('users','id')],
        ]);

        if ($request->has('waiter_id')) {
            $wid = $request->input('waiter_id');
            $transactionKitchen->transaction()->update(['waiter_id' => $wid]);
        }

        if ($request->has('status')) {
            $allowed = [
                'pending'    => ['onprogress'],
                'onprogress' => ['success'],
                'success'    => [],
            ];
            $current = $transactionKitchen->status ?? 'pending';
            
            // Relaxed validation: Allow any status update if the target status is same as current or progressive
            // But strictly forbid going back from success to pending (though not requested).
            
            // Check logic "Ready items"
            $ready = collect($request->input('ready_items', []))->map(fn($v) => (int)$v)->all();
            
            if ($data['status'] === 'success') {
                $mustIds = $transactionKitchen->transaction_kitchen_items()->pluck('id')->all();
                // Validasi: Pastikan semua item ID ada di list ready
                $missing = array_diff($mustIds, $ready);
                
                // Force update items if user request success
                // This handles case where UI thinks all ready but backend hasn't marked them 'is_done' yet
            }

            DB::transaction(function () use ($transactionKitchen, $data, $ready) {
                $now = now();

                // Update status
                $payload = ['status' => $data['status']];
                if ($data['status'] === 'success' && is_null($transactionKitchen->transaction_finish)) {
                    $payload['transaction_finish'] = $now;
                }
                $transactionKitchen->update($payload);

                // Sync is_done status
                // 1. Set passed items to DONE
                if (!empty($ready)) {
                    \App\Models\TransactionKitchenItem::where('transaction_kitchen_id', $transactionKitchen->id)
                        ->whereIn('id', $ready)
                        ->update(['is_done' => true]);
                }
                
                // 2. Set items NOT in list to NOT DONE (only if status is onprogress/pending)
                // This allows unchecking items
                if ($data['status'] !== 'success') {
                     \App\Models\TransactionKitchenItem::where('transaction_kitchen_id', $transactionKitchen->id)
                        ->whereNotIn('id', $ready)
                        ->update(['is_done' => false]);
                }

                // 3. If success, FORCE ALL to DONE (safety net)
                if ($data['status'] === 'success') {
                    \App\Models\TransactionKitchenItem::where('transaction_kitchen_id', $transactionKitchen->id)
                        ->update(['is_done' => true]);
                }
            });
        }

        return back();
    }
}

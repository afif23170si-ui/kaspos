<?php

namespace App\Http\Controllers\Apps;

use Carbon\Carbon;
use App\Models\User;
use App\Models\Order;
use App\Models\Stock;
use App\Models\Expense;
use App\Models\Setting;
use App\Models\Material;
use Carbon\CarbonPeriod;
use App\Models\Transaction;
use App\Models\OrderPayment;
use Illuminate\Http\Request;
use App\Models\StockMovement;
use App\Models\ExpensePayment;
use App\Models\ProductVariant;
use App\Models\PurchaseReturn;
use App\Models\TransactionDetail;
use App\Models\TransactionReturn;
use App\Models\TransactionPayment;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Validator;
use Illuminate\Routing\Controllers\Middleware;
use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Database\Eloquent\Relations\MorphTo;

class ReportController extends Controller implements HasMiddleware
{
    public static function middleware()
    {
        return [
            new Middleware('permission:report-cash-flow', only: ['cashFlowView', 'cashFlowReport']),
            new Middleware('permission:report-purchase', only: ['purchaseView', 'purchaseReport']),
            new Middleware('permission:report-sale', only: ['saleView', 'saleReport']),
            new Middleware('permission:report-stock', only: ['stockView', 'stocksReport']),
            new Middleware('permission:report-card-stock', only: ['cardStockView', 'cardStockReport']),
            new Middleware('permission:report-profit-loss', only: ['profitLossView', 'profitLossReport'])
        ];
    }

    public function cashFlowView()
    {
        return inertia('apps/reports/cash-flow');
    }

    public function cashFlowReport(Request $request)
    {
        $v = Validator::make($request->all(), [
            'start_date' => ['nullable', 'date'],
            'end_date'   => ['nullable', 'date', 'after_or_equal:start_date'],
        ]);

        if ($v->fails()) {
            return response()->json([
                'code'    => 422,
                'message' => 'Validation error',
                'errors'  => $v->errors(),
            ], 422);
        }

        $startDate = $request->start_date ?: Carbon::now()->startOfMonth()->toDateString();
        $endDate   = $request->end_date   ?: Carbon::now()->toDateString();

        // payment without partial payment
        $sales = Transaction::query()
            ->withCount(['transaction_payments as payments_count'])
            ->whereBetween('transaction_date', [$startDate, $endDate])
            ->get(['id','invoice','transaction_type','payment_method','bank_account_id','pay','notes_note','transaction_date'])
            ->filter(fn ($t) => (int) $t->payments_count === 0)
            ->map(function ($t) {
                return [
                    'tanggal'             => $t->transaction_date,
                    'no_transaksi'        => $t->invoice,
                    'jenis_transaksi'     => 'Penjualan',
                    'keterangan'          => $t->transaction_type,
                    'metode_bayar'        => $t->payment_method ?? '-',
                    'bank'                => optional($t->bank_account)->bank_name ?: '-',
                    'arah_kas'            => 'Masuk',
                    'jumlah'              => (float) $t->grand_total,
                    'status_tempo'        => $t->status,
                    'keterangan_tambahan' => $t->notes_note,
                ];
            });

        // payment with partial payment
        $salesPays = TransactionPayment::query()
            ->with(['transaction:id,invoice,transaction_type', 'bank_account:id,bank_name'])
            ->whereBetween('paid_at', [$startDate, $endDate])
            ->get(['id','transaction_id','bank_account_id','paid_at','amount','payment_method'])
            ->map(function ($tp, $i) {
                return [
                    'tanggal'             => $tp->paid_at,
                    'no_transaksi'        => ($tp->transaction?->invoice ?? '-') . '-PAY #'. $i + 1,
                    'jenis_transaksi'     => 'Pelunasan Penjualan',
                    'keterangan'          => $tp->transaction?->transaction_type,
                    'metode_bayar'        => $tp->payment_method ?? '-',
                    'bank'                => optional($tp->bank_account)->bank_name ?: '-',
                    'arah_kas'            => 'Masuk',
                    'jumlah'              => (float) $tp->amount,
                    'status_tempo'        => $tp->status->transaction->status,
                    'keterangan_tambahan' => $tp->transaction->notes_note,
                ];
            });

        // order without partial payment
        $orders = Order::query()
            ->withCount(['order_payments as payments_count'])
            ->whereBetween('order_date', [$startDate, $endDate])
            ->get(['id','order_code','type','payment_method','bank_account_id','payment_status','grand_total','notes','order_date'])
            ->filter(fn ($o) => (int) $o->payments_count === 0)
            ->map(function ($o) {
                return [
                    'tanggal'             => $o->order_date,
                    'no_transaksi'        => $o->order_code,
                    'jenis_transaksi'     => 'Pembelian',
                    'keterangan'          => $o->type == 'products' ? 'Pembelian Produk' : 'Pembelian Bahan Baku',
                    'metode_bayar'        => $o->payment_method ?? '-',
                    'bank'                => '-',
                    'arah_kas'            => 'Keluar',
                    'jumlah'              => (float) $o->grand_total,
                    'status_tempo'        => $o->payment_status ?? '-',
                    'keterangan_tambahan' => $o->notes,
                ];
            });

        // order with partial payment
        $orderPays = OrderPayment::query()
            ->with(['order:id,order_code,type,payment_status', 'bank_account:id,bank_name'])
            ->whereBetween('paid_at', [$startDate, $endDate])
            ->get(['id','order_id','bank_account_id','paid_at','amount','payment_method'])
            ->map(function ($op, $i) {
                return [
                    'tanggal'             => $op->paid_at,
                    'no_transaksi'        => ($op->order?->order_code ?? '-') . '-PAY #'. $i + 1,
                    'jenis_transaksi'     => 'Pelunasan Pembelian',
                    'keterangan'          => $op->order?->type == 'products' ? 'Pembelian Produk' : 'Pembelian Bahan Baku',
                    'metode_bayar'        => $op->payment_method ?? '-',
                    'bank'                => optional($op->bank_account)->bank_name ?: '-',
                    'arah_kas'            => 'Keluar',
                    'jumlah'              => (float) $op->amount,
                    'status_tempo'        => $op->order?->payment_status ?? '-',
                    'keterangan_tambahan' => $op->order?->notes,
                ];
            });

        // expense without partial payment
        $expenses = Expense::query()
            ->withCount(['expense_payments as payments_count'])
            ->whereBetween('date', [$startDate, $endDate])
            ->get(['id','expensee_number','reference_number','date','amount','payment_status','description'])
            ->filter(fn ($e) => (int) $e->payments_count === 0)
            ->map(function ($e) {
                return [
                    'tanggal'             => $e->date,
                    'no_transaksi'        => $e->expensee_number,
                    'jenis_transaksi'     => 'Biaya',
                    'keterangan'          => $e->description,
                    'metode_bayar'        => '-',
                    'bank'                => '-',
                    'arah_kas'            => 'Keluar',
                    'jumlah'              => (float) $e->amount,
                    'status_tempo'        => $e->payment_status ?? '-',
                    'keterangan_tambahan' => $e->reference_number,
                ];
            });

        // expense with partial payment
        $expensePays = ExpensePayment::query()
            ->with(['expense:id,expensee_number,description,payment_status', 'bank_account:id,bank_name'])
            ->whereBetween('paid_at', [$startDate, $endDate])
            ->get(['id','expense_id','bank_account_id','paid_at','amount','payment_method'])
            ->map(function ($ep, $i) {
                return [
                    'tanggal'             => $ep->paid_at,
                    'no_transaksi'        => ($ep->expense?->expensee_number ?? '-') . '-PAY #'. $i + 1,
                    'jenis_transaksi'     => 'Pelunasan Biaya',
                    'keterangan'          => $ep->expense?->description,
                    'metode_bayar'        => $ep->payment_method ?? '-',
                    'bank'                => optional($ep->bank_account)->bank_name ?: '-',
                    'arah_kas'            => 'Keluar',
                    'jumlah'              => (float) $ep->amount,
                    'status_tempo'        => $ep->expense?->payment_status ?? '-',
                    'keterangan_tambahan' => $ep->expense->reference_number,
                ];
            });

        $all = collect()
            ->concat($sales)
            ->concat($salesPays)
            ->concat($orders)
            ->concat($orderPays)
            ->concat($expenses)
            ->concat($expensePays)
            ->sortBy([
                ['tanggal', 'asc'],
                ['no_transaksi', 'asc'],
            ])
            ->values();

        $totalMasuk  = (float) $all->where('arah_kas', 'Masuk')->sum('jumlah');
        $totalKeluar = (float) $all->where('arah_kas', 'Keluar')->sum('jumlah');
        $saldo       = $totalMasuk - $totalKeluar;

        return response()->json([
            'code'    => 200,
            'message' => 'success',
            'data'    => [
                'rows'   => $all,
                'totals' => [
                    'total_masuk'  => $totalMasuk,
                    'total_keluar' => $totalKeluar,
                    'saldo'        => $saldo,
                ],
                'range'  => [
                    'start_date' => $startDate,
                    'end_date'   => $endDate,
                ],
            ],
        ]);
    }

     public function purchaseView()
    {
        return inertia('apps/reports/purchase');
    }

    public function purchaseReport(Request $request)
    {
        $v = Validator::make($request->all(), [
            'start_date'     => ['nullable', 'date'],
            'end_date'       => ['nullable', 'date', 'after_or_equal:start_date'],
            'payment_status' => ['nullable', 'string'],
            'payment_method' => ['nullable', 'string'],
            'bank_name'      => ['nullable', 'string'],
            'q'              => ['nullable', 'string'],
        ]);

        if ($v->fails()) {
            return response()->json([
                'code' => 422,
                'message' => 'Validation error',
                'errors' => $v->errors(),
            ], 422);
        }

        $startDate = $request->start_date ?: now()->startOfMonth()->toDateString();
        $endDate   = $request->end_date   ?: now()->toDateString();

        $filterStatus = $request->payment_status;
        $filterPM     = $request->payment_method;
        $filterBank   = $request->bank_name;
        $q            = $request->q;
        $notAll = fn($v) => !empty($v) && strtolower($v) !== 'all';

        $ordersBase = Order::query()
            ->whereBetween('order_date', [$startDate, $endDate])
            ->when($notAll($filterStatus), fn($qq) => $qq->where('payment_status', $filterStatus))
            ->when($notAll($filterPM),     fn($qq) => $qq->where('payment_method', $filterPM))
            ->when($notAll($q), function ($qq) use ($q) {
                $qq->where(function ($x) use ($q) {
                    $x->where('order_code', 'like', "%{$q}%")
                    ->orWhere('type', 'like', "%{$q}%")
                    ->orWhere('notes', 'like', "%{$q}%");
                });
            });

        $orderIds = (clone $ordersBase)->pluck('id')->all();

        $ordersNoPay = (clone $ordersBase)
            ->withCount(['order_payments as payments_count'])
            ->get(['id','order_code','type','payment_method','payment_status','grand_total','notes','order_date'])
            ->filter(fn ($o) => (int) $o->payments_count === 0)
            ->map(function ($o) {
                return [
                    'tanggal'             => (string) $o->order_date,
                    'no_transaksi'        => (string) $o->order_code,
                    'jenis_transaksi'     => 'Pembelian',
                    'keterangan'          => $o->type === 'products' ? 'Pembelian Produk' : 'Pembelian Bahan Baku',
                    'metode_bayar'        => $o->payment_method ?? '-',
                    'bank'                => '-',
                    'arah_kas'            => 'Keluar',
                    'jumlah'              => (float) $o->grand_total,
                    'status_tempo'        => $o->payment_status ?? '-',
                    'keterangan_tambahan' => $o->notes,
                ];
            });

        $paysBase = OrderPayment::query()
            ->with(['order:id,order_code,type,payment_status,notes', 'bank_account:id,bank_name'])
            ->whereBetween('paid_at', [$startDate, $endDate])
            ->when(!empty($orderIds), fn($qq) => $qq->whereIn('order_id', $orderIds))
            ->when($notAll($filterPM),   fn($qq) => $qq->where('payment_method', $filterPM))
            ->when($notAll($filterBank), fn($qq) => $qq->whereHas('bank_account', fn($q2) => $q2->where('bank_name', $filterBank)));

        $payments = $paysBase
            ->get(['id','order_id','bank_account_id','paid_at','amount','payment_method'])
            ->groupBy('order_id')
            ->flatMap(function ($group) {
                return $group->values()->map(function ($op, $idx) {
                    $order = $op->order;
                    return [
                        'tanggal'             => (string) $op->paid_at,
                        'no_transaksi'        => ($order?->order_code ?? '-') . ' -PAY #' . ($idx + 1),
                        'jenis_transaksi'     => 'Pelunasan Pembelian',
                        'keterangan'          => $order?->type === 'products' ? 'Pembelian Produk' : 'Pembelian Bahan Baku',
                        'metode_bayar'        => $op->payment_method ?? '-',
                        'bank'                => optional($op->bank_account)->bank_name ?: '-',
                        'arah_kas'            => 'Keluar',
                        'jumlah'              => (float) $op->amount,
                        'status_tempo'        => $order?->payment_status ?? '-',
                        'keterangan_tambahan' => $order?->notes,
                    ];
                });
            });

        $rows = collect($ordersNoPay)
            ->concat($payments)
            ->sortBy([['tanggal', 'asc'], ['no_transaksi', 'asc']])
            ->values()
            ->all();

        $totalPembelian = (float) Order::query()
            ->whereIn('id', $orderIds)
            ->sum('grand_total');

        $totalPembayaran = (float) OrderPayment::query()
            ->when(!empty($orderIds), fn($qq) => $qq->whereIn('order_id', $orderIds))
            ->whereBetween('paid_at', [$startDate, $endDate])
            ->when($notAll($filterPM),   fn($qq) => $qq->where('payment_method', $filterPM))
            ->when($notAll($filterBank), fn($qq) => $qq->whereHas('bank_account', fn($q2) => $q2->where('bank_name', $filterBank)))
            ->sum('amount');

        $paidToDate = OrderPayment::query()
            ->selectRaw('order_id, SUM(amount) as total_paid_to_date')
            ->when(!empty($orderIds), fn($qq) => $qq->whereIn('order_id', $orderIds))
            ->whereDate('paid_at', '<=', $endDate)
            ->groupBy('order_id');

        $outstandingAll = (float) Order::query()
            ->when(!empty($orderIds), fn($qq) => $qq->whereIn('id', $orderIds))
            ->leftJoinSub($paidToDate, 'ptd', 'ptd.order_id', '=', 'orders.id')
            ->selectRaw('SUM(GREATEST(COALESCE(orders.grand_total,0) - COALESCE(ptd.total_paid_to_date,0), 0)) as sisa')
            ->value('sisa');

        $outstandingInRange = (float) Order::query()
            ->when(!empty($orderIds), fn($qq) => $qq->whereIn('id', $orderIds))
            ->leftJoinSub($paidToDate, 'ptd', 'ptd.order_id', '=', 'orders.id')
            ->whereBetween('order_date', [$startDate, $endDate])
            ->selectRaw('SUM(GREATEST(COALESCE(orders.grand_total,0) - COALESCE(ptd.total_paid_to_date,0), 0)) as sisa')
            ->value('sisa');

        return response()->json([
            'code' => 200,
            'message' => 'success',
            'data' => [
                'rows' => $rows,
                'totals' => [
                    'total_pembelian'      => $totalPembelian,
                    'total_pembayaran'     => $totalPembayaran,
                    'outstanding_all'      => $outstandingAll,
                    'outstanding_in_range' => $outstandingInRange,
                ],
                'range' => [
                    'start_date' => $startDate,
                    'end_date'   => $endDate,
                ],
            ],
        ]);
    }

    public function saleView()
    {
        $cashiers = User::role('cashier')
            ->select('id', 'name')
            ->orderBy('name')
            ->get();

        return inertia('apps/reports/sale', [
            'cashiers' => $cashiers
        ]);
    }

    public function salesReport(Request $request)
    {
        $v = Validator::make($request->all(), [
            'start_date'     => ['nullable', 'date'],
            'end_date'       => ['nullable', 'date', 'after_or_equal:start_date'],
            'payment_status' => ['nullable', 'string'],
            'payment_method' => ['nullable', 'string'],
            'bank_name'      => ['nullable', 'string'],
            'cashier_name'   => ['nullable', 'string'],
            'q'              => ['nullable', 'string'],
        ]);
        if ($v->fails()) {
            return response()->json([
                'code' => 422,
                'message' => 'Validation error',
                'errors' => $v->errors(),
            ], 422);
        }

        $startDate   = $request->start_date ?: now()->startOfMonth()->toDateString();
        $endDate     = $request->end_date   ?: now()->toDateString();
        $filterStat  = ($request->payment_status && $request->payment_status !== 'all') ? $request->payment_status : null;
        $filterPM    = ($request->payment_method && $request->payment_method !== 'all') ? $request->payment_method : null;
        $filterBank  = $request->bank_name ?: null;
        $cashierName = $request->cashier_name ?: null;
        $q           = $request->q ?: null;

        $txQuery = Transaction::query()
            ->with('bank_account')
            ->withCount(['transaction_payments as payments_count'])
            ->whereBetween('transaction_date', [$startDate, $endDate])
            ->when($filterStat,  fn($q2) => $q2->where('status', $filterStat))
            ->when($filterPM,    fn($q2) => $q2->where('payment_method', $filterPM))
            ->when($cashierName, fn($q2) => $q2->whereHas('cashier_shift.user', fn($u) => $u->where('name', 'like', '%'.trim($cashierName).'%')))
            ->when($q, function ($q2) use ($q) {
                $q2->where(function ($w) use ($q) {
                    $w->where('invoice', 'like', "%{$q}%")
                    ->orWhere('notes_note', 'like', "%{$q}%")
                    ->orWhere('notes_transaction_source', 'like', "%{$q}%")
                    ->orWhere('platform', 'like', "%{$q}%");
                });
            });

        $salesNoRecv = $txQuery
            ->get(['id','invoice','transaction_type','platform','payment_method','status','grand_total','notes_note','transaction_date'])
            ->filter(fn ($t) => (int)$t->payments_count === 0 && (string)$t->status !== 'paid')
            ->map(function ($t) {
                $ket = match ($t->transaction_type) {
                    'dine_in'  => 'Penjualan Dine-in',
                    'takeaway' => 'Penjualan Takeaway',
                    'platform' => 'Penjualan Platform' . ($t->platform ? " ({$t->platform})" : ''),
                    default    => 'Penjualan',
                };
                return [
                    'tanggal'             => (string) \Carbon\Carbon::parse($t->transaction_date)->format('d/m/Y'),
                    'no_transaksi'        => (string) $t->invoice,
                    'jenis_transaksi'     => 'Penjualan',
                    'keterangan'          => $ket,
                    'metode_bayar'        => $t->payment_method ?? '-',
                    'bank'                => optional($t->bank_account)->bank_name ?: '-',
                    'arah_kas'            => 'Masuk',
                    'jumlah'              => (float) $t->grand_total,
                    'status_tempo'        => $t->status ?? '-',
                    'keterangan_tambahan' => $t->notes_note,
                ];
            });

        $recvBase = TransactionPayment::query()
            ->with([
                'transaction:id,invoice,transaction_type,platform,status,notes_note,cashier_shift_id',
                'bank_account:id,bank_name',
                'transaction.cashier_shift.user:id,name',
            ])
            ->whereBetween('paid_at', [$startDate, $endDate])
            ->when($filterPM,    fn($q2) => $q2->where('payment_method', $filterPM))
            ->when($filterBank,  fn($q2) => $q2->whereHas('bank_account', fn($b) => $b->where('bank_name', $filterBank)))
            ->when($filterStat,  fn($q2) => $q2->whereHas('transaction', fn($t) => $t->where('status', $filterStat)))
            ->when($cashierName, fn($q2) => $q2->whereHas('transaction.cashier_shift.user', fn($u) => $u->where('name', 'like', '%'.trim($cashierName).'%')))
            ->when($q, function($q2) use($q){
                $q2->whereHas('transaction', function ($t) use ($q) {
                    $t->where(function ($w) use ($q) {
                        $w->where('invoice', 'like', "%{$q}%")
                        ->orWhere('notes_note', 'like', "%{$q}%")
                        ->orWhere('notes_transaction_source', 'like', "%{$q}%")
                        ->orWhere('platform', 'like', "%{$q}%");
                    });
                });
            });

        $receipts = $recvBase
            ->get(['id','transaction_id','bank_account_id','paid_at','amount','payment_method'])
            ->groupBy('transaction_id')
            ->flatMap(function ($group) {
                return $group->values()->map(function ($rp, $idx) {
                    $tx  = $rp->transaction;
                    $ket = match ($tx?->transaction_type) {
                        'dine_in'  => 'Penjualan Dine-in',
                        'takeaway' => 'Penjualan Takeaway',
                        'platform' => 'Penjualan Platform' . (($tx?->platform) ? " ({$tx->platform})" : ''),
                        default    => 'Penjualan',
                    };
                    return [
                        'tanggal'             => (string) \Carbon\Carbon::parse($rp->paid_at)->format('d/m/Y'),
                        'no_transaksi'        => ($tx?->invoice ?? '-') . ' -REC #' . ($idx + 1),
                        'jenis_transaksi'     => 'Penerimaan Penjualan',
                        'keterangan'          => $ket,
                        'metode_bayar'        => $rp->payment_method ?? '-',
                        'bank'                => optional($rp->bank_account)->bank_name ?: '-',
                        'arah_kas'            => 'Masuk',
                        'jumlah'              => (float) $rp->amount,
                        'status_tempo'        => $tx?->status ?? '-',
                        'keterangan_tambahan' => $tx?->notes_note,
                    ];
                });
            });

        $instantQ = Transaction::query()
            ->select('*')
            ->withCount(['transaction_payments as payments_count'])
            ->leftJoin('bank_accounts as ba', 'ba.id', '=', 'transactions.bank_account_id')
            ->leftJoin('cashier_shifts as cs', 'cs.id', '=', 'transactions.cashier_shift_id')
            ->leftJoin('users as u', 'u.id', '=', 'cs.user_id')
            ->whereBetween('transactions.transaction_date', [$startDate, $endDate])
            ->where('transactions.status', 'paid')
            ->having('payments_count', '=', 0)
            ->when($filterBank,  fn($q2) => $q2->where('ba.bank_name', $filterBank))
            ->when($filterPM,    fn($q2) => $q2->where('transactions.payment_method', $filterPM))
            ->when($cashierName, fn($q2) => $q2->where('u.name', 'like', '%'.trim($cashierName).'%'))
            ->when($q, function ($q2) use ($q) {
                $q2->where(function ($w) use ($q) {
                    $w->where('transactions.invoice', 'like', "%{$q}%")
                    ->orWhere('transactions.notes_note', 'like', "%{$q}%")
                    ->orWhere('transactions.notes_transaction_source', 'like', "%{$q}%")
                    ->orWhere('transactions.platform', 'like', "%{$q}%");
                });
            });

        $instantRows = $instantQ->get([
                'transactions.id',
                'transactions.invoice',
                'transactions.transaction_type',
                'transactions.platform',
                'transactions.payment_method',
                'transactions.status',
                'transactions.grand_total',
                'transactions.notes_note',
                'transactions.transaction_date',
                'ba.bank_name',
                'u.name as cashier_name',
            ])
            ->map(function ($t) {
                $ket = match ($t->transaction_type) {
                    'dine_in'  => 'Penjualan Dine-in',
                    'takeaway' => 'Penjualan Takeaway',
                    'platform' => 'Penjualan Platform' . ($t->platform ? " ({$t->platform})" : ''),
                    default    => 'Penjualan',
                };
                return [
                    'tanggal'             => (string) \Carbon\Carbon::parse($t->transaction_date)->format('d/m/Y'),
                    'no_transaksi'        => (string) $t->invoice . ' -REC #1',
                    'jenis_transaksi'     => 'Penerimaan Penjualan',
                    'keterangan'          => $ket,
                    'metode_bayar'        => $t->payment_method ?? '-',
                    'bank'                => $t->bank_name ?: '-',
                    'arah_kas'            => 'Masuk',
                    'jumlah'              => (float) $t->grand_total,
                    'status_tempo'        => $t->status ?? '-',
                    'keterangan_tambahan' => $t->notes_note,
                ];
            });

        $rows = collect($salesNoRecv)
            ->concat($receipts)
            ->concat($instantRows)
            ->sortBy([
                ['tanggal', 'asc'],
                ['no_transaksi', 'asc'],
            ])
            ->values()
            ->all();

        $totalPenjualanQ = Transaction::query()
            ->whereBetween('transaction_date', [$startDate, $endDate])
            ->when($filterStat,  fn($q2) => $q2->where('status', $filterStat))
            ->when($filterPM,    fn($q2) => $q2->where('payment_method', $filterPM))
            ->when($cashierName, fn($q2) => $q2->whereHas('cashier_shift.user', fn($u) => $u->where('name', 'like', '%'.trim($cashierName).'%')))
            ->when($q, function ($q2) use ($q) {
                $q2->where(function ($w) use ($q) {
                    $w->where('invoice', 'like', "%{$q}%")
                    ->orWhere('notes_note', 'like', "%{$q}%")
                    ->orWhere('notes_transaction_source', 'like', "%{$q}%")
                    ->orWhere('platform', 'like', "%{$q}%");
                });
            });
        $totalPenjualan = (float) $totalPenjualanQ->sum('grand_total');

        $totalPenerimaanQ = TransactionPayment::query()
            ->whereBetween('paid_at', [$startDate, $endDate])
            ->when($filterPM,    fn($q2) => $q2->where('payment_method', $filterPM))
            ->when($filterBank,  fn($q2) => $q2->whereHas('bank_account', fn($b) => $b->where('bank_name', $filterBank)))
            ->when($filterStat || $cashierName || $q, function ($q2) use ($filterStat, $cashierName, $q) {
                $q2->whereHas('transaction', function ($tq) use ($filterStat, $cashierName, $q) {
                    if ($filterStat)  $tq->where('status', $filterStat);
                    if ($cashierName) $tq->whereHas('cashier_shift.user', fn($u) => $u->where('name', 'like', '%'.trim($cashierName).'%'));
                    if ($q) {
                        $tq->where(function ($w) use ($q) {
                            $w->where('invoice', 'like', "%{$q}%")
                            ->orWhere('notes_note', 'like', "%{$q}%")
                            ->orWhere('notes_transaction_source', 'like', "%{$q}%")
                            ->orWhere('platform', 'like', "%{$q}%");
                        });
                    }
                });
            });
        $totalPenerimaanPayments = (float) $totalPenerimaanQ->sum('amount');

        $instantSumQ = Transaction::query()
            ->withCount(['transaction_payments as payments_count'])
            ->leftJoin('bank_accounts as ba', 'ba.id', '=', 'transactions.bank_account_id')
            ->leftJoin('cashier_shifts as cs', 'cs.id', '=', 'transactions.cashier_shift_id')
            ->leftJoin('users as u', 'u.id', '=', 'cs.user_id')
            ->whereBetween('transactions.transaction_date', [$startDate, $endDate])
            ->where('transactions.status', 'paid')
            ->having('payments_count', '=', 0)
            ->when($filterPM,    fn($q2) => $q2->where('transactions.payment_method', $filterPM))
            ->when($filterBank,  fn($q2) => $q2->where('ba.bank_name', $filterBank))
            ->when($cashierName, fn($q2) => $q2->where('u.name', 'like', '%'.trim($cashierName).'%'))
            ->when($q, function ($q2) use ($q) {
                $q2->where(function ($w) use ($q) {
                    $w->where('transactions.invoice', 'like', "%{$q}%")
                    ->orWhere('transactions.notes_note', 'like', "%{$q}%")
                    ->orWhere('transactions.notes_transaction_source', 'like', "%{$q}%")
                    ->orWhere('transactions.platform', 'like', "%{$q}%");
                });
            });
        $instantSum = (float) $instantSumQ->sum('grand_total');

        $totalPenerimaan = $totalPenerimaanPayments + $instantSum;

        $paidToDateMap = TransactionPayment::query()
            ->selectRaw('transaction_id, SUM(amount) as total_paid_to_date')
            ->whereDate('paid_at', '<=', $endDate)
            ->groupBy('transaction_id')
            ->pluck('total_paid_to_date', 'transaction_id');

        $computeOutstanding = function ($baseQuery) use ($paidToDateMap, $filterStat, $cashierName, $q) {
            $baseQuery
                ->when($filterStat,  fn($q2) => $q2->where('status', $filterStat))
                ->when($cashierName, fn($q2) => $q2->whereHas('cashier_shift.user', fn($u) => $u->where('name', 'like', '%'.trim($cashierName).'%')))
                ->when($q, function ($q2) use ($q) {
                    $q2->where(function ($w) use ($q) {
                        $w->where('invoice', 'like', "%{$q}%")
                        ->orWhere('notes_note', 'like', "%{$q}%")
                        ->orWhere('notes_transaction_source', 'like', "%{$q}%")
                        ->orWhere('platform', 'like', "%{$q}%");
                    });
                });

            return (float) $baseQuery
                ->get(['id','grand_total','status'])
                ->reduce(function ($carry, $t) use ($paidToDateMap) {
                    $sumPaid = (float) ($paidToDateMap[$t->id] ?? 0);
                    if ($sumPaid <= 0 && (string)$t->status === 'paid') {
                        $sumPaid = (float) $t->grand_total;
                    }
                    $sisa = max((float)$t->grand_total - $sumPaid, 0);
                    return $carry + $sisa;
                }, 0.0);
        };

        $outstandingAll      = $computeOutstanding(Transaction::query()->whereDate('transaction_date', '<=', $endDate));
        $outstandingInRange  = $computeOutstanding(Transaction::query()->whereBetween('transaction_date', [$startDate, $endDate]));

        return response()->json([
            'code' => 200,
            'message' => 'success',
            'data' => [
                'rows' => $rows,
                'totals' => [
                    'total_penjualan'       => $totalPenjualan,
                    'total_penerimaan'      => $totalPenerimaan,
                    'outstanding_all'       => $outstandingAll,
                    'outstanding_in_range'  => $outstandingInRange,
                ],
                'range' => [
                    'start_date' => $startDate,
                    'end_date'   => $endDate,
                ],
            ],
        ]);

    }

    public function salesExport(Request $request)
    {
        $v = Validator::make($request->all(), [
            'start_date'     => ['nullable', 'date'],
            'end_date'       => ['nullable', 'date', 'after_or_equal:start_date'],
            'payment_status' => ['nullable', 'string'],
            'payment_method' => ['nullable', 'string'],
            'bank_name'      => ['nullable', 'string'],
            'cashier_name'   => ['nullable', 'string'],
            'q'              => ['nullable', 'string'],
        ]);
        if ($v->fails()) {
            return response()->json([
                'code' => 422,
                'message' => 'Validation error',
                'errors' => $v->errors(),
            ], 422);
        }

        $startDate   = $request->start_date ?: now()->startOfMonth()->toDateString();
        $endDate     = $request->end_date   ?: now()->toDateString();
        $filterStat  = ($request->payment_status && $request->payment_status !== 'all') ? $request->payment_status : null;
        $filterPM    = ($request->payment_method && $request->payment_method !== 'all') ? $request->payment_method : null;
        $filterBank  = $request->bank_name ?: null;
        $cashierName = $request->cashier_name ?: null;
        $q           = $request->q ?: null;

        $txQuery = Transaction::query()
            ->with('bank_account')
            ->withCount(['transaction_payments as payments_count'])
            ->whereBetween('transaction_date', [$startDate, $endDate])
            ->when($filterStat,  fn($q2) => $q2->where('status', $filterStat))
            ->when($filterPM,    fn($q2) => $q2->where('payment_method', $filterPM))
            ->when($cashierName, fn($q2) => $q2->whereHas('cashier_shift.user', fn($u) => $u->where('name', 'like', '%'.trim($cashierName).'%')))
            ->when($q, function ($q2) use ($q) {
                $q2->where(function ($w) use ($q) {
                    $w->where('invoice', 'like', "%{$q}%")
                    ->orWhere('notes_note', 'like', "%{$q}%")
                    ->orWhere('notes_transaction_source', 'like', "%{$q}%")
                    ->orWhere('platform', 'like', "%{$q}%");
                });
            });

        $salesNoRecv = $txQuery
            ->get(['id','invoice','transaction_type','platform','payment_method','status','grand_total','notes_note','transaction_date'])
            ->filter(fn ($t) => (int)$t->payments_count === 0 && (string)$t->status !== 'paid')
            ->map(function ($t) {
                $ket = match ($t->transaction_type) {
                    'dine_in'  => 'Penjualan Dine-in',
                    'takeaway' => 'Penjualan Takeaway',
                    'platform' => 'Penjualan Platform' . ($t->platform ? " ({$t->platform})" : ''),
                    default    => 'Penjualan',
                };
                return [
                    'tanggal'             => (string) \Carbon\Carbon::parse($t->transaction_date)->format('d/m/Y'),
                    'no_transaksi'        => (string) $t->invoice,
                    'jenis_transaksi'     => 'Penjualan',
                    'keterangan'          => $ket,
                    'metode_bayar'        => $t->payment_method ?? '-',
                    'bank'                => optional($t->bank_account)->bank_name ?: '-',
                    'arah_kas'            => 'Masuk',
                    'jumlah'              => (float) $t->grand_total,
                    'status_tempo'        => $t->status ?? '-',
                    'keterangan_tambahan' => $t->notes_note,
                ];
            });

        $recvBase = TransactionPayment::query()
            ->with([
                'transaction:id,invoice,transaction_type,platform,status,notes_note,cashier_shift_id',
                'bank_account:id,bank_name',
                'transaction.cashier_shift.user:id,name',
            ])
            ->whereBetween('paid_at', [$startDate, $endDate])
            ->when($filterPM,    fn($q2) => $q2->where('payment_method', $filterPM))
            ->when($filterBank,  fn($q2) => $q2->whereHas('bank_account', fn($b) => $b->where('bank_name', $filterBank)))
            ->when($filterStat,  fn($q2) => $q2->whereHas('transaction', fn($t) => $t->where('status', $filterStat)))
            ->when($cashierName, fn($q2) => $q2->whereHas('transaction.cashier_shift.user', fn($u) => $u->where('name', 'like', '%'.trim($cashierName).'%')))
            ->when($q, function($q2) use($q){
                $q2->whereHas('transaction', function ($t) use ($q) {
                    $t->where(function ($w) use ($q) {
                        $w->where('invoice', 'like', "%{$q}%")
                        ->orWhere('notes_note', 'like', "%{$q}%")
                        ->orWhere('notes_transaction_source', 'like', "%{$q}%")
                        ->orWhere('platform', 'like', "%{$q}%");
                    });
                });
            });

        $receipts = $recvBase
            ->get(['id','transaction_id','bank_account_id','paid_at','amount','payment_method'])
            ->groupBy('transaction_id')
            ->flatMap(function ($group) {
                return $group->values()->map(function ($rp, $idx) {
                    $tx  = $rp->transaction;
                    $ket = match ($tx?->transaction_type) {
                        'dine_in'  => 'Penjualan Dine-in',
                        'takeaway' => 'Penjualan Takeaway',
                        'platform' => 'Penjualan Platform' . (($tx?->platform) ? " ({$tx->platform})" : ''),
                        default    => 'Penjualan',
                    };
                    return [
                        'tanggal'             => (string) \Carbon\Carbon::parse($rp->paid_at)->format('d/m/Y'),
                        'no_transaksi'        => ($tx?->invoice ?? '-') . ' -REC #' . ($idx + 1),
                        'jenis_transaksi'     => 'Penerimaan Penjualan',
                        'keterangan'          => $ket,
                        'metode_bayar'        => $rp->payment_method ?? '-',
                        'bank'                => optional($rp->bank_account)->bank_name ?: '-',
                        'arah_kas'            => 'Masuk',
                        'jumlah'              => (float) $rp->amount,
                        'status_tempo'        => $tx?->status ?? '-',
                        'keterangan_tambahan' => $tx?->notes_note,
                    ];
                });
            });

        $instantQ = Transaction::query()
            ->select('*')
            ->withCount(['transaction_payments as payments_count'])
            ->leftJoin('bank_accounts as ba', 'ba.id', '=', 'transactions.bank_account_id')
            ->leftJoin('cashier_shifts as cs', 'cs.id', '=', 'transactions.cashier_shift_id')
            ->leftJoin('users as u', 'u.id', '=', 'cs.user_id')
            ->whereBetween('transactions.transaction_date', [$startDate, $endDate])
            ->where('transactions.status', 'paid')
            ->having('payments_count', '=', 0)
            ->when($filterBank,  fn($q2) => $q2->where('ba.bank_name', $filterBank))
            ->when($filterPM,    fn($q2) => $q2->where('transactions.payment_method', $filterPM))
            ->when($cashierName, fn($q2) => $q2->where('u.name', 'like', '%'.trim($cashierName).'%'))
            ->when($q, function ($q2) use ($q) {
                $q2->where(function ($w) use ($q) {
                    $w->where('transactions.invoice', 'like', "%{$q}%")
                    ->orWhere('transactions.notes_note', 'like', "%{$q}%")
                    ->orWhere('transactions.notes_transaction_source', 'like', "%{$q}%")
                    ->orWhere('transactions.platform', 'like', "%{$q}%");
                });
            });

        $instantRows = $instantQ->get([
                'transactions.id',
                'transactions.invoice',
                'transactions.transaction_type',
                'transactions.platform',
                'transactions.payment_method',
                'transactions.status',
                'transactions.grand_total',
                'transactions.notes_note',
                'transactions.transaction_date',
                'ba.bank_name',
                'u.name as cashier_name',
            ])
            ->map(function ($t) {
                $ket = match ($t->transaction_type) {
                    'dine_in'  => 'Penjualan Dine-in',
                    'takeaway' => 'Penjualan Takeaway',
                    'platform' => 'Penjualan Platform' . ($t->platform ? " ({$t->platform})" : ''),
                    default    => 'Penjualan',
                };
                return [
                    'tanggal'             => (string) \Carbon\Carbon::parse($t->transaction_date)->format('d/m/Y'),
                    'no_transaksi'        => (string) $t->invoice . ' -REC #1',
                    'jenis_transaksi'     => 'Penerimaan Penjualan',
                    'keterangan'          => $ket,
                    'metode_bayar'        => $t->payment_method ?? '-',
                    'bank'                => $t->bank_name ?: '-',
                    'arah_kas'            => 'Masuk',
                    'jumlah'              => (float) $t->grand_total,
                    'status_tempo'        => $t->status ?? '-',
                    'keterangan_tambahan' => $t->notes_note,
                ];
            });

        $rows = collect($salesNoRecv)
            ->concat($receipts)
            ->concat($instantRows)
            ->sortBy([
                ['tanggal', 'asc'],
                ['no_transaksi', 'asc'],
            ])
            ->values()
            ->all();

        $totalPenjualanQ = Transaction::query()
            ->whereBetween('transaction_date', [$startDate, $endDate])
            ->when($filterStat,  fn($q2) => $q2->where('status', $filterStat))
            ->when($filterPM,    fn($q2) => $q2->where('payment_method', $filterPM))
            ->when($cashierName, fn($q2) => $q2->whereHas('cashier_shift.user', fn($u) => $u->where('name', 'like', '%'.trim($cashierName).'%')))
            ->when($q, function ($q2) use ($q) {
                $q2->where(function ($w) use ($q) {
                    $w->where('invoice', 'like', "%{$q}%")
                    ->orWhere('notes_note', 'like', "%{$q}%")
                    ->orWhere('notes_transaction_source', 'like', "%{$q}%")
                    ->orWhere('platform', 'like', "%{$q}%");
                });
            });
        $totalPenjualan = (float) $totalPenjualanQ->sum('grand_total');

        $totalPenerimaanQ = TransactionPayment::query()
            ->whereBetween('paid_at', [$startDate, $endDate])
            ->when($filterPM,    fn($q2) => $q2->where('payment_method', $filterPM))
            ->when($filterBank,  fn($q2) => $q2->whereHas('bank_account', fn($b) => $b->where('bank_name', $filterBank)))
            ->when($filterStat || $cashierName || $q, function ($q2) use ($filterStat, $cashierName, $q) {
                $q2->whereHas('transaction', function ($tq) use ($filterStat, $cashierName, $q) {
                    if ($filterStat)  $tq->where('status', $filterStat);
                    if ($cashierName) $tq->whereHas('cashier_shift.user', fn($u) => $u->where('name', 'like', '%'.trim($cashierName).'%'));
                    if ($q) {
                        $tq->where(function ($w) use ($q) {
                            $w->where('invoice', 'like', "%{$q}%")
                            ->orWhere('notes_note', 'like', "%{$q}%")
                            ->orWhere('notes_transaction_source', 'like', "%{$q}%")
                            ->orWhere('platform', 'like', "%{$q}%");
                        });
                    }
                });
            });
        $totalPenerimaanPayments = (float) $totalPenerimaanQ->sum('amount');

        $instantSumQ = Transaction::query()
            ->withCount(['transaction_payments as payments_count'])
            ->leftJoin('bank_accounts as ba', 'ba.id', '=', 'transactions.bank_account_id')
            ->leftJoin('cashier_shifts as cs', 'cs.id', '=', 'transactions.cashier_shift_id')
            ->leftJoin('users as u', 'u.id', '=', 'cs.user_id')
            ->whereBetween('transactions.transaction_date', [$startDate, $endDate])
            ->where('transactions.status', 'paid')
            ->having('payments_count', '=', 0)
            ->when($filterPM,    fn($q2) => $q2->where('transactions.payment_method', $filterPM))
            ->when($filterBank,  fn($q2) => $q2->where('ba.bank_name', $filterBank))
            ->when($cashierName, fn($q2) => $q2->where('u.name', 'like', '%'.trim($cashierName).'%'))
            ->when($q, function ($q2) use ($q) {
                $q2->where(function ($w) use ($q) {
                    $w->where('transactions.invoice', 'like', "%{$q}%")
                    ->orWhere('transactions.notes_note', 'like', "%{$q}%")
                    ->orWhere('transactions.notes_transaction_source', 'like', "%{$q}%")
                    ->orWhere('transactions.platform', 'like', "%{$q}%");
                });
            });
        $instantSum = (float) $instantSumQ->sum('grand_total');

        $totalPenerimaan = $totalPenerimaanPayments + $instantSum;

        $paidToDateMap = TransactionPayment::query()
            ->selectRaw('transaction_id, SUM(amount) as total_paid_to_date')
            ->whereDate('paid_at', '<=', $endDate)
            ->groupBy('transaction_id')
            ->pluck('total_paid_to_date', 'transaction_id');

        $computeOutstanding = function ($baseQuery) use ($paidToDateMap, $filterStat, $cashierName, $q) {
            $baseQuery
                ->when($filterStat,  fn($q2) => $q2->where('status', $filterStat))
                ->when($cashierName, fn($q2) => $q2->whereHas('cashier_shift.user', fn($u) => $u->where('name', 'like', '%'.trim($cashierName).'%')))
                ->when($q, function ($q2) use ($q) {
                    $q2->where(function ($w) use ($q) {
                        $w->where('invoice', 'like', "%{$q}%")
                        ->orWhere('notes_note', 'like', "%{$q}%")
                        ->orWhere('notes_transaction_source', 'like', "%{$q}%")
                        ->orWhere('platform', 'like', "%{$q}%");
                    });
                });

            return (float) $baseQuery
                ->get(['id','grand_total','status'])
                ->reduce(function ($carry, $t) use ($paidToDateMap) {
                    $sumPaid = (float) ($paidToDateMap[$t->id] ?? 0);
                    if ($sumPaid <= 0 && (string)$t->status === 'paid') {
                        $sumPaid = (float) $t->grand_total;
                    }
                    $sisa = max((float)$t->grand_total - $sumPaid, 0);
                    return $carry + $sisa;
                }, 0.0);
        };

        $outstandingAll      = $computeOutstanding(Transaction::query()->whereDate('transaction_date', '<=', $endDate));
        $outstandingInRange  = $computeOutstanding(Transaction::query()->whereBetween('transaction_date', [$startDate, $endDate]));

        $pdf = \Barryvdh\DomPDF\Facade\Pdf::loadView('pdf.sales-report', [
            'rows'   => $rows,
            'totals' => [
                'total_penjualan'       => $totalPenjualan,
                'total_penerimaan'      => $totalPenerimaan,
                'outstanding_all'       => $outstandingAll,
                'outstanding_in_range'  => $outstandingInRange,
            ],
            'range' => [
                'start_date' => $startDate,
                'end_date'   => $endDate,
            ],
        ])->setPaper('a4', 'landscape');

        return $pdf->stream('laporan-penjualan.pdf');
    }

    public function stockView()
    {
        return inertia('apps/reports/stock');
    }

    public function stocksReport(Request $request)
    {
        $v = Validator::make($request->all(), [
            'date'            => ['nullable', 'date'],
            'start_date'      => ['nullable', 'date'],
            'stockable_type'  => ['nullable', 'string'],
            'q'               => ['nullable', 'string'],
            'hide_zero'       => ['nullable', 'boolean'],
        ]);

        if ($v->fails()) {
            return response()->json([
                'code' => 422,
                'message' => 'Validation error',
                'errors' => $v->errors(),
            ], 422);
        }

        $asOfDate   = $request->date
                    ?: ($request->end_date ?? $request->start_date)
                    ?: now()->toDateString();

        $typeFilter = $request->stockable_type && $request->stockable_type !== 'all' ? $request->stockable_type : null;
        $q          = $request->q ?: null;
        $hideZero   = (bool) $request->boolean('hide_zero', false);

        $TYPE_VARIANT  = 'App\\Models\\ProductVariant';
        $TYPE_MATERIAL = 'App\\Models\\Material';

        $stocksQ = Stock::query()->with([
            'stockable' => function ($morphTo) {
                $morphTo->morphWith([
                    ProductVariant::class => ['product', 'product_variant_values.variant_value'],
                    Material::class       => [],
                ]);
            }
        ]);

        if ($typeFilter === 'product_variant') {
            $stocksQ->where('stockable_type', $TYPE_VARIANT);
        } elseif ($typeFilter === 'material') {
            $stocksQ->where('stockable_type', $TYPE_MATERIAL);
        }

        $stocks = $stocksQ->get();

        if ($q) {
            $qLower = mb_strtolower($q);

            $stocks = $stocks->filter(function (Stock $s) use ($qLower, $TYPE_VARIANT, $TYPE_MATERIAL) {
                $inBatch = str_contains(mb_strtolower((string) $s->batch_code), $qLower);

                $stockable = $s->stockable;

                if ($s->stockable_type === $TYPE_VARIANT) {
                    $barcodeLower = mb_strtolower((string) ($stockable?->barcode ?? ''));
                    $productNameLower = mb_strtolower((string) ($stockable?->product?->name ?? ''));
                    $valuesLower = collect($stockable?->product_variant_values ?? [])
                        ->map(fn($v) => mb_strtolower((string) ($v->variant_value?->name ?? '')))
                        ->filter()
                        ->implode(' ');
                    $compositeLower = trim($productNameLower . ' ' . $valuesLower);

                    return $inBatch
                        || ($barcodeLower !== ''  && str_contains($barcodeLower, $qLower))
                        || ($productNameLower !== '' && str_contains($productNameLower, $qLower))
                        || ($valuesLower !== ''  && str_contains($valuesLower, $qLower))
                        || ($compositeLower !== '' && str_contains($compositeLower, $qLower));
                }

                if ($s->stockable_type === $TYPE_MATERIAL) {
                    $nameLower = mb_strtolower((string) ($stockable?->name ?? ''));
                    return $inBatch
                        || ($nameLower !== '' && str_contains($nameLower, $qLower));
                }

                return $inBatch;
            })->values();
        }

        if ($stocks->isEmpty()) {
            return response()->json([
                'code' => 200,
                'message' => 'success',
                'data' => [
                    'rows' => [],
                    'totals' => [
                        'grand_total_current' => 0,
                        'grand_total_expired' => 0,
                    ],
                    'as_of' => $asOfDate,
                ],
            ]);
        }

        $stockIds = $stocks->pluck('id')->all();

        $openingMap = StockMovement::query()
            ->whereIn('stock_id', $stockIds)
            ->whereDate('created_at', '<', $asOfDate)
            ->get(['stock_id','type','quantity'])
            ->groupBy('stock_id')
            ->map(function ($rows) {
                $in  = (double) $rows->where('type','in')->sum('quantity');
                $out = (double) $rows->where('type','out')->sum('quantity');
                return $in - $out;
            });

        $dayMap = StockMovement::query()
            ->whereIn('stock_id', $stockIds)
            ->whereDate('created_at', '=', $asOfDate)
            ->get(['stock_id','type','quantity'])
            ->groupBy('stock_id')
            ->map(function ($rows) {
                return [
                    'in'  => (double) $rows->where('type','in')->sum('quantity'),
                    'out' => (double) $rows->where('type','out')->sum('quantity'),
                ];
            });

        $TYPE_LABEL = fn(string $type) => $type === $TYPE_VARIANT ? 'product_variant' : ($type === $TYPE_MATERIAL ? 'material' : 'unknown');

        $perBatch = $stocks->map(function (Stock $s) use ($TYPE_VARIANT, $TYPE_MATERIAL, $TYPE_LABEL, $openingMap, $dayMap, $asOfDate) {
            $stockable = $s->stockable;

            $itemType = $TYPE_LABEL($s->stockable_type);
            $itemId   = (int) $s->stockable_id;
            $unitId   = $stockable?->unit_id ?? null;

            if ($s->stockable_type === $TYPE_VARIANT) {
                $variantValues = collect($stockable?->product_variant_values ?? [])
                    ->map(fn($v) => $v->variant_value?->name)
                    ->filter()
                    ->implode(' ');
                $productName = $stockable?->product?->name ?? '';
                $itemLabel   = trim($productName.' '.$variantValues) ?: ('VARIANT #'.$itemId);
                $minimumQty  = (double) ($stockable?->minimum_quantity ?? 0);
            } elseif ($s->stockable_type === $TYPE_MATERIAL) {
                $itemLabel   = (string) ($stockable?->name ?? ('MATERIAL #'.$itemId));
                $minimumQty  = (double) ($stockable?->minimum_qty ?? 0);
            } else {
                $itemLabel   = 'ITEM #'.$itemId;
                $minimumQty  = 0.0;
            }

            $opening = (double) ($openingMap[$s->id] ?? 0.0);
            $in      = (double) ($dayMap[$s->id]['in']  ?? 0.0);
            $out     = (double) ($dayMap[$s->id]['out'] ?? 0.0);
            $closing = $opening + $in - $out;
            $eps = 1e-6;

            $isExpiredDate = $s->expired_at
                ? (strtotime((string)$s->expired_at) < strtotime($asOfDate))
                : false;

            if (abs($closing) <= $eps) {
                $status = 'out stock';
            } else {
                $status = $isExpiredDate ? 'expired' : 'active';
            }

            $isExpired = ($status === 'expired');

            return [
                'item_type'    => $itemType,
                'item_id'      => $itemId,
                'item_label'   => $itemLabel,
                'unit_id'      => $unitId,
                'minimum_qty'  => $minimumQty,
                'stock_id'     => (int) $s->id,
                'batch_code'   => $s->batch_code,
                'expired_at'   => $s->expired_at ? (string) $s->expired_at : null,
                'status'       => $status,
                'is_expired'   => (bool) $isExpired,
                'opening_qty'  => (double) $opening,
                'in_qty'       => (double) $in,
                'out_qty'      => (double) $out,
                'closing_qty'  => (double) $closing,
            ];
        });

        $grouped = $perBatch->groupBy(fn ($b) => $b['item_type'].'#'.$b['item_id']);

        $rows = $grouped->map(function ($grp) {
            $grp = collect($grp);
            $first      = $grp->first();
            $itemLabel  = $first['item_label'];
            $unitId     = $first['unit_id'];
            $minimum    = (double) ($first['minimum_qty'] ?? 0);

            $totalActive  = (double) $grp->filter(fn($b) => !$b['is_expired'])->sum('closing_qty');
            $totalExpired = (double) $grp->filter(fn($b) =>  $b['is_expired'])->sum('closing_qty');

            $sumOpening = (double) $grp->sum('opening_qty');
            $sumIn      = (double) $grp->sum('in_qty');
            $sumOut     = (double) $grp->sum('out_qty');
            $sumClosing = (double) $grp->sum('closing_qty');
            $isBelowMin = $totalActive < $minimum;

            $batches = $grp->map(function ($b) {
                return [
                    'stock_id'     => $b['stock_id'],
                    'batch_code'   => $b['batch_code'],
                    'expired_at'   => $b['expired_at'],
                    'status'       => $b['status'],
                    'opening_qty'  => (double) $b['opening_qty'],
                    'in_qty'       => (double) $b['in_qty'],
                    'out_qty'      => (double) $b['out_qty'],
                    'closing_qty'  => (double) $b['closing_qty'],
                ];
            })->values()->all();

            return [
                'item_type'          => $first['item_type'],
                'item_id'            => $first['item_id'],
                'item_label'         => $itemLabel,
                'unit_id'            => $unitId,
                'total_current'      => $totalActive,
                'total_expired'      => $totalExpired,
                'sum_opening'        => $sumOpening,
                'sum_in'             => $sumIn,
                'sum_out'            => $sumOut,
                'sum_closing'        => $sumClosing,
                'minimum_qty'        => $minimum,
                'is_below_min'       => $isBelowMin,
                'batches'            => $batches,
            ];
        })->values();

        if ($hideZero) {
            $rows = $rows->filter(fn($r) => ($r['total_current'] ?? 0) != 0)->values();
        }

        $grandTotalCurrent = (double) $rows->sum('total_current');
        $grandTotalExpired = (double) $rows->sum('total_expired');
        $totalItems        = $rows->count();

        return response()->json([
            'code' => 200,
            'message' => 'success',
            'data' => [
                'rows' => $rows->all(),
                'totals' => [
                    'grand_total_current' => $grandTotalCurrent,
                    'grand_total_expired' => $grandTotalExpired,
                    'total_items'         => $totalItems,
                ],
                'as_of' => $asOfDate,
            ],
        ]);
    }

    public function cardStockView()
    {
        $variants = ProductVariant::with(['product:id,name,image,category_id', 'product_variant_values.variant_value:id,name'])
            ->get(['id','product_id','price','capital_price'])
            ->map(function ($variant) {
                $variantValues = collect($variant->product_variant_values ?? [])
                    ->map(fn($v) => $v->variant_value?->name)
                    ->filter()
                    ->implode(' ');

                return [
                    'type' => 'product_variant',
                    'id'   => (int) $variant->id,
                    'name' => trim(($variant->product?->name ?? 'VARIANT #'.$variant->id) . ' ' . $variantValues),
                    'image' => $variant->product?->image,
                ];
            });

        $materials = Material::query()
            ->get(['id','name'])
            ->map(fn($m) => [
                'type' => 'material',
                'id'   => (int) $m->id,
                'name' => (string) $m->name,
                'image' => null,
            ]);

        $items = $variants->concat($materials)->sortBy('name', SORT_NATURAL | SORT_FLAG_CASE)->values();

        return inertia('apps/reports/card-stock', [
            'items' => $items,
        ]);
    }

    public function cardStockReport(Request $request)
    {
        $response = [
            'message' => null,
            'code'    => 522,
            'data'    => null,
        ];

        try {
            $request->validate([
                'selectedMonth'   => ['required'],
                'selectedYear'    => ['required'],
                'stockable_type'  => ['required','in:product_variant,material'],
                'stockable_id'    => ['required','integer'],
            ]);

            $month         = (int) $request->selectedMonth;
            $year          = (int) $request->selectedYear;
            $stockableType = $request->stockable_type;
            $stockableId   = (int) $request->stockable_id;

            $firstDate = Carbon::createFromDate($year, $month, 1)->toDateString();
            $today     = Carbon::today()->toDateString();
            $lastDate  = (Carbon::createFromDate($year, $month, 1)->isSameMonth($today))
                            ? $today
                            : Carbon::createFromDate($year, $month, 1)->endOfMonth()->toDateString();

            $period = CarbonPeriod::create($firstDate, $lastDate);
            $periodDates = collect($period)->map(fn($d) => $d->toDateString())->values();

            $TYPE_VARIANT  = ProductVariant::class;
            $TYPE_MATERIAL = Material::class;

            $typeFQCN = $stockableType === 'product_variant' ? $TYPE_VARIANT : $TYPE_MATERIAL;

            $stocks = Stock::query()
                ->where('stockable_type', $typeFQCN)
                ->where('stockable_id', $stockableId)
                ->with([
                    'stockable' => function (MorphTo $morphTo) {
                        $morphTo->morphWith([
                            ProductVariant::class => ['product:id,name,category_id,image', 'product_variant_values.variant_value', 'unit'],
                            Material::class       => ['unit'],
                        ]);
                    },
                ])
                ->get(['id','stockable_type','stockable_id','batch_code','quantity','expired_at']);

            if ($stocks->isEmpty()) {
                return response()->json([
                    'message' => 'Success',
                    'code'    => 200,
                    'data'    => [
                        'item'          => null,
                        'period'        => ['first_date' => $firstDate, 'last_date' => $lastDate, 'days' => $periodDates],
                        'batches'       => [],
                        'grand_totals'  => ['in' => 0.0, 'out' => 0.0, 'closing' => 0.0],
                    ],
                ], 200);
            }

            $sample = $stocks->first()->stockable;
            if ($stockableType === 'product_variant') {
                $variantValues = collect($sample?->product_variant_values ?? [])
                    ->map(fn($v) => $v->variant_value?->name)
                    ->filter()
                    ->implode(' ');
                $itemLabel = trim(($sample?->product?->name ?? 'VARIANT #'.$stockableId) . ' ' . $variantValues);
                $unitName  = $sample?->unit?->name ?? null;
                $categoryId= $sample?->product?->category_id ?? null;
                $image     = $sample?->product?->image ?? null;
            } else {
                $itemLabel = (string) ($sample?->name ?? 'MATERIAL #'.$stockableId);
                $unitName  = $sample?->unit?->name ?? null;
                $categoryId= null;
                $image     = null;
            }

            $stockIds = $stocks->pluck('id')->all();

            $openMap = StockMovement::query()
                ->whereIn('stock_id', $stockIds)
                ->whereDate('created_at', '<', $firstDate)
                ->select('stock_id',
                    DB::raw("SUM(CASE WHEN type = 'in' THEN quantity ELSE 0 END) as tin"),
                    DB::raw("SUM(CASE WHEN type = 'out' THEN quantity ELSE 0 END) as tout")
                )
                ->groupBy('stock_id')
                ->get()
                ->keyBy('stock_id')
                ->map(fn($r) => (double) $r->tin - (double) $r->tout);

            $rangeAgg = StockMovement::query()
                ->whereIn('stock_id', $stockIds)
                ->whereBetween(DB::raw('DATE(created_at)'), [$firstDate, $lastDate])
                ->select(
                    'stock_id',
                    DB::raw("DATE(created_at) as tgl"),
                    DB::raw("SUM(CASE WHEN type = 'in'  THEN quantity ELSE 0 END) as in_qty"),
                    DB::raw("SUM(CASE WHEN type = 'out' THEN quantity ELSE 0 END) as out_qty")
                )
                ->groupBy('stock_id', DB::raw("DATE(created_at)"))
                ->get()
                ->groupBy('stock_id')
                ->map(function ($rows) {
                    return $rows->keyBy('tgl');
                });

            $eps = 1e-6;

            $batches = $stocks->map(function (Stock $s) use ($openMap, $rangeAgg, $periodDates, $firstDate, $lastDate, $eps) {
                $opening = (double) ($openMap[$s->id] ?? 0.0);
                $balance = $opening;

                $perDay = [];
                foreach ($periodDates as $d) {
                    $agg    = $rangeAgg[$s->id][$d] ?? null;
                    $in     = (double) ($agg->in_qty  ?? 0.0);
                    $out    = (double) ($agg->out_qty ?? 0.0);
                    $balance = $balance + $in - $out;

                    $expiredOnDay = $s->expired_at
                        ? Carbon::parse($s->expired_at)->lt(Carbon::parse($d))
                        : false;

                    $statusDay = (abs($balance) <= $eps)
                        ? 'out stock'
                        : ($expiredOnDay ? 'expired' : 'active');

                    $perDay[] = [
                        'date'       => $d,
                        'in'         => round($in, 3),
                        'out'        => round($out, 3),
                        'balance'    => round($balance, 3),
                        'is_expired' => $expiredOnDay,
                        'status'     => $statusDay,
                    ];
                }

                $totalIn  = array_sum(array_column($perDay, 'in'));
                $totalOut = array_sum(array_column($perDay, 'out'));
                $closing  = $opening + $totalIn - $totalOut;

                $expiredByLast = $s->expired_at
                    ? Carbon::parse($s->expired_at)->lt(Carbon::parse($lastDate))
                    : false;

                $statusPeriod = (abs($closing) <= $eps)
                    ? 'all_sales'
                    : ($expiredByLast ? 'expired' : 'active');

                return [
                    'stock_id'       => (int) $s->id,
                    'batch_code'     => $s->batch_code,
                    'expired_at'     => $s->expired_at ? Carbon::parse($s->expired_at)->toDateString() : null,
                    'is_expired_now' => $s->expired_at ? Carbon::parse($s->expired_at)->lt(Carbon::parse($firstDate)) : false,

                    'status'         => $statusPeriod,
                    'opening_qty'    => round($opening, 3),
                    'daily'          => $perDay,
                    'totals'         => [
                        'in'      => round($totalIn, 3),
                        'out'     => round($totalOut, 3),
                        'closing' => round($closing, 3),
                    ],
                ];
            })->values();

            $activeBatches = $batches->filter(function ($b) use ($lastDate) {
                if (empty($b['expired_at'])) return true;
                return \Carbon\Carbon::parse($b['expired_at'])->gte(\Carbon\Carbon::parse($lastDate));
            });
            $grandIn    = (double) $activeBatches->sum(fn($b) => $b['totals']['in']);
            $grandOut   = (double) $activeBatches->sum(fn($b) => $b['totals']['out']);
            $grandOpen  = (double) $activeBatches->sum('opening_qty');
            $grandClose = $grandOpen + $grandIn - $grandOut;

            $response['message'] = 'Success';
            $response['code']    = 200;
            $response['data']    = [
                'item' => [
                    'type'        => $stockableType,
                    'id'          => $stockableId,
                    'label'       => $itemLabel,
                    'unit_name'   => $unitName,
                    'category_id' => $categoryId,
                    'image'       => $image,
                ],
                'period' => [
                    'first_date' => $firstDate,
                    'last_date'  => $lastDate,
                    'days'       => $periodDates,
                ],
                'batches' => $batches,
                'grand_totals' => [
                    'opening' => round($grandOpen, 3),
                    'in'      => round($grandIn, 3),
                    'out'     => round($grandOut, 3),
                    'closing' => round($grandClose, 3),
                ],
            ];
        } catch (\Exception $e) {
            $response['message'] = 'An error occurred: ' . $e->getMessage();
            $response['code']    = 500;
        }

        return response()->json($response, $response['code']);
    }

    public function profitLossView()
    {
        return inertia('apps/reports/profit-loss');
    }

    public function profitLossReport(Request $request)
    {
        $request->validate([
            'start_date' => ['nullable', 'date'],
            'end_date'   => ['nullable', 'date', 'after_or_equal:start_date'],
        ]);

        $start = $request->start_date ?: now()->startOfMonth()->toDateString();
        $end   = $request->end_date   ?: now()->toDateString();

        $txBase = Transaction::query()
            ->whereBetween('transaction_date', [$start, $end])
            ->whereIn('status', ['paid', 'partial']);

        $sumSubtotal = (float) (clone $txBase)->sum(DB::raw('COALESCE(subtotal,0)'));
        $sumGrand    = (float) (clone $txBase)->sum(DB::raw('COALESCE(grand_total,0)'));

        $grossSales = $sumSubtotal;

        $taxTable = 'transaction_taxes';

        $otherIncomeDirect  = 0.0;
        $otherIncomeDetails = [];
        $outputVAT          = 0.0;
        $adminFees          = 0.0;
        $hasOprInRows       = false;

        if ($taxTable) {
            $taxRows = DB::table("$taxTable as tt")
                ->join('transactions as t', 't.id', '=', 'tt.transaction_id')
                ->whereBetween('t.transaction_date', [$start, $end])
                ->whereIn('t.status', ['paid','partial'])
                ->get(['tt.code','tt.name','tt.value']);

            $otherIncomeDirect = (float) $taxRows->sum('value');

            $otherIncomeDetails = $taxRows
                ->groupBy(fn ($r) => $r->code.'|'.$r->name)
                ->map(fn ($g) => [
                    'code'   => $g->first()->code,
                    'name'   => $g->first()->name,
                    'amount' => (float) $g->sum('value'),
                ])
                ->values()
                ->all();

            $outputVAT = (float) collect($otherIncomeDetails)
                ->filter(fn($r) => strtoupper($r['code']) === 'PJK')
                ->sum('amount');

            $hasOprInRows = $taxRows->contains(fn($r) => strtoupper($r->code) === 'OPR');
        } else {
            $otherIncomeDirect = $sumGrand - $sumSubtotal;
            $otherIncomeDetails = [
                ['code' => 'MISC', 'name' => 'Tax/Fees', 'amount' => $otherIncomeDirect],
            ];
            $outputVAT = $otherIncomeDirect;
            $hasOprInRows = false;
        }

        $salesReturn = 0.0;
        if (Schema::hasTable('transaction_returns')) {
            $salesReturn = (float) DB::table('transaction_returns')
                ->whereBetween('return_date', [$start, $end])
                ->sum(DB::raw('COALESCE(grand_total,0)'));
        }

        $settings = Schema::hasTable('settings')
            ? DB::table('settings')->where('is_active', 1)->get(['id','name','code','value'])
            : collect();

        $platformGrossByName = Transaction::query()
            ->whereBetween('transaction_date', [$start, $end])
            ->whereIn('status', ['paid','partial'])
            ->where('transaction_type', 'platform')
            ->selectRaw('platform, SUM(COALESCE(grand_total,0)) as total')
            ->groupBy('platform')
            ->pluck('total', 'platform');

        $transferReceipts = (float) TransactionPayment::query()
            ->whereBetween('paid_at', [$start, $end])
            ->where('payment_method', 'transfer')
            ->sum('amount');

        $platformFees      = [];
        $totalPlatformFees = 0.0;

        $parseRate = function (?string $v): array {
            $s = trim((string) $v);
            if ($s === '') return ['is_percent' => false, 'value' => 0.0];
            if (str_ends_with($s, '%')) {
                $n = (float) str_replace(['%',' '], '', $s);
                return ['is_percent' => true, 'rate' => max($n,0)/100];
            }
            return ['is_percent' => false, 'value' => (float) str_replace([' ', ','], '', $s)];
        };

        foreach ($settings as $s) {
            $code   = strtoupper((string) $s->code);
            $name   = (string) $s->name;
            $parsed = $parseRate($s->value);

            if ($code === 'OLS') {
                $base = 0.0;
                foreach ($platformGrossByName as $plat => $amt) {
                    if (mb_strtolower((string)$plat) === mb_strtolower($name)) {
                        $base = (float) $amt; break;
                    }
                }
                $fee = ($parsed['is_percent'] ?? false)
                    ? round($base * (float) $parsed['rate'], 2)
                    : (float) $parsed['value'];

                if ($fee > 0) {
                    $platformFees[] = [
                        'name'   => $name,
                        'base'   => $base,
                        'amount' => $fee,
                        'label'  => 'Komisi Platform',
                    ];
                    $totalPlatformFees += $fee;
                }
            }
            elseif ($code === 'PJK') {
                if (!$taxTable) {
                    if ($parsed['is_percent'] ?? false) {
                        $outputVAT = $sumGrand - $sumSubtotal;
                    } else {
                        $outputVAT = (float) $parsed['value'];
                    }
                }
            }
            elseif ($code === 'OPR') {
                if (!$hasOprInRows) {
                    $adminFees += ($parsed['is_percent'] ?? false)
                        ? round($transferReceipts * (float) $parsed['rate'], 2)
                        : (float) $parsed['value'];
                }
            }
        }

        $totalRevenue = $grossSales + $otherIncomeDirect - $salesReturn;

        $TYPE_VARIANT = ProductVariant::class;

        $cogs = (float) TransactionDetail::query()
            ->join('transactions as t', 't.id', '=', 'transaction_details.transaction_id')
            ->leftJoin('product_variants as pv', function ($j) use ($TYPE_VARIANT) {
                $j->on('pv.id', '=', 'transaction_details.items_id')
                  ->where('transaction_details.items_type', '=', $TYPE_VARIANT);
            })
            ->whereBetween('t.transaction_date', [$start, $end])
            ->whereIn('t.status', ['paid', 'partial'])
            ->selectRaw('SUM(COALESCE(pv.capital_price,0) * COALESCE(transaction_details.quantity,0)) as total_hpp')
            ->value('total_hpp');

        $purchaseReturn = 0.0;
        if (Schema::hasTable('purchase_returns')) {
            $purchaseReturn = (float) DB::table('purchase_returns')
                ->whereBetween('return_date', [$start, $end])
                ->sum(DB::raw('COALESCE(grand_total,0)'));
        }

        $totalCOGS = $cogs - $purchaseReturn;

        $opexDetails = [];
        $opexSum     = 0.0;

        if (Schema::hasTable('expenses')) {
            $expRows = DB::table('expenses')
                ->leftJoin('expense_categories as ec', 'ec.id', '=', 'expenses.expense_category_id')
                ->leftJoin('expense_subcategories as esc', 'esc.id', '=', 'expenses.expense_subcategory_id')
                ->whereBetween('expenses.date', [$start, $end])
                ->get([
                    'expenses.amount',
                    'expenses.description',
                    'ec.name as category_name',
                    'esc.name as subcategory_name',
                ]);

            foreach ($expRows as $er) {
                $label = $er->category_name ?: 'Biaya';
                if ($er->subcategory_name) $label .= ' - '.$er->subcategory_name;
                $opexDetails[] = ['name' => $label, 'amount' => (float) $er->amount];
                $opexSum += (float) $er->amount;
            }
        }

        foreach ($platformFees as $pf) {
            $opexDetails[] = [
                'name'   => "{$pf['label']} - {$pf['name']}",
                'amount' => (float) $pf['amount'],
            ];
            $opexSum += (float) $pf['amount'];
        }

        if ($adminFees > 0) {
            $opexDetails[] = ['name' => 'Biaya Admin (OPR)', 'amount' => (float) $adminFees];
            $opexSum += (float) $adminFees;
        }

        $grossProfit = $totalRevenue - $totalCOGS;
        $netProfit   = $grossProfit - $opexSum - $outputVAT;

        return response()->json([
            'code'    => 200,
            'message' => 'success',
            'data'    => [
                'periode' => ['start_date' => $start, 'end_date' => $end],
                'pendapatan' => [
                    'penjualan_gross'          => $grossSales,
                    'pendapatan_lain'          => $otherIncomeDirect,
                    'retur_penjualan'          => $salesReturn,
                    'pajak_keluaran'           => $outputVAT,
                    'total'                    => $totalRevenue,
                    'pendapatan_lain_details'  => $otherIncomeDetails,
                ],
                'hpp' => [
                    'pembelian_terjual' => $cogs,
                    'retur_pembelian'   => $purchaseReturn,
                    'total'             => $totalCOGS,
                ],
                'pajak' => $outputVAT,
                'laba_kotor' => $grossProfit,
                'biaya_operasional' => [
                    'details' => $opexDetails,
                    'total'   => $opexSum,
                ],
                'laba_bersih' => $netProfit,
                'komponen' => [
                    'komisi_platform' => $platformFees,
                    'biaya_admin'     => $adminFees,
                    'pajak_keluaran'  => $outputVAT,
                ],
            ],
        ]);
    }
}

<?php

namespace App\Http\Controllers\Apps;

use Carbon\Carbon;
use App\Models\Menu;
use App\Models\Order;
use App\Models\Table;
use App\Models\Expense;
use App\Models\Material;
use App\Models\Transaction;
use Illuminate\Http\Request;
use App\Models\StockMovement;
use App\Models\ProductVariant;
use App\Models\PurchaseReturn;
use App\Models\DiscountPackage;
use App\Models\TransactionReturn;
use Illuminate\Support\Facades\DB;
use App\Http\Controllers\Controller;
use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Routing\Controllers\Middleware;

class DashboardController extends Controller implements HasMiddleware
{
    public static function middleware()
    {
        return [
            new Middleware('permission:dashboard-data')
        ];
    }

    protected function topSellingAllTime()
    {
        $productVariantType = (new ProductVariant)->getMorphClass();
        $menuType           = (new Menu)->getMorphClass();
        $packageType        = (new DiscountPackage)->getMorphClass();

        $returnAgg = DB::table('transaction_return_details as trd')
            ->join('transaction_returns as tr', 'tr.id', '=', 'trd.transaction_return_id')
            ->join('transaction_details as td2', 'td2.id', '=', 'trd.transaction_detail_id')
            ->where('tr.status', 'confirmed')
            ->where('tr.refund_method', 'replacement')
            ->select('td2.items_type', 'td2.items_id', DB::raw('SUM(trd.quantity) as returned_qty'))
            ->groupBy('td2.items_type', 'td2.items_id');

        $pvQ = DB::table('transaction_details as td')
            ->join('transactions as t', 't.id', '=', 'td.transaction_id')
            ->where('t.status', '!=', 'pending')
            ->where('td.items_type', '=', $productVariantType)
            ->join('product_variants as pv', 'pv.id', '=', 'td.items_id')
            ->join('products as p', 'p.id', '=', 'pv.product_id')
            ->leftJoin('product_variant_values as pvv', 'pvv.product_variant_id', '=', 'pv.id')
            ->leftJoin('variant_values as vv', 'vv.id', '=', 'pvv.variant_value_id')
            ->leftJoinSub($returnAgg, 'r', function ($join) use ($productVariantType) {
                $join->on('r.items_id', '=', 'pv.id')
                    ->where('r.items_type', '=', $productVariantType);
            })
            ->selectRaw("
                'product' AS item_type,
                pv.id AS item_id,
                pv.barcode AS barcode,
                TRIM(
                    CONCAT(
                        p.name, ' ',
                        COALESCE(
                            REPLACE(
                                REPLACE(
                                    GROUP_CONCAT(DISTINCT vv.name ORDER BY vv.name SEPARATOR ' '),
                                    '  ', ' '
                                ),
                                '  ', ' '
                            ),
                        '')
                    )
                ) AS name,
                SUM(td.quantity) AS sold_qty,
                COALESCE(MAX(r.returned_qty), 0) AS returned_qty,
                (SUM(td.quantity) - COALESCE(MAX(r.returned_qty), 0)) AS net_sold_qty
            ")
            ->groupBy('pv.id', 'pv.barcode', 'p.name');

        $menuQ = DB::table('transaction_details as td')
            ->join('transactions as t', 't.id', '=', 'td.transaction_id')
            ->where('t.status', '!=', 'pending')
            ->where('td.items_type', '=', $menuType)
            ->join('menus as m', 'm.id', '=', 'td.items_id')
            ->leftJoinSub($returnAgg, 'r', function ($join) use ($menuType) {
                $join->on('r.items_id', '=', 'm.id')
                    ->where('r.items_type', '=', $menuType);
            })
            ->selectRaw("
                'menu' AS item_type,
                m.id AS item_id,
                NULL AS barcode,
                m.name AS name,
                SUM(td.quantity) AS sold_qty,
                COALESCE(MAX(r.returned_qty), 0) AS returned_qty,
                (SUM(td.quantity) - COALESCE(MAX(r.returned_qty), 0)) AS net_sold_qty
            ")
            ->groupBy('m.id', 'm.name');

        $pkgQ = DB::table('transaction_details as td')
            ->join('transactions as t', 't.id', '=', 'td.transaction_id')
            ->where('t.status', '!=', 'pending')
            ->where('td.items_type', '=', $packageType)
            ->join('discount_packages as dp', 'dp.id', '=', 'td.items_id')
            ->leftJoinSub($returnAgg, 'r', function ($join) use ($packageType) {
                $join->on('r.items_id', '=', 'dp.id')
                    ->where('r.items_type', '=', $packageType);
            })
            ->selectRaw("
                'discount_package' AS item_type,
                dp.id AS item_id,
                NULL AS barcode,
                dp.name AS name,
                SUM(td.quantity) AS sold_qty,
                COALESCE(MAX(r.returned_qty), 0) AS returned_qty,
                (SUM(td.quantity) - COALESCE(MAX(r.returned_qty), 0)) AS net_sold_qty
            ")
            ->groupBy('dp.id', 'dp.name');

        $union = $pvQ->unionAll($menuQ)->unionAll($pkgQ);

        return DB::query()
            ->fromSub($union, 'x')
            ->orderByDesc('net_sold_qty')
            ->limit(10)
            ->get();
    }

   protected function lowStockTop10()
    {
        $productVariantType = (new ProductVariant)->getMorphClass();
        $materialType       = (new Material)->getMorphClass();
        $today              = now()->toDateString();

        $movAgg = DB::table('stock_movements as sm')
            ->select('sm.stock_id', DB::raw("
                SUM(CASE
                    WHEN sm.type = 'in'  THEN sm.quantity
                    WHEN sm.type = 'out' THEN -sm.quantity
                    ELSE 0
                END) AS net_move
            "))
            ->groupBy('sm.stock_id');

        $balancesByItem = DB::table('stocks as s')
            ->leftJoinSub($movAgg, 'm', 'm.stock_id', '=', 's.id')
            ->where(function ($q) use ($today) {
                $q->whereNull('s.expired_at')
                ->orWhereDate('s.expired_at', '>=', $today);
            })
            ->select(
                's.stockable_type',
                's.stockable_id',
                DB::raw('COALESCE(SUM(m.net_move), 0) AS on_hand')
            )
            ->groupBy('s.stockable_type', 's.stockable_id');

        $shortPV = DB::table('product_variants as pv')
            ->join('products as p', 'p.id', '=', 'pv.product_id')
            ->leftJoin('product_variant_values as pvv', 'pvv.product_variant_id', '=', 'pv.id')
            ->leftJoin('variant_values as vv', 'vv.id', '=', 'pvv.variant_value_id')
            ->leftJoinSub($balancesByItem, 'b', function ($join) use ($productVariantType) {
                $join->on('b.stockable_id', '=', 'pv.id')
                    ->where('b.stockable_type', '=', $productVariantType);
            })
            ->selectRaw("
                'product' AS item_type,
                pv.id     AS item_id,
                pv.barcode,
                TRIM(
                    CONCAT(
                        p.name, ' ',
                        COALESCE(
                            REPLACE(
                                REPLACE(
                                    GROUP_CONCAT(DISTINCT vv.name ORDER BY vv.name SEPARATOR ' '),
                                    '  ', ' '
                                ),
                                '  ', ' '
                            ),
                        '')
                    )
                ) AS name,
                COALESCE(b.on_hand, 0) AS on_hand,
                pv.minimum_quantity     AS min_qty,
                (COALESCE(b.on_hand,0) - pv.minimum_quantity) AS diff,
                pv.price,
                pv.capital_price,
                p.image,
                p.category_id
            ")
            ->groupBy('pv.id','p.name','pv.minimum_quantity','pv.price','pv.capital_price','pv.barcode','p.image','p.category_id','b.on_hand')
            ->whereRaw('COALESCE(b.on_hand, 0) < pv.minimum_quantity');

        $shortMT = DB::table('materials as mt')
            ->leftJoinSub($balancesByItem, 'b', function ($join) use ($materialType) {
                $join->on('b.stockable_id', '=', 'mt.id')
                    ->where('b.stockable_type', '=', $materialType);
            })
            ->selectRaw("
                'material' AS item_type,
                mt.id      AS item_id,
                NULL       AS barcode,
                mt.name,
                COALESCE(b.on_hand, 0) AS on_hand,
                mt.minimum_qty          AS min_qty,
                (COALESCE(b.on_hand,0) - mt.minimum_qty) AS diff,
                mt.price,
                NULL AS capital_price,
                NULL AS image,
                NULL AS category_id
            ")
            ->whereRaw('COALESCE(b.on_hand, 0) < mt.minimum_qty');

        $union = $shortPV->unionAll($shortMT);

        return DB::query()
            ->fromSub($union, 'x')
            ->orderBy('diff')
            ->limit(10)
            ->get();
    }

    protected function getOrderPartial()
    {
        $op = DB::table('order_payments')
            ->select('order_id', DB::raw('SUM(amount) AS total_paid'))
            ->groupBy('order_id');

        $q = DB::table('orders as o')
            ->leftJoinSub($op, 'pay', 'pay.order_id', '=', 'o.id')
            ->leftJoin('suppliers as s', 's.id', '=', 'o.supplier_id')
            ->selectRaw("
                o.order_code AS id,
                COALESCE(s.name, CONCAT('Supplier #', o.supplier_id)) AS supplier,
                o.grand_total AS total,
                (o.grand_total - COALESCE(pay.total_paid, 0)) AS sisa,
                o.order_date AS tanggal
            ")
            ->whereIn('o.payment_status', ['unpaid', 'partial'])
            ->having('sisa', '>', 0)
            ->orderByDesc('o.order_date')
            ->limit(10)
            ->get();

        // Optional clamp: kalau ada kelebihan bayar tak sengaja
        return $q->map(function ($r) {
            $r->sisa = max(0, (float)$r->sisa);
            return $r;
        });
    }

    protected function getExpensesPartial()
    {
        $ep = DB::table('expense_payments')
            ->select('expense_id', DB::raw('SUM(amount) AS total_paid'))
            ->groupBy('expense_id');

        $q = DB::table('expenses as e')
            ->leftJoinSub($ep, 'pay', 'pay.expense_id', '=', 'e.id')
            ->selectRaw("
                e.expensee_number AS id,
                COALESCE(e.description, CONCAT('Pengeluaran #', e.expensee_number)) AS keterangan,
                e.amount AS total,
                (e.amount - COALESCE(pay.total_paid, 0)) AS sisa,
                e.date AS tanggal
            ")
            ->whereIn('e.payment_status', ['unpaid', 'partial'])
            ->having('sisa', '>', 0)
            ->orderByDesc('e.date')
            ->limit(10)
            ->get();

        return $q->map(function ($r) {
            $r->sisa = max(0, (float)$r->sisa);
            return $r;
        });
    }

    protected function getTransactionPartial()
    {
        $tp = DB::table('transaction_payments')
            ->select('transaction_id', DB::raw('SUM(amount) AS total_paid'))
            ->groupBy('transaction_id');

        $q = DB::table('transactions as t')
            ->leftJoinSub($tp, 'pay', 'pay.transaction_id', '=', 't.id')
            ->leftJoin('customers as c', 'c.id', '=', 't.customer_id')
            ->selectRaw("
                t.invoice AS id,
                COALESCE(c.name, CONCAT('Customer #', t.customer_id)) AS customer,
                t.grand_total AS total,
                (t.grand_total - COALESCE(t.pay, 0) - COALESCE(pay.total_paid, 0)) AS sisa,
                t.transaction_date AS tanggal
            ")
            ->where('t.status', 'partial')
            ->having('sisa', '>', 0)
            ->orderByDesc('t.transaction_date')
            ->limit(10)
            ->get();

        return $q->map(function ($r) {
            $r->sisa = max(0, (float) $r->sisa);
            return $r;
        });
    }

    protected function getTotalStockOverall()
    {
        $productVariantType = (new ProductVariant)->getMorphClass();
        $materialType       = (new Material)->getMorphClass();

        // 1) movement per batch
        $movAgg = DB::table('stock_movements')
            ->select('stock_id', DB::raw("
                SUM(CASE WHEN type='in' THEN quantity
                        WHEN type='out' THEN -quantity
                        ELSE 0 END) AS net_move
            "))
            ->groupBy('stock_id');

        // 2) saldo per item type
        $totalsByType = DB::table('stocks as s')
            ->leftJoinSub($movAgg, 'm', 'm.stock_id', '=', 's.id')
            ->select(
                's.stockable_type',
                DB::raw('SUM(s.quantity + COALESCE(m.net_move, 0)) AS on_hand')
            )
            ->where(function($query){
                $query->whereNull('s.expired_at')->orWhere('s.expired_at', '>=', now()->toDateString());
            })
            ->groupBy('s.stockable_type')
            ->get()
            ->keyBy('stockable_type');

        $productsQty  = (float) ($totalsByType[$productVariantType]->on_hand ?? 0);
        $materialsQty = (float) ($totalsByType[$materialType]->on_hand ?? 0);

        return $productsQty + $materialsQty;
    }

    protected function getCategorySalesThisMonthChartOnly(int $limit = 10): array
    {
        $start = Carbon::now()->startOfMonth();
        $end   = Carbon::now()->endOfDay();

        $rows = $this->buildCategorySalesByRange($start, $end);

        $rows = collect($rows)->sortByDesc('sold')->take($limit)->values();

        $fills = [
            'var(--chart-1)','var(--chart-2)','var(--chart-3)','var(--chart-4)','var(--chart-5)',
            'var(--chart-6)','var(--chart-7)','var(--chart-8)','var(--chart-9)','var(--chart-10)',
        ];

        return $rows->values()->map(function ($r, $i) use ($fills) {
            return [
                'category' => $r['category'],
                'sold'     => max(0, (int) $r['sold']),
                'fill'     => $fills[$i % count($fills)],
            ];
        })->all();
    }

    protected function getCategorySalesMoMOverall(): array
    {
        $start = Carbon::now()->startOfMonth();
        $end   = Carbon::now()->endOfDay();

        $prevStart = Carbon::now()->subMonthNoOverflow()->startOfMonth();
        $prevEnd   = Carbon::now()->subMonthNoOverflow()->endOfMonth()->endOfDay();

        $current  = collect($this->buildCategorySalesByRange($start, $end))->sum(fn($r) => max(0, (int)$r['sold']));
        $previous = collect($this->buildCategorySalesByRange($prevStart, $prevEnd))->sum(fn($r) => max(0, (int)$r['sold']));

        $diff   = $current - $previous;
        $momPct = $previous > 0 ? ($diff / $previous) * 100 : ($current > 0 ? 100 : 0);

        return [
            'current_sold'  => (int) $current,
            'previous_sold' => (int) $previous,
            'diff'          => (int) $diff,
            'mom_pct'       => round($momPct, 2),
        ];
    }

    protected function buildCategorySalesByRange(Carbon $start, Carbon $end): array
    {
        $productVariantType = (new ProductVariant)->getMorphClass();
        $menuType           = (new Menu)->getMorphClass();
        $packageType        = (new DiscountPackage)->getMorphClass();

        $returnPerItem = DB::table('transaction_return_details as trd')
            ->join('transaction_returns as tr', 'tr.id', '=', 'trd.transaction_return_id')
            ->join('transaction_details as td2', 'td2.id', '=', 'trd.transaction_detail_id')
            ->where('tr.status', 'confirmed')
            ->whereBetween('tr.return_date', [$start->toDateString(), $end->toDateString()])
            ->select('td2.items_type', 'td2.items_id', DB::raw('SUM(trd.quantity) AS returned_qty'))
            ->groupBy('td2.items_type', 'td2.items_id');

        $returnPerTd = DB::table('transaction_return_details as trd')
            ->join('transaction_returns as tr', 'tr.id', '=', 'trd.transaction_return_id')
            ->join('transaction_details as td2', 'td2.id', '=', 'trd.transaction_detail_id')
            ->where('tr.status', 'confirmed')
            ->whereBetween('tr.return_date', [$start->toDateString(), $end->toDateString()])
            ->where('td2.items_type', $packageType)
            ->select('td2.id as td_id', DB::raw('SUM(trd.quantity) AS returned_qty'))
            ->groupBy('td2.id');

        $soldProdPerItem = DB::table('transaction_details as td')
            ->join('transactions as t', 't.id', '=', 'td.transaction_id')
            ->where('t.status', '!=', 'pending')
            ->whereBetween('t.transaction_date', [$start, $end])
            ->where('td.items_type', $productVariantType)
            ->select('td.items_id as product_variant_id', DB::raw('SUM(td.quantity) AS sold_qty'))
            ->groupBy('td.items_id');

        $soldMenuPerItem = DB::table('transaction_details as td')
            ->join('transactions as t', 't.id', '=', 'td.transaction_id')
            ->where('t.status', '!=', 'pending')
            ->whereBetween('t.transaction_date', [$start, $end])
            ->where('td.items_type', $menuType)
            ->select('td.items_id as menu_id', DB::raw('SUM(td.quantity) AS sold_qty'))
            ->groupBy('td.items_id');

        $soldPkgPerTd = DB::table('transaction_details as td')
            ->join('transactions as t', 't.id', '=', 'td.transaction_id')
            ->where('t.status', '!=', 'pending')
            ->whereBetween('t.transaction_date', [$start, $end])
            ->where('td.items_type', $packageType)
            ->select('td.id as td_id', DB::raw('SUM(td.quantity) AS sold_qty'))
            ->groupBy('td.id');

        $catProd = DB::query()
            ->fromSub($soldProdPerItem, 's')
            ->leftJoinSub($returnPerItem, 'r', function ($j) use ($productVariantType) {
                $j->on('r.items_id', '=', 's.product_variant_id')->where('r.items_type', '=', $productVariantType);
            })
            ->join('product_variants as pv', 'pv.id', '=', 's.product_variant_id')
            ->join('products as p', 'p.id', '=', 'pv.product_id')
            ->leftJoin('categories as c', 'c.id', '=', 'p.category_id')
            ->selectRaw("COALESCE(c.name, 'Produk') AS category, (SUM(s.sold_qty) - SUM(COALESCE(r.returned_qty, 0))) AS sold")
            ->groupBy('c.name');

        $catMenu = DB::query()
            ->fromSub($soldMenuPerItem, 's')
            ->leftJoinSub($returnPerItem, 'r', function ($j) use ($menuType) {
                $j->on('r.items_id', '=', 's.menu_id')->where('r.items_type', '=', $menuType);
            })
            ->join('menus as m', 'm.id', '=', 's.menu_id')
            ->leftJoin('categories as c', 'c.id', '=', 'm.category_id')
            ->selectRaw("COALESCE(c.name, 'Menu') AS category, (SUM(s.sold_qty) - SUM(COALESCE(r.returned_qty, 0))) AS sold")
            ->groupBy('c.name');

        $catPkgPv = DB::query()
            ->fromSub($soldPkgPerTd, 's')
            ->leftJoinSub($returnPerTd, 'r', 'r.td_id', '=', 's.td_id')
            ->join('transaction_details as td', 'td.id', '=', 's.td_id')
            ->join('discount_package_items as dpi', 'dpi.discount_package_id', '=', 'td.items_id')
            ->where('dpi.items_type', $productVariantType)
            ->join('product_variants as pv', 'pv.id', '=', 'dpi.items_id')
            ->join('products as p', 'p.id', '=', 'pv.product_id')
            ->leftJoin('categories as c', 'c.id', '=', 'p.category_id')
            ->selectRaw("COALESCE(c.name, 'Produk') AS category, SUM((s.sold_qty - COALESCE(r.returned_qty, 0))) AS sold")
            ->groupBy('c.name');

        $catPkgMenu = DB::query()
            ->fromSub($soldPkgPerTd, 's')
            ->leftJoinSub($returnPerTd, 'r', 'r.td_id', '=', 's.td_id')
            ->join('transaction_details as td', 'td.id', '=', 's.td_id')
            ->join('discount_package_items as dpi', 'dpi.discount_package_id', '=', 'td.items_id')
            ->where('dpi.items_type', $menuType)
            ->join('menus as m', 'm.id', '=', 'dpi.items_id')
            ->leftJoin('categories as c', 'c.id', '=', 'm.category_id')
            ->selectRaw("COALESCE(c.name, 'Menu') AS category, SUM((s.sold_qty - COALESCE(r.returned_qty, 0))) AS sold")
            ->groupBy('c.name');

        $union = $catProd->unionAll($catMenu)->unionAll($catPkgPv)->unionAll($catPkgMenu);

        $rows = DB::query()
            ->fromSub($union, 'u')
            ->selectRaw('category, SUM(sold) AS sold')
            ->groupBy('category')
            ->get();

        return $rows->map(fn($r) => [
            'category' => $r->category,
            'sold'     => max(0, (int) $r->sold),
        ])->values()->all();
    }

    protected function getMonthlySalesChartData(int $year): array
    {
        $rows = DB::table('transactions as t')
            ->where('t.status', '!=', 'pending')
            ->whereYear('t.transaction_date', $year)
            ->selectRaw('MONTH(t.transaction_date) as month_num, SUM(t.grand_total) as total_penjualan')
            ->groupBy(DB::raw('MONTH(t.transaction_date)'))
            ->pluck('total_penjualan', 'month_num');

        $bulanNames = [1=>'Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des'];

        $chartData = [];
        for ($m = 1; $m <= 12; $m++) {
            $chartData[] = [
                'bulan'          => $bulanNames[$m],
                'totalPenjualan' => (int) round(($rows[$m] ?? 0)),
            ];
        }

        return $chartData;
    }

    protected function getDailySalesPurchasesChartData(?string $start = null, ?string $end = null): array
    {
        $startDt = $start ? Carbon::parse($start)->startOfDay() : Carbon::now()->subDays(29)->startOfDay();
        $endDt   = $end   ? Carbon::parse($end)->endOfDay()    : Carbon::now()->endOfDay();

        $movIn = DB::table('stock_movements')
            ->where('type', 'in')
            ->whereBetween('created_at', [$startDt, $endDt])
            ->selectRaw('DATE(created_at) as d, SUM(quantity) as qty_in')
            ->groupBy('d')
            ->pluck('qty_in', 'd');

        $movOut = DB::table('stock_movements')
            ->where('type', 'out')
            ->whereBetween('created_at', [$startDt, $endDt])
            ->selectRaw('DATE(created_at) as d, SUM(quantity) as qty_out')
            ->groupBy('d')
            ->pluck('qty_out', 'd');

        $sales = DB::table('transactions')
            ->where('status', '!=', 'pending')
            ->whereBetween('transaction_date', [$startDt->toDateString(), $endDt->toDateString()])
            ->selectRaw('DATE(transaction_date) as d, SUM(grand_total) as total_out')
            ->groupBy('d')
            ->pluck('total_out', 'd');

        $purchases = DB::table('orders')
            ->whereIn('order_status', ['confirmed','received'])
            ->whereBetween('order_date', [$startDt->toDateString(), $endDt->toDateString()])
            ->selectRaw('DATE(order_date) as d, SUM(grand_total) as total_in')
            ->groupBy('d')
            ->pluck('total_in', 'd');

        $cursor = $startDt->copy();
        $chart  = [];
        while ($cursor->lte($endDt)) {
            $key = $cursor->toDateString();
            $chart[] = [
                'date'            => $key,
                'barangout'       => (int) ($movOut[$key] ?? 0),
                'barangin'        => (int) ($movIn[$key] ?? 0),
                'totalharga_out'  => (int) round($sales[$key] ?? 0),
                'totalharga_in'   => (int) round($purchases[$key] ?? 0),
            ];
            $cursor->addDay();
        }

        return $chart;
    }

    /**
     * Handle the incoming request.
     */
    public function __invoke(Request $request)
    {
        // report minimum stocks
        $minimum_stocks = $this->lowStockTop10();

        // report top selling
        $topSellingAllTime = $this->topSellingAllTime();

        // report expense partial & pending
        $expense_pending = $this->getExpensesPartial();

        // report orders partial & pending
        $order_pending = $this->getOrderPartial();

        // report trasnaction partial
        $transaction_pending = $this->getTransactionPartial();

        // report sales
        $sales = Transaction::where('status', '!=', 'pending')->whereDate('transaction_date', Carbon::today())->sum('grand_total');

        // report orders
        $orders = Order::where('payment_status', '!=', 'unpaid')->whereDate('order_date', Carbon::today())->sum('grand_total');

        // report expenses
        $expenses = Expense::where('payment_status', '!=', 'unpaid')->whereDate('date', Carbon::today())->sum('amount');

        // report purchase return
        $purchaseReturns = PurchaseReturn::where('status', 'confirmed')->whereDate('return_date', Carbon::today())->get()->count();

        // report transaction return
        $transactionReturns = TransactionReturn::where('status', 'confirmed')->where('return_date', Carbon::today())->get()->count();

        // report stock in
        $stockIn = StockMovement::where('type', 'in')->whereDate('created_at', Carbon::today())->sum('quantity');

        // report stock out
        $stockOut = StockMovement::where('type', 'out')->whereDate('created_at', Carbon::today())->sum('quantity');

        // report total stock
        $totalStock = $this->getTotalStockOverall();

        // report chart category
        $chartCategories = $this->getCategorySalesThisMonthChartOnly(10);
        $categoryOvervall  = $this->getCategorySalesMoMOverall();

        // report monthly sale
        $yearOptions = collect(range(now()->year - 2, now()->year))->values();
        $requested = $request->integer('year');
        $year = $yearOptions->contains($requested) ? (int) $requested : now()->year;
        $chartDataMonthlySale = $this->getMonthlySalesChartData($year);

        // report daily chart
        $start = $request->input('start');
        $end   = $request->input('end');
        $chartDataDaily = $this->getDailySalesPurchasesChartData($start, $end);

        // report tables
        $tables = Table::with('transaction', 'transaction.customer')->orderBy('number')->get();

        return inertia('dashboard', [
            'minimum_stocks' => $minimum_stocks,
            'top_sellings' => $topSellingAllTime,
            'sales' => $sales,
            'orders' => $orders,
            'expenses' => $expenses,
            'purchaseReturns' => $purchaseReturns,
            'transactionReturns' => $transactionReturns,
            'stockIn' => $stockIn,
            'stockOut' => $stockOut,
            'totalStock' => $totalStock,
            'order_pending' => $order_pending,
            'expense_pending' => $expense_pending,
            'transaction_pending' => $transaction_pending,
            'chart_categories' => $chartCategories,
            'category_overall' => $categoryOvervall,
            'chartDataMonthlySale' => $chartDataMonthlySale,
            'chartYear'        => $year,
            'yearOptions'      => $yearOptions,
            'chartDataDaily' => $chartDataDaily,
            'tables' => $tables
        ]);
    }
}

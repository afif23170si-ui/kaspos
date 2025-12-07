<?php

namespace App\Traits;

use App\Models\Menu;
use App\Models\Material;
use App\Models\StockMovement;
use Illuminate\Support\Facades\DB;

trait Helpers
{
    function getStock(string $stockableType, array $ids)
    {
        if (empty($ids)) return [];

        return DB::table('stock_movements as sm')
            ->join('stocks as s', 's.id', '=', 'sm.stock_id')
            ->where('s.stockable_type', $stockableType)
            ->whereIn('s.stockable_id', $ids)
            ->where(function ($q) {
                $q->whereNull('s.expired_at')
                ->orWhereDate('s.expired_at', '>=', today());
            })
            ->select('s.stockable_id', DB::raw("
                SUM(CASE
                    WHEN sm.type = 'in'  THEN sm.quantity
                    WHEN sm.type = 'out' THEN -sm.quantity
                    ELSE 0
                END) AS on_hand
            "))
            ->groupBy('s.stockable_id')
            ->pluck('on_hand', 'stockable_id')
            ->map(fn ($v) => (float) $v)
            ->all();
    }

    function getMenuStockFromMaterials(array $menuIds): array
    {
        if (empty($menuIds)) return [];

        $recipes = DB::table('receipes')
            ->select('menu_id', 'material_id', 'quantity')
            ->whereIn('menu_id', $menuIds)
            ->get()
            ->groupBy('menu_id');

        $materialIds = $recipes->flatten(1)->pluck('material_id')->unique()->values()->all();

        $materialType = (new Material)->getMorphClass();
        $materialStockMap = $this->getStock($materialType, $materialIds);

        $menuStock = [];
        foreach ($recipes as $menuId => $rows) {
            $perMaterialServings = [];

            foreach ($rows as $r) {
                $needed = (float) $r->quantity;
                if ($needed <= 0) {
                    continue;
                }
                $available = (float) ($materialStockMap[$r->material_id] ?? 0.0);
                $perMaterialServings[] = (int) floor($available / $needed);
            }

            $menuStock[$menuId] = !empty($perMaterialServings) ? min($perMaterialServings) : 0;
        }

        return $menuStock;
    }

    function consumeStockFifo(string $stockableType, int $stockableId, float $requiredQty, string $desc = ''): void
    {
        if ($requiredQty <= 0) return;

        DB::transaction(function () use ($stockableType, $stockableId, $requiredQty, $desc) {
            $movAgg = DB::table('stock_movements as sm')
                ->select('sm.stock_id', DB::raw("
                    SUM(CASE
                        WHEN sm.type = 'in'  THEN sm.quantity
                        WHEN sm.type = 'out' THEN -sm.quantity
                        ELSE 0
                    END) AS on_hand
                "))
                ->groupBy('sm.stock_id');

            $batches = DB::table('stocks as s')
                ->leftJoinSub($movAgg, 'm', 'm.stock_id', '=', 's.id')
                ->where('s.stockable_type', $stockableType)
                ->where('s.stockable_id', $stockableId)
                ->where(function ($q) {
                    $q->whereNull('s.expired_at')
                    ->orWhereDate('s.expired_at', '>=', today());
                })
                ->select(
                    's.id',
                    's.batch_code',
                    's.expired_at',
                    's.created_at',
                    DB::raw('COALESCE(m.on_hand, 0) AS available')
                )
                ->having('available', '>', 0)
                ->orderByRaw(' (s.expired_at IS NULL), s.expired_at ASC, s.created_at ASC, s.id ASC ')
                ->lockForUpdate()
                ->get();

            $remain = $requiredQty;

            foreach ($batches as $b) {
                if ($remain <= 0) break;

                $available = (float) $b->available;
                if ($available <= 0) continue;

                $take = min($remain, $available);

                StockMovement::create([
                    'stock_id'    => $b->id,
                    'type'        => 'out',
                    'quantity'    => $take,
                    'description' => $desc,
                ]);

                $remain -= $take;
            }

            if ($remain > 1e-6) {
                throw new \RuntimeException("Stok tidak mencukupi untuk {$stockableType}#{$stockableId}. Kekurangan: {$remain}");
            }
        });
    }

    public function consumeMenuFifo(int $menuId, float $menuQty, string $desc = ''): void
    {
        if ($menuQty <= 0) return;

        $menu = Menu::with([
            'receipes.material:id,name,unit_id,minimum_qty,price'
        ])->findOrFail($menuId);

        DB::transaction(function () use ($menu, $menuQty, $desc) {
            foreach ($menu->receipes as $line) {
                $need = (float) $line->quantity * (float) $menuQty;
                if ($need <= 0) continue;

                $this->consumeStockFifo(Material::class, (int) $line->material_id, $need, $desc);
            }
        });
    }
}

<?php

namespace App\Models;

use Illuminate\Support\Carbon;
use App\Traits\Trait\Auditable;
use Illuminate\Database\Eloquent\Model;

class Stock extends Model
{
    use Auditable;
    protected string $logName = 'stock';

    protected $fillable = ['stockable_id', 'stockable_type', 'batch_code', 'quantity', 'expired_at'];

    public function stockable()
    {
        return $this->morphTo();
    }

    public function movements()
    {
        return $this->hasMany(StockMovement::class);
    }

    public static function getAvailableStockUntilDate($itemType, $itemId, $date)
    {
        $date = $date ? Carbon::parse($date)->toDateString() : Carbon::today()->toDateString();

        $stocks = static::with(['movements' => function ($query) use ($date) {
                $query->whereDate('created_at', '<=', $date);
            }])
            ->where('stockable_type', $itemType)
            ->where('stockable_id', $itemId)
            ->whereDate('created_at', '<=', $date)
            ->where(function ($q) use ($date) {
                $q->whereNull('expired_at')
                ->orWhereDate('expired_at', '>=', $date);
            })
            ->get();

        $totalIn  = $stocks->flatMap->movements->where('type', 'in')->sum('quantity');
        $totalOut = $stocks->flatMap->movements->where('type', 'out')->sum('quantity');

        return (float) $totalIn - (float) $totalOut;
    }
}

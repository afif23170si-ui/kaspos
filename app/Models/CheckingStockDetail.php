<?php

namespace App\Models;

use App\Traits\Trait\Auditable;
use Illuminate\Database\Eloquent\Model;

class CheckingStockDetail extends Model
{
    use Auditable;
    protected string $logName = 'checking_stock_detail';

    protected $fillable = ['checking_stock_id', 'items_id', 'items_type', 'stock', 'quantity', 'price', 'note'];

    public function checking_stock()
    {
        return $this->belongsTo(CheckingStock::class);
    }

    public function items()
    {
        return $this->morphTo();
    }
}

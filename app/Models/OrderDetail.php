<?php

namespace App\Models;

use App\Traits\Trait\Auditable;
use Illuminate\Database\Eloquent\Model;

class OrderDetail extends Model
{
    use Auditable;
    protected string $logName = 'order_detail';

    protected $fillable = ['order_id', 'items_id', 'items_type', 'quantity', 'price', 'expired_at'];

    public function order()
    {
        return $this->belongsTo(Order::class);
    }

    public function items()
    {
        return $this->morphTo();
    }

    public function stocks()
    {
        return $this->morphMany(Stock::class, 'stockable');
    }
}

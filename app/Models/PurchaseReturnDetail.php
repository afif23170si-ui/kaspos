<?php

namespace App\Models;

use App\Traits\Trait\Auditable;
use Illuminate\Database\Eloquent\Model;

class PurchaseReturnDetail extends Model
{
    use Auditable;
    protected string $logName = 'purchase_return_detail';

    protected $fillable = [
        'purchase_return_id',
        'order_detail_id',
        'quantity',
        'reason',
        'expired_at',
    ];

    public function purchase_return()
    {
        return $this->belongsTo(PurchaseReturn::class);
    }

    public function order_detail()
    {
        return $this->belongsTo(OrderDetail::class);
    }
}

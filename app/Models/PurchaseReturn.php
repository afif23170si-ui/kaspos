<?php

namespace App\Models;

use App\Traits\Trait\Auditable;
use Illuminate\Database\Eloquent\Model;

class PurchaseReturn extends Model
{
    use Auditable;
    protected string $logName = 'purchase_return';

    protected $fillable = [
        'order_id',
        'return_code',
        'return_date',
        'notes',
        'refund_method',
        'status',
        'grand_total',
        'created_by',
    ];

    public function order()
    {
        return $this->belongsTo(Order::class);
    }

    public function user_created()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function details()
    {
        return $this->hasMany(PurchaseReturnDetail::class);
    }
}

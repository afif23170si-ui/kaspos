<?php

namespace App\Models;

use Illuminate\Support\Carbon;
use App\Traits\Trait\Auditable;
use Illuminate\Database\Eloquent\Model;

class Order extends Model
{
    use Auditable;
    protected string $logName = 'order';

    protected $fillable = ['order_code', 'supplier_id', 'order_date', 'type', 'discount', 'discount_type', 'subtotal', 'grand_total', 'payment_status', 'order_status', 'notes', 'created_by'];

    public function supplier()
    {
        return $this->belongsTo(Supplier::class);
    }

    public function order_details()
    {
        return $this->hasMany(OrderDetail::class);
    }

    public function order_payments()
    {
        return $this->hasMany(OrderPayment::class);
    }

    public function user_created()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function purchase_returns()
    {
        return $this->hasMany(PurchaseReturn::class);
    }

    public function purchase_return()
    {
        return $this->hasOne(PurchaseReturn::class);
    }
}

<?php

namespace App\Models;

use App\Traits\Trait\Auditable;
use Illuminate\Database\Eloquent\Model;

class OrderPayment extends Model
{
    use Auditable;
    protected string $logName = 'order_payment';

    protected $fillable = ['order_id', 'bank_account_id', 'paid_at', 'amount', 'payment_method'];

    public function order()
    {
        return $this->belongsTo(Order::class);
    }

    public function bank_account()
    {
        return $this->belongsTo(BankAccount::class);
    }
}

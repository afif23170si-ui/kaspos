<?php

namespace App\Models;

use App\Traits\Trait\Auditable;
use Illuminate\Database\Eloquent\Model;

class Transaction extends Model
{
    use Auditable;
    protected string $logName = 'transaction';

    protected $fillable = [
        'invoice', 'cashier_shift_id', 'customer_id',
        'waiter_id', 'transaction_type', 'table_id',
        'platform', 'coupon_id', 'status', 'notes_noref',
        'notes_transaction_source', 'notes_note', 'shipping_name',
        'shipping_ref', 'shipping_address', 'shipping_note',
        'shipping_status', 'payment_method', 'bank_account_id', 'subtotal',
        'discount', 'pay', 'change', 'grand_total', 'transaction_date'
    ];

    public function bank_account()
    {
        return $this->belongsTo(BankAccount::class);
    }

    public function cashier_shift()
    {
        return $this->belongsTo(CashierShift::class);
    }

    public function customer()
    {
        return $this->belongsTo(Customer::class);
    }

    public function transaction_details()
    {
        return $this->hasMany(TransactionDetail::class);
    }

    public function table()
    {
        return $this->belongsTo(Table::class);
    }

    public function customer_points()
    {
        return $this->hasMany(CustomerPoint::class);
    }

    public function transaction_payments()
    {
        return $this->hasMany(TransactionPayment::class);
    }

    public function transaction_taxs()
    {
        return $this->hasMany(TransactionTax::class);
    }

    public function waiter()
    {
        return $this->belongsTo(User::class, 'waiter_id', 'id');
    }
}

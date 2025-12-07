<?php

namespace App\Models;

use App\Traits\Trait\Auditable;
use Illuminate\Database\Eloquent\Model;

class TransactionPayment extends Model
{
    use Auditable;
    protected string $logName = 'transaction_payment';

    protected $fillable = ['transaction_id', 'bank_account_id', 'paid_at', 'amount', 'payment_method'];

    public function transaction()
    {
        return $this->belongsTo(Transaction::class);
    }

    public function bank_account()
    {
        return $this->belongsTo(BankAccount::class);
    }
}

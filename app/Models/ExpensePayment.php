<?php

namespace App\Models;

use App\Traits\Trait\Auditable;
use Illuminate\Database\Eloquent\Model;

class ExpensePayment extends Model
{
    use Auditable;
    protected string $logName = 'expense_payment';

    protected $fillable = ['expense_id', 'bank_account_id', 'paid_at', 'amount', 'payment_method'];

    public function expense()
    {
        return $this->belongsTo(Expense::class);
    }

    public function bank_account()
    {
        return $this->belongsTo(BankAccount::class);
    }
}

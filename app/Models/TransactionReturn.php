<?php

namespace App\Models;

use App\Traits\Trait\Auditable;
use Illuminate\Database\Eloquent\Model;

class TransactionReturn extends Model
{
    use Auditable;
    protected string $logName = 'transaction_return';

    protected $fillable = ['transaction_id', 'return_code', 'return_date', 'grand_total', 'refund_method', 'notes', 'status', 'created_by'];

    public function transaction()
    {
        return $this->belongsTo(Transaction::class);
    }

    public function user_created()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function details()
    {
        return $this->hasMany(TransactionReturnDetail::class);
    }
}

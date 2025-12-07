<?php

namespace App\Models;

use App\Traits\Trait\Auditable;
use Illuminate\Database\Eloquent\Model;

class TransactionTax extends Model
{
    use Auditable;
    protected string $logName = 'transaction_tax';

    protected $fillable = ['transaction_id', 'code', 'name', 'value'];

    public function transaction()
    {
        return $this->belongsTo(Transaction::class);
    }
}

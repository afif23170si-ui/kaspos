<?php

namespace App\Models;

use App\Traits\Trait\Auditable;
use Illuminate\Database\Eloquent\Model;

class TransactionReturnDetail extends Model
{
    use Auditable;
    protected string $logName = 'transaction_return_detail';

    protected $fillable = [
        'transaction_return_id',
        'transaction_detail_id',
        'quantity',
        'reason',
    ];

    public function transaction_return()
    {
        return $this->belongsTo(TransactionReturn::class);
    }

    public function transaction_detail()
    {
        return $this->belongsTo(TransactionDetail::class);
    }
}

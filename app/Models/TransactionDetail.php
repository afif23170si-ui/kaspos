<?php

namespace App\Models;

use App\Traits\Trait\Auditable;
use Illuminate\Database\Eloquent\Model;

class TransactionDetail extends Model
{
    use Auditable;
    protected string $logName = 'transaction_detail';

    protected $fillable = ['transaction_id', 'items_id', 'items_type', 'price', 'quantity', 'discount_type', 'discount', 'note'];

    public function transaction()
    {
        return $this->belongsTo(Transaction::class);
    }

    public function items()
    {
        return $this->morphTo();
    }
}

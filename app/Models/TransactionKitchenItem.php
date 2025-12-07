<?php

namespace App\Models;

use App\Traits\Trait\Auditable;
use Illuminate\Database\Eloquent\Model;

class TransactionKitchenItem extends Model
{
    use Auditable;
    protected string $logName = 'transaction_kitchen_item';

    protected $fillable = ['transaction_kitchen_id', 'transaction_detail_id', 'is_done'];

    public function transaction_kitchen()
    {
        return $this->belongsTo(TransactionKitchen::class);
    }

    public function transaction_detail()
    {
        return $this->belongsTo(TransactionDetail::class);
    }
}

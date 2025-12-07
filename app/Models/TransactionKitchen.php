<?php

namespace App\Models;

use App\Traits\Trait\Auditable;
use Illuminate\Database\Eloquent\Model;

class TransactionKitchen extends Model
{
    use Auditable;
    protected string $logName = 'transaction_kitchen';

    protected $fillable = ['transaction_id', 'status', 'transaction_date', 'transaction_finish'];

    public function transaction()
    {
        return $this->belongsTo(Transaction::class);
    }

    public function transaction_kitchen_items()
    {
        return $this->hasMany(TransactionKitchenItem::class);
    }
}

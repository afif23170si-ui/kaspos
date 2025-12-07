<?php

namespace App\Models;

use App\Traits\Trait\Auditable;
use Illuminate\Database\Eloquent\Model;

class CustomerPoint extends Model
{
    use Auditable;
    protected string $logName = 'customer_point';

    protected $fillable = ['transction_id', 'customer_id', 'point', 'status', 'expired_date', 'change_date'];

    public function transaction()
    {
        return $this->belongsTo(Transaction::class);
    }

    public function customer()
    {
        return $this->belongsTo(Customer::class);
    }
}

<?php

namespace App\Models;

use App\Traits\Trait\Auditable;
use Illuminate\Database\Eloquent\Model;

class Customer extends Model
{
    use Auditable;
    protected string $logName = 'customer';

    protected $fillable = ['name', 'email', 'phone', 'address'];

    public function customer_points()
    {
        return $this->hasMany(CustomerPoint::class);
    }
}

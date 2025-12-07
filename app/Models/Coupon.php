<?php

namespace App\Models;

use App\Traits\Trait\Auditable;
use Illuminate\Database\Eloquent\Model;

class Coupon extends Model
{
    use Auditable;
    protected string $logName = 'coupon';

    protected $fillable = ['code', 'value', 'type', 'is_active'];
}

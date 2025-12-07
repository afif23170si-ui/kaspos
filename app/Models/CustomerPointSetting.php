<?php

namespace App\Models;

use App\Traits\Trait\Auditable;
use Illuminate\Database\Eloquent\Model;

class CustomerPointSetting extends Model
{
    use Auditable;
    protected string $logName = 'customer_point_setting';

    protected $fillable = ['spend_amount', 'point_earned', 'expired_in_days', 'is_active'];
}

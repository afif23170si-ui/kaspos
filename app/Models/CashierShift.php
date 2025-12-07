<?php

namespace App\Models;

use App\Traits\Trait\Auditable;
use Illuminate\Database\Eloquent\Model;

class CashierShift extends Model
{
    use Auditable;
    protected string $logName = 'cashier_shift';

    protected $fillable = [
        'shift_id',
        'user_id',
        'starting_cash',
        'ending_cash',
        'opened_at',
        'closed_at',
        'status',
    ];

    public function shift()
    {
        return $this->belongsTo(Shift::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}

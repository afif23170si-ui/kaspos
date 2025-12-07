<?php

namespace App\Models;

use App\Traits\Trait\Auditable;
use Illuminate\Database\Eloquent\Model;

class CheckingStock extends Model
{
    use Auditable;
    protected string $logName = 'checking_stock';

    protected $fillable = ['no_ref', 'user_id', 'due_date', 'type', 'status', 'note'];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function details()
    {
        return $this->hasMany(CheckingStockDetail::class);
    }
}

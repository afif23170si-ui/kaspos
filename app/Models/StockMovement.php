<?php

namespace App\Models;

use App\Traits\Trait\Auditable;
use Illuminate\Database\Eloquent\Model;

class StockMovement extends Model
{
    use Auditable;
    protected string $logName = 'stock_movement';

    protected $fillable = ['stock_id', 'type', 'quantity', 'description'];

    public function stock()
    {
        return $this->belongsTo(Stock::class);
    }
}

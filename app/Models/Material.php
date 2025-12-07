<?php

namespace App\Models;

use App\Traits\Trait\Auditable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Casts\Attribute;

class Material extends Model
{
    use Auditable;
    protected string $logName = 'material';

    protected $fillable = ['name', 'unit_id', 'minimum_qty', 'price'];

    public function unit()
    {
        return $this->belongsTo(Unit::class);
    }

    public function initial_stock()
    {
        return $this->morphOne(Stock::class, 'stockable')->whereRelation('movements', 'type', 'in')->whereRelation('movements', 'description', 'Initial Stock');
    }

    public function stocks()
    {
        return $this->morphMany(Stock::class, 'stockable');
    }
}

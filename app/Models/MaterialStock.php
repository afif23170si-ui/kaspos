<?php

namespace App\Models;

use App\Traits\Trait\Auditable;
use Illuminate\Database\Eloquent\Model;

class MaterialStock extends Model
{
    use Auditable;
    protected string $logName = 'material_stock';

    protected $fillable = ['material_id', 'supplier_id', 'qty', 'qty_remain', 'expired_date', 'date'];

    public function material()
    {
        return $this->belongsTo(Material::class);
    }
}

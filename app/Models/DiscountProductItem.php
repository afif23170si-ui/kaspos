<?php

namespace App\Models;

use App\Traits\Trait\Auditable;
use Illuminate\Database\Eloquent\Model;

class DiscountProductItem extends Model
{
    use Auditable;
    protected string $logName = 'discount_product_item';

    protected $fillable = ['discount_product_id', 'items_type', 'items_id'];

    public function discount_product()
    {
        return $this->belongsTo(DiscountProduct::class);
    }

    public function items()
    {
        return $this->morphTo();
    }
}

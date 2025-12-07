<?php

namespace App\Models;

use App\Traits\Trait\Auditable;
use Illuminate\Database\Eloquent\Model;

class ProductVariantValue extends Model
{
    use Auditable;
    protected string $logName = 'product_variant_value';

    protected $fillable = ['product_variant_id', 'variant_value_id'];

    public function product_variant()
    {
        return $this->belongsTo(ProductVariant::class);
    }

    public function variant_value()
    {
        return $this->belongsTo(VariantValue::class);
    }
}

<?php

namespace App\Models;

use App\Traits\Trait\Auditable;
use Illuminate\Database\Eloquent\Model;

class ProductVariant extends Model
{
    use Auditable;
    protected string $logName = 'product_variant';

    protected $fillable = ['barcode', 'product_id', 'unit_id', 'price', 'capital_price', 'minimum_quantity'];

    public function product()
    {
        return $this->belongsTo(Product::class);
    }

    public function unit()
    {
        return $this->belongsTo(Unit::class);
    }

    public function product_variant_values()
    {
        return $this->hasMany(ProductVariantValue::class);
    }

    public function stocks()
    {
        return $this->morphMany(Stock::class, 'stockable');
    }

    public function initial_stock()
    {
        return $this->morphOne(Stock::class, 'stockable')->whereRelation('movements', 'type', 'in')->whereRelation('movements', 'description', 'Initial Stock');
    }
}

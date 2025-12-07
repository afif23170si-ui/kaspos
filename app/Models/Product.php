<?php

namespace App\Models;

use App\Traits\Trait\Auditable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Casts\Attribute;

class Product extends Model
{
    use Auditable;
    protected string $logName = 'product';

    protected $fillable = [
        'image',
        'sku',
        'name',
        'category_id',
        'description',
        'has_variant',
        'has_stock'
    ];

    protected function image(): Attribute
    {
        return Attribute::make(
            get: fn ($image) => $image != '' ? asset('/storage/products/' . $image) : asset('NoImage.png'),
        );
    }

    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    public function variants()
    {
        return $this->hasMany(ProductVariant::class);
    }

    public function stocks()
    {
        return $this->morphMany(Stock::class, 'stockable');
    }
}

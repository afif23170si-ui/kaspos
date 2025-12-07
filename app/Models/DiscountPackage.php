<?php

namespace App\Models;

use App\Traits\Trait\Auditable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Casts\Attribute;

class DiscountPackage extends Model
{
    use Auditable;
    protected string $logName = 'discount_package';

    protected $fillable = ['name', 'image', 'total_price', 'is_active'];

    protected function image(): Attribute
    {
        return Attribute::make(
            get: fn ($image) => asset('/storage/discount-packages/' . $image),
        );
    }

    public function discount_package_items()
    {
        return $this->hasMany(DiscountPackageItem::class);
    }
}

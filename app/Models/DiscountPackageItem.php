<?php

namespace App\Models;

use App\Traits\Trait\Auditable;
use Illuminate\Database\Eloquent\Model;

class DiscountPackageItem extends Model
{
    use Auditable;
    protected string $logName = 'discount_package_item';

    protected $fillable = ['discount_package_id', 'items_type', 'items_id', 'estimate_price'];

    public function discount_package()
    {
        return $this->belongsTo(DiscountPackage::class);
    }

    public function items()
    {
        return $this->morphTo();
    }
}

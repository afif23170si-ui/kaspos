<?php

namespace App\Models;

use App\Traits\Trait\Auditable;
use Illuminate\Database\Eloquent\Model;

class DiscountProduct extends Model
{
    use Auditable;
    protected string $logName = 'discount_product';

    protected $fillable = ['discount_name', 'discount_type', 'discount_value', 'discount_quantity', 'all_products', 'all_customers'];

    public function discount_product_customers()
    {
        return $this->hasMany(DiscountProductCustomer::class);
    }

    public function discount_product_items()
    {
        return $this->hasMany(DiscountProductItem::class);
    }
}

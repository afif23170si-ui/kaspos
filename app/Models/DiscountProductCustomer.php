<?php

namespace App\Models;

use App\Traits\Trait\Auditable;
use Illuminate\Database\Eloquent\Model;

class DiscountProductCustomer extends Model
{
    use Auditable;
    protected string $logName = 'discount_product_customer';

    protected $fillable = ['discount_product_id', 'customer_id'];

    public function discount_product()
    {
        return $this->belongsTo(DiscountProduct::class);
    }

    public function customer()
    {
        return $this->belongsTo(Customer::class);
    }
}

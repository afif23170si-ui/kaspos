<?php

namespace App\Models;

use App\Traits\Trait\Auditable;
use Illuminate\Database\Eloquent\Model;

class VariantOption extends Model
{
    use Auditable;
    protected string $logName = 'variant_option';

    protected $fillable = ['name'];

    public function variant_values()
    {
        return $this->hasMany(VariantValue::class);
    }
}

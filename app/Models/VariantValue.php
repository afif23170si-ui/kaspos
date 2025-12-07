<?php

namespace App\Models;

use App\Traits\Trait\Auditable;
use Illuminate\Database\Eloquent\Model;

class VariantValue extends Model
{
    use Auditable;
    protected string $logName = 'variant_value';

    protected $fillable = ['variant_option_id', 'name'];

    public function variant_option()
    {
        return $this->belongsTo(VariantOption::class)->orderBy('name');
    }
}

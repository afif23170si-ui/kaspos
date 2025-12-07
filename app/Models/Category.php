<?php

namespace App\Models;

use App\Traits\Trait\Auditable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Casts\Attribute;

class Category extends Model
{
    use Auditable;
    protected string $logName = 'category';

    protected $fillable = ['name', 'slug', 'image'];

    protected function image(): Attribute
    {
        return Attribute::make(
            get: fn ($image) => $image != '' ? asset('/storage/categories/' . $image) : asset('NoImage.png'),
        );
    }
}

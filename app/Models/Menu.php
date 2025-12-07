<?php

namespace App\Models;

use App\Traits\Trait\Auditable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Casts\Attribute;

class Menu extends Model
{
    use Auditable;
    protected string $logName = 'menu';

    protected $fillable = ['name', 'image', 'category_id', 'capital_price', 'selling_price', 'margin'];

    protected function image(): Attribute
    {
        return Attribute::make(
            get: fn ($image) => $image != '' ? asset('/storage/menus/' . $image) : asset('NoImage.png'),
        );
    }

    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    public function receipes()
    {
        return $this->hasMany(Receipe::class);
    }
}

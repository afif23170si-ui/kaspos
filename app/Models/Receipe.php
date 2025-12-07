<?php

namespace App\Models;

use App\Traits\Trait\Auditable;
use Illuminate\Database\Eloquent\Model;

class Receipe extends Model
{
    use Auditable;
    protected string $logName = 'receipes';

    protected $fillable = ['menu_id', 'material_id', 'quantity', 'price', 'total_price'];

    public function menu()
    {
        return $this->belongsTo(Menu::class);
    }

    public function material()
    {
        return $this->belongsTo(Material::class);
    }
}

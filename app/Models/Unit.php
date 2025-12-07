<?php

namespace App\Models;

use App\Traits\Trait\Auditable;
use Illuminate\Database\Eloquent\Model;

class Unit extends Model
{
    use Auditable;
    protected string $logName = 'unit';

    protected $fillable = ['name', 'description'];
}

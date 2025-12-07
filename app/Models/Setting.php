<?php

namespace App\Models;

use App\Traits\Trait\Auditable;
use Illuminate\Database\Eloquent\Model;

class Setting extends Model
{
    use Auditable;
    protected string $logName = 'setting';

    protected $fillable = ['name', 'code', 'value', 'is_active'];
}

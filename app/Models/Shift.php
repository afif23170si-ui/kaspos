<?php

namespace App\Models;

use App\Traits\Trait\Auditable;
use Illuminate\Database\Eloquent\Model;

class Shift extends Model
{
    use Auditable;
    protected string $logName = 'shift';

    protected $fillable = ['code', 'name', 'start_time', 'end_time'];
}

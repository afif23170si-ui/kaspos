<?php

namespace App\Models;

use App\Traits\Trait\Auditable;
use Illuminate\Database\Eloquent\Model;

class Table extends Model
{
    use Auditable;
    protected string $logName = 'table';

    protected $fillable = ['number', 'capacity', 'status'];

    public function transaction()
    {
        return $this->hasOne(Transaction::class)->latest();
    }
}

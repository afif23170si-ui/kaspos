<?php

namespace App\Models;

use App\Traits\Trait\Auditable;
use Illuminate\Database\Eloquent\Model;

class ExpenseCategory extends Model
{
    use Auditable;
    protected string $logName = 'expense_category';

    protected $fillable = ['name'];
}

<?php

namespace App\Models;

use App\Traits\Trait\Auditable;
use Illuminate\Database\Eloquent\Model;

class ExpenseSubcategory extends Model
{
    use Auditable;
    protected string $logName = 'expense_subcategory';

    protected $fillable = ['expense_category_id', 'name'];

    public function expense_category()
    {
        return $this->belongsTo(ExpenseCategory::class);
    }
}

<?php

namespace App\Models;

use App\Traits\Trait\Auditable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Casts\Attribute;

class Expense extends Model
{
    use Auditable;
    protected string $logName = 'expense';

    protected $fillable = ['expensee_number', 'reference_number', 'date', 'expense_category_id', 'expense_subcategory_id', 'amount', 'payment_status', 'description', 'file', 'created_by'];

    protected function file(): Attribute
    {
        return Attribute::make(
            get: fn ($value) => $value != null ? asset('/storage/expense/' . $value) : null,
        );
    }

    public function expense_category()
    {
        return $this->belongsTo(ExpenseCategory::class);
    }

    public function expense_subcategory()
    {
        return $this->belongsTo(ExpenseSubcategory::class);
    }

    public function expense_payments()
    {
        return $this->hasMany(ExpensePayment::class);
    }

    public function user_created()
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}

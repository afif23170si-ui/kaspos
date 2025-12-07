<?php

namespace App\Models;

use App\Traits\Trait\Auditable;
use Illuminate\Database\Eloquent\Model;

class BankAccount extends Model
{
    use Auditable;
    protected string $logName = 'bank_account';

    protected $fillable = ['bank_name', 'account_number', 'account_name'];
}

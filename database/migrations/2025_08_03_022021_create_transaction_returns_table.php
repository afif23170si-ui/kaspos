<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('transaction_returns', function (Blueprint $table) {
            $table->id();
            $table->foreignId('transaction_id')->constrained('transactions');
            $table->string('return_code')->unique();
            $table->date('return_date');
            $table->text('grand_total')->nullable();
            $table->enum('refund_method', ['refund', 'replacement']);
            $table->text('notes')->nullable();
            $table->enum('status', ['pending', 'confirmed']);
            $table->foreignId('created_by')->constrained('users');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('transaction_returns');
    }
};

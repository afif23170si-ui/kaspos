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
        Schema::create('transaction_return_details', function (Blueprint $table) {
            $table->id();
            $table->foreignId('transaction_return_id')->constrained('transaction_returns')->onDelete('cascade');
            $table->foreignId('transaction_detail_id')->constrained('transaction_details');
            $table->double('quantity');
            $table->text('reason')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('transaction_return_details');
    }
};

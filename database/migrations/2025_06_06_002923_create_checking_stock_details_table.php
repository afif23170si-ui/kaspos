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
        Schema::create('checking_stock_details', function (Blueprint $table) {
            $table->id();
            $table->foreignId('checking_stock_id')->constrained();
            $table->morphs('items');
            $table->double('stock');
            $table->double('quantity');
            $table->double('price');
            $table->text('note')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('checking_stock_details');
    }
};

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
        Schema::create('transaction_kitchen_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('transaction_kitchen_id')->constrained('transaction_kitchens')->cascadeOnDelete()->cascadeOnUpdate();
            $table->foreignId('transaction_detail_id')->constrained('transaction_details')->cascadeOnDelete()->cascadeOnUpdate();
            $table->boolean('is_done')->default(0);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('transaction_kitchen_items');
    }
};

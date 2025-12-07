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
        Schema::create('checking_stocks', function (Blueprint $table) {
            $table->id();
            $table->string('no_ref');
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->date('due_date');
            $table->enum('type', ['materials', 'products']);
            $table->enum('status', ['draft', 'done']);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('checking_stocks');
    }
};

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
        Schema::table('orders', function (Blueprint $table) {
            $table->enum('order_status', ['confirmed', 'received', 'pending'])->after('payment_status');
            $table->enum('discount_type', ['percentage', 'rupiah'])->after('type')->nullable();
            $table->double('discount')->after('type')->nullable();
            $table->double('subtotal')->after('type');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropColumn('order_status');
            $table->dropColumn('discount_type');
            $table->dropColumn('discount');
            $table->dropColumn('subtotal');
        });
    }
};

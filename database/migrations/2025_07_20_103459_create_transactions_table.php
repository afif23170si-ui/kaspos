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
        Schema::create('transactions', function (Blueprint $table) {
            $table->id();
            $table->string('invoice');
            $table->foreignId('cashier_shift_id')->constrained('cashier_shifts')->cascadeOnDelete()->cascadeOnUpdate();
            $table->foreignId('customer_id')->nullable()->constrained('customers')->nullOnDelete()->cascadeOnUpdate();
            $table->foreignId('waiter_id')->nullable()->constrained('users')->nullOnDelete()->cascadeOnUpdate();
            $table->enum('transaction_type', ['dine_in', 'takeaway', 'online'])->default('dine_in');
            $table->foreignId('table_id')->nullable()->constrained('tables')->cascadeOnDelete()->cascadeOnUpdate();
            $table->string('platform')->nullable();
            $table->foreignId('coupon_id')->nullable()->constrained('coupons')->nullOnDelete()->cascadeOnUpdate();
            $table->enum('status', ['pending', 'paid', 'cancelled'])->default('pending');
            $table->string('notes_noref')->nullable();
            $table->string('notes_transaction_source')->nullable();
            $table->string('notes_note')->nullable();
            $table->string('shipping_name')->nullable();
            $table->string('shipping_ref')->nullable();
            $table->string('shipping_address')->nullable();
            $table->string('shipping_note')->nullable();
            $table->enum('shipping_status', ['pending', 'shipped', 'delivered', 'cancelled'])->default('pending')->nullable();
            $table->enum('payment_method', ['cash', 'transfer'])->default('cash')->nullable();
            $table->double('subtotal')->default(0);
            $table->double('discount')->default(0);
            $table->double('pay')->default(0);
            $table->double('change')->default(0);
            $table->double('grand_total')->default(0);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('transactions');
    }
};

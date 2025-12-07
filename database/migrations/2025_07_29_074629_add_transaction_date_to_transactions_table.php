<?php

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        DB::statement("ALTER TABLE transactions MODIFY status ENUM('unpaid', 'pending', 'paid', 'partial') NOT NULL DEFAULT 'pending'");

        Schema::table('transactions', function (Blueprint $table) {
            $table->date('transaction_date')->after('grand_total')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('transactions', function (Blueprint $table) {
            $table->dropColumn('transaction_date');
        });

        DB::statement("ALTER TABLE transactions MODIFY status ENUM('pending', 'paid') NOT NULL DEFAULT 'pending'");
    }
};

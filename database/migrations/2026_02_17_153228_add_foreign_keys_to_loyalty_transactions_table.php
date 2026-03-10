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
        Schema::table('loyalty_transactions', function (Blueprint $table) {
            $table->foreign(['client_id'], 'loyalty_transactions_ibfk_1')->references(['id'])->on('clients')->onUpdate('no action')->onDelete('cascade');
            $table->foreign(['booking_id'], 'loyalty_transactions_ibfk_2')->references(['id'])->on('bookings')->onUpdate('no action')->onDelete('set null');
            $table->foreign(['created_by'], 'loyalty_transactions_ibfk_3')->references(['id'])->on('admin_users')->onUpdate('no action')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('loyalty_transactions', function (Blueprint $table) {
            $table->dropForeign('loyalty_transactions_ibfk_1');
            $table->dropForeign('loyalty_transactions_ibfk_2');
            $table->dropForeign('loyalty_transactions_ibfk_3');
        });
    }
};

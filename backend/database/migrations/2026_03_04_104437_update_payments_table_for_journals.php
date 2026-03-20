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
        Schema::table('payments', function (Blueprint $table) {
            // Drop foreign key first to allow changing the column type
            $table->dropForeign(['booking_id']);
        });

        Schema::table('payments', function (Blueprint $table) {
            // Change to integer to match bookings.id (which was created as integer('id', true))
            $table->integer('booking_id')->nullable()->change();
            $table->string('payment_type')->default('booking'); // booking, journal
            $table->foreignId('journal_id')->nullable()->constrained()->nullOnDelete();
            
            // Re-add foreign key
            $table->foreign('booking_id')->references('id')->on('bookings')->cascadeOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('payments', function (Blueprint $table) {
            $table->unsignedBigInteger('booking_id')->nullable(false)->change();
            $table->dropColumn('payment_type');
            $table->dropForeign(['journal_id']);
            $table->dropColumn('journal_id');
        });
    }
};

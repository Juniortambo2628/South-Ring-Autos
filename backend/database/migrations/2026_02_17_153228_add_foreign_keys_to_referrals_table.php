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
        Schema::table('referrals', function (Blueprint $table) {
            $table->foreign(['referrer_client_id'], 'referrals_ibfk_1')->references(['id'])->on('clients')->onUpdate('no action')->onDelete('cascade');
            $table->foreign(['referred_client_id'], 'referrals_ibfk_2')->references(['id'])->on('clients')->onUpdate('no action')->onDelete('set null');
            $table->foreign(['first_booking_id'], 'referrals_ibfk_3')->references(['id'])->on('bookings')->onUpdate('no action')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('referrals', function (Blueprint $table) {
            $table->dropForeign('referrals_ibfk_1');
            $table->dropForeign('referrals_ibfk_2');
            $table->dropForeign('referrals_ibfk_3');
        });
    }
};

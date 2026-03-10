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
        Schema::table('notifications', function (Blueprint $table) {
            $table->foreign(['client_id'], 'notifications_ibfk_1')->references(['id'])->on('clients')->onUpdate('no action')->onDelete('cascade');
            $table->foreign(['booking_id'], 'notifications_ibfk_2')->references(['id'])->on('bookings')->onUpdate('no action')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('notifications', function (Blueprint $table) {
            $table->dropForeign('notifications_ibfk_1');
            $table->dropForeign('notifications_ibfk_2');
        });
    }
};

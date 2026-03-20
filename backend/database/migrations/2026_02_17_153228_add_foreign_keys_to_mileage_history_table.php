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
        Schema::table('mileage_history', function (Blueprint $table) {
            $table->foreign(['vehicle_id'], 'mileage_history_ibfk_1')->references(['id'])->on('vehicles')->onUpdate('no action')->onDelete('cascade');
            $table->foreign(['booking_id'], 'mileage_history_ibfk_2')->references(['id'])->on('bookings')->onUpdate('no action')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('mileage_history', function (Blueprint $table) {
            $table->dropForeign('mileage_history_ibfk_1');
            $table->dropForeign('mileage_history_ibfk_2');
        });
    }
};

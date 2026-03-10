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
        Schema::table('bookings', function (Blueprint $table) {
            $table->foreign(['vehicle_id'], 'bookings_ibfk_1')->references(['id'])->on('vehicles')->onUpdate('no action')->onDelete('set null');
            $table->foreign(['client_id'], 'fk_bookings_client')->references(['id'])->on('clients')->onUpdate('no action')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('bookings', function (Blueprint $table) {
            $table->dropForeign('bookings_ibfk_1');
            $table->dropForeign('fk_bookings_client');
        });
    }
};

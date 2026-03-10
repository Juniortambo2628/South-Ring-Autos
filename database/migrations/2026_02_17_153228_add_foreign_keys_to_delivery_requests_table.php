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
        Schema::table('delivery_requests', function (Blueprint $table) {
            $table->foreign(['booking_id'], 'delivery_requests_ibfk_1')->references(['id'])->on('bookings')->onUpdate('no action')->onDelete('cascade');
            $table->foreign(['client_id'], 'delivery_requests_ibfk_2')->references(['id'])->on('clients')->onUpdate('no action')->onDelete('set null');
            $table->foreign(['assigned_to'], 'delivery_requests_ibfk_3')->references(['id'])->on('admin_users')->onUpdate('no action')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('delivery_requests', function (Blueprint $table) {
            $table->dropForeign('delivery_requests_ibfk_1');
            $table->dropForeign('delivery_requests_ibfk_2');
            $table->dropForeign('delivery_requests_ibfk_3');
        });
    }
};

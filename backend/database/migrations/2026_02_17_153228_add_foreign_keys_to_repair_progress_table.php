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
        Schema::table('repair_progress', function (Blueprint $table) {
            $table->foreign(['booking_id'], 'repair_progress_ibfk_1')->references(['id'])->on('bookings')->onUpdate('no action')->onDelete('cascade');
            $table->foreign(['updated_by'], 'repair_progress_ibfk_2')->references(['id'])->on('admin_users')->onUpdate('no action')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('repair_progress', function (Blueprint $table) {
            $table->dropForeign('repair_progress_ibfk_1');
            $table->dropForeign('repair_progress_ibfk_2');
        });
    }
};

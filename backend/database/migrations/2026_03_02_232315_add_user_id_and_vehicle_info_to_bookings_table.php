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
            $table->foreignId('user_id')->nullable()->after('client_id')->constrained()->onDelete('set null');
            $table->string('vehicle_make')->nullable()->after('registration');
            $table->string('vehicle_model')->nullable()->after('vehicle_make');
            $table->integer('vehicle_year')->nullable()->after('vehicle_model');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('bookings', function (Blueprint $table) {
            $table->dropForeign(['user_id']);
            $table->dropColumn(['user_id', 'vehicle_make', 'vehicle_model', 'vehicle_year']);
        });
    }
};

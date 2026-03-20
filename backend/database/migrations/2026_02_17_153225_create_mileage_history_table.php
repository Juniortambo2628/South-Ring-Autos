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
        Schema::create('mileage_history', function (Blueprint $table) {
            $table->integer('id', true);
            $table->integer('vehicle_id');
            $table->integer('booking_id')->nullable()->index('booking_id');
            $table->integer('mileage');
            $table->date('recorded_date')->index('idx_recorded_date');
            $table->enum('source', ['booking', 'manual', 'service'])->nullable()->default('booking');
            $table->text('notes')->nullable();
            $table->timestamp('created_at')->nullable()->useCurrent();

            $table->index(['vehicle_id', 'recorded_date'], 'idx_vehicle_date');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('mileage_history');
    }
};

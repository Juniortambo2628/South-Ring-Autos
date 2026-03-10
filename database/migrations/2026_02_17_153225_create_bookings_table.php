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
        Schema::create('bookings', function (Blueprint $table) {
            $table->integer('id', true);
            $table->integer('client_id')->nullable()->index('idx_client_id');
            $table->integer('vehicle_id')->nullable()->index('idx_vehicle_id');
            $table->string('name', 100);
            $table->string('phone', 20);
            $table->string('email', 100)->nullable();
            $table->string('registration', 50);
            $table->string('service', 100);
            $table->date('date')->nullable();
            $table->text('message')->nullable();
            $table->string('status', 20)->nullable()->default('pending');
            $table->decimal('estimated_cost', 10)->nullable();
            $table->decimal('actual_cost', 10)->nullable();
            $table->timestamp('created_at')->nullable()->useCurrent();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('bookings');
    }
};

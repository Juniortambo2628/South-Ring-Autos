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
        Schema::create('delivery_requests', function (Blueprint $table) {
            $table->integer('id', true);
            $table->integer('booking_id')->index('idx_booking_id');
            $table->integer('client_id')->nullable()->index('client_id');
            $table->enum('type', ['pickup', 'dropoff']);
            $table->text('address');
            $table->string('city', 100)->nullable();
            $table->string('postal_code', 20)->nullable();
            $table->date('preferred_date')->nullable();
            $table->time('preferred_time')->nullable();
            $table->string('contact_phone', 20);
            $table->text('special_instructions')->nullable();
            $table->string('status', 20)->nullable()->default('pending')->index('idx_status');
            $table->integer('assigned_to')->nullable()->index('assigned_to');
            $table->dateTime('scheduled_date')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->timestamp('created_at')->nullable()->useCurrent();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('delivery_requests');
    }
};

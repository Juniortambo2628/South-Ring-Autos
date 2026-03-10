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
        Schema::create('loyalty_redemptions', function (Blueprint $table) {
            $table->integer('id', true);
            $table->integer('client_id');
            $table->integer('reward_id')->index('reward_id');
            $table->integer('booking_id')->nullable()->index('booking_id');
            $table->integer('points_spent');
            $table->enum('status', ['pending', 'applied', 'cancelled'])->nullable()->default('pending');
            $table->decimal('discount_applied', 10)->nullable();
            $table->timestamp('redeemed_at')->nullable()->useCurrent();
            $table->timestamp('applied_at')->nullable();
            $table->timestamp('cancelled_at')->nullable();

            $table->index(['client_id', 'status'], 'idx_client_status');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('loyalty_redemptions');
    }
};

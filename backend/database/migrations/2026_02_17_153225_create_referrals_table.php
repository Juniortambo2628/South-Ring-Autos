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
        Schema::create('referrals', function (Blueprint $table) {
            $table->integer('id', true);
            $table->integer('referrer_client_id')->index('idx_referrer');
            $table->string('referred_email', 100)->index('idx_referred_email');
            $table->integer('referred_client_id')->nullable()->index('referred_client_id');
            $table->string('referral_code', 50)->index('idx_code');
            $table->enum('status', ['pending', 'registered', 'completed', 'rewarded'])->nullable()->default('pending')->index('idx_status');
            $table->decimal('referrer_reward', 10)->nullable()->default(500);
            $table->decimal('referee_reward', 10)->nullable()->default(500);
            $table->integer('first_booking_id')->nullable()->index('first_booking_id');
            $table->timestamp('registered_at')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->timestamp('rewarded_at')->nullable();
            $table->timestamp('created_at')->nullable()->useCurrent();

            $table->unique(['referral_code'], 'referral_code');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('referrals');
    }
};

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
        Schema::create('loyalty_rewards', function (Blueprint $table) {
            $table->integer('id', true);
            $table->string('name');
            $table->text('description')->nullable();
            $table->integer('points_required')->index('idx_points');
            $table->enum('reward_type', ['discount_percentage', 'discount_fixed', 'free_service', 'gift_card', 'parts_discount']);
            $table->decimal('reward_value', 10)->nullable();
            $table->integer('max_redemptions_per_client')->nullable()->default(1);
            $table->boolean('is_active')->nullable()->default(true)->index('idx_active');
            $table->date('valid_from')->nullable();
            $table->date('valid_until')->nullable();
            $table->timestamp('created_at')->nullable()->useCurrent();
            $table->timestamp('updated_at')->useCurrentOnUpdate()->nullable()->useCurrent();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('loyalty_rewards');
    }
};

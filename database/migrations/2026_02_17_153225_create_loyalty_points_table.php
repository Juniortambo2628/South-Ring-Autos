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
        Schema::create('loyalty_points', function (Blueprint $table) {
            $table->integer('id', true);
            $table->integer('client_id')->unique('client_id');
            $table->integer('points_earned')->nullable()->default(0);
            $table->integer('points_redeemed')->nullable()->default(0);
            $table->integer('points_available')->nullable()->storedAs('(`points_earned` - `points_redeemed`)')->index('idx_points_available');
            $table->integer('lifetime_points')->nullable()->default(0);
            $table->enum('tier', ['bronze', 'silver', 'gold', 'platinum'])->nullable()->default('bronze')->index('idx_tier');
            $table->timestamp('created_at')->nullable()->useCurrent();
            $table->timestamp('updated_at')->useCurrentOnUpdate()->nullable()->useCurrent();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('loyalty_points');
    }
};

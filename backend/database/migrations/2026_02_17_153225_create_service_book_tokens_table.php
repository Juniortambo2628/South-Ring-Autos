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
        Schema::create('service_book_tokens', function (Blueprint $table) {
            $table->integer('id', true);
            $table->integer('vehicle_id')->index('idx_vehicle');
            $table->string('token', 64)->index('idx_token');
            $table->integer('created_by')->index('created_by');
            $table->boolean('is_active')->nullable()->default(true)->index('idx_active');
            $table->integer('views_count')->nullable()->default(0);
            $table->timestamp('last_viewed_at')->nullable();
            $table->timestamp('expires_at')->nullable();
            $table->timestamp('created_at')->nullable()->useCurrent();

            $table->unique(['token'], 'token');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('service_book_tokens');
    }
};

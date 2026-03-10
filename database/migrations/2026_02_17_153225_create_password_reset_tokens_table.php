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
        Schema::create('password_reset_tokens', function (Blueprint $table) {
            $table->integer('id', true);
            $table->enum('user_type', ['client', 'admin']);
            $table->integer('user_id');
            $table->string('token')->index('idx_token');
            $table->timestamp('expires_at')->index('idx_expires');
            $table->boolean('used')->nullable()->default(false);
            $table->timestamp('created_at')->nullable()->useCurrent();

            $table->index(['user_type', 'user_id'], 'idx_user');
            $table->unique(['token'], 'token');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('password_reset_tokens');
    }
};

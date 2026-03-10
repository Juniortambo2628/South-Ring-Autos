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
        Schema::create('notifications', function (Blueprint $table) {
            $table->integer('id', true);
            $table->integer('client_id')->nullable()->index('idx_client_id');
            $table->integer('booking_id')->nullable()->index('booking_id');
            $table->string('type', 50);
            $table->string('title');
            $table->text('message');
            $table->boolean('read_status')->nullable()->default(false)->index('idx_read_status');
            $table->boolean('sent_email')->nullable()->default(false);
            $table->timestamp('created_at')->nullable()->useCurrent()->index('idx_created_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('notifications');
    }
};

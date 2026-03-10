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
        Schema::create('loyalty_transactions', function (Blueprint $table) {
            $table->integer('id', true);
            $table->integer('client_id');
            $table->integer('booking_id')->nullable()->index('booking_id');
            $table->integer('points_change');
            $table->enum('transaction_type', ['earned', 'redeemed', 'bonus', 'expired', 'adjustment'])->index('idx_type');
            $table->string('description')->nullable();
            $table->integer('created_by')->nullable()->index('created_by');
            $table->timestamp('created_at')->nullable()->useCurrent();

            $table->index(['client_id', 'created_at'], 'idx_client_date');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('loyalty_transactions');
    }
};

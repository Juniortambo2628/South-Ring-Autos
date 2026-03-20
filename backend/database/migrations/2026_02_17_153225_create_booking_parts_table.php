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
        Schema::create('booking_parts', function (Blueprint $table) {
            $table->integer('id', true);
            $table->integer('booking_id')->index('idx_booking');
            $table->string('part_name');
            $table->string('part_number', 100)->nullable();
            $table->string('part_category', 100)->nullable()->index('idx_category');
            $table->decimal('quantity', 10)->nullable()->default(1);
            $table->decimal('unit_price', 10)->nullable();
            $table->decimal('total_price', 10)->nullable();
            $table->integer('warranty_months')->nullable()->default(0);
            $table->string('supplier')->nullable();
            $table->timestamp('created_at')->nullable()->useCurrent();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('booking_parts');
    }
};

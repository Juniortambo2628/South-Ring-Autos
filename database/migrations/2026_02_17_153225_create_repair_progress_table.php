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
        Schema::create('repair_progress', function (Blueprint $table) {
            $table->integer('id', true);
            $table->integer('booking_id')->index('idx_booking_id');
            $table->string('stage', 50);
            $table->text('description')->nullable();
            $table->integer('progress_percentage')->nullable()->default(0);
            $table->integer('updated_by')->nullable()->index('updated_by');
            $table->timestamp('created_at')->nullable()->useCurrent()->index('idx_created_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('repair_progress');
    }
};

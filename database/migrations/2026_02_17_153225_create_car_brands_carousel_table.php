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
        Schema::create('car_brands_carousel', function (Blueprint $table) {
            $table->integer('id', true);
            $table->string('brand_name', 100);
            $table->string('brand_slug', 100)->unique('unique_slug');
            $table->string('logo_path')->nullable();
            $table->integer('display_order')->nullable()->default(0)->index('idx_display_order');
            $table->boolean('is_active')->nullable()->default(true)->index('idx_is_active');
            $table->timestamp('created_at')->nullable()->useCurrent();
            $table->timestamp('updated_at')->useCurrentOnUpdate()->nullable()->useCurrent();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('car_brands_carousel');
    }
};

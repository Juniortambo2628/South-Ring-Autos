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
        Schema::create('vehicles', function (Blueprint $table) {
            $table->integer('id', true);
            $table->integer('client_id')->index('idx_client_id');
            $table->string('make', 50);
            $table->string('model', 50);
            $table->integer('year')->nullable();
            $table->string('registration', 50)->index('idx_registration');
            $table->string('color', 30)->nullable();
            $table->string('vin', 50)->nullable();
            $table->string('engine_size', 20)->nullable();
            $table->string('fuel_type', 20)->nullable();
            $table->integer('mileage')->nullable();
            $table->string('thumbnail')->nullable();
            $table->text('notes')->nullable();
            $table->timestamp('created_at')->nullable()->useCurrent();
            $table->timestamp('updated_at')->useCurrentOnUpdate()->nullable()->useCurrent();

            $table->unique(['client_id', 'registration'], 'unique_registration_per_client');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('vehicles');
    }
};

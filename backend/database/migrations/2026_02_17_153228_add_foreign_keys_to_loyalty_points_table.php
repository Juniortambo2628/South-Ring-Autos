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
        Schema::table('loyalty_points', function (Blueprint $table) {
            $table->foreign(['client_id'], 'loyalty_points_ibfk_1')->references(['id'])->on('clients')->onUpdate('no action')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('loyalty_points', function (Blueprint $table) {
            $table->dropForeign('loyalty_points_ibfk_1');
        });
    }
};

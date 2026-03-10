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
        Schema::table('service_book_tokens', function (Blueprint $table) {
            $table->foreign(['vehicle_id'], 'service_book_tokens_ibfk_1')->references(['id'])->on('vehicles')->onUpdate('no action')->onDelete('cascade');
            $table->foreign(['created_by'], 'service_book_tokens_ibfk_2')->references(['id'])->on('clients')->onUpdate('no action')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('service_book_tokens', function (Blueprint $table) {
            $table->dropForeign('service_book_tokens_ibfk_1');
            $table->dropForeign('service_book_tokens_ibfk_2');
        });
    }
};

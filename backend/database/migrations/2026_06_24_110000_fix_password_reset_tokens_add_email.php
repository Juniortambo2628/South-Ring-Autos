<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('password_reset_tokens', function (Blueprint $table) {
            if (!Schema::hasColumn('password_reset_tokens', 'email')) {
                $table->string('email', 100)->nullable()->after('id');
                $table->index('email');
            }
            if (!Schema::hasColumn('password_reset_tokens', 'created_at')) {
                $table->timestamp('created_at')->nullable()->useCurrent();
            }
            // Make legacy columns nullable for transition
            $table->string('user_type', 20)->nullable()->change();
            $table->integer('user_id')->nullable()->change();
        });
    }

    public function down(): void
    {
        Schema::table('password_reset_tokens', function (Blueprint $table) {
            $table->dropColumn('email');
            $table->string('user_type', 20)->nullable(false)->change();
            $table->integer('user_id')->nullable(false)->change();
        });
    }
};

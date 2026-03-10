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
        Schema::table('users', function (Blueprint $column) {
            $column->string('google_id')->nullable()->after('id');
            $column->string('avatar')->nullable()->after('email');
            $column->string('phone')->nullable()->after('avatar');
            $column->text('address')->nullable()->after('phone');
            $column->string('role')->default('client')->after('password'); // admin or client
            $column->boolean('profile_completed')->default(false)->after('role');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $column) {
            $column->dropColumn(['google_id', 'avatar', 'phone', 'address', 'role', 'profile_completed']);
        });
    }
};

<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::dropIfExists('admin_users');
        Schema::dropIfExists('car_brands_carousel');
    }

    public function down(): void
    {
        // These tables are legacy and should not be restored
    }
};

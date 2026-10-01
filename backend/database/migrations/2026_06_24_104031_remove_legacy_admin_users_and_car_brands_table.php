<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    // Foreign keys added by the 2026_02_17 migrations still point at
    // admin_users; MySQL refuses to drop a referenced table, so detach
    // them first. SQLite does not enforce them (and cannot drop them).
    private const ADMIN_USER_FKS = [
        'delivery_requests' => 'delivery_requests_ibfk_3',
        'loyalty_transactions' => 'loyalty_transactions_ibfk_3',
        'repair_progress' => 'repair_progress_ibfk_2',
    ];

    public function up(): void
    {
        if (DB::getDriverName() === 'mysql') {
            foreach (self::ADMIN_USER_FKS as $table => $foreign) {
                if (Schema::hasTable($table)) {
                    Schema::table($table, fn ($blueprint) => $blueprint->dropForeign($foreign));
                }
            }
        }

        Schema::dropIfExists('admin_users');
        Schema::dropIfExists('car_brands_carousel');
    }

    public function down(): void
    {
        // These tables are legacy and should not be restored
    }
};

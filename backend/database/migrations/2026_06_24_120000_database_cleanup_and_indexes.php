<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::dropIfExists('referrals');
        Schema::dropIfExists('booking_parts');

        Schema::table('payments', function (Blueprint $table) {
            $table->index(['user_id', 'status'], 'payments_user_id_status_idx');
        });

        Schema::table('bookings', function (Blueprint $table) {
            $table->index(['email', 'status'], 'bookings_email_status_idx');
        });

        Schema::table('blog_posts', function (Blueprint $table) {
            $table->index(['status', 'created_at'], 'blog_posts_status_created_idx');
        });

        Schema::table('notifications', function (Blueprint $table) {
            $table->index(['notifiable_type', 'notifiable_id', 'created_at'], 'notif_notifiable_created_idx');
        });
    }

    public function down(): void
    {
        if (Schema::hasTable('payments')) {
            Schema::table('payments', function (Blueprint $table) {
                $table->dropIndex('payments_user_id_status_idx');
            });
        }
        if (Schema::hasTable('bookings')) {
            Schema::table('bookings', function (Blueprint $table) {
                $table->dropIndex('bookings_email_status_idx');
            });
        }
        if (Schema::hasTable('blog_posts')) {
            Schema::table('blog_posts', function (Blueprint $table) {
                $table->dropIndex('blog_posts_status_created_idx');
            });
        }
        if (Schema::hasTable('notifications')) {
            Schema::table('notifications', function (Blueprint $table) {
                $table->dropIndex('notif_notifiable_created_idx');
            });
        }

        Schema::create('referrals', function (Blueprint $table) {
            $table->integer('id', true);
            $table->integer('referrer_client_id')->index('idx_referrer');
            $table->string('referred_email', 100)->index('idx_referred_email');
            $table->integer('referred_client_id')->nullable()->index('referred_client_id');
            $table->string('referral_code', 50)->index('idx_code');
            $table->enum('status', ['pending', 'registered', 'completed', 'rewarded'])->nullable()->default('pending')->index('idx_status');
            $table->decimal('referrer_reward', 10)->nullable()->default(500);
            $table->decimal('referee_reward', 10)->nullable()->default(500);
            $table->integer('first_booking_id')->nullable()->index('first_booking_id');
            $table->timestamp('registered_at')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->timestamp('rewarded_at')->nullable();
            $table->timestamp('created_at')->nullable()->useCurrent();
            $table->unique(['referral_code'], 'referral_code');
        });

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
};

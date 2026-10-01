<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    private const DEFAULT_BRANDS = [
        ['name' => 'Audi', 'logo' => '/car-logos/audi.png'],
        ['name' => 'BMW', 'logo' => '/car-logos/bmw.png'],
        ['name' => 'Honda', 'logo' => '/car-logos/honda.png'],
        ['name' => 'Toyota', 'logo' => '/car-logos/toyota.png'],
        ['name' => 'Mercedes-Benz', 'logo' => '/car-logos/mercedes-benz.png'],
        ['name' => 'Nissan', 'logo' => '/car-logos/nissan.png'],
        ['name' => 'Mazda', 'logo' => '/car-logos/mazda.png'],
        ['name' => 'Volkswagen', 'logo' => '/car-logos/volkswagen.png'],
        ['name' => 'Hyundai', 'logo' => '/car-logos/hyundai.png'],
        ['name' => 'Kia', 'logo' => '/car-logos/kia.png'],
        ['name' => 'Land Rover', 'logo' => '/car-logos/land-rover.png'],
        ['name' => 'Subaru', 'logo' => '/car-logos/subaru.png'],
    ];

    public function up(): void
    {
        Schema::create('car_brands_carousel', function (Blueprint $table) {
            $table->id();
            $table->string('name')->unique();
            $table->string('logo');
            $table->unsignedInteger('sort_order')->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        $now = now();
        foreach (self::DEFAULT_BRANDS as $index => $brand) {
            DB::table('car_brands_carousel')->insertOrIgnore(array_merge($brand, [
                'sort_order' => $index,
                'is_active' => true,
                'created_at' => $now,
                'updated_at' => $now,
            ]));
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('car_brands_carousel');
    }
};

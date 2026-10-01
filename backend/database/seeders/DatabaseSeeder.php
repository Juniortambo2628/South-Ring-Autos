<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // User::factory(10)->create();

        User::updateOrCreate(
            ['email' => 'test@example.com'],
            // email/name must win over the factory's random values so
            // repeated seed runs do not create a new user each time
            array_merge(User::factory()->raw(), ['email' => 'test@example.com', 'name' => 'Test User'])
        );

        $this->call([
            AdminSeeder::class,
            BlogSeeder::class,
            JournalSeeder::class,
        ]);
    }
}

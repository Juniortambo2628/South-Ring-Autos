<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class AdminSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        User::updateOrCreate(
            ['email' => 'admin@southring.com'],
            [
                'name' => 'South Ring Admin',
                'password' => Hash::make('admin123'),
                'role' => 'admin',
                'profile_completed' => true,
            ]
        );
    }
}

<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Journal;

class JournalSeeder extends Seeder
{
    public function run(): void
    {
        $journals = [
            [
                'year' => 2026,
                'title' => 'The 2026 Automotive Expansion',
                'description' => 'A look ahead at the next phase of EV infrastructure and autonomous driving advancements.',
                'price' => 2000,
                'cover_image' => null, // Provide null or a valid path if any
                'is_active' => true,
            ],
            [
                'year' => 2025,
                'title' => '2025: The Year of Hybrid Revival',
                'description' => 'Discover how hybrid technologies made a massive comeback in the 2025 landscape.',
                'price' => 1800,
                'cover_image' => null,
                'is_active' => true,
            ],
            [
                'year' => 2024,
                'title' => 'The 2024 Automotive Legacy',
                'description' => 'A comprehensive digital archive of 2024\'s most vital car care advice and industry analysis.',
                'price' => 1500,
                'cover_image' => '/images/journals/2024-cover.jpg',
                'is_active' => true,
            ],
            [
                'year' => 2023,
                'title' => 'Navigating the 2023 Shift',
                'description' => 'Relive the breakthroughs of 2023 with our curated collection of technical explorations.',
                'price' => 1200,
                'cover_image' => '/images/journals/2023-cover.jpg',
                'is_active' => true,
            ],
        ];

        foreach ($journals as $j) {
            Journal::updateOrCreate(['year' => $j['year']], $j);
        }
    }
}

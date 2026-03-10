<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\BlogPost;
use Carbon\Carbon;

class BlogSeeder extends Seeder
{
    public function run(): void
    {
        $categories = ['Maintenance', 'Technology', 'Reviews', 'News', 'Tips & Tricks'];
        $years = [2023, 2024, 2025, 2026];
        $posts = [];

        foreach ($years as $year) {
            for ($i = 1; $i <= 5; $i++) {
                $posts[] = [
                    'title' => "The Ultimate Guide to Automotive $categories[$i] in $year - Part $i",
                    'excerpt' => "Explore the intricacies and advancements of $categories[$i] during the year $year. This article delves deep into what changed and how you can adapt.",
                    'content' => "<p>Welcome to our comprehensive deep-dive into $categories[$i] for the year $year.</p><h2>The Landscape of $year</h2><p>Our experts have spent countless hours analyzing data and testing the latest models. This guide will provide you with unparalleled insights into maintaining, buying, and understanding vehicles in $year.</p><h3>Key Takeaways</h3><ul><li>Always check the manufacturer guidelines.</li><li>Stay updated with the latest software patches for your car's ECU.</li><li>Regular maintenance saves money in the long run.</li></ul><p>As we look towards the future, the lessons learned in $year will undoubtedly shape the automotive industry for decades to come.</p>",
                    'category' => $categories[$i % count($categories)],
                    'status' => 'published',
                    'created_at' => Carbon::create($year, ($i * 2), 15),
                ];
            }
        }
        
        // Ensure some current year (2025/2026 fallback depending on actual date) current news
        $posts[] = [
            'title' => 'Breaking News: Current Auto Trends',
            'excerpt' => 'A look at the most recent developments in the automotive world.',
            'content' => '<p>Current news content goes here, explaining real-time updates.</p>',
            'category' => 'News',
            'status' => 'published',
            'created_at' => Carbon::now()->subDays(2),
        ];

        foreach ($posts as $post) {
            BlogPost::updateOrCreate(['title' => $post['title']], $post);
        }
    }
}

<?php

namespace Tests\Feature;

use App\Models\BlogPost;
use App\Models\EmailTemplate;
use App\Models\User;
use Database\Seeders\BlogSeeder;
use Database\Seeders\DatabaseSeeder;
use Database\Seeders\EmailTemplateSeeder;
use Database\Seeders\JournalSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SeederIdempotencyTest extends TestCase
{
    use RefreshDatabase;

    public function test_database_seeder_can_run_twice_without_duplicating_rows(): void
    {
        $this->seed(DatabaseSeeder::class);
        $users = User::count();
        $posts = BlogPost::count();

        $this->seed(DatabaseSeeder::class);

        $this->assertSame($users, User::count());
        $this->assertSame($posts, BlogPost::count());
    }

    public function test_content_seeders_can_run_twice_without_duplicating_rows(): void
    {
        $this->seed(BlogSeeder::class);
        $this->seed(JournalSeeder::class);
        $posts = BlogPost::count();
        $journals = \App\Models\Journal::count();

        $this->seed(BlogSeeder::class);
        $this->seed(JournalSeeder::class);

        $this->assertSame($posts, BlogPost::count());
        $this->assertSame($journals, \App\Models\Journal::count());
    }

    public function test_email_template_seeder_can_run_twice(): void
    {
        $this->seed(EmailTemplateSeeder::class);
        $count = EmailTemplate::count();

        $this->seed(EmailTemplateSeeder::class);

        $this->assertSame($count, EmailTemplate::count());
        $this->assertSame(4, $count);
    }
}

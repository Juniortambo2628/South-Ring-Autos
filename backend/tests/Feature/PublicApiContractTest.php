<?php

namespace Tests\Feature;

use App\Models\BlogPost;
use App\Models\Setting;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class PublicApiContractTest extends TestCase
{
    use RefreshDatabase;

    public function test_public_blog_hides_drafts_even_with_admin_flag(): void
    {
        BlogPost::create(['title' => 'Public Post', 'content' => 'body', 'status' => 'published']);
        BlogPost::create(['title' => 'Secret Draft', 'content' => 'body', 'status' => 'draft']);

        $response = $this->getJson('/api/blog?admin=1')->assertOk();

        $titles = collect($response->json('posts'))->pluck('title');
        $this->assertTrue($titles->contains('Public Post'));
        $this->assertFalse($titles->contains('Secret Draft'));
    }

    public function test_admin_blog_includes_drafts_for_admins(): void
    {
        BlogPost::create(['title' => 'Secret Draft', 'content' => 'body', 'status' => 'draft']);
        Sanctum::actingAs(User::factory()->create(['role' => 'admin']));

        $response = $this->getJson('/api/admin/blog')->assertOk();

        $titles = collect($response->json('posts'))->pluck('title');
        $this->assertTrue($titles->contains('Secret Draft'));
    }

    public function test_public_settings_exclude_secret_keys(): void
    {
        Setting::create(['key' => 'company_name', 'value' => 'South Ring Autos']);
        Setting::create(['key' => 'paystack_secret_key', 'value' => 'sk_test_secret']);

        $response = $this->getJson('/api/settings')->assertOk();

        $this->assertSame('South Ring Autos', $response->json('settings.company_name'));
        $this->assertArrayNotHasKey('paystack_secret_key', $response->json('settings'));
        $response->assertDontSee('sk_test_secret');
    }

    public function test_admin_settings_require_admin_role(): void
    {
        Setting::create(['key' => 'paystack_secret_key', 'value' => 'sk_test_secret']);

        $this->getJson('/api/admin/settings')->assertUnauthorized();

        Sanctum::actingAs(User::factory()->create(['role' => 'client']));
        $this->getJson('/api/admin/settings')->assertForbidden();

        Sanctum::actingAs(User::factory()->create(['role' => 'admin']));
        $this->getJson('/api/admin/settings')->assertOk()->assertSee('paystack_secret_key');
    }

    public function test_public_reads_survive_invalid_bearer_tokens(): void
    {
        $this->withHeader('Authorization', 'Bearer not-a-real-token')
            ->getJson('/api/journals')
            ->assertOk();
    }

    public function test_contact_endpoint_is_rate_limited(): void
    {
        $payload = [
            'name' => 'Test Sender',
            'email' => 'sender@example.test',
            'subject' => 'Hello',
            'message' => 'Testing the throttle.',
        ];

        for ($i = 0; $i < 5; $i++) {
            $this->postJson('/api/contact', $payload)->assertCreated();
        }

        $this->postJson('/api/contact', $payload)->assertStatus(429);
    }
}

<?php

namespace Tests\Feature;

use App\Auth\OneTimeCode;
use App\Models\User;
use Database\Seeders\EmailTemplateSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class EmailVerificationTest extends TestCase
{
    use RefreshDatabase;

    public function test_unverified_user_login_is_blocked_without_a_token(): void
    {
        $user = User::factory()->unverified()->create();

        $response = $this->postJson('/api/login', [
            'email' => $user->email,
            'password' => 'password',
        ]);

        $response->assertStatus(202)
            ->assertJson([
                'success' => false,
                'status' => 'verification_required',
                'email' => $user->email,
            ])
            ->assertJsonMissingPath('access_token');
    }

    public function test_verified_user_login_still_returns_a_token(): void
    {
        $user = User::factory()->create();

        $response = $this->postJson('/api/login', [
            'email' => $user->email,
            'password' => 'password',
        ]);

        $response->assertOk()
            ->assertJson(['success' => true, 'token_type' => 'Bearer'])
            ->assertJsonPath('user.email', $user->email);

        $this->assertNotEmpty($response->json('access_token'));
    }

    public function test_register_creates_an_unverified_user_and_requires_verification(): void
    {
        $response = $this->postJson('/api/register', [
            'name' => 'Tambo Junior',
            'email' => 'tambo@example.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
        ]);

        $response->assertStatus(202)
            ->assertJson([
                'success' => false,
                'status' => 'verification_required',
                'email' => 'tambo@example.com',
            ])
            ->assertJsonMissingPath('access_token');

        $user = User::where('email', 'tambo@example.com')->firstOrFail();
        $this->assertNull($user->email_verified_at);
    }

    public function test_send_code_rejects_wrong_password(): void
    {
        $user = User::factory()->unverified()->create();

        $response = $this->postJson('/api/verify-email/send', [
            'email' => $user->email,
            'password' => 'wrong-password',
        ]);

        $response->assertStatus(401);
    }

    public function test_send_code_emails_a_code_to_unverified_users(): void
    {
        $this->seed(EmailTemplateSeeder::class);
        $user = User::factory()->unverified()->create();

        $response = $this->postJson('/api/verify-email/send', [
            'email' => $user->email,
            'password' => 'password',
        ]);

        $response->assertOk()->assertJson(['success' => true]);

        $this->assertNotSame(
            '',
            \Illuminate\Support\Facades\Cache::get('one_time_code:email_verification:' . $user->email) ?? ''
        );
    }

    public function test_send_code_is_rejected_for_already_verified_users(): void
    {
        $user = User::factory()->create();

        $response = $this->postJson('/api/verify-email/send', [
            'email' => $user->email,
            'password' => 'password',
        ]);

        $response->assertStatus(422);
    }

    public function test_wrong_code_does_not_verify_the_user(): void
    {
        $user = User::factory()->unverified()->create();

        $response = $this->postJson('/api/verify-email', [
            'email' => $user->email,
            'code' => '000000',
        ]);

        $response->assertStatus(422);
        $this->assertNull($user->fresh()->email_verified_at);
    }

    public function test_correct_code_verifies_the_user_and_returns_a_token(): void
    {
        $user = User::factory()->unverified()->create();
        $code = OneTimeCode::issue('email_verification', $user->email);

        $response = $this->postJson('/api/verify-email', [
            'email' => $user->email,
            'code' => $code,
        ]);

        $response->assertOk()
            ->assertJson(['success' => true, 'token_type' => 'Bearer'])
            ->assertJsonPath('user.email', $user->email);

        $this->assertNotNull($user->fresh()->email_verified_at);
    }

    public function test_verification_code_is_single_use(): void
    {
        $user = User::factory()->unverified()->create();
        $code = OneTimeCode::issue('email_verification', $user->email);

        $this->postJson('/api/verify-email', ['email' => $user->email, 'code' => $code])->assertOk();

        $second = $this->postJson('/api/verify-email', ['email' => $user->email, 'code' => $code]);
        $second->assertOk(); // already verified now logs in regardless of code validity
        $this->assertNotNull($user->fresh()->email_verified_at);
    }

    public function test_send_code_endpoint_is_throttled(): void
    {
        $this->seed(EmailTemplateSeeder::class);
        $user = User::factory()->unverified()->create();

        $last = null;
        for ($i = 0; $i < 8; $i++) {
            $last = $this->postJson('/api/verify-email/send', [
                'email' => $user->email,
                'password' => 'password',
            ]);
        }

        $last->assertStatus(429);
    }
}

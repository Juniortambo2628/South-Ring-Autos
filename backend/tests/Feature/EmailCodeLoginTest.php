<?php

namespace Tests\Feature;

use App\Auth\OneTimeCode;
use App\Models\User;
use Database\Seeders\EmailTemplateSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class EmailCodeLoginTest extends TestCase
{
    use RefreshDatabase;

    public function test_send_does_not_reveal_whether_the_account_exists(): void
    {
        $this->seed(EmailTemplateSeeder::class);
        $known = User::factory()->create();
        User::factory()->create(['email' => 'ghost@example.com']);

        $unknown = $this->postJson('/api/email-code/send', ['email' => 'ghost2@example.com']);
        $existing = $this->postJson('/api/email-code/send', ['email' => $known->email]);

        $unknown->assertOk();
        $existing->assertOk();
        $this->assertSame($unknown->json('message'), $existing->json('message'));
        $this->assertNull(\Illuminate\Support\Facades\Cache::get('one_time_code:email_login:ghost2@example.com'));
        $this->assertNotNull(\Illuminate\Support\Facades\Cache::get('one_time_code:email_login:' . $known->email));
    }

    public function test_send_issues_no_code_for_unverified_accounts(): void
    {
        $user = User::factory()->unverified()->create();

        $this->postJson('/api/email-code/send', ['email' => $user->email])->assertOk();

        $this->assertNull(\Illuminate\Support\Facades\Cache::get('one_time_code:email_login:' . $user->email));
    }

    public function test_correct_email_code_returns_a_token(): void
    {
        $user = User::factory()->create();
        $code = OneTimeCode::issue('email_login', $user->email);

        $response = $this->postJson('/api/email-code/login', [
            'email' => $user->email,
            'code' => $code,
        ]);

        $response->assertOk()
            ->assertJson(['success' => true, 'token_type' => 'Bearer'])
            ->assertJsonPath('user.email', $user->email);

        $this->assertNotEmpty($response->json('access_token'));
    }

    public function test_wrong_email_code_is_rejected(): void
    {
        $user = User::factory()->create();
        OneTimeCode::issue('email_login', $user->email);

        $this->postJson('/api/email-code/login', [
            'email' => $user->email,
            'code' => '999999',
        ])->assertStatus(422);
    }

    public function test_email_code_expires(): void
    {
        $user = User::factory()->create();
        $code = OneTimeCode::issue('email_login', $user->email);

        $this->travel(11)->minutes();

        $this->postJson('/api/email-code/login', [
            'email' => $user->email,
            'code' => $code,
        ])->assertStatus(422);
    }

    public function test_email_code_for_unverified_account_hits_the_verification_gate(): void
    {
        $user = User::factory()->unverified()->create();
        $code = OneTimeCode::issue('email_login', $user->email);

        $this->postJson('/api/email-code/login', [
            'email' => $user->email,
            'code' => $code,
        ])->assertStatus(202)->assertJson(['status' => 'verification_required']);
    }

    public function test_two_factor_challenge_is_required_after_email_code(): void
    {
        $user = User::factory()->create([
            'two_factor_secret' => 'JBSWY3DPEHPK3PXP',
            'two_factor_confirmed_at' => now(),
        ]);
        $code = OneTimeCode::issue('email_login', $user->email);

        $response = $this->postJson('/api/email-code/login', [
            'email' => $user->email,
            'code' => $code,
        ]);

        $response->assertStatus(202)
            ->assertJson([
                'success' => false,
                'status' => 'two_factor_required',
            ])
            ->assertJsonMissingPath('user')
            ->assertJsonMissingPath('access_token');

        $this->assertNotEmpty($response->json('challenge_token'));
    }
}

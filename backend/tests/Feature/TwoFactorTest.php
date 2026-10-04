<?php

namespace Tests\Feature;

use App\Models\User;
use Database\Seeders\EmailTemplateSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use PragmaRX\Google2FA\Google2FA;
use Tests\TestCase;

class TwoFactorTest extends TestCase
{
    use RefreshDatabase;

    private function passwordLogin(string $email)
    {
        // An authed request in the same test flips the default guard to sanctum;
        // password login needs the web guard back.
        auth()->shouldUse('web');

        return $this->postJson('/api/login', ['email' => $email, 'password' => 'password']);
    }

    private function currentOtp(User $user): string
    {
        return (new Google2FA)->getCurrentOtp($user->fresh()->two_factor_secret);
    }

    private function enableAndConfirm(User $user): array
    {
        $this->withHeader('Authorization', 'Bearer ' . $user->createToken('auth_token')->plainTextToken);
        $this->postJson('/api/two-factor/enable')->assertOk();

        return $this->postJson('/api/two-factor/confirm', ['code' => $this->currentOtp($user)])
            ->assertOk()
            ->json('recovery_codes');
    }

    public function test_enable_stores_a_secret_but_does_not_challenge_yet(): void
    {
        $user = User::factory()->create();
        $this->withHeader('Authorization', 'Bearer ' . $user->createToken('auth_token')->plainTextToken);

        $response = $this->postJson('/api/two-factor/enable');

        $response->assertOk()
            ->assertJsonStructure(['secret', 'otpauth_url'])
            ->assertJsonPath('success', true);

        $this->assertStringStartsWith('otpauth://totp/', $response->json('otpauth_url'));
        $this->assertTrue($user->fresh()->hasTwoFactorSecret());
        $this->assertFalse($user->fresh()->twoFactorEnabled());

        $this->passwordLogin($user->email)
            ->assertOk()
            ->assertJsonPath('success', true);
    }

    public function test_confirm_rejects_wrong_code(): void
    {
        $user = User::factory()->create();
        $this->withHeader('Authorization', 'Bearer ' . $user->createToken('auth_token')->plainTextToken);
        $this->postJson('/api/two-factor/enable')->assertOk();

        $this->postJson('/api/two-factor/confirm', ['code' => '000000'])->assertStatus(422);
        $this->assertFalse($user->fresh()->twoFactorEnabled());
    }

    public function test_confirm_succeeds_and_returns_recovery_codes(): void
    {
        $this->seed(EmailTemplateSeeder::class);
        $user = User::factory()->create();
        $this->withHeader('Authorization', 'Bearer ' . $user->createToken('auth_token')->plainTextToken);
        $this->postJson('/api/two-factor/enable')->assertOk();

        $response = $this->postJson('/api/two-factor/confirm', ['code' => $this->currentOtp($user)]);

        $response->assertOk()->assertJsonStructure(['recovery_codes']);
        $codes = $response->json('recovery_codes');
        $this->assertCount(10, $codes);

        $fresh = $user->fresh();
        $this->assertTrue($fresh->twoFactorEnabled());
        $this->assertNotContains($codes[0], $fresh->recoveryCodes());
        $this->assertStringNotContainsString($codes[0], json_encode($fresh->getAttributes()));
    }

    public function test_login_requires_two_factor_challenge_once_enabled(): void
    {
        $user = User::factory()->create();
        $this->enableAndConfirm($user);

        $login = $this->passwordLogin($user->email);

        $login->assertStatus(202)
            ->assertJson(['success' => false, 'status' => 'two_factor_required'])
            ->assertJsonMissingPath('access_token');

        $this->assertNotEmpty($login->json('challenge_token'));
    }

    public function test_challenge_with_totp_returns_token(): void
    {
        $user = User::factory()->create();
        $this->enableAndConfirm($user);

        $login = $this->passwordLogin($user->email);
        $login->assertStatus(202)->assertJson(['status' => 'two_factor_required']);
        $token = $login->json('challenge_token');

        $this->postJson('/api/two-factor/challenge', [
            'challenge_token' => $token,
            'code' => $this->currentOtp($user),
        ])->assertOk()->assertJson(['success' => true, 'token_type' => 'Bearer']);
    }

    public function test_challenge_rejects_wrong_code_and_bad_token(): void
    {
        $user = User::factory()->create();
        $this->enableAndConfirm($user);

        $login = $this->passwordLogin($user->email);
        $token = $login->json('challenge_token');

        $this->postJson('/api/two-factor/challenge', [
            'challenge_token' => $token,
            'code' => '000000',
        ])->assertStatus(422);

        $this->postJson('/api/two-factor/challenge', [
            'challenge_token' => 'forged-token',
            'code' => $this->currentOtp($user),
        ])->assertStatus(422);
    }

    public function test_recovery_code_works_once_and_is_consumed(): void
    {
        $user = User::factory()->create();
        $codes = $this->enableAndConfirm($user);

        $login = $this->passwordLogin($user->email);
        $token = $login->json('challenge_token');

        $this->postJson('/api/two-factor/challenge', [
            'challenge_token' => $token,
            'code' => $codes[0],
        ])->assertOk();

        $login2 = $this->passwordLogin($user->email);
        $this->postJson('/api/two-factor/challenge', [
            'challenge_token' => $login2->json('challenge_token'),
            'code' => $codes[0],
        ])->assertStatus(422);

        $this->assertCount(9, $user->fresh()->recoveryCodes());
    }

    public function test_disable_requires_password_and_clears_state(): void
    {
        $this->seed(EmailTemplateSeeder::class);
        $user = User::factory()->create();
        $this->enableAndConfirm($user);

        $this->withHeader('Authorization', 'Bearer ' . $user->createToken('auth_token')->plainTextToken);
        $this->postJson('/api/two-factor/disable', ['password' => 'wrong'])->assertStatus(422);

        $this->postJson('/api/two-factor/disable', ['password' => 'password'])->assertOk();

        $fresh = $user->fresh();
        $this->assertFalse($fresh->twoFactorEnabled());
        $this->assertNull($fresh->two_factor_secret);

        $this->passwordLogin($user->email)
            ->assertOk();
    }

    public function test_recovery_codes_can_be_regenerated_with_a_totp_code(): void
    {
        $user = User::factory()->create();
        $old = $this->enableAndConfirm($user);

        $this->withHeader('Authorization', 'Bearer ' . $user->createToken('auth_token')->plainTextToken);
        $response = $this->postJson('/api/two-factor/recovery-codes', ['code' => $this->currentOtp($user)]);

        $response->assertOk()->assertJsonStructure(['recovery_codes']);
        $new = $response->json('recovery_codes');

        $this->assertNotSame($old, $new);
        $this->assertCount(10, $new);
        $this->assertNotContains($old[0], $user->fresh()->recoveryCodes());
    }
}

<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Tests\TestCase;

class PasskeyTest extends TestCase
{
    use RefreshDatabase;

    private function tokenFor(User $user): string
    {
        return 'Bearer ' . $user->createToken('auth_token')->plainTextToken;
    }

    private function credentialId(): string
    {
        return rtrim(strtr(base64_encode(random_bytes(32)), '+/', '-_'), '=');
    }

    private function fakeCredential(User $user, ?string $id = null): string
    {
        $id ??= $this->credentialId();

        DB::table('webauthn_credentials')->insert([
            'id' => $id,
            'authenticatable_type' => $user->getMorphClass(),
            'authenticatable_id' => $user->id,
            'user_id' => (string) Str::uuid(),
            'alias' => 'Test passkey',
            'counter' => 0,
            'rp_id' => 'localhost',
            'origin' => 'http://localhost:3000',
            'public_key' => 'not-a-real-key',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        return $id;
    }

    public function test_listing_requires_authentication(): void
    {
        $this->getJson('/api/passkeys')->assertStatus(401);
    }

    public function test_user_can_list_their_passkeys(): void
    {
        $user = User::factory()->create();
        $id = $this->fakeCredential($user);

        $response = $this->withHeader('Authorization', $this->tokenFor($user))
            ->getJson('/api/passkeys');

        $response->assertOk()
            ->assertJson(['success' => true])
            ->assertJsonCount(1, 'passkeys')
            ->assertJsonPath('passkeys.0.id', $id)
            ->assertJsonPath('passkeys.0.alias', 'Test passkey');
    }

    public function test_register_options_return_a_challenge_for_the_relying_party(): void
    {
        $user = User::factory()->create();

        $response = $this->withHeader('Authorization', $this->tokenFor($user))
            ->postJson('/api/passkeys/register/options');

        $response->assertOk();
        $this->assertNotEmpty($response->json('challenge'));
        $this->assertSame('localhost', $response->json('rp.id'));
        $this->assertSame($user->email, $response->json('user.name'));
    }

    public function test_register_rejects_a_malformed_credential(): void
    {
        $user = User::factory()->create();

        $this->withHeader('Authorization', $this->tokenFor($user))
            ->postJson('/api/passkeys/register', [])
            ->assertStatus(422);

        $this->withHeader('Authorization', $this->tokenFor($user))
            ->postJson('/api/passkeys/register', [
                'id' => 'AAAA',
                'rawId' => 'AAAA',
                'type' => 'public-key',
                'response' => [
                    'clientDataJSON' => base64_encode('not-json'),
                    'attestationObject' => base64_encode('not-an-attestation'),
                ],
            ])
            ->assertStatus(422);
    }

    public function test_login_options_rejects_unknown_or_passkeyless_accounts(): void
    {
        $this->postJson('/api/passkeys/login/options', ['email' => 'nobody@example.com'])
            ->assertStatus(422);

        $withoutPasskey = User::factory()->create();
        $this->postJson('/api/passkeys/login/options', ['email' => $withoutPasskey->email])
            ->assertStatus(422);
    }

    public function test_login_options_include_the_users_credentials(): void
    {
        $user = User::factory()->create();
        $id = $this->fakeCredential($user);

        $response = $this->postJson('/api/passkeys/login/options', ['email' => $user->email]);

        $response->assertOk();
        $this->assertNotEmpty($response->json('challenge'));
        $this->assertSame($id, $response->json('allowCredentials.0.id'));
        $this->assertSame('localhost', $response->json('rpId'));
    }

    public function test_login_rejects_a_malformed_assertion(): void
    {
        $user = User::factory()->create();
        $this->fakeCredential($user);

        $this->postJson('/api/passkeys/login', [
            'email' => $user->email,
            'id' => 'AAAA',
            'rawId' => 'AAAA',
            'type' => 'public-key',
            'response' => [
                'authenticatorData' => base64_encode('x'),
                'clientDataJSON' => base64_encode('x'),
                'signature' => base64_encode('x'),
            ],
        ])->assertStatus(422);
    }

    public function test_passkey_cannot_be_deleted_by_another_user(): void
    {
        $owner = User::factory()->create();
        $intruder = User::factory()->create();
        $id = $this->fakeCredential($owner);

        $this->withHeader('Authorization', $this->tokenFor($intruder))
            ->deleteJson("/api/passkeys/{$id}")
            ->assertStatus(404);

        $this->assertDatabaseHas('webauthn_credentials', ['id' => $id]);
    }

    public function test_owner_can_delete_their_passkey(): void
    {
        $owner = User::factory()->create();
        $id = $this->fakeCredential($owner);

        $this->withHeader('Authorization', $this->tokenFor($owner))
            ->deleteJson("/api/passkeys/{$id}")
            ->assertOk();

        $this->assertDatabaseMissing('webauthn_credentials', ['id' => $id]);
    }
}

<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class BroadcastingAuthTest extends TestCase
{
    use RefreshDatabase;

    public function test_broadcasting_auth_requires_a_token(): void
    {
        $this->postJson('/api/broadcasting/auth', [
            'channel_name' => 'private-App.Models.User.1',
            'socket_id' => '123.456',
        ])->assertUnauthorized();
    }

    public function test_authenticated_user_can_authorize_their_own_channel(): void
    {
        $user = User::factory()->create(['role' => 'client']);
        Sanctum::actingAs($user);

        $this->postJson('/api/broadcasting/auth', [
            'channel_name' => "private-App.Models.User.{$user->id}",
            'socket_id' => '123.456',
        ])->assertOk()->assertJsonStructure(['auth']);
    }

    public function test_authenticated_user_cannot_authorize_someone_elses_channel(): void
    {
        $owner = User::factory()->create(['role' => 'client']);
        User::factory()->create(['role' => 'client']);
        Sanctum::actingAs($owner);

        $other = User::where('id', '!=', $owner->id)->firstOrFail();

        $this->postJson('/api/broadcasting/auth', [
            'channel_name' => "private-App.Models.User.{$other->id}",
            'socket_id' => '123.456',
        ])->assertForbidden();
    }
}

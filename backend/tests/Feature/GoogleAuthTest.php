<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class GoogleAuthTest extends TestCase
{
    use RefreshDatabase;

    public function test_google_redirect_returns_503_when_credentials_are_missing(): void
    {
        config(['services.google.client_id' => null, 'services.google.client_secret' => null]);

        $response = $this->getJson('/api/auth/google');

        $response->assertStatus(503);
        $response->assertJsonPath('success', false);
        $this->assertStringContainsString('GOOGLE_CLIENT_ID', $response->json('message'));
    }

    public function test_google_redirect_builds_consent_url_with_client_id(): void
    {
        config([
            'services.google.client_id' => 'test-client-id',
            'services.google.client_secret' => 'test-client-secret',
            'services.google.redirect' => 'http://localhost/api/auth/google/callback',
        ]);

        $response = $this->get('/api/auth/google');

        $response->assertRedirect();
        $location = $response->headers->get('Location');
        $this->assertStringContainsString('accounts.google.com', $location);
        $this->assertStringContainsString('client_id=test-client-id', $location);
    }
}

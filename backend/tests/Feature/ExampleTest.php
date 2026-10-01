<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ExampleTest extends TestCase
{
    use RefreshDatabase;

    /**
     * The API has no web root; public routes should answer JSON.
     */
    public function test_the_application_returns_a_successful_response(): void
    {
        $this->getJson('/api/settings')->assertOk()->assertJsonPath('success', true);
    }
}

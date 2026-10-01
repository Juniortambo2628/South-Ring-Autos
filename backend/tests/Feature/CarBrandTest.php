<?php

namespace Tests\Feature;

use App\Models\CarBrand;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class CarBrandTest extends TestCase
{
    use RefreshDatabase;

    public function test_migration_seeds_default_brands(): void
    {
        $response = $this->getJson('/api/car-brands')->assertOk();

        $this->assertCount(12, $response->json('data'));
        $this->assertSame('Audi', $response->json('data.0.name'));
    }

    public function test_inactive_brands_are_hidden_from_public_listing(): void
    {
        CarBrand::create(['name' => 'Hidden Make', 'logo' => '/car-logos/bmw.png', 'is_active' => false, 'sort_order' => 99]);

        $this->getJson('/api/car-brands')->assertOk()->assertJsonMissing(['name' => 'Hidden Make']);

        Sanctum::actingAs(User::factory()->create(['role' => 'admin']));
        $this->getJson('/api/admin/car-brands')->assertOk()->assertJsonFragment(['name' => 'Hidden Make']);
    }

    public function test_brand_writes_require_admin_role(): void
    {
        $payload = ['name' => 'Probe Motors', 'logo' => '/car-logos/bmw.png'];

        $this->postJson('/api/admin/car-brands', $payload)->assertUnauthorized();

        Sanctum::actingAs(User::factory()->create(['role' => 'client']));
        $this->postJson('/api/admin/car-brands', $payload)->assertForbidden();
    }

    public function test_admin_can_create_toggle_update_and_delete_a_brand(): void
    {
        Sanctum::actingAs(User::factory()->create(['role' => 'admin']));

        $created = $this->postJson('/api/admin/car-brands', [
            'name' => 'Probe Motors',
            'logo' => '/car-logos/bmw.png',
            'sort_order' => 50,
        ])->assertCreated();

        $id = $created->json('data.id');

        $this->patchJson("/api/admin/car-brands/{$id}/toggle")->assertOk()
            ->assertJsonPath('data.is_active', false);

        $this->getJson('/api/car-brands')->assertJsonMissing(['id' => $id]);

        $this->patchJson("/api/admin/car-brands/{$id}", ['name' => 'Probe Motors Ltd'])->assertOk()
            ->assertJsonPath('data.name', 'Probe Motors Ltd');

        $this->deleteJson("/api/admin/car-brands/{$id}")->assertOk();
        $this->assertDatabaseMissing('car_brands_carousel', ['id' => $id]);
    }
}

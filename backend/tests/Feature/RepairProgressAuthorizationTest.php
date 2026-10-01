<?php

namespace Tests\Feature;

use App\Models\Booking;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class RepairProgressAuthorizationTest extends TestCase
{
    use RefreshDatabase;

    private function makeBookingFor(string $ownerEmail): Booking
    {
        $clientId = DB::table('clients')->insertGetId([
            'name' => 'Booking Owner',
            'email' => $ownerEmail,
            'phone' => '0700000000',
            'password' => 'secret',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        return Booking::create([
            'client_id' => $clientId,
            'name' => 'Booking Owner',
            'phone' => '0700000000',
            'email' => $ownerEmail,
            'registration' => 'KDA 123X',
            'service' => 'General Service',
            'date' => '2026-10-10',
        ]);
    }

    public function test_owner_of_the_booking_can_view_progress(): void
    {
        $booking = $this->makeBookingFor('owner@example.test');
        $owner = User::factory()->create(['email' => 'owner@example.test', 'role' => 'client']);

        Sanctum::actingAs($owner);

        $this->getJson("/api/bookings/{$booking->id}/progress")->assertOk();
    }

    public function test_another_client_cannot_view_progress(): void
    {
        $booking = $this->makeBookingFor('owner@example.test');
        $stranger = User::factory()->create(['role' => 'client']);

        Sanctum::actingAs($stranger);

        $this->getJson("/api/bookings/{$booking->id}/progress")->assertForbidden();
    }

    public function test_admin_can_view_any_progress(): void
    {
        $booking = $this->makeBookingFor('owner@example.test');
        Sanctum::actingAs(User::factory()->create(['role' => 'admin']));

        $this->getJson("/api/bookings/{$booking->id}/progress")->assertOk();
    }

    public function test_guest_cannot_view_progress(): void
    {
        $booking = $this->makeBookingFor('owner@example.test');

        $this->getJson("/api/bookings/{$booking->id}/progress")->assertUnauthorized();
    }
}

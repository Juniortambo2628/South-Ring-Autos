<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Models\Booking;
use App\Models\Vehicle;
use App\Models\Notification;

class DashboardController extends Controller
{
    public function stats(Request $request)
    {
        try {
            $user = $request->user();

            // Resolve client record (vehicles/bookings use clients table, not users)
            $client = DB::table('clients')->where('email', $user->email)->first();
            $clientId = $client ? $client->id : null;

            $stats = [
                'total_bookings' => Booking::where('email', $user->email)->count(),
                'total_vehicles' => $clientId ? Vehicle::where('client_id', $clientId)->count() : 0,
                'loyalty_points' => $user->loyalty_points ?? 0,
                'membership_tier' => $user->membership_tier ?? 'Standard',
                'upcoming_appointments' => Booking::where('email', $user->email)
                    ->where('date', '>=', now()->toDateString())
                    ->orderBy('date', 'asc')
                    ->take(5)
                    ->get(),
                'recent_vehicles' => $clientId
                    ? Vehicle::where('client_id', $clientId)->latest()->take(3)->get()
                    : [],
            ];

            return response()->json([
                'success' => true,
                'data' => $stats
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch dashboard stats: ' . $e->getMessage()
            ], 500);
        }
    }
}

<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Booking;
use App\Models\Vehicle;
use App\Models\Payment;
use Illuminate\Http\Request;

class AdminClientController extends Controller
{
    public function index()
    {
        $clients = User::where('role', '!=', 'admin')
            ->withCount(['bookings', 'vehicles'])
            ->latest()
            ->get()
            ->map(function ($user) {
                $totalSpent = Payment::where('user_id', $user->id)
                    ->where('status', 'completed')
                    ->sum('amount');

                return [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'phone' => $user->phone,
                    'loyalty_points' => $user->loyalty_points ?? 0,
                    'membership_tier' => $user->membership_tier ?? 'Bronze',
                    'bookings_count' => $user->bookings_count,
                    'vehicles_count' => $user->vehicles_count,
                    'total_spent' => $totalSpent,
                    'created_at' => $user->created_at,
                ];
            });

        return response()->json(['success' => true, 'data' => $clients]);
    }

    public function history($id)
    {
        $user = User::findOrFail($id);
        
        $bookings = Booking::with(['vehicle'])
            ->where('client_id', $user->id)
            ->latest()
            ->get();

        $vehicles = Vehicle::where('client_id', $user->id)->get();
        
        $payments = Payment::with('booking')
            ->where('user_id', $user->id)
            ->latest()
            ->get();

        return response()->json([
            'success' => true,
            'data' => [
                'user' => $user,
                'bookings' => $bookings,
                'vehicles' => $vehicles,
                'payments' => $payments,
            ],
        ]);
    }
}

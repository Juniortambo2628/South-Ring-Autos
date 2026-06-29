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
        $spentByUser = Payment::where('status', 'completed')
            ->selectRaw('user_id, SUM(amount) as total_spent')
            ->groupBy('user_id')
            ->pluck('total_spent', 'user_id');

        $clients = User::where('role', '!=', 'admin')
            ->withCount(['bookings', 'vehicles'])
            ->latest()
            ->get()
            ->map(function ($user) use ($spentByUser) {
                return [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'phone' => $user->phone,
                    'loyalty_points' => $user->loyalty_points ?? 0,
                    'membership_tier' => $user->membership_tier ?? 'Bronze',
                    'bookings_count' => $user->bookings_count,
                    'vehicles_count' => $user->vehicles_count,
                    'total_spent' => (float) ($spentByUser->get($user->id) ?? 0),
                    'created_at' => $user->created_at,
                ];
            });

        return response()->json(['success' => true, 'data' => $clients]);
    }

    public function history($id)
    {
        $user = User::with('client')->findOrFail($id);
        
        $clientId = $user->client ? $user->client->id : null;

        $bookings = Booking::with(['vehicle'])
            ->where(function($q) use ($user, $clientId) {
                $q->where('email', $user->email);
                if ($clientId) {
                    $q->orWhere('client_id', $clientId);
                }
            })
            ->latest()
            ->get();

        $vehicles = Vehicle::where(function($q) use ($user, $clientId) {
            if ($clientId) {
                $q->where('client_id', $clientId);
            } else {
                $q->whereRaw('0 = 1'); 
            }
        })->get();
        
        $payments = Payment::with(['booking', 'journal'])
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

    public function destroy($id)
    {
        $user = User::findOrFail($id);

        if ($user->role === 'admin') {
            return response()->json([
                'success' => false,
                'message' => 'Cannot delete admin users',
            ], 400);
        }

        $user->delete();

        return response()->json([
            'success' => true,
            'message' => 'Client deleted successfully',
        ]);
    }
}

<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\Vehicle;
use App\Models\User;
use App\Http\Resources\BookingResource;
use App\Http\Resources\VehicleResource;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class ClientDashboardController extends Controller
{
    /**
     * Get dashboard summary stats for the client.
     */
    public function stats(Request $request)
    {
        $user = $request->user();
        
        $activeBookings = Booking::where('email', $user->email)
            ->whereNotIn('status', ['completed', 'cancelled'])
            ->count();
            
        $completedBookings = Booking::where('email', $user->email)
            ->where('status', 'completed')
            ->count();
            
        $vehicleCount = Vehicle::where('client_id', function($query) use ($user) {
            $query->select('id')->from('clients')->where('email', $user->email);
        })->count();

        $totalSpent = DB::table('payments')
            ->join('bookings', 'payments.booking_id', '=', 'bookings.id')
            ->where('bookings.email', $user->email)
            ->where('payments.status', 'completed')
            ->sum('payments.amount');
            
        $pendingPayment = DB::table('payments')
            ->join('bookings', 'payments.booking_id', '=', 'bookings.id')
            ->where('bookings.email', $user->email)
            ->where('payments.status', 'pending')
            ->sum('payments.amount');

        return response()->json([
            'success' => true,
            'stats' => [
                'active_bookings' => $activeBookings,
                'completed_bookings' => $completedBookings,
                'vehicle_count' => $vehicleCount,
                'total_spent' => (float)$totalSpent,
                'pending_payment' => (float)$pendingPayment,
            ]
        ]);
    }

    /**
     * List user's bookings.
     */
    public function bookings(Request $request): AnonymousResourceCollection
    {
        $user = $request->user();
        $bookings = Booking::with(['vehicle', 'client'])
            ->where('email', $user->email)
            ->latest()
            ->get();
            
        return BookingResource::collection($bookings);
    }

    /**
     * List user's vehicles.
     */
    public function vehicles(Request $request): AnonymousResourceCollection
    {
        $user = $request->user();
        
        $vehicles = Vehicle::whereHas('client', function($query) use ($user) {
            $query->where('email', $user->email);
        })->get();
            
        return VehicleResource::collection($vehicles);
    }

    /**
     * Store a new vehicle.
     */
    public function storeVehicle(Request $request)
    {
        $user = $request->user();
        
        $validated = $request->validate([
            'make' => 'required|string|max:50',
            'model' => 'required|string|max:50',
            'year' => 'nullable|integer|min:1900|max:'.(date('Y')+1),
            'registration' => 'required|string|max:20|unique:vehicles,registration',
            'color' => 'nullable|string|max:30',
            'vin' => 'nullable|string|max:50',
            'engine_size' => 'nullable|string|max:20',
            'fuel_type' => 'nullable|string|max:20|in:Petrol,Diesel,Hybrid,Electric',
            'mileage' => 'nullable|integer|min:0',
            'notes' => 'nullable|string',
        ]);

        return DB::transaction(function() use ($user, $validated) {
            $client = DB::table('clients')->where('email', $user->email)->first();
            
            if (!$client) {
                $clientId = DB::table('clients')->insertGetId([
                    'name' => $user->name,
                    'email' => $user->email,
                    'phone' => $user->phone ?? '',
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            } else {
                $clientId = $client->id;
            }

            $validated['client_id'] = $clientId;
            $vehicle = Vehicle::create($validated);
            
            return (new VehicleResource($vehicle))
                ->additional(['success' => true, 'message' => 'Vehicle added successfully']);
        });
    }

    /**
     * Update profile information.
     */
    public function updateProfile(Request $request)
    {
        $user = $request->user();
        
        $validated = $request->validate([
            'name' => 'required|string|max:100',
            'phone' => 'nullable|string|max:20',
            'address' => 'nullable|string',
            'current_password' => 'nullable|required_with:new_password|string',
            'new_password' => 'nullable|string|min:8|max:100|confirmed',
        ]);

        if (!empty($validated['new_password'])) {
            if (!Hash::check($validated['current_password'], $user->password)) {
                return response()->json([
                    'success' => false,
                    'message' => 'The provided current password does not match our records.'
                ], 422);
            }
            $user->password = Hash::make($validated['new_password']);
        }

        $user->name = $validated['name'];
        $user->phone = $validated['phone'];
        $user->address = $validated['address'];
        $user->save();
        
        // Synchronize with legacy clients table
        DB::table('clients')->where('email', $user->email)->update([
            'name' => $user->name,
            'phone' => $user->phone,
            'address' => $user->address,
            'updated_at' => now(),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Profile updated successfully',
            'user' => $user
        ]);
    }
}

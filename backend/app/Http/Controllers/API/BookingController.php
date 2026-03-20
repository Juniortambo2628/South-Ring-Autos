<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\Client;
use App\Models\Vehicle;
use App\Http\Resources\BookingResource;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;
use App\Models\EmailTemplate;
use App\Mail\DynamicEmail;
use App\Notifications\AppNotification;
use App\Models\User;

class BookingController extends Controller
{
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:100',
            'phone' => 'required|string|max:20',
            'email' => 'nullable|email|max:100',
            'registration' => 'required|string|max:50',
            'service' => 'required|string|max:100',
            'date' => 'nullable|date',
            'preferred_time' => 'nullable|string|max:50',
            'message' => 'nullable|string',
            'vehicle_make' => 'nullable|string|max:50',
            'vehicle_model' => 'nullable|string|max:50',
            'vehicle_year' => 'nullable|integer',
            'vehicle_fuel_type' => 'nullable|string|max:50',
        ]);

        return DB::transaction(function () use ($validated, $request) {
            $user = $request->user('sanctum');
            $client = null;

            // 1. Handle Client/User identification
            if ($user) {
                // Logged-in user: find or create matching client record
                $client = Client::where('email', $user->email)->first();
                if (!$client) {
                    $client = Client::create([
                        'name' => $user->name,
                        'email' => $user->email,
                        'phone' => $user->phone ?? $validated['phone'],
                    ]);
                }
                $client_id = $client->id;
            } else if (!empty($validated['email'])) {
                $client = Client::where('email', $validated['email'])->first();
                
                if (!$client) {
                    $password = Str::random(8);
                    $client = Client::create([
                        'name' => $validated['name'],
                        'email' => $validated['email'],
                        'phone' => $validated['phone'],
                        'password' => Hash::make($password),
                    ]);
                }
                $client_id = $client->id;
            } else {
                $client_id = null;
            }

            // 2. Find or Create Vehicle
            $vehicle = null;
            if ($client_id) {
                $vehicle = Vehicle::where('client_id', $client_id)
                    ->where('registration', $validated['registration'])
                    ->first();

                if (!$vehicle && !empty($validated['vehicle_make'])) {
                    $vehicle = Vehicle::create([
                        'client_id' => $client_id,
                        'make' => $validated['vehicle_make'],
                        'model' => $validated['vehicle_model'],
                        'year' => $validated['vehicle_year'] ?? null,
                        'fuel_type' => $validated['vehicle_fuel_type'] ?? null,
                        'registration' => $validated['registration'],
                    ]);
                }
            }

            $booking = Booking::create([
                'client_id' => $client_id,
                'vehicle_id' => $vehicle ? $vehicle->id : null,
                'name' => $validated['name'],
                'phone' => $validated['phone'],
                'email' => $validated['email'] ?? ($user ? $user->email : null),
                'registration' => $validated['registration'],
                'service' => $validated['service'],
                'date' => $validated['date'] ?? null,
                'preferred_time' => $validated['preferred_time'] ?? null,
                'message' => $validated['message'] ?? null,
                'status' => 'pending',
            ]);

            if ($booking->email) {
                try {
                    $template = EmailTemplate::where('type', 'booking_received')->where('is_active', true)->first();
                    if ($template) {
                        Mail::to($booking->email)->send(new DynamicEmail($template, [
                            'name' => $booking->name,
                            'service' => $booking->service,
                            'registration' => $booking->registration,
                            'reference' => 'SRA-' . str_pad($booking->id, 6, '0', STR_PAD_LEFT),
                            'date' => $booking->date ? date('Y-m-d', strtotime($booking->date)) : 'N/A',
                            'time' => $booking->preferred_time ?? ($booking->date ? date('H:i', strtotime($booking->date)) : 'N/A'),
                        ]));
                    }
                } catch (\Exception $e) {
                    Log::error("Failed to send booking created email to {$booking->email}: " . $e->getMessage());
                }

                // Send real-time notification to User if they have an account
                $notifiableUser = User::where('email', $booking->email)->first();
                if ($notifiableUser) {
                    $notifiableUser->notify(new AppNotification(
                        'Booking Received',
                        "Your {$booking->service} booking for {$booking->registration} has been received and is pending review.",
                        'info',
                        '/dashboard/bookings'
                    ));
                }
            }

            // Notify Admins
            try {
                $admins = User::where('role', 'admin')->get();
                foreach ($admins as $admin) {
                    $admin->notify(new AppNotification(
                        'New Booking Request',
                        "New booking from {$booking->name} ({$booking->registration}) for {$booking->service}.",
                        'info',
                        '/admin/bookings'
                    ));
                }
            } catch (\Exception $e) {
                Log::error("Failed to notify admins of new booking: " . $e->getMessage());
            }

            return response()->json([
                'success' => true,
                'message' => 'Booking submitted successfully',
                'booking' => $booking,
                'reference' => 'SRA-' . str_pad($booking->id, 6, '0', STR_PAD_LEFT),
            ], 201);
        });
    }

    public function index()
    {
        $bookings = Booking::with(['client', 'vehicle'])->latest()->get();
        return response()->json(['success' => true, 'data' => BookingResource::collection($bookings)]);
    }

    public function userBookings(Request $request)
    {
        $user = $request->user('sanctum');
        if (!$user) {
            return response()->json(['success' => false, 'message' => 'Unauthorized'], 401);
        }

        // Resolve client record from clients table
        $client = \Illuminate\Support\Facades\DB::table('clients')->where('email', $user->email)->first();
        $clientId = $client ? $client->id : null;

        // Query by email (reliable) or client_id (for users who booked while logged in)
        $bookings = Booking::with('vehicle')
            ->where(function ($q) use ($user, $clientId) {
                $q->where('email', $user->email);
                if ($clientId) {
                    $q->orWhere('client_id', $clientId);
                }
            })
            ->latest()
            ->get();

        return response()->json([
            'success' => true,
            'data' => BookingResource::collection($bookings)
        ]);
    }

    public function updateStatus(Request $request, $id)
    {
        $validated = $request->validate([
            'status' => 'required|string|in:pending,confirmed,cancelled,completed',
            'estimated_cost' => 'nullable|numeric',
            'actual_cost' => 'nullable|numeric',
        ]);

        $booking = Booking::findOrFail($id);
        $oldStatus = $booking->status;
        $booking->update($validated);

        if ($booking->status !== $oldStatus && $booking->email) {
            try {
                $template = EmailTemplate::where('type', 'booking_status_updated')->where('is_active', true)->first();
                if ($template) {
                    Mail::to($booking->email)->send(new DynamicEmail($template, [
                        'name' => $booking->name,
                        'status' => $booking->status,
                        'registration' => $booking->registration,
                    ]));
                }
            } catch (\Exception $e) {
                Log::error("Failed to send booking status email to {$booking->email}: " . $e->getMessage());
            }

            $notifiableUser = User::where('email', $booking->email)->first();
            if ($notifiableUser) {
                $statusMsg = $booking->status === 'confirmed' ? "has been confirmed! Please check your invoice." : "status is now: {$booking->status}";
                $notifiableUser->notify(new AppNotification(
                    'Booking Status Updated',
                    "Your booking for {$booking->registration} {$statusMsg}",
                    $booking->status === 'confirmed' ? 'success' : 'info',
                    '/dashboard/bookings'
                ));
            }
        }

        return response()->json([
            'success' => true,
            'message' => 'Booking status updated successfully',
            'booking' => $booking->load(['client', 'vehicle'])
        ]);
    }
}

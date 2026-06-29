<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\RepairProgress;
use App\Models\Booking;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class RepairProgressController extends Controller
{
    // Client: View progress for a specific booking
    public function show($bookingId)
    {
        $user = Auth::user();
        $booking = Booking::with('client')->findOrFail($bookingId);

        // Authorization: user must own this booking OR be an admin
        if ($booking->client_id && $booking->client && $booking->client->user_id !== $user->id && $user->role !== 'admin') {
            return response()->json(['success' => false, 'message' => 'Unauthorized.'], 403);
        }

        $progress = RepairProgress::with('updater')->where('booking_id', $bookingId)
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $progress,
        ]);
    }

    // Admin: Add a progress update to a booking
    public function store(Request $request, $bookingId)
    {
        $request->validate([
            'stage' => 'required|string|max:50',
            'description' => 'nullable|string',
            'progress_percentage' => 'required|integer|min:0|max:100',
        ]);

        $booking = Booking::findOrFail($bookingId);
        $user = $request->user('sanctum');

        $progress = RepairProgress::create([
            'booking_id' => $booking->id,
            'stage' => $request->stage,
            'description' => $request->description,
            'progress_percentage' => $request->progress_percentage,
            'updated_by' => $user ? $user->id : null,
            'created_at' => now(),
        ]);

        // Auto-update booking status if progress is 100%
        if ($request->progress_percentage >= 100) {
            $booking->update(['status' => 'completed']);
        } elseif ($booking->status === 'pending') {
            $booking->update(['status' => 'confirmed']);
        }

        return response()->json([
            'success' => true,
            'message' => 'Progress updated',
            'data' => $progress,
        ], 201);
    }
}

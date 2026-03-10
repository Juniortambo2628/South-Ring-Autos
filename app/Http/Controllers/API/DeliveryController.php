<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\DeliveryRequest;
use App\Models\Booking;
use Illuminate\Http\Request;

class DeliveryController extends Controller
{
    // Client: Create a delivery request
    public function store(Request $request)
    {
        $request->validate([
            'booking_id' => 'required|exists:bookings,id',
            'type' => 'required|in:pickup,dropoff',
            'address' => 'required|string',
            'city' => 'nullable|string|max:100',
            'preferred_date' => 'nullable|date',
            'preferred_time' => 'nullable',
            'contact_phone' => 'required|string|max:20',
            'special_instructions' => 'nullable|string',
        ]);

        $user = $request->user('sanctum');

        $delivery = DeliveryRequest::create([
            'booking_id' => $request->booking_id,
            'client_id' => $user ? $user->id : null,
            'type' => $request->type,
            'address' => $request->address,
            'city' => $request->city,
            'preferred_date' => $request->preferred_date,
            'preferred_time' => $request->preferred_time,
            'contact_phone' => $request->contact_phone,
            'special_instructions' => $request->special_instructions,
            'status' => 'requested',
            'created_at' => now(),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Delivery request submitted',
            'data' => $delivery,
        ], 201);
    }

    // Admin: Get all delivery requests
    public function index()
    {
        $deliveries = DeliveryRequest::with(['booking', 'assignee'])
            ->latest('created_at')
            ->get();

        return response()->json(['success' => true, 'data' => $deliveries]);
    }

    // Admin: Update delivery (assign driver, update status)
    public function update(Request $request, $id)
    {
        $request->validate([
            'status' => 'nullable|string|in:requested,scheduled,out_for_delivery,completed,cancelled',
            'assigned_to' => 'nullable|integer',
            'scheduled_date' => 'nullable|date',
        ]);

        $delivery = DeliveryRequest::findOrFail($id);

        $data = $request->only(['status', 'assigned_to', 'scheduled_date']);
        
        if ($request->status === 'completed' && $delivery->status !== 'completed') {
            $data['completed_at'] = now();
        }

        $delivery->update(array_filter($data, fn($v) => $v !== null));

        return response()->json([
            'success' => true,
            'message' => 'Delivery updated',
            'data' => $delivery->fresh(['booking', 'client', 'assignee']),
        ]);
    }
}

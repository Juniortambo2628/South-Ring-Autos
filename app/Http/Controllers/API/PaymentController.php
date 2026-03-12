<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Payment;
use App\Models\Booking;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class PaymentController extends Controller
{
    // Admin: Get all payments
    public function index()
    {
        $payments = Payment::with(['user', 'booking'])->latest()->get();
        return response()->json(['success' => true, 'data' => $payments]);
    }

    // Client: Get their own payments
    public function userPayments(Request $request)
    {
        $user = $request->user('sanctum');
        
        $payments = Payment::with('booking')
            ->where('user_id', $user->id)
            ->latest()
            ->get();
            
        return response()->json(['success' => true, 'data' => $payments]);
    }

    // Initialize a new payment
    public function initialize(Request $request)
    {
        $request->validate([
            'booking_id' => 'required|exists:bookings,id',
            'amount' => 'required|numeric|min:0',
            'payment_method' => 'required|string|in:mpesa,card,cash',
        ]);

        $user = $request->user('sanctum');
        $booking = Booking::findOrFail($request->booking_id);

        // Security check — resolve client from user email, since client_id references clients table
        if ($user && $user->role !== 'admin') {
            $client = \Illuminate\Support\Facades\DB::table('clients')->where('email', $user->email)->first();
            if (!$client || $booking->client_id !== $client->id) {
                return response()->json(['success' => false, 'message' => 'Unauthorized access to this booking'], 403);
            }
        }

        // Check if an active payment already exists
        $existingPayment = Payment::where('booking_id', $booking->id)
            ->whereIn('status', ['pending', 'completed'])
            ->first();

        if ($existingPayment && $existingPayment->status === 'completed') {
             return response()->json(['success' => false, 'message' => 'This booking is already fully paid'], 400);
        }

        if ($existingPayment) {
             // We can return the existing invoice if pending
             return response()->json(['success' => true, 'data' => $existingPayment]);
        }

        // Generate a unique invoice number
        $invoiceNumber = 'INV-' . strtoupper(Str::random(8));

        $payment = Payment::create([
            'booking_id' => $booking->id,
            'user_id' => $user ? $user->id : null,
            'amount' => $request->amount,
            'payment_method' => $request->payment_method,
            'invoice_number' => $invoiceNumber,
            'status' => 'pending',
            // In a real app, transaction_reference comes back from the payment gateway
            'transaction_reference' => null, 
        ]);

        return response()->json([
            'success' => true, 
            'message' => 'Payment initialized',
            'data' => $payment
        ], 201);
    }

    // Admin: Manually verify/update status
    public function updateStatus(Request $request, $id)
    {
        $request->validate([
            'status' => 'required|string|in:pending,completed,failed',
            'transaction_reference' => 'nullable|string'
        ]);

        $payment = Payment::findOrFail($id);
        
        $updateData = ['status' => $request->status];
        if ($request->has('transaction_reference')) {
             $updateData['transaction_reference'] = $request->transaction_reference;
        }
        
        if ($request->status === 'completed' && $payment->status !== 'completed') {
            $updateData['paid_at'] = now();
        }

        $payment->update($updateData);

        return response()->json([
            'success' => true,
            'message' => 'Payment status updated',
            'data' => $payment
        ]);
    }
}

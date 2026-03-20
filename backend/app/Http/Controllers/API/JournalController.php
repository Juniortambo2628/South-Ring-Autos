<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Journal;
use App\Models\JournalPurchase;
use App\Http\Resources\JournalResource;
use App\Http\Resources\JournalPurchaseResource;
use Illuminate\Http\Request;
use Carbon\Carbon;
use Illuminate\Support\Str;

class JournalController extends Controller
{
    public function index(Request $request)
    {
        // Try to manually authenticate user for this request if a token is present
        if ($request->bearerToken()) {
            \auth('sanctum')->authenticate();
        }

        $journals = Journal::where('is_active', true)->orderBy('year', 'desc')->get();
        
        return JournalResource::collection($journals)->additional(['success' => true]);
    }

    public function show(Request $request, $id)
    {
        // Try to manually authenticate user for this request if a token is present
        if ($request->bearerToken()) {
            \auth('sanctum')->authenticate();
        }

        $journal = Journal::findOrFail($id);
        
        return (new JournalResource($journal))->additional(['success' => true]);
    }

    public function checkAccess(Request $request, $year)
    {
        $user = $request->user();
        
        if (!$user) {
            return response()->json(['has_access' => false, 'message' => 'Login required'], 401);
        }

        // Current year is free
        if ($year == Carbon::now()->year) {
            return response()->json(['has_access' => true]);
        }

        // Admins automatically get access to all journals
        if ($user->role === 'admin' || $user->email === 'admin@southringautos.com') {
            return response()->json(['has_access' => true]);
        }

        // Check if user has purchased the journal for this year
        $hasPurchased = JournalPurchase::where('user_id', $user->id)
            ->whereHas('journal', function($query) use ($year) {
                $query->where('year', $year);
            })->exists();

        return response()->json(['has_access' => $hasPurchased]);
    }

    public function purchase(Request $request)
    {
        $request->validate([
            'journal_id' => 'required|exists:journals,id',
            'payment_method' => 'required|string',
        ]);

        $user = $request->user();
        $journal = Journal::findOrFail($request->journal_id);

        // Check if already purchased
        if (JournalPurchase::where('user_id', $user->id)->where('journal_id', $journal->id)->exists()) {
            return response()->json([
                'success' => false,
                'message' => 'You already have access to this journal'
            ], 400);
        }

        // Check for existing pending payment for this journal by this user
        $existingPayment = \App\Models\Payment::where('user_id', $user->id)
            ->where('journal_id', $journal->id)
            ->where('status', 'pending')
            ->first();

        if ($existingPayment) {
            return response()->json([
                'success' => true,
                'message' => "Continue with your payment for {$journal->title}.",
                'data' => [
                    'payment_id' => $existingPayment->id,
                    'invoice_number' => $existingPayment->invoice_number,
                    'amount' => $existingPayment->amount,
                ]
            ]);
        }

        // Create Pending Payment Record
        $payment = \App\Models\Payment::create([
            'user_id' => $user->id,
            'amount' => $journal->price,
            'payment_method' => $request->payment_method,
            'status' => 'pending',
            'payment_type' => 'journal',
            'journal_id' => $journal->id,
            'invoice_number' => 'JRN-' . strtoupper(Str::random(8)),
        ]);

        return response()->json([
            'success' => true,
            'message' => "Invoice generated for {$journal->title}. Please complete the payment.",
            'data' => [
                'payment_id' => $payment->id,
                'invoice_number' => $payment->invoice_number,
                'amount' => $payment->amount,
            ]
        ]);
    }
}

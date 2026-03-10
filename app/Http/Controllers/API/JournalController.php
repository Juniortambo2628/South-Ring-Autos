<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Journal;
use App\Models\JournalPurchase;
use App\Http\Resources\JournalResource;
use App\Http\Resources\JournalPurchaseResource;
use Illuminate\Http\Request;
use Carbon\Carbon;

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

        // Create Payment Record (Simulated for now, would link to gateway)
        $payment = \App\Models\Payment::create([
            'user_id' => $user->id,
            'amount' => $journal->price,
            'payment_method' => $request->payment_method,
            'status' => 'completed', // In real app, start as 'pending'
            'payment_type' => 'journal',
            'journal_id' => $journal->id,
            'invoice_number' => 'JRN-'.strtoupper(bin2hex(random_bytes(4))),
            'paid_at' => now(),
        ]);

        // Create Purchase record
        $purchase = JournalPurchase::create([
            'user_id' => $user->id,
            'journal_id' => $journal->id,
            'payment_id' => $payment->id,
            'purchased_at' => now(),
        ]);

        return (new JournalPurchaseResource($purchase->load(['journal'])))->additional([
            'success' => true,
            'message' => "Successfully purchased {$journal->title}. You now have full access."
        ]);
    }
}

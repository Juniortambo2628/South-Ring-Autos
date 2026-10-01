<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Journal;
use App\Models\JournalPurchase;
use App\Http\Resources\JournalResource;
use App\Http\Resources\JournalPurchaseResource;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class JournalController extends Controller
{
    public function index(Request $request)
    {
        $journals = Journal::where('is_active', true)->orderBy('year', 'desc')->get();
        
        return JournalResource::collection($journals)->additional(['success' => true]);
    }

    public function show(Request $request, $id)
    {
        $journal = Journal::findOrFail($id);
        
        return (new JournalResource($journal))->additional(['success' => true]);
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

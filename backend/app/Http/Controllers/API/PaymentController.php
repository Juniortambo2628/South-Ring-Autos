<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Payment;
use App\Models\Booking;
use App\Models\Setting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Mail;
use App\Models\EmailTemplate;
use App\Mail\DynamicEmail;
use App\Notifications\AppNotification;
use App\Models\User;

class PaymentController extends Controller
{
    /**
     * Get the Paystack secret key from settings or config.
     */
    private function getPaystackSecretKey(): string
    {
        $fromSettings = Setting::where('key', 'paystack_secret_key')->value('value');
        return $fromSettings ?: config('paystack.secret_key', '');
    }

    /**
     * Get the Paystack public key from settings or config.
     */
    public static function getPaystackPublicKey(): string
    {
        $fromSettings = Setting::where('key', 'paystack_public_key')->value('value');
        return $fromSettings ?: config('paystack.public_key', '');
    }

    // ─── Admin: Get all payments ────────────────────────────────────────
    public function index()
    {
        $payments = Payment::with(['booking', 'user', 'journal'])->latest()->get();
        return response()->json(['success' => true, 'data' => $payments]);
    }

    // ─── Client: Get their own payments ─────────────────────────────────
    public function userPayments(Request $request)
    {
        $user = $request->user('sanctum');

        $payments = Payment::with('booking')
            ->where('user_id', $user->id)
            ->latest()
            ->get();

        return response()->json(['success' => true, 'data' => $payments]);
    }

    // ─── Admin: Create an invoice for a booking ─────────────────────────
    public function createInvoice(Request $request)
    {
        $request->validate([
            'booking_id' => 'required|exists:bookings,id',
            'amount' => 'required|numeric|min:1',
            'payment_method' => 'nullable|string|in:paystack,mpesa,card,cash',
            'description' => 'nullable|string|max:255',
        ]);

        $booking = Booking::findOrFail($request->booking_id);

        // Check if an active payment already exists
        $existing = Payment::where('booking_id', $booking->id)
            ->whereIn('status', ['pending', 'completed'])
            ->first();

        if ($existing && $existing->status === 'completed') {
            return response()->json(['success' => false, 'message' => 'This booking is already fully paid'], 400);
        }

        if ($existing) {
            // Update the existing pending payment
            $existing->update([
                'amount' => $request->amount,
                'payment_method' => $request->payment_method ?? 'paystack',
            ]);
            return response()->json([
                'success' => true,
                'message' => 'Invoice updated',
                'data' => $existing->fresh(['booking']),
            ]);
        }

        // Resolve user_id from the booking email
        $user = \App\Models\User::where('email', $booking->email)->first();

        $payment = Payment::create([
            'booking_id' => $booking->id,
            'user_id' => $user ? $user->id : null,
            'amount' => $request->amount,
            'payment_method' => $request->payment_method ?? 'paystack',
            'invoice_number' => 'INV-' . strtoupper(Str::random(8)),
            'status' => 'pending',
        ]);

        // Update booking estimated_cost
        $booking->update(['estimated_cost' => $request->amount]);

        if ($user) {
            $user->notify(new AppNotification(
                'New Invoice Created',
                "An invoice of Ksh " . number_format($request->amount, 2) . " has been generated for your {$booking->service} booking.",
                'info',
                '/dashboard/payments'
            ));
        }

        return response()->json([
            'success' => true,
            'message' => 'Invoice created successfully',
            'data' => $payment->load('booking'),
        ], 201);
    }

    // ─── Paystack: Initialize a transaction ─────────────────────────────
    public function initializePaystack(Request $request)
    {
        $request->validate([
            'payment_id' => 'required|exists:payments,id',
        ]);

        $user = $request->user('sanctum');
        $payment = Payment::findOrFail($request->payment_id);

        // Security: ensure the payment belongs to this user
        if ($payment->user_id && $payment->user_id !== $user->id && $user->role !== 'admin') {
            return response()->json(['success' => false, 'message' => 'Unauthorized'], 403);
        }

        if ($payment->status === 'completed') {
            return response()->json(['success' => false, 'message' => 'Payment already completed'], 400);
        }

        $secretKey = $this->getPaystackSecretKey();
        if (empty($secretKey)) {
            return response()->json([
                'success' => false,
                'message' => 'Payment gateway is not configured. Please contact the administrator.',
            ], 503);
        }

        // Generate a unique reference
        $reference = 'SRA-' . strtoupper(Str::random(12));

        // Paystack amounts are in the smallest currency unit (cents for KES)
        $amountInCents = (int) round($payment->amount * 100);

        $callbackUrl = Setting::where('key', 'paystack_callback_url')->value('value')
            ?: config('paystack.callback_url')
            ?: (rtrim(config('app.frontend_url', 'https://southringautos.com'), '/') . '/dashboard/payments?verify=' . $reference);

        try {
            $request = Http::withToken($secretKey);
            
            if (config('app.env') === 'local') {
                $request->withoutVerifying();
            }

            $response = $request->post('https://api.paystack.co/transaction/initialize', [
                'email' => $user->email,
                'amount' => $amountInCents,
                'reference' => $reference,
                'callback_url' => $callbackUrl,
                'metadata' => [
                    'payment_id' => $payment->id,
                    'invoice_number' => $payment->invoice_number,
                    'booking_id' => $payment->booking_id,
                    'user_id' => $user->id,
                ],
            ]);

            $data = $response->json();

            if (!$response->successful() || !($data['status'] ?? false)) {
                Log::error('Paystack initialize failed', ['response' => $data]);
                return response()->json([
                    'success' => false,
                    'message' => $data['message'] ?? 'Failed to initialize payment',
                ], 502);
            }

            // Store the reference on the payment
            $payment->update(['transaction_reference' => $reference]);

            return response()->json([
                'success' => true,
                'data' => [
                    'authorization_url' => $data['data']['authorization_url'],
                    'access_code' => $data['data']['access_code'],
                    'reference' => $reference,
                ],
            ]);

        } catch (\Exception $e) {
            Log::error('Paystack initialize exception: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Payment service unavailable. Please try again later.',
            ], 503);
        }
    }

    // ─── Paystack: Verify a transaction ─────────────────────────────────
    public function verifyPaystack(Request $request)
    {
        $request->validate([
            'reference' => 'required|string',
        ]);

        $reference = $request->reference;
        $secretKey = $this->getPaystackSecretKey();

        if (empty($secretKey)) {
            return response()->json(['success' => false, 'message' => 'Payment gateway not configured'], 503);
        }

        try {
            $request = Http::withToken($secretKey);

            if (config('app.env') === 'local') {
                $request->withoutVerifying();
            }

            $response = $request->get("https://api.paystack.co/transaction/verify/{$reference}");

            $data = $response->json();

            if (!$response->successful() || !($data['status'] ?? false)) {
                return response()->json([
                    'success' => false,
                    'message' => $data['message'] ?? 'Verification failed',
                ], 400);
            }

            $txData = $data['data'];
            $payment = Payment::where('transaction_reference', $reference)->first();

            if (!$payment) {
                return response()->json(['success' => false, 'message' => 'Payment not found'], 404);
            }

            if ($txData['status'] === 'success') {
                $payment->update([
                    'status' => 'completed',
                    'paid_at' => now(),
                    'payment_method' => 'paystack',
                ]);

                // Fulfillment logic
                $this->fulfillPayment($payment);

                if ($payment->user) {
                    $payment->user->notify(new AppNotification(
                        'Payment Successful',
                        "Your payment of Ksh " . number_format($payment->amount, 2) . " for Invoice {$payment->invoice_number} has been received.",
                        'success',
                        "/dashboard/payments/receipt/{$payment->id}"
                    ));

                    try {
                        $template = EmailTemplate::where('type', 'payment_confirmation')->where('is_active', true)->first();
                        if ($template) {
                            Mail::to($payment->user->email)->send(new DynamicEmail($template, [
                                'name' => $payment->user->name,
                                'amount' => number_format($payment->amount, 2),
                                'invoice_number' => $payment->invoice_number,
                            ]));
                        }
                    } catch (\Exception $e) {
                        Log::error("Failed to send payment confirmation email: " . $e->getMessage());
                    }
                }

                return response()->json([
                    'success' => true,
                    'message' => 'Payment verified successfully',
                    'data' => $payment->fresh(['booking']),
                ]);
            }

            // Payment failed or was abandoned
            $payment->update(['status' => 'failed']);

            return response()->json([
                'success' => false,
                'message' => 'Payment was not successful: ' . ($txData['gateway_response'] ?? 'Unknown'),
            ], 400);

        } catch (\Exception $e) {
            Log::error('Paystack verify exception: ' . $e->getMessage());
            return response()->json(['success' => false, 'message' => 'Verification service unavailable'], 503);
        }
    }

    // ─── Paystack: Webhook handler ──────────────────────────────────────
    public function paystackWebhook(Request $request)
    {
        // Verify webhook signature
        $secretKey = $this->getPaystackSecretKey();
        $signature = $request->header('x-paystack-signature');
        $payload = $request->getContent();

        if (!$signature || !$secretKey) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        $computedSignature = hash_hmac('sha512', $payload, $secretKey);
        if (!hash_equals($computedSignature, $signature)) {
            Log::warning('Paystack webhook: invalid signature');
            return response()->json(['message' => 'Invalid signature'], 401);
        }

        $event = $request->input('event');
        $data = $request->input('data');

        if ($event === 'charge.success') {
            $reference = $data['reference'] ?? null;
            if (!$reference) return response()->json(['message' => 'No reference'], 400);

            $payment = Payment::where('transaction_reference', $reference)->first();

            if ($payment && $payment->status !== 'completed') {
                $payment->update([
                    'status' => 'completed',
                    'paid_at' => now(),
                    'payment_method' => 'paystack',
                ]);

                $this->fulfillPayment($payment);

                Log::info("Paystack webhook: Payment {$payment->invoice_number} completed via webhook");
            }
        }

        return response()->json(['message' => 'Webhook received'], 200);
    }

    // ─── Admin: Manually update payment status ──────────────────────────
    public function updateStatus(Request $request, $id)
    {
        $request->validate([
            'status' => 'required|string|in:pending,completed,failed',
            'transaction_reference' => 'nullable|string',
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
            'data' => $payment,
        ]);
    }

    // ─── Get Paystack public key (for frontend) ─────────────────────────
    public function getPublicKey()
    {
        $key = self::getPaystackPublicKey();
        return response()->json([
            'success' => true,
            'data' => ['public_key' => $key],
        ]);
    }

    // ─── Receipt data ───────────────────────────────────────────────────
    public function receipt(Request $request, $id)
    {
        $payment = Payment::with(['booking', 'user'])->findOrFail($id);

        // Security: user can only see their own receipts
        $user = $request->user('sanctum');
        if ($user->role !== 'admin' && $payment->user_id !== $user->id) {
            return response()->json(['success' => false, 'message' => 'Unauthorized'], 403);
        }

        // Get company info from settings
        $settings = Setting::whereIn('key', [
            'company_name', 'company_phone', 'company_email',
            'company_address', 'company_logo',
        ])->pluck('value', 'key');

        return response()->json([
            'success' => true,
            'data' => [
                'payment' => $payment,
                'company' => $settings,
            ],
        ]);
    }

    /**
     * Handle post-payment success actions (Fulfillment)
     */
    private function fulfillPayment(Payment $payment)
    {
        // 1. Handle Bookings
        if ($payment->booking_id) {
            Booking::where('id', $payment->booking_id)
                ->where('status', 'pending')
                ->update(['status' => 'confirmed']);
        }

        // 2. Handle Journals
        if ($payment->payment_type === 'journal' && $payment->journal_id) {
            \App\Models\JournalPurchase::firstOrCreate([
                'user_id' => $payment->user_id,
                'journal_id' => $payment->journal_id,
            ], [
                'payment_id' => $payment->id,
                'purchased_at' => now(),
            ]);
            
            Log::info("Journal access granted for user {$payment->user_id} on journal {$payment->journal_id}");
        }
    }
}

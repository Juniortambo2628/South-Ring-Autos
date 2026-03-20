<?php

/**
 * MPESA STK Push Service
 *
 * Handles MPESA payment integration including:
 * - STK Push requests
 * - Payment callback handling
 * - Payment verification
 */

namespace SouthRingAutos\Services;

use Psr\Log\LoggerInterface;
use SouthRingAutos\Database\Database;

class MpesaService
{
    private $pdo;
    private $logger;
    private $config;
    private $baseUrl;
    private $accessToken;

    public function __construct(?LoggerInterface $logger = null)
    {
        $db = Database::getInstance();
        $this->pdo = $db->getConnection();
        $this->logger = $logger;
        $this->config = require __DIR__ . '/../../config/mpesa.php';

        $env = $this->config['environment'];
        $this->baseUrl = $this->config['base_url'][$env];

        $this->accessToken = $this->getAccessToken();
    }

    /**
     * Get OAuth Access Token from Safaricom API
     */
    private function getAccessToken()
    {
        try {
            $url = $this->baseUrl . '/oauth/v1/generate?grant_type=client_credentials';

            $ch = curl_init($url);
            curl_setopt($ch, CURLOPT_HTTPHEADER, [
                'Authorization: Basic ' . base64_encode($this->config['consumer_key'] . ':' . $this->config['consumer_secret']),
            ]);
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
            curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);

            $response = curl_exec($ch);
            $statusCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
            curl_close($ch);

            if ($statusCode !== 200) {
                throw new \Exception('Failed to get access token: ' . $response);
            }

            $data = json_decode($response, true);

            if (! isset($data['access_token'])) {
                throw new \Exception('Access token not found in response');
            }

            return $data['access_token'];

        } catch (\Exception $e) {
            if ($this->logger) {
                $this->logger->error('MPESA Access Token Error', ['error' => $e->getMessage()]);
            }

            throw $e;
        }
    }

    /**
     * Generate Password for STK Push
     */
    private function generatePassword()
    {
        $timestamp = date('YmdHis');
        $businessShortCode = $this->config['business_short_code'];
        $passkey = $this->config['passkey'];

        return base64_encode($businessShortCode . $passkey . $timestamp);
    }

    /**
     * Generate Timestamp for STK Push
     */
    private function generateTimestamp()
    {
        return date('YmdHis');
    }

    /**
     * Initiate STK Push Payment
     *
     * @param string $phoneNumber Phone number (format: 254712345678)
     * @param float $amount Amount to charge
     * @param int $bookingId Booking ID
     * @param string $accountReference Vehicle registration number
     * @return array Response data
     */
    public function initiateSTKPush($phoneNumber, $amount, $bookingId, $accountReference)
    {
        try {
            // Format phone number (remove + or 0, add 254)
            $phoneNumber = $this->formatPhoneNumber($phoneNumber);

            $url = $this->baseUrl . '/mpesa/stkpush/v1/processrequest';

            $timestamp = $this->generateTimestamp();
            $password = $this->generatePassword();

            $data = [
                'BusinessShortCode' => $this->config['business_short_code'],
                'Password' => $password,
                'Timestamp' => $timestamp,
                'TransactionType' => $this->config['transaction_type'],
                'Amount' => $amount,
                'PartyA' => $phoneNumber,
                'PartyB' => $this->config['business_short_code'],
                'PhoneNumber' => $phoneNumber,
                'CallBackURL' => $this->config['callback_url'],
                'AccountReference' => $accountReference,
                'TransactionDesc' => $this->config['transaction_desc'],
            ];

            $ch = curl_init($url);
            curl_setopt($ch, CURLOPT_HTTPHEADER, [
                'Authorization: Bearer ' . $this->accessToken,
                'Content-Type: application/json',
            ]);
            curl_setopt($ch, CURLOPT_POST, true);
            curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
            curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);

            $response = curl_exec($ch);
            $statusCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
            curl_close($ch);

            $responseData = json_decode($response, true);

            if ($statusCode !== 200 || ! isset($responseData['ResponseCode'])) {
                throw new \Exception('STK Push failed: ' . ($responseData['errorMessage'] ?? $response));
            }

            // Save payment request to database
            $checkoutRequestId = $responseData['CheckoutRequestID'] ?? null;
            if ($checkoutRequestId) {
                $this->savePaymentRequest($bookingId, $phoneNumber, $amount, $checkoutRequestId, $accountReference);
            }

            if ($this->logger) {
                $this->logger->info('STK Push Initiated', [
                    'booking_id' => $bookingId,
                    'phone' => $phoneNumber,
                    'amount' => $amount,
                    'checkout_request_id' => $checkoutRequestId,
                ]);
            }

            return [
                'success' => $responseData['ResponseCode'] == '0',
                'message' => $responseData['ResponseDescription'] ?? 'Payment request sent',
                'checkout_request_id' => $checkoutRequestId,
                'customer_message' => $responseData['CustomerMessage'] ?? 'Please check your phone for payment prompt',
            ];

        } catch (\Exception $e) {
            if ($this->logger) {
                $this->logger->error('STK Push Error', ['error' => $e->getMessage()]);
            }

            return [
                'success' => false,
                'message' => $e->getMessage(),
            ];
        }
    }

    /**
     * Format phone number to MPESA format (254XXXXXXXXX)
     */
    private function formatPhoneNumber($phone)
    {
        // Remove spaces, dashes, and other characters
        $phone = preg_replace('/[^0-9+]/', '', $phone);

        // Remove + if present
        $phone = str_replace('+', '', $phone);

        // If starts with 0, replace with 254
        if (substr($phone, 0, 1) === '0') {
            $phone = '254' . substr($phone, 1);
        }

        // If doesn't start with 254, add it
        if (substr($phone, 0, 3) !== '254') {
            $phone = '254' . $phone;
        }

        return $phone;
    }

    /**
     * Save payment request to database
     */
    private function savePaymentRequest($bookingId, $phoneNumber, $amount, $checkoutRequestId, $accountReference)
    {
        try {
            // Get client_id from booking if exists
            $stmt = $this->pdo->prepare("SELECT client_id FROM bookings WHERE id = ?");
            $stmt->execute([$bookingId]);
            $booking = $stmt->fetch(\PDO::FETCH_ASSOC);
            $clientId = $booking['client_id'] ?? null;

            // Calculate deposit (75% of amount)
            $depositAmount = $amount * 0.75;

            // Insert payment record
            $stmt = $this->pdo->prepare("INSERT INTO payments 
                (booking_id, client_id, amount, payment_method, transaction_id, status, created_at)
                VALUES (?, ?, ?, 'MPESA', ?, 'processing', NOW())");
            $stmt->execute([$bookingId, $clientId, $depositAmount, $checkoutRequestId]);

            // Update booking with estimated cost if not set
            $stmt = $this->pdo->prepare("UPDATE bookings 
                SET estimated_cost = ? 
                WHERE id = ? AND estimated_cost IS NULL");
            $stmt->execute([$amount, $bookingId]);

            // Save checkout request ID for callback matching
            $stmt = $this->pdo->prepare("UPDATE payments 
                SET transaction_id = ? 
                WHERE booking_id = ? AND status = 'processing' 
                ORDER BY id DESC LIMIT 1");
            $stmt->execute([$checkoutRequestId, $bookingId]);

        } catch (\PDOException $e) {
            if ($this->logger) {
                $this->logger->error('Failed to save payment request', ['error' => $e->getMessage()]);
            }
        }
    }

    /**
     * Handle MPESA Callback
     * This method processes the callback from Safaricom after payment
     */
    public function handleCallback($callbackData)
    {
        try {
            $body = json_decode($callbackData, true);

            if (! isset($body['Body']['stkCallback'])) {
                throw new \Exception('Invalid callback data');
            }

            $callback = $body['Body']['stkCallback'];
            $checkoutRequestId = $callback['CheckoutRequestID'];
            $resultCode = $callback['ResultCode'];
            $resultDesc = $callback['ResultDesc'];

            // Find payment by checkout request ID
            $stmt = $this->pdo->prepare("SELECT * FROM payments 
                WHERE transaction_id = ? AND status = 'processing' 
                ORDER BY id DESC LIMIT 1");
            $stmt->execute([$checkoutRequestId]);
            $payment = $stmt->fetch(\PDO::FETCH_ASSOC);

            if (! $payment) {
                throw new \Exception('Payment not found for checkout request: ' . $checkoutRequestId);
            }

            if ($resultCode == 0) {
                // Payment successful
                $callbackMetadata = $callback['CallbackMetadata']['Item'];

                $amount = null;
                $mpesaReceiptNumber = null;
                $transactionDate = null;
                $phoneNumber = null;

                foreach ($callbackMetadata as $item) {
                    switch ($item['Name']) {
                        case 'Amount':
                            $amount = $item['Value'];

                            break;
                        case 'MpesaReceiptNumber':
                            $mpesaReceiptNumber = $item['Value'];

                            break;
                        case 'TransactionDate':
                            $transactionDate = $item['Value'];

                            break;
                        case 'PhoneNumber':
                            $phoneNumber = $item['Value'];

                            break;
                    }
                }

                // Update payment record
                $stmt = $this->pdo->prepare("UPDATE payments 
                    SET status = 'completed',
                        transaction_id = ?,
                        payment_date = FROM_UNIXTIME(?),
                        updated_at = NOW()
                    WHERE id = ?");

                $transactionTimestamp = substr($transactionDate, 0, 10); // First 10 digits are timestamp
                $stmt->execute([$mpesaReceiptNumber, $transactionTimestamp, $payment['id']]);

                // Update booking status to confirmed if still pending
                $stmt = $this->pdo->prepare("UPDATE bookings 
                    SET status = 'confirmed',
                        updated_at = NOW()
                    WHERE id = ? AND status = 'pending'");
                $stmt->execute([$payment['booking_id']]);

                // Create notification for client
                if ($payment['client_id']) {
                    $stmt = $this->pdo->prepare("INSERT INTO notifications 
                        (client_id, booking_id, type, title, message, created_at)
                        VALUES (?, ?, 'payment', 'Payment Confirmed', ?, NOW())");
                    $message = "Your payment of KES " . number_format($amount, 2) . " has been confirmed. Receipt: " . $mpesaReceiptNumber;
                    $stmt->execute([$payment['client_id'], $payment['booking_id'], $message]);
                }

                if ($this->logger) {
                    $this->logger->info('Payment Confirmed', [
                        'payment_id' => $payment['id'],
                        'booking_id' => $payment['booking_id'],
                        'receipt' => $mpesaReceiptNumber,
                        'amount' => $amount,
                    ]);
                }

                return [
                    'success' => true,
                    'message' => 'Payment confirmed successfully',
                ];

            } else {
                // Payment failed or cancelled
                $stmt = $this->pdo->prepare("UPDATE payments 
                    SET status = 'failed',
                        updated_at = NOW()
                    WHERE id = ?");
                $stmt->execute([$payment['id']]);

                if ($this->logger) {
                    $this->logger->warning('Payment Failed', [
                        'payment_id' => $payment['id'],
                        'result_code' => $resultCode,
                        'result_desc' => $resultDesc,
                    ]);
                }

                return [
                    'success' => false,
                    'message' => $resultDesc,
                ];
            }

        } catch (\Exception $e) {
            if ($this->logger) {
                $this->logger->error('Callback Processing Error', ['error' => $e->getMessage()]);
            }

            return [
                'success' => false,
                'message' => $e->getMessage(),
            ];
        }
    }

    /**
     * Verify payment status by checkout request ID
     */
    public function verifyPayment($checkoutRequestId)
    {
        $stmt = $this->pdo->prepare("SELECT * FROM payments 
            WHERE transaction_id = ? 
            ORDER BY id DESC LIMIT 1");
        $stmt->execute([$checkoutRequestId]);

        return $stmt->fetch(\PDO::FETCH_ASSOC);
    }
}

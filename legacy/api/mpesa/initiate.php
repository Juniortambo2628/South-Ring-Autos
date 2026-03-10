<?php
/**
 * MPESA STK Push Initiation API
 * 
 * Endpoint: /api/mpesa/initiate.php
 * Method: POST
 * 
 * Parameters:
 * - booking_id (required): Booking ID
 * - phone (required): Customer phone number
 * - amount (required): Total service amount (deposit 75% will be calculated)
 */

ob_start();
header('Content-Type: application/json');
ini_set('display_errors', '0');
error_reporting(E_ALL);

try {
    require_once __DIR__ . '/../../bootstrap.php';
} catch (Exception $e) {
    ob_clean();
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'System error. Please contact administrator.'
    ]);
    exit;
}

use SouthRingAutos\Utils\SessionManager;
SessionManager::start();

use SouthRingAutos\Services\MpesaService;
use SouthRingAutos\Database\Database;

ob_clean();

// Only allow POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode([
        'success' => false,
        'message' => 'Method not allowed'
    ]);
    exit;
}

// Get input data
$input = json_decode(file_get_contents('php://input'), true) ?: $_POST;

$bookingId = $input['booking_id'] ?? null;
$phone = $input['phone'] ?? null;
$amount = $input['amount'] ?? null;

// Validate inputs
if (!$bookingId || !$phone || !$amount) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => 'Missing required parameters: booking_id, phone, amount'
    ]);
    exit;
}

// Validate amount
$amount = floatval($amount);
if ($amount <= 0) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => 'Invalid amount'
    ]);
    exit;
}

try {
    $db = Database::getInstance();
    $pdo = $db->getConnection();
    
    // Verify booking exists
    $stmt = $pdo->prepare("SELECT id, registration, client_id FROM bookings WHERE id = ?");
    $stmt->execute([$bookingId]);
    $booking = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$booking) {
        http_response_code(404);
        echo json_encode([
            'success' => false,
            'message' => 'Booking not found'
        ]);
        exit;
    }
    
    // Get registration number for account reference
    $accountReference = $booking['registration'] ?? 'BOOKING' . $bookingId;
    
    // Calculate deposit (75% of total amount)
    $depositAmount = round($amount * 0.75, 2);
    
    // Initialize MPESA service
    $mpesaService = new MpesaService($db->getLogger());
    
    // Initiate STK Push
    $result = $mpesaService->initiateSTKPush($phone, $depositAmount, $bookingId, $accountReference);
    
    if ($result['success']) {
        http_response_code(200);
        echo json_encode([
            'success' => true,
            'message' => $result['message'],
            'customer_message' => $result['customer_message'] ?? 'Please check your phone for payment prompt',
            'checkout_request_id' => $result['checkout_request_id'],
            'deposit_amount' => $depositAmount,
            'total_amount' => $amount
        ]);
    } else {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'message' => $result['message']
        ]);
    }
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Payment initiation failed: ' . $e->getMessage()
    ]);
}





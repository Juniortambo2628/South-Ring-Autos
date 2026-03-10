<?php
/**
 * MPESA Payment Verification API
 * 
 * Endpoint: /api/mpesa/verify.php
 * Method: GET
 * 
 * Parameters:
 * - checkout_request_id (required): Checkout request ID from STK Push
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
        'message' => 'System error'
    ]);
    exit;
}

use SouthRingAutos\Utils\SessionManager;
SessionManager::start();

use SouthRingAutos\Services\MpesaService;
use SouthRingAutos\Database\Database;

ob_clean();

$checkoutRequestId = $_GET['checkout_request_id'] ?? null;

if (!$checkoutRequestId) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => 'Missing checkout_request_id parameter'
    ]);
    exit;
}

try {
    $db = Database::getInstance();
    $mpesaService = new MpesaService($db->getLogger());
    
    $payment = $mpesaService->verifyPayment($checkoutRequestId);
    
    if ($payment) {
        echo json_encode([
            'success' => true,
            'payment' => $payment
        ]);
    } else {
        http_response_code(404);
        echo json_encode([
            'success' => false,
            'message' => 'Payment not found'
        ]);
    }
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}





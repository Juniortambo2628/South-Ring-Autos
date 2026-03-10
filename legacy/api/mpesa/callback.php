<?php
/**
 * MPESA Payment Callback Handler
 * 
 * This endpoint receives callbacks from Safaricom MPESA API
 * when a payment is completed, cancelled, or fails.
 * 
 * Endpoint: /api/mpesa/callback.php
 * Method: POST
 * 
 * IMPORTANT: This URL must be publicly accessible (HTTPS recommended)
 * Configure this URL in your Safaricom Developer Portal as the callback URL
 */

// Log all callbacks for debugging
$logFile = __DIR__ . '/../../logs/mpesa-callbacks.log';
$logDir = dirname($logFile);
if (!is_dir($logDir)) {
    mkdir($logDir, 0755, true);
}

// Log raw callback data
$rawData = file_get_contents('php://input');
file_put_contents($logFile, date('Y-m-d H:i:s') . " - " . $rawData . "\n", FILE_APPEND);

header('Content-Type: application/json');

try {
    require_once __DIR__ . '/../../bootstrap.php';
} catch (Exception $e) {
    // Still respond to Safaricom even if our code fails
    http_response_code(200);
    echo json_encode([
        'ResultCode' => 1,
        'ResultDesc' => 'System error'
    ]);
    exit;
}

use SouthRingAutos\Services\MpesaService;
use SouthRingAutos\Database\Database;
use SouthRingAutos\Utils\Logger;

try {
    $db = Database::getInstance();
    $mpesaService = new MpesaService($db->getLogger());
    
    // Process callback
    $result = $mpesaService->handleCallback($rawData);
    
    // Always respond with success to Safaricom
    // (even if processing failed, we don't want them to retry)
    http_response_code(200);
    echo json_encode([
        'ResultCode' => $result['success'] ? 0 : 1,
        'ResultDesc' => $result['message']
    ]);
    
} catch (Exception $e) {
    // Log error but still respond to Safaricom
    Logger::logError('MPESA Callback Error: ' . $e->getMessage());
    
    http_response_code(200);
    echo json_encode([
        'ResultCode' => 1,
        'ResultDesc' => 'Callback processing error'
    ]);
}





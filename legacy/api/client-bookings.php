<?php
/**
 * Client Bookings API
 */

ob_start();
header('Content-Type: application/json');

try {
    require_once __DIR__ . '/../bootstrap.php';
} catch (Exception $e) {
    ob_clean();
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'System error']);
    exit;
}

use SouthRingAutos\Database\Database;
use SouthRingAutos\Utils\SessionManager;

SessionManager::start();

if (!SessionManager::isClientLoggedIn()) {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Unauthorized']);
    exit;
}

ob_clean();

$action = $_GET['action'] ?? 'list';
$clientId = SessionManager::getClientId();

try {
    $db = Database::getInstance();
    $pdo = $db->getConnection();
    
    if ($action === 'list') {
        $stmt = $pdo->prepare("SELECT b.*, 
            (SELECT progress_percentage FROM repair_progress WHERE booking_id = b.id ORDER BY created_at DESC LIMIT 1) as progress,
            (SELECT stage FROM repair_progress WHERE booking_id = b.id ORDER BY created_at DESC LIMIT 1) as current_stage
            FROM bookings b 
            WHERE b.client_id = ? 
            ORDER BY b.created_at DESC");
        $stmt->execute([$clientId]);
        $bookings = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        echo json_encode(['success' => true, 'bookings' => $bookings]);
    } elseif ($action === 'get') {
        $id = $_GET['id'] ?? null;
        if (!$id) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Booking ID required']);
            exit;
        }
        
        $stmt = $pdo->prepare("SELECT b.*, 
            (SELECT JSON_ARRAYAGG(JSON_OBJECT('stage', stage, 'description', description, 'progress_percentage', progress_percentage, 'created_at', created_at))
             FROM repair_progress WHERE booking_id = b.id) as progress_history
            FROM bookings b 
            WHERE b.id = ? AND b.client_id = ?");
        $stmt->execute([$id, $clientId]);
        $booking = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if ($booking) {
            echo json_encode(['success' => true, 'booking' => $booking]);
        } else {
            http_response_code(404);
            echo json_encode(['success' => false, 'message' => 'Booking not found']);
        }
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => DEBUG_MODE ? $e->getMessage() : 'An error occurred']);
}

ob_end_flush();


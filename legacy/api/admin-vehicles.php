<?php
/**
 * Admin Vehicles API
 * Admin access to vehicle information
 */

header('Content-Type: application/json');
require_once __DIR__ . '/../bootstrap.php';

use SouthRingAutos\Database\Database;
use SouthRingAutos\Utils\SessionManager;

SessionManager::start();

if (!SessionManager::isAdminLoggedIn()) {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Unauthorized']);
    exit;
}

$db = Database::getInstance();
$pdo = $db->getConnection();

$action = $_GET['action'] ?? 'list';

try {
    switch ($action) {
        case 'list':
            // Get all vehicles with client info and statistics
            $stmt = $pdo->query("
                SELECT 
                    v.*,
                    c.name as client_name,
                    c.email as client_email,
                    c.phone as client_phone,
                    (SELECT COUNT(*) FROM bookings b WHERE b.vehicle_id = v.id) as booking_count,
                    (SELECT SUM(p.amount) FROM payments p 
                     INNER JOIN bookings b ON p.booking_id = b.id 
                     WHERE b.vehicle_id = v.id AND p.status = 'completed') as total_spent
                FROM vehicles v
                INNER JOIN clients c ON v.client_id = c.id
                ORDER BY v.created_at DESC
            ");
            $vehicles = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            echo json_encode([
                'success' => true,
                'vehicles' => $vehicles
            ]);
            break;

        case 'history':
            // Get vehicle history for admin
            $vehicleId = $_GET['id'] ?? null;
            if (!$vehicleId) {
                http_response_code(400);
                echo json_encode(['success' => false, 'message' => 'Vehicle ID required']);
                exit;
            }
            
            // Get bookings
            $stmt = $pdo->prepare("
                SELECT 
                    b.*,
                    (SELECT stage FROM repair_progress WHERE booking_id = b.id ORDER BY created_at DESC LIMIT 1) as current_stage,
                    (SELECT progress_percentage FROM repair_progress WHERE booking_id = b.id ORDER BY created_at DESC LIMIT 1) as progress
                FROM bookings b
                WHERE b.vehicle_id = ?
                ORDER BY b.created_at DESC
            ");
            $stmt->execute([$vehicleId]);
            $bookings = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            // Get payments
            $paymentStmt = $pdo->prepare("
                SELECT 
                    p.*,
                    b.service,
                    b.registration
                FROM payments p
                INNER JOIN bookings b ON p.booking_id = b.id
                WHERE b.vehicle_id = ?
                ORDER BY p.created_at DESC
            ");
            $paymentStmt->execute([$vehicleId]);
            $payments = $paymentStmt->fetchAll(PDO::FETCH_ASSOC);
            
            echo json_encode([
                'success' => true,
                'bookings' => $bookings,
                'payments' => $payments
            ]);
            break;

        default:
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Invalid action']);
            break;
    }
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Database error: ' . $e->getMessage()
    ]);
}


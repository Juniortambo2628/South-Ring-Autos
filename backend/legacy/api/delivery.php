<?php
/**
 * Delivery Requests API
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
use SouthRingAutos\Utils\Email;
use SouthRingAutos\Utils\Logger;
use SouthRingAutos\Utils\SessionManager;

SessionManager::start();
ob_clean();

$action = $_GET['action'] ?? '';

try {
    $db = Database::getInstance();
    $pdo = $db->getConnection();
    
    if ($action === 'list') {
        if (SessionManager::isClientLoggedIn()) {
            $clientId = SessionManager::getClientId();
            $stmt = $pdo->prepare("SELECT dr.*, b.registration, b.service 
                FROM delivery_requests dr 
                JOIN bookings b ON dr.booking_id = b.id 
                WHERE dr.client_id = ? 
                ORDER BY dr.created_at DESC");
            $stmt->execute([$clientId]);
            $requests = $stmt->fetchAll(PDO::FETCH_ASSOC);
            echo json_encode(['success' => true, 'requests' => $requests]);
        } elseif (SessionManager::isAdminLoggedIn()) {
            $stmt = $pdo->query("SELECT dr.*, b.registration, b.service, c.name as client_name 
                FROM delivery_requests dr 
                JOIN bookings b ON dr.booking_id = b.id 
                LEFT JOIN clients c ON dr.client_id = c.id 
                ORDER BY dr.created_at DESC");
            $requests = $stmt->fetchAll(PDO::FETCH_ASSOC);
            echo json_encode(['success' => true, 'requests' => $requests]);
        } else {
            http_response_code(401);
            echo json_encode(['success' => false, 'message' => 'Unauthorized']);
        }
    } elseif ($action === 'create') {
        if (!SessionManager::isClientLoggedIn()) {
            http_response_code(401);
            echo json_encode(['success' => false, 'message' => 'Unauthorized']);
            exit;
        }
        
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            http_response_code(405);
            echo json_encode(['success' => false, 'message' => 'POST method required']);
            exit;
        }
        
        $data = json_decode(file_get_contents('php://input'), true);
        
        $bookingId = $data['booking_id'] ?? null;
        $type = $data['type'] ?? 'pickup';
        $address = $data['address'] ?? '';
        $city = $data['city'] ?? '';
        $postalCode = $data['postal_code'] ?? '';
        $preferredDate = $data['preferred_date'] ?? null;
        $preferredTime = $data['preferred_time'] ?? null;
        $contactPhone = $data['contact_phone'] ?? '';
        $instructions = $data['special_instructions'] ?? '';
        $clientId = SessionManager::getClientId();
        
        if (!$bookingId || !$address || !$contactPhone) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Missing required fields']);
            exit;
        }
        
        // Verify booking belongs to client
        $checkStmt = $pdo->prepare("SELECT id FROM bookings WHERE id = ? AND client_id = ?");
        $checkStmt->execute([$bookingId, $clientId]);
        if (!$checkStmt->fetch()) {
            http_response_code(403);
            echo json_encode(['success' => false, 'message' => 'Unauthorized']);
            exit;
        }
        
        $stmt = $pdo->prepare("INSERT INTO delivery_requests (booking_id, client_id, type, address, city, postal_code, preferred_date, preferred_time, contact_phone, special_instructions) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
        $stmt->execute([$bookingId, $clientId, $type, $address, $city, $postalCode, $preferredDate, $preferredTime, $contactPhone, $instructions]);
        
        echo json_encode([
            'success' => true,
            'id' => $pdo->lastInsertId(),
            'message' => 'Delivery request submitted successfully'
        ]);
        
    } elseif ($action === 'update') {
        // Admin only
        if (!SessionManager::isAdminLoggedIn()) {
            http_response_code(401);
            echo json_encode(['success' => false, 'message' => 'Unauthorized']);
            exit;
        }
        
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            http_response_code(405);
            echo json_encode(['success' => false, 'message' => 'POST method required']);
            exit;
        }
        
        $data = json_decode(file_get_contents('php://input'), true);
        $requestId = $data['id'] ?? null;
        $status = $data['status'] ?? 'pending';
        $assignedTo = $data['assigned_to'] ?? null;
        $scheduledDate = $data['scheduled_date'] ?? null;
        
        if (!$requestId) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Request ID required']);
            exit;
        }
        
        $completedAt = $status === 'completed' ? date('Y-m-d H:i:s') : null;
        
        $stmt = $pdo->prepare("UPDATE delivery_requests SET status = ?, assigned_to = ?, scheduled_date = ?, completed_at = ? WHERE id = ?");
        $stmt->execute([$status, $assignedTo, $scheduledDate, $completedAt, $requestId]);
        
        // Create notification and send email
        $reqStmt = $pdo->prepare("SELECT dr.*, c.email, c.name as client_name 
            FROM delivery_requests dr 
            LEFT JOIN clients c ON dr.client_id = c.id 
            WHERE dr.id = ?");
        $reqStmt->execute([$requestId]);
        $request = $reqStmt->fetch();
        
        if ($request && $request['client_id']) {
            $title = "Delivery {$request['type']} " . ucfirst($status);
            $message = "Your {$request['type']} request has been {$status}.";
            if ($scheduledDate) {
                $message .= " Scheduled for: " . date('Y-m-d H:i', strtotime($scheduledDate));
            }
            
            $sentEmail = false;
            
            // Send email if confirmed or scheduled
            if (($status === 'confirmed' || $status === 'scheduled') && $request['email']) {
                try {
                    $email = new Email();
                    $email->sendDeliveryConfirmation($request['email'], $request['client_name'], $request);
                    $sentEmail = true;
                } catch (Exception $e) {
                    Logger::logError('Failed to send delivery email: ' . $e->getMessage());
                }
            }
            
            $notifStmt = $pdo->prepare("INSERT INTO notifications (client_id, booking_id, type, title, message, sent_email) VALUES (?, ?, 'delivery', ?, ?, ?)");
            $notifStmt->execute([$request['client_id'], $request['booking_id'], $title, $message, $sentEmail]);
        }
        
        echo json_encode(['success' => true, 'message' => 'Delivery request updated']);
    } else {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Invalid action']);
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => DEBUG_MODE ? $e->getMessage() : 'An error occurred']);
}

ob_end_flush();


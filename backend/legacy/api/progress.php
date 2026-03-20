<?php
/**
 * Repair Progress API
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

$action = $_GET['action'] ?? 'get';

try {
    $db = Database::getInstance();
    $pdo = $db->getConnection();
    
    if ($action === 'get') {
        // Client or admin can get progress
        $bookingId = $_GET['booking_id'] ?? null;
        if (!$bookingId) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Booking ID required']);
            exit;
        }
        
        // Check authorization
        if (SessionManager::isClientLoggedIn()) {
            $clientId = SessionManager::getClientId();
            $stmt = $pdo->prepare("SELECT id FROM bookings WHERE id = ? AND client_id = ?");
            $stmt->execute([$bookingId, $clientId]);
            if (!$stmt->fetch()) {
                http_response_code(403);
                echo json_encode(['success' => false, 'message' => 'Unauthorized']);
                exit;
            }
        } elseif (!SessionManager::isAdminLoggedIn()) {
            http_response_code(401);
            echo json_encode(['success' => false, 'message' => 'Unauthorized']);
            exit;
        }
        
        $stmt = $pdo->prepare("SELECT rp.*, au.username as updated_by_name 
            FROM repair_progress rp 
            LEFT JOIN admin_users au ON rp.updated_by = au.id 
            WHERE rp.booking_id = ? 
            ORDER BY rp.created_at DESC");
        $stmt->execute([$bookingId]);
        $progress = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        // Get latest progress
        $latestStmt = $pdo->prepare("SELECT * FROM repair_progress WHERE booking_id = ? ORDER BY created_at DESC LIMIT 1");
        $latestStmt->execute([$bookingId]);
        $latest = $latestStmt->fetch(PDO::FETCH_ASSOC);
        
        echo json_encode([
            'success' => true,
            'progress_history' => $progress,
            'latest' => $latest
        ]);
        
    } elseif ($action === 'update') {
        // Only admin can update
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
        
        $bookingId = $data['booking_id'] ?? null;
        $stage = $data['stage'] ?? '';
        $description = $data['description'] ?? '';
        $progressPercentage = intval($data['progress_percentage'] ?? 0);
        $adminId = SessionManager::getAdminId();
        
        if (!$bookingId || !$stage) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Booking ID and stage are required']);
            exit;
        }
        
        // Validate percentage
        if ($progressPercentage < 0 || $progressPercentage > 100) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Progress percentage must be between 0 and 100']);
            exit;
        }
        
        $stmt = $pdo->prepare("INSERT INTO repair_progress (booking_id, stage, description, progress_percentage, updated_by) VALUES (?, ?, ?, ?, ?)");
        $stmt->execute([$bookingId, $stage, $description, $progressPercentage, $adminId]);
        
        // Update booking status if progress is 100%
        if ($progressPercentage >= 100) {
            $updateStmt = $pdo->prepare("UPDATE bookings SET status = 'completed' WHERE id = ?");
            $updateStmt->execute([$bookingId]);
        }
        
        // Create notification and send email if client exists
        $clientStmt = $pdo->prepare("SELECT b.client_id, b.registration, b.service, c.email, c.name as client_name 
            FROM bookings b 
            LEFT JOIN clients c ON b.client_id = c.id 
            WHERE b.id = ?");
        $clientStmt->execute([$bookingId]);
        $booking = $clientStmt->fetch();
        
        if ($booking && $booking['client_id']) {
            $notificationMsg = "Your vehicle repair progress has been updated: $stage";
            $notificationType = 'progress_update';
            $notificationTitle = "Repair Progress Update";
            $sentEmail = false;
            
            if ($progressPercentage >= 100) {
                $notificationMsg = "Your vehicle is ready for collection!";
                $notificationType = 'car_ready';
                $notificationTitle = "Vehicle Ready for Collection";
                
                // Send email notification
                if ($booking['email']) {
                    try {
                        $email = new Email();
                        $email->sendCarReadyNotification($booking['email'], $booking['client_name'], [
                            'registration' => $booking['registration'],
                            'service' => $booking['service'],
                            'actual_cost' => null
                        ]);
                        $sentEmail = true;
                    } catch (Exception $e) {
                        Logger::logError('Failed to send ready email: ' . $e->getMessage());
                    }
                }
            } elseif ($progressPercentage >= 25) {
                // Send progress email for milestones
                if ($booking['email']) {
                    try {
                        $email = new Email();
                        $email->sendProgressUpdate($booking['email'], $booking['client_name'], [
                            'registration' => $booking['registration']
                        ], [
                            'stage' => $stage,
                            'progress_percentage' => $progressPercentage,
                            'description' => $description
                        ]);
                        $sentEmail = true;
                    } catch (Exception $e) {
                        Logger::logError('Failed to send progress email: ' . $e->getMessage());
                    }
                }
            }
            
            $notifStmt = $pdo->prepare("INSERT INTO notifications (client_id, booking_id, type, title, message, sent_email) VALUES (?, ?, ?, ?, ?, ?)");
            $notifStmt->execute([$booking['client_id'], $bookingId, $notificationType, $notificationTitle, $notificationMsg, $sentEmail]);
        }
        
        echo json_encode([
            'success' => true,
            'id' => $pdo->lastInsertId(),
            'message' => 'Progress updated successfully'
        ]);
    } else {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Invalid action']);
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => DEBUG_MODE ? $e->getMessage() : 'An error occurred']);
}

ob_end_flush();


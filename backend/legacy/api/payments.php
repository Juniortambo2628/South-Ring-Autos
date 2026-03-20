<?php
/**
 * Payments API
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
        // Client view
        if (SessionManager::isClientLoggedIn()) {
            $clientId = SessionManager::getClientId();
            $stmt = $pdo->prepare("SELECT p.*, b.registration, b.service 
                FROM payments p 
                JOIN bookings b ON p.booking_id = b.id 
                WHERE p.client_id = ? 
                ORDER BY p.created_at DESC");
            $stmt->execute([$clientId]);
            $payments = $stmt->fetchAll(PDO::FETCH_ASSOC);
            echo json_encode(['success' => true, 'payments' => $payments]);
        } elseif (SessionManager::isAdminLoggedIn()) {
            // Admin view all
            $stmt = $pdo->query("SELECT p.*, b.registration, b.service, c.name as client_name 
                FROM payments p 
                JOIN bookings b ON p.booking_id = b.id 
                LEFT JOIN clients c ON p.client_id = c.id 
                ORDER BY p.created_at DESC");
            $payments = $stmt->fetchAll(PDO::FETCH_ASSOC);
            echo json_encode(['success' => true, 'payments' => $payments]);
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
        $amount = floatval($data['amount'] ?? 0);
        $paymentMethod = $data['payment_method'] ?? 'manual';
        $transactionId = $data['transaction_id'] ?? null;
        $clientId = SessionManager::getClientId();
        
        if (!$bookingId || $amount <= 0) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Invalid booking ID or amount']);
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
        
        $stmt = $pdo->prepare("INSERT INTO payments (booking_id, client_id, amount, payment_method, transaction_id, status) VALUES (?, ?, ?, ?, ?, 'pending')");
        $stmt->execute([$bookingId, $clientId, $amount, $paymentMethod, $transactionId]);
        
        echo json_encode([
            'success' => true,
            'id' => $pdo->lastInsertId(),
            'message' => 'Payment recorded. Pending confirmation.'
        ]);
        
    } elseif ($action === 'update-status') {
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
        $paymentId = $data['id'] ?? null;
        $status = $data['status'] ?? 'pending';
        
        if (!$paymentId) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Payment ID required']);
            exit;
        }
        
        $paymentDate = $status === 'completed' ? date('Y-m-d H:i:s') : null;
        
        $stmt = $pdo->prepare("UPDATE payments SET status = ?, payment_date = ? WHERE id = ?");
        $stmt->execute([$status, $paymentDate, $paymentId]);
        
        // Create notification and send email if payment completed
        if ($status === 'completed') {
            $payStmt = $pdo->prepare("SELECT p.*, b.registration, b.service, c.email, c.name as client_name 
                FROM payments p 
                JOIN bookings b ON p.booking_id = b.id 
                LEFT JOIN clients c ON p.client_id = c.id 
                WHERE p.id = ?");
            $payStmt->execute([$paymentId]);
            $payment = $payStmt->fetch();
            
            if ($payment && $payment['client_id']) {
                $message = "Your payment for vehicle {$payment['registration']} has been confirmed.";
                $sentEmail = false;
                
                // Send email
                if ($payment['email']) {
                    try {
                        $email = new Email();
                        $email->sendPaymentConfirmation($payment['email'], $payment['client_name'], $payment, [
                            'registration' => $payment['registration']
                        ]);
                        $sentEmail = true;
                    } catch (Exception $e) {
                        Logger::logError('Failed to send payment email: ' . $e->getMessage());
                    }
                }
                
                $notifStmt = $pdo->prepare("INSERT INTO notifications (client_id, booking_id, type, title, message, sent_email) VALUES (?, ?, 'payment', 'Payment Confirmed', ?, ?)");
                $notifStmt->execute([$payment['client_id'], $payment['booking_id'], $message, $sentEmail]);
            }
        }
        
        echo json_encode(['success' => true, 'message' => 'Payment status updated']);
    } else {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Invalid action']);
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => DEBUG_MODE ? $e->getMessage() : 'An error occurred']);
}

ob_end_flush();


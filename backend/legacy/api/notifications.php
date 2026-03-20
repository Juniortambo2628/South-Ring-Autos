<?php
/**
 * Notifications API
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
ob_clean();

$action = $_GET['action'] ?? '';

// Check if client is logged in
if (!SessionManager::isClientLoggedIn()) {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Unauthorized']);
    exit;
}

$clientId = SessionManager::getClientId();

try {
    $db = Database::getInstance();
    $pdo = $db->getConnection();
    
    if ($action === 'list') {
        $limit = intval($_GET['limit'] ?? 20);
        $stmt = $pdo->prepare("SELECT * FROM notifications WHERE client_id = ? ORDER BY created_at DESC LIMIT ?");
        $stmt->execute([$clientId, $limit]);
        $notifications = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        // Get unread count
        $countStmt = $pdo->prepare("SELECT COUNT(*) FROM notifications WHERE client_id = ? AND read_status = FALSE");
        $countStmt->execute([$clientId]);
        $unreadCount = $countStmt->fetchColumn();
        
        echo json_encode([
            'success' => true,
            'notifications' => $notifications,
            'unread_count' => $unreadCount
        ]);
    } elseif ($action === 'mark-read') {
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            http_response_code(405);
            echo json_encode(['success' => false, 'message' => 'POST method required']);
            exit;
        }
        
        $id = $_GET['id'] ?? null;
        if (!$id) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Notification ID required']);
            exit;
        }
        
        $stmt = $pdo->prepare("UPDATE notifications SET read_status = TRUE WHERE id = ? AND client_id = ?");
        $stmt->execute([$id, $clientId]);
        
        echo json_encode(['success' => true]);
    } elseif ($action === 'mark-all-read') {
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            http_response_code(405);
            echo json_encode(['success' => false, 'message' => 'POST method required']);
            exit;
        }
        
        $stmt = $pdo->prepare("UPDATE notifications SET read_status = TRUE WHERE client_id = ?");
        $stmt->execute([$clientId]);
        
        echo json_encode(['success' => true]);
    } elseif ($action === 'delete') {
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            http_response_code(405);
            echo json_encode(['success' => false, 'message' => 'POST method required']);
            exit;
        }
        
        $id = $_GET['id'] ?? null;
        if (!$id) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Notification ID required']);
            exit;
        }
        
        $stmt = $pdo->prepare("DELETE FROM notifications WHERE id = ? AND client_id = ?");
        $stmt->execute([$id, $clientId]);
        
        echo json_encode(['success' => true]);
    } else {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Invalid action']);
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => DEBUG_MODE ? $e->getMessage() : 'An error occurred']);
}

ob_end_flush();


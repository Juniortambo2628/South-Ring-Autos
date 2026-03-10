<?php
/**
 * Admin Users API
 * User management endpoints
 */

require_once __DIR__ . '/../bootstrap.php';

use SouthRingAutos\Database\Database;
use SouthRingAutos\Utils\SessionManager;

// Start session and check authentication
SessionManager::start();

if (!SessionManager::isAdminLoggedIn()) {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Unauthorized']);
    exit;
}

// Start output buffering
ob_start();
header('Content-Type: application/json');

try {
    // Bootstrap already loaded
} catch (Exception $e) {
    ob_clean();
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'System error. Please contact administrator.',
        'error' => DEBUG_MODE ? $e->getMessage() : null
    ]);
    exit;
}

ob_clean();

$action = $_GET['action'] ?? '';

try {
    $db = Database::getInstance();
    $pdo = $db->getConnection();
    
    switch ($action) {
        case 'list':
            listUsers($pdo);
            break;
        case 'create':
            createUser($pdo);
            break;
        case 'delete':
            deleteUser($pdo);
            break;
        case 'change-password':
            changePassword($pdo);
            break;
        default:
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Invalid action']);
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => DEBUG_MODE ? $e->getMessage() : 'An error occurred'
    ]);
}

ob_end_flush();

function listUsers($pdo) {
    try {
        // Check if table exists first
        $checkTable = $pdo->query("SHOW TABLES LIKE 'admin_users'");
        if ($checkTable->rowCount() === 0) {
            echo json_encode(['success' => true, 'users' => []]);
            return;
        }
        
        $stmt = $pdo->query("SELECT id, username, email, created_at FROM admin_users ORDER BY created_at DESC");
        $users = $stmt->fetchAll(PDO::FETCH_ASSOC);
        echo json_encode(['success' => true, 'users' => $users]);
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'message' => 'Error loading users',
            'error' => DEBUG_MODE ? $e->getMessage() : null
        ]);
    }
}

function createUser($pdo) {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        http_response_code(405);
        echo json_encode(['success' => false, 'message' => 'POST method required']);
        return;
    }
    
    $data = json_decode(file_get_contents('php://input'), true);
    
    $username = $data['username'] ?? '';
    $email = $data['email'] ?? null;
    $password = $data['password'] ?? '';
    
    if (empty($username) || empty($password)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Username and password are required']);
        return;
    }
    
    if (strlen($password) < 8) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Password must be at least 8 characters']);
        return;
    }
    
    // Check if username already exists
    $checkStmt = $pdo->prepare("SELECT id FROM admin_users WHERE username = ?");
    $checkStmt->execute([$username]);
    if ($checkStmt->fetch()) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Username already exists']);
        return;
    }
    
    $hashedPassword = password_hash($password, PASSWORD_DEFAULT);
    
    $stmt = $pdo->prepare("INSERT INTO admin_users (username, password, email) VALUES (?, ?, ?)");
    $stmt->execute([$username, $hashedPassword, $email]);
    
    echo json_encode([
        'success' => true,
        'id' => $pdo->lastInsertId(),
        'message' => 'User created successfully'
    ]);
}

function deleteUser($pdo) {
    $id = $_GET['id'] ?? null;
    
    if (!$id) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'User ID required']);
        return;
    }
    
    // Don't allow deleting own account
    if ($id == SessionManager::getAdminId()) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'You cannot delete your own account']);
        return;
    }
    
    $stmt = $pdo->prepare("DELETE FROM admin_users WHERE id = ?");
    $stmt->execute([$id]);
    
    if ($stmt->rowCount() > 0) {
        echo json_encode(['success' => true, 'message' => 'User deleted successfully']);
    } else {
        http_response_code(404);
        echo json_encode(['success' => false, 'message' => 'User not found']);
    }
}

function changePassword($pdo) {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        http_response_code(405);
        echo json_encode(['success' => false, 'message' => 'POST method required']);
        return;
    }
    
    $data = json_decode(file_get_contents('php://input'), true);
    
    $currentPassword = $data['current_password'] ?? '';
    $newPassword = $data['new_password'] ?? '';
    $userId = SessionManager::getAdminId();
    
    if (empty($currentPassword) || empty($newPassword)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Current and new passwords are required']);
        return;
    }
    
    if (strlen($newPassword) < 8) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'New password must be at least 8 characters']);
        return;
    }
    
    // Verify current password
    $stmt = $pdo->prepare("SELECT password FROM admin_users WHERE id = ?");
    $stmt->execute([$userId]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$user || !password_verify($currentPassword, $user['password'])) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Current password is incorrect']);
        return;
    }
    
    // Update password
    $hashedPassword = password_hash($newPassword, PASSWORD_DEFAULT);
    $updateStmt = $pdo->prepare("UPDATE admin_users SET password = ? WHERE id = ?");
    $updateStmt->execute([$hashedPassword, $userId]);
    
    echo json_encode(['success' => true, 'message' => 'Password changed successfully']);
}


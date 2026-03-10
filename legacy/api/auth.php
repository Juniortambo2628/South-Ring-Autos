<?php
/**
 * Authentication API
 * Refactored to use new architecture
 */

// Start output buffering to catch any errors
ob_start();

// Set JSON header first
header('Content-Type: application/json');

// Start session
require_once __DIR__ . '/../bootstrap.php';
use SouthRingAutos\Utils\SessionManager;
SessionManager::start();

// Suppress error display but keep logging
ini_set('display_errors', '0');
error_reporting(E_ALL);

try {
    // Bootstrap already loaded above
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

use SouthRingAutos\Database\Database;
use Monolog\Logger;
use Monolog\Handler\StreamHandler;

// Initialize logger
if (defined('LOG_PATH') && is_dir(LOG_PATH)) {
    $logger = new Logger('auth');
    $logger->pushHandler(new StreamHandler(LOG_PATH . '/auth.log', Logger::INFO));
} else {
    // Fallback logger if LOG_PATH not defined
    $logger = new Logger('auth');
}

// Clear any output before processing
ob_clean();

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $username = $_POST['username'] ?? '';
    $password = $_POST['password'] ?? '';
    
    try {
        $db = Database::getInstance();
        $pdo = $db->getConnection();
        
        $stmt = $pdo->prepare("SELECT * FROM admin_users WHERE username = ?");
        $stmt->execute([$username]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if ($user && password_verify($password, $user['password'])) {
            SessionManager::set('admin_logged_in', true);
            SessionManager::set('admin_id', $user['id']);
            SessionManager::set('admin_username', $user['username']);
            SessionManager::regenerate(); // Regenerate session ID for security
            
            $logger->info('Admin login successful', ['username' => $username]);
            
            echo json_encode([
                'success' => true,
                'token' => session_id(), // Session ID after regeneration
                'message' => 'Login successful'
            ]);
        } else {
            $logger->warning('Failed login attempt', ['username' => $username]);
            echo json_encode(['success' => false, 'message' => 'Invalid username or password']);
        }
    } catch (Exception $e) {
        $logger->error('Login error', ['error' => $e->getMessage()]);
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'message' => DEBUG_MODE ? $e->getMessage() : 'Login failed. Please try again.'
        ]);
    }
} else {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Invalid request method']);
}

// Flush output buffer
ob_end_flush();


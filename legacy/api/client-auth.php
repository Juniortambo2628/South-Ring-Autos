<?php
/**
 * Client Authentication API
 */

ob_start();
header('Content-Type: application/json');

try {
    require_once __DIR__ . '/../bootstrap.php';
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
use SouthRingAutos\Utils\SessionManager;
use SouthRingAutos\Utils\EmailService;
use SouthRingAutos\Utils\Logger;

// Start session
SessionManager::start();

ob_clean();

$action = $_GET['action'] ?? '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    try {
        $db = Database::getInstance();
        $pdo = $db->getConnection();
        
        if ($action === 'login') {
            $email = $_POST['email'] ?? '';
            $password = $_POST['password'] ?? '';
            
            $stmt = $pdo->prepare("SELECT * FROM clients WHERE email = ?");
            $stmt->execute([$email]);
            $client = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if ($client && password_verify($password, $client['password'])) {
                SessionManager::set('client_logged_in', true);
                SessionManager::set('client_id', $client['id']);
                SessionManager::set('client_email', $client['email']);
                SessionManager::set('client_name', $client['name']);
                SessionManager::regenerate(); // Regenerate session ID for security
                
                echo json_encode([
                    'success' => true,
                    'message' => 'Login successful'
                ]);
            } else {
                echo json_encode(['success' => false, 'message' => 'Invalid email or password']);
            }
        } elseif ($action === 'forgot-password') {
            $email = $_POST['email'] ?? '';
            
            if (empty($email)) {
                http_response_code(400);
                echo json_encode(['success' => false, 'message' => 'Email is required']);
                exit;
            }
            
            // Find client by email
            $stmt = $pdo->prepare("SELECT id, name, email FROM clients WHERE email = ?");
            $stmt->execute([$email]);
            $client = $stmt->fetch(PDO::FETCH_ASSOC);
            
            // Always return success (security: don't reveal if email exists)
            if ($client) {
                // Generate secure token
                $token = bin2hex(random_bytes(32));
                $expiresAt = date('Y-m-d H:i:s', strtotime('+24 hours'));
                
                // Invalidate any existing tokens for this user
                $deleteStmt = $pdo->prepare("DELETE FROM password_reset_tokens WHERE user_type = 'client' AND user_id = ?");
                $deleteStmt->execute([$client['id']]);
                
                // Insert new token
                $insertStmt = $pdo->prepare("INSERT INTO password_reset_tokens (user_type, user_id, token, expires_at) VALUES ('client', ?, ?, ?)");
                $insertStmt->execute([$client['id'], $token, $expiresAt]);
                
                // Send password reset email
                try {
                    $baseUrl = defined('BASE_URL') ? constant('BASE_URL') : 'http://localhost/South-Ring-Autos';
                    $resetLink = $baseUrl . '/client/reset-password.php?token=' . $token;
                    
                    $emailService = new EmailService();
                    $emailService->sendPasswordReset([
                        'name' => $client['name'],
                        'email' => $client['email'],
                        'reset_link' => $resetLink,
                        'expiry_hours' => 24
                    ]);
                    
                    Logger::logInfo('Password reset email sent', ['client_id' => $client['id'], 'email' => $email]);
                } catch (Exception $e) {
                    Logger::logError('Password reset email failed: ' . $e->getMessage());
                }
            }
            
            // Always return success for security
            echo json_encode([
                'success' => true,
                'message' => 'If an account exists with that email, a password reset link has been sent.'
            ]);
        } elseif ($action === 'reset-password') {
            $token = $_POST['token'] ?? '';
            $password = $_POST['password'] ?? '';
            
            if (empty($token) || empty($password)) {
                http_response_code(400);
                echo json_encode(['success' => false, 'message' => 'Token and password are required']);
                exit;
            }
            
            if (strlen($password) < 8) {
                http_response_code(400);
                echo json_encode(['success' => false, 'message' => 'Password must be at least 8 characters']);
                exit;
            }
            
            // Find valid token
            $stmt = $pdo->prepare("SELECT prt.*, c.id as client_id, c.name, c.email 
                                   FROM password_reset_tokens prt 
                                   JOIN clients c ON prt.user_id = c.id 
                                   WHERE prt.token = ? AND prt.user_type = 'client' AND prt.used = 0 AND prt.expires_at > NOW()");
            $stmt->execute([$token]);
            $tokenData = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if (!$tokenData) {
                http_response_code(400);
                echo json_encode(['success' => false, 'message' => 'Invalid or expired reset token']);
                exit;
            }
            
            // Update password
            $hashedPassword = password_hash($password, PASSWORD_DEFAULT);
            $updateStmt = $pdo->prepare("UPDATE clients SET password = ? WHERE id = ?");
            $updateStmt->execute([$hashedPassword, $tokenData['client_id']]);
            
            // Mark token as used
            $markStmt = $pdo->prepare("UPDATE password_reset_tokens SET used = 1 WHERE id = ?");
            $markStmt->execute([$tokenData['id']]);
            
            // Send confirmation email
            try {
                $emailService = new EmailService();
                $emailService->sendPasswordResetSuccess([
                    'name' => $tokenData['name'],
                    'email' => $tokenData['email']
                ]);
                Logger::logInfo('Password reset successful', ['client_id' => $tokenData['client_id']]);
            } catch (Exception $e) {
                Logger::logError('Password reset success email failed: ' . $e->getMessage());
            }
            
            echo json_encode([
                'success' => true,
                'message' => 'Password reset successfully. You can now log in with your new password.'
            ]);
        } elseif ($action === 'register') {
            $rawInput = file_get_contents('php://input');
            $data = json_decode($rawInput, true);
            
            // Check if JSON parsing failed or data is null
            if ($data === null && json_last_error() !== JSON_ERROR_NONE) {
                http_response_code(400);
                echo json_encode([
                    'success' => false,
                    'message' => 'Invalid JSON data',
                    'error' => DEBUG_MODE ? json_last_error_msg() : null
                ]);
                exit;
            }
            
            if (!is_array($data)) {
                http_response_code(400);
                echo json_encode(['success' => false, 'message' => 'Invalid request data']);
                exit;
            }
            
            $name = $data['name'] ?? '';
            $email = $data['email'] ?? '';
            $phone = $data['phone'] ?? '';
            $password = $data['password'] ?? '';
            $address = $data['address'] ?? null;
            
            if (empty($name) || empty($email) || empty($phone) || empty($password)) {
                http_response_code(400);
                echo json_encode(['success' => false, 'message' => 'All fields are required']);
                exit;
            }
            
            if (strlen($password) < 8) {
                http_response_code(400);
                echo json_encode(['success' => false, 'message' => 'Password must be at least 8 characters']);
                exit;
            }
            
            // Check if email exists
            $checkStmt = $pdo->prepare("SELECT id FROM clients WHERE email = ?");
            $checkStmt->execute([$email]);
            if ($checkStmt->fetch()) {
                http_response_code(400);
                echo json_encode(['success' => false, 'message' => 'Email already registered']);
                exit;
            }
            
            $hashedPassword = password_hash($password, PASSWORD_DEFAULT);
            
            $stmt = $pdo->prepare("INSERT INTO clients (name, email, phone, password, address) VALUES (?, ?, ?, ?, ?)");
            $stmt->execute([$name, $email, $phone, $hashedPassword, $address]);
            
            $clientId = $pdo->lastInsertId();
            
            $_SESSION['client_logged_in'] = true;
            $_SESSION['client_id'] = $clientId;
            $_SESSION['client_email'] = $email;
            $_SESSION['client_name'] = $name;
            
            // Send welcome email
            try {
                $emailService = new EmailService();
                $emailService->sendWelcomeEmail([
                    'name' => $name,
                    'email' => $email
                ]);
                Logger::logInfo('Welcome email sent', ['client_id' => $clientId, 'email' => $email]);
            } catch (Exception $e) {
                // Log but don't fail registration
                Logger::logError('Welcome email failed: ' . $e->getMessage());
            }
            
            echo json_encode([
                'success' => true,
                'id' => $clientId,
                'message' => 'Registration successful'
            ]);
        }
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'message' => DEBUG_MODE ? $e->getMessage() : 'An error occurred'
        ]);
    }
} elseif ($action === 'logout') {
    session_destroy();
    echo json_encode(['success' => true, 'message' => 'Logged out']);
} else {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Invalid request']);
}

ob_end_flush();


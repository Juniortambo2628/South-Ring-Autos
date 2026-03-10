<?php
/**
 * Settings API
 * Handles application settings configuration
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

require_once __DIR__ . '/../bootstrap.php';

use SouthRingAutos\Utils\Logger;
use SouthRingAutos\Utils\SessionManager;
use SouthRingAutos\Utils\EmailService;

SessionManager::start();

// Check admin authentication
if (!SessionManager::isAdminLoggedIn()) {
    http_response_code(403);
    echo json_encode(['success' => false, 'message' => 'Unauthorized']);
    exit;
}

$action = $_GET['action'] ?? '';

try {
    switch ($action) {
        case 'email':
            saveEmailConfig();
            break;
        case 'test-email':
            testEmailConfig();
            break;
        default:
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Invalid action']);
    }
} catch (Exception $e) {
    Logger::logError('Settings API error: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => DEBUG_MODE ? $e->getMessage() : 'An error occurred'
    ]);
}

function saveEmailConfig() {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        http_response_code(405);
        echo json_encode(['success' => false, 'message' => 'POST method required']);
        return;
    }
    
    $data = json_decode(file_get_contents('php://input'), true);
    
    // Get config file path
    $configFile = __DIR__ . '/../config/app.php';
    
    // Read current config
    $configContent = file_get_contents($configFile);
    
    // Update email constants
    $updates = [
        'MAIL_FROM_EMAIL' => $data['mail_from_email'] ?? 'noreply@southringautos.com',
        'MAIL_FROM_NAME' => $data['mail_from_name'] ?? 'South Ring Autos',
        'MAIL_SMTP_ENABLED' => isset($data['mail_smtp_enabled']) && $data['mail_smtp_enabled'] ? 'true' : 'false',
        'MAIL_SMTP_HOST' => $data['mail_smtp_host'] ?? 'smtp.gmail.com',
        'MAIL_SMTP_PORT' => $data['mail_smtp_port'] ?? '587',
        'MAIL_SMTP_USER' => $data['mail_smtp_user'] ?? '',
        'MAIL_SMTP_SECURE' => $data['mail_smtp_secure'] ?? 'tls'
    ];
    
    // Only update password if provided
    if (!empty($data['mail_smtp_pass'])) {
        $updates['MAIL_SMTP_PASS'] = $data['mail_smtp_pass'];
    }
    
    // Update each constant in config file
    foreach ($updates as $constant => $value) {
        $pattern = "/define\s*\(\s*['\"]" . $constant . "['\"]\s*,\s*[^)]+\)/";
        $replacement = "define('" . $constant . "', " . (is_numeric($value) ? $value : "'" . addslashes($value) . "'") . ")";
        
        if (preg_match($pattern, $configContent)) {
            $configContent = preg_replace($pattern, $replacement, $configContent);
        } else {
            // Add constant if it doesn't exist (add before the closing PHP tag or at end)
            $configContent = rtrim($configContent) . "\ndefine('" . $constant . "', " . (is_numeric($value) ? $value : "'" . addslashes($value) . "'") . ");\n";
        }
    }
    
    // Write updated config
    if (file_put_contents($configFile, $configContent)) {
        Logger::logInfo('Email configuration updated');
        echo json_encode(['success' => true, 'message' => 'Email settings saved successfully']);
    } else {
        Logger::logError('Failed to save email configuration');
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Failed to save configuration']);
    }
}

function testEmailConfig() {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        http_response_code(405);
        echo json_encode(['success' => false, 'message' => 'POST method required']);
        return;
    }
    
    $data = json_decode(file_get_contents('php://input'), true);
    
    try {
        // Temporarily set constants for testing
        $originalConfig = [
            'MAIL_FROM_EMAIL' => defined('MAIL_FROM_EMAIL') ? constant('MAIL_FROM_EMAIL') : null,
            'MAIL_FROM_NAME' => defined('MAIL_FROM_NAME') ? constant('MAIL_FROM_NAME') : null,
            'MAIL_SMTP_ENABLED' => defined('MAIL_SMTP_ENABLED') ? constant('MAIL_SMTP_ENABLED') : null,
            'MAIL_SMTP_HOST' => defined('MAIL_SMTP_HOST') ? constant('MAIL_SMTP_HOST') : null,
            'MAIL_SMTP_PORT' => defined('MAIL_SMTP_PORT') ? constant('MAIL_SMTP_PORT') : null,
            'MAIL_SMTP_USER' => defined('MAIL_SMTP_USER') ? constant('MAIL_SMTP_USER') : null,
            'MAIL_SMTP_PASS' => defined('MAIL_SMTP_PASS') ? constant('MAIL_SMTP_PASS') : null,
            'MAIL_SMTP_SECURE' => defined('MAIL_SMTP_SECURE') ? constant('MAIL_SMTP_SECURE') : null
        ];
        
        // Set test values
        if (!defined('MAIL_FROM_EMAIL')) define('MAIL_FROM_EMAIL', $data['mail_from_email'] ?? 'noreply@southringautos.com');
        if (!defined('MAIL_FROM_NAME')) define('MAIL_FROM_NAME', $data['mail_from_name'] ?? 'South Ring Autos');
        if (!defined('MAIL_SMTP_ENABLED')) define('MAIL_SMTP_ENABLED', isset($data['mail_smtp_enabled']) && $data['mail_smtp_enabled']);
        if (!defined('MAIL_SMTP_HOST')) define('MAIL_SMTP_HOST', $data['mail_smtp_host'] ?? 'smtp.gmail.com');
        if (!defined('MAIL_SMTP_PORT')) define('MAIL_SMTP_PORT', $data['mail_smtp_port'] ?? 587);
        if (!defined('MAIL_SMTP_USER')) define('MAIL_SMTP_USER', $data['mail_smtp_user'] ?? '');
        if (!defined('MAIL_SMTP_PASS')) define('MAIL_SMTP_PASS', $data['mail_smtp_pass'] ?? '');
        if (!defined('MAIL_SMTP_SECURE')) define('MAIL_SMTP_SECURE', $data['mail_smtp_secure'] ?? 'tls');
        
        // Get admin email from session or use default
        $adminEmail = SessionManager::get('admin_email') ?? $data['mail_from_email'] ?? 'admin@southringautos.com';
        
        // Create EmailService instance and send test email
        $emailService = new EmailService();
        $subject = 'Test Email - South Ring Autos';
        $body = '<html><body><h2>Test Email</h2><p>This is a test email from South Ring Autos email configuration.</p><p>If you received this email, your email settings are configured correctly!</p></body></html>';
        
        $sent = $emailService->send($adminEmail, $subject, $body);
        
        if ($sent) {
            Logger::logInfo('Test email sent successfully', ['to' => $adminEmail]);
            echo json_encode(['success' => true, 'message' => 'Test email sent successfully']);
        } else {
            Logger::logError('Failed to send test email', ['to' => $adminEmail]);
            echo json_encode(['success' => false, 'message' => 'Failed to send test email. Check your SMTP settings.']);
        }
    } catch (Exception $e) {
        Logger::logError('Test email error: ' . $e->getMessage());
        echo json_encode(['success' => false, 'message' => 'Error: ' . $e->getMessage()]);
    }
}


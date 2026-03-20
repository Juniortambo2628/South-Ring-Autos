<?php
/**
 * Production Environment Verification Script
 * Run this script to verify production configuration
 */

require_once __DIR__ . '/../bootstrap.php';

use SouthRingAutos\Utils\Environment;
use SouthRingAutos\Database\Database;

echo "========================================\n";
echo "Production Environment Verification\n";
echo "========================================\n\n";

// Get server info
$detectedEnv = Environment::detect();
$appEnvVar = getenv('APP_ENV') ?: (isset($_ENV['APP_ENV']) ? $_ENV['APP_ENV'] : 'not set');
$serverIp = $_SERVER['SERVER_ADDR'] ?? $_SERVER['LOCAL_ADDR'] ?? 'unknown';
$host = $_SERVER['HTTP_HOST'] ?? $_SERVER['SERVER_NAME'] ?? 'unknown';
$documentRoot = $_SERVER['DOCUMENT_ROOT'] ?? 'unknown';
$scriptPath = $_SERVER['SCRIPT_FILENAME'] ?? __FILE__;

echo "Environment Detection:\n";
echo "---------------------\n";
echo "Detected Environment: " . $detectedEnv . "\n";
echo "APP_ENV Variable: " . $appEnvVar . "\n";
echo "Server IP: " . $serverIp . "\n";
echo "Host: " . $host . "\n";
echo "Document Root: " . $documentRoot . "\n";
echo "Script Path: " . $scriptPath . "\n\n";

// Verify environment
$isProduction = Environment::isProduction();
echo "Status: " . ($isProduction ? "✓ PRODUCTION" : "✗ DEVELOPMENT") . "\n\n";

// Check configuration
echo "Configuration Check:\n";
echo "--------------------\n";

// Database
$dbHost = $_ENV['DB_HOST'] ?? 'not set';
$dbName = $_ENV['DB_NAME'] ?? 'not set';
$dbUser = $_ENV['DB_USER'] ?? 'not set';
echo "Database Host: " . $dbHost . "\n";
echo "Database Name: " . $dbName . "\n";
echo "Database User: " . $dbUser . "\n";
echo "Database Port: " . ($_ENV['DB_PORT'] ?? 'not set') . "\n\n";

// Email
$smtpHost = $_ENV['SMTP_HOST'] ?? 'not set';
$smtpPort = $_ENV['SMTP_PORT'] ?? 'not set';
$smtpUser = $_ENV['SMTP_USER'] ?? 'not set';
echo "SMTP Host: " . $smtpHost . "\n";
echo "SMTP Port: " . $smtpPort . "\n";
echo "SMTP User: " . $smtpUser . "\n";
echo "SMTP Encryption: " . ($_ENV['SMTP_ENCRYPTION'] ?? 'not set') . "\n\n";

// Constants
echo "Application Constants:\n";
echo "---------------------\n";
echo "APP_ENV: " . (defined('APP_ENV') ? APP_ENV : 'not defined') . "\n";
echo "DEBUG_MODE: " . (defined('DEBUG_MODE') ? (DEBUG_MODE ? 'true' : 'false') : 'not defined') . "\n";
echo "BASE_URL: " . (defined('BASE_URL') ? BASE_URL : 'not defined') . "\n\n";

// Test database connection
echo "Testing Database Connection:\n";
echo "---------------------------\n";
try {
    $db = Database::getInstance();
    $pdo = $db->getConnection();
    echo "✓ Database connection successful\n";
    
    // Get database name
    $stmt = $pdo->query("SELECT DATABASE()");
    $currentDb = $stmt->fetchColumn();
    echo "Connected to database: " . $currentDb . "\n\n";
} catch (\Exception $e) {
    echo "✗ Database connection failed: " . $e->getMessage() . "\n\n";
}

// Production-specific checks
if ($isProduction) {
    echo "Production-Specific Checks:\n";
    echo "--------------------------\n";
    
    // Check DEBUG_MODE
    if (defined('DEBUG_MODE') && DEBUG_MODE) {
        echo "⚠ WARNING: DEBUG_MODE is enabled in production!\n";
    } else {
        echo "✓ DEBUG_MODE is disabled\n";
    }
    
    // Check database credentials
    $expectedDb = 'zhpebukm_southringautos';
    if ($dbName === $expectedDb) {
        echo "✓ Database name matches production\n";
    } else {
        echo "⚠ Database name doesn't match production (expected: $expectedDb)\n";
    }
    
    // Check email configuration
    if ($smtpHost === 'mail.okjtech.co.ke' && $smtpPort == 465) {
        echo "✓ Email configuration matches production\n";
    } else {
        echo "⚠ Email configuration may not be production settings\n";
    }
    
    // Check BASE_URL
    if (defined('BASE_URL') && strpos(BASE_URL, 'okjtech.co.ke/apps/SouthRingAutos') !== false) {
        echo "✓ BASE_URL appears to be production URL\n";
    } elseif (defined('BASE_URL') && strpos(BASE_URL, 'okjtech.co.ke') !== false) {
        echo "⚠ BASE_URL is production domain but may be missing subdirectory path\n";
    } else {
        echo "⚠ BASE_URL may not be production URL\n";
    }
}

echo "\n========================================\n";
echo "Verification Complete\n";
echo "========================================\n";


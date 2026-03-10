<?php
/**
 * 500 Error Diagnostic Script
 * Run this to identify what's causing the 500 error
 */

// Enable error display for diagnostics
error_reporting(E_ALL);
ini_set('display_errors', '1');
ini_set('log_errors', '1');

echo "<h1>500 Error Diagnostic</h1>";
echo "<pre>";

// Check PHP version
echo "PHP Version: " . phpversion() . "\n\n";

// Check if vendor directory exists
echo "Checking vendor directory...\n";
if (file_exists(__DIR__ . '/vendor/autoload.php')) {
    echo "✓ vendor/autoload.php exists\n";
} else {
    echo "✗ vendor/autoload.php NOT FOUND\n";
    echo "  Run: composer install --no-dev --optimize-autoloader\n\n";
}

// Check if bootstrap.php exists
echo "\nChecking bootstrap.php...\n";
if (file_exists(__DIR__ . '/bootstrap.php')) {
    echo "✓ bootstrap.php exists\n";
    try {
        require_once __DIR__ . '/bootstrap.php';
        echo "✓ bootstrap.php loaded successfully\n";
    } catch (Exception $e) {
        echo "✗ Error loading bootstrap.php: " . $e->getMessage() . "\n";
        echo "  File: " . $e->getFile() . "\n";
        echo "  Line: " . $e->getLine() . "\n";
    }
} else {
    echo "✗ bootstrap.php NOT FOUND\n";
}

// Check config files
echo "\nChecking config files...\n";
$configFiles = ['config/app.php', 'config/paths.php', 'config/constants.php', 'config/database.php'];
foreach ($configFiles as $file) {
    if (file_exists(__DIR__ . '/' . $file)) {
        echo "✓ $file exists\n";
    } else {
        echo "✗ $file NOT FOUND\n";
    }
}

// Check .env file
echo "\nChecking .env file...\n";
if (file_exists(__DIR__ . '/.env')) {
    echo "✓ .env file exists\n";
} else {
    echo "⚠ .env file not found (may use .env-production or defaults)\n";
}

// Check database connection
echo "\nChecking database connection...\n";
try {
    if (class_exists('SouthRingAutos\Database\Database')) {
        $db = SouthRingAutos\Database\Database::getInstance();
        $pdo = $db->getConnection();
        echo "✓ Database connection successful\n";
    } else {
        echo "✗ Database class not found\n";
    }
} catch (Exception $e) {
    echo "✗ Database connection failed: " . $e->getMessage() . "\n";
}

// Check required directories
echo "\nChecking required directories...\n";
$dirs = ['storage', 'storage/logs', 'storage/uploads', 'storage/cache', 'vendor', 'src'];
foreach ($dirs as $dir) {
    if (is_dir(__DIR__ . '/' . $dir)) {
        $writable = is_writable(__DIR__ . '/' . $dir) ? 'writable' : 'not writable';
        echo "✓ $dir exists ($writable)\n";
    } else {
        echo "✗ $dir NOT FOUND\n";
    }
}

// Check includes/header.php
echo "\nChecking includes/header.php...\n";
if (file_exists(__DIR__ . '/includes/header.php')) {
    echo "✓ includes/header.php exists\n";
    try {
        // Try to include it with output buffering
        ob_start();
        include __DIR__ . '/includes/header.php';
        $output = ob_get_clean();
        echo "✓ includes/header.php loaded successfully\n";
    } catch (Exception $e) {
        echo "✗ Error loading includes/header.php: " . $e->getMessage() . "\n";
        echo "  File: " . $e->getFile() . "\n";
        echo "  Line: " . $e->getLine() . "\n";
    } catch (Error $e) {
        echo "✗ Fatal error loading includes/header.php: " . $e->getMessage() . "\n";
        echo "  File: " . $e->getFile() . "\n";
        echo "  Line: " . $e->getLine() . "\n";
    }
} else {
    echo "✗ includes/header.php NOT FOUND\n";
}

// Check index.php
echo "\nChecking index.php...\n";
if (file_exists(__DIR__ . '/index.php')) {
    echo "✓ index.php exists\n";
} else {
    echo "✗ index.php NOT FOUND\n";
}

// Check for common PHP errors
echo "\nChecking for common issues...\n";

// Check if constants are defined
if (defined('BASE_URL')) {
    echo "✓ BASE_URL defined: " . BASE_URL . "\n";
} else {
    echo "✗ BASE_URL not defined\n";
}

if (defined('APP_ENV')) {
    echo "✓ APP_ENV defined: " . APP_ENV . "\n";
} else {
    echo "⚠ APP_ENV not defined (will auto-detect)\n";
}

if (defined('DEBUG_MODE')) {
    echo "✓ DEBUG_MODE defined: " . (DEBUG_MODE ? 'true' : 'false') . "\n";
} else {
    echo "⚠ DEBUG_MODE not defined (will auto-detect)\n";
}

// Check file permissions
echo "\nChecking file permissions...\n";
$files = ['.env', 'bootstrap.php', 'index.php', 'includes/header.php'];
foreach ($files as $file) {
    if (file_exists(__DIR__ . '/' . $file)) {
        $perms = substr(sprintf('%o', fileperms(__DIR__ . '/' . $file)), -4);
        echo "  $file: $perms\n";
    }
}

echo "\n=== Diagnostic Complete ===\n";
echo "</pre>";


<?php
/**
 * Quick Setup Test
 * Verifies all components are working
 */

require_once __DIR__ . '/../bootstrap.php';

use SouthRingAutos\Database\Database;
use SouthRingAutos\Config\Config;
use SouthRingAutos\Utils\Validator;

echo "=== South Ring Autos - Component Test ===\n\n";

// Test 1: Configuration
echo "1. Testing Configuration...\n";
try {
    $config = Config::init();
    $appName = Config::get('app.name');
    echo "   ✓ Config loaded: {$appName}\n";
} catch (Exception $e) {
    echo "   ✗ Config failed: " . $e->getMessage() . "\n";
    exit(1);
}

// Test 2: Database
echo "2. Testing Database...\n";
try {
    $db = Database::getInstance();
    $pdo = $db->getConnection();
    $stmt = $pdo->query("SELECT 1");
    echo "   ✓ Database connection successful\n";
} catch (Exception $e) {
    echo "   ✗ Database failed: " . $e->getMessage() . "\n";
    exit(1);
}

// Test 3: Validation
echo "3. Testing Validation...\n";
try {
    $testData = [
        'name' => 'Test User',
        'phone' => '+254712345678',
        'registration' => 'KCA 123A',
        'service' => 'General Service'
    ];
    $result = Validator::validateBooking($testData);
    if ($result['valid']) {
        echo "   ✓ Validation working\n";
    } else {
        echo "   ✗ Validation failed\n";
        exit(1);
    }
} catch (Exception $e) {
    echo "   ✗ Validation error: " . $e->getMessage() . "\n";
    exit(1);
}

// Test 4: Autoloading
echo "4. Testing Autoloading...\n";
try {
    if (class_exists('SouthRingAutos\\Database\\Database')) {
        echo "   ✓ Autoloading working\n";
    } else {
        echo "   ✗ Autoloading failed\n";
        exit(1);
    }
} catch (Exception $e) {
    echo "   ✗ Autoloading error: " . $e->getMessage() . "\n";
    exit(1);
}

// Test 5: Paths
echo "5. Testing Paths...\n";
if (defined('BASE_PATH') && defined('STORAGE_PATH')) {
    echo "   ✓ Paths defined correctly\n";
} else {
    echo "   ✗ Paths not defined\n";
    exit(1);
}

echo "\n=== All Tests Passed! ===\n";
echo "\nSystem is ready to use.\n";


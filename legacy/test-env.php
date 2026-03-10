<?php
/**
 * Test Environment Variables Loading
 * Use this to verify .env file is being read correctly
 */

error_reporting(E_ALL);
ini_set('display_errors', '1');

echo "<h1>Environment Variables Test</h1>";
echo "<pre>";

// Load bootstrap to initialize environment
// But first, let's manually ensure .env is loaded
if (file_exists(__DIR__ . '/.env')) {
    $envFile = file_get_contents(__DIR__ . '/.env');
    $lines = explode("\n", $envFile);
    foreach ($lines as $line) {
        $line = trim($line);
        if (empty($line) || strpos($line, '#') === 0) {
            continue;
        }
        if (strpos($line, '=') !== false) {
            $pos = strpos($line, '=');
            $key = trim(substr($line, 0, $pos));
            $value = trim(substr($line, $pos + 1));
            if ((substr($value, 0, 1) === '"' && substr($value, -1) === '"') ||
                (substr($value, 0, 1) === "'" && substr($value, -1) === "'")) {
                $value = substr($value, 1, -1);
            }
            $_ENV[$key] = $value;
            putenv("$key=$value");
        }
    }
}

require_once __DIR__ . '/bootstrap.php';

echo "=== Database Credentials Check ===\n\n";

// Check $_ENV
echo "From \$_ENV:\n";
echo "DB_HOST: " . (isset($_ENV['DB_HOST']) ? $_ENV['DB_HOST'] : 'NOT SET') . "\n";
echo "DB_NAME: " . (isset($_ENV['DB_NAME']) ? $_ENV['DB_NAME'] : 'NOT SET') . "\n";
echo "DB_USER: " . (isset($_ENV['DB_USER']) ? $_ENV['DB_USER'] : 'NOT SET') . "\n";
echo "DB_PASS: " . (isset($_ENV['DB_PASS']) ? (strlen($_ENV['DB_PASS']) > 0 ? '***SET*** (' . strlen($_ENV['DB_PASS']) . ' chars)' : 'EMPTY') : 'NOT SET') . "\n";
echo "DB_PORT: " . (isset($_ENV['DB_PORT']) ? $_ENV['DB_PORT'] : 'NOT SET') . "\n\n";

// Check getenv()
echo "From getenv():\n";
echo "DB_HOST: " . (getenv('DB_HOST') !== false ? getenv('DB_HOST') : 'NOT SET') . "\n";
echo "DB_NAME: " . (getenv('DB_NAME') !== false ? getenv('DB_NAME') : 'NOT SET') . "\n";
echo "DB_USER: " . (getenv('DB_USER') !== false ? getenv('DB_USER') : 'NOT SET') . "\n";
$dbPass = getenv('DB_PASS');
echo "DB_PASS: " . ($dbPass !== false ? (strlen($dbPass) > 0 ? '***SET*** (' . strlen($dbPass) . ' chars)' : 'EMPTY') : 'NOT SET') . "\n";
echo "DB_PORT: " . (getenv('DB_PORT') !== false ? getenv('DB_PORT') : 'NOT SET') . "\n\n";

// Check .env file directly
echo "=== Reading .env file directly ===\n";
if (file_exists(__DIR__ . '/.env')) {
    $envContent = file_get_contents(__DIR__ . '/.env');
    $lines = explode("\n", $envContent);
    foreach ($lines as $line) {
        $line = trim($line);
        if (empty($line) || strpos($line, '#') === 0) {
            continue;
        }
        if (strpos($line, '=') !== false && (strpos($line, 'DB_') === 0)) {
            list($key, $value) = explode('=', $line, 2);
            $key = trim($key);
            $value = trim($value);
            if ($key === 'DB_PASS') {
                echo "$key = " . (strlen($value) > 0 ? '***SET*** (' . strlen($value) . ' chars)' : 'EMPTY') . "\n";
            } else {
                echo "$key = $value\n";
            }
        }
    }
} else {
    echo ".env file not found!\n";
}

echo "\n=== Test Database Connection ===\n";
try {
    $host = $_ENV['DB_HOST'] ?? getenv('DB_HOST') ?: 'localhost';
    $dbname = $_ENV['DB_NAME'] ?? getenv('DB_NAME') ?: 'south_ring_autos';
    $username = $_ENV['DB_USER'] ?? getenv('DB_USER') ?: 'root';
    $password = $_ENV['DB_PASS'] ?? getenv('DB_PASS') ?: '';
    
    echo "Attempting connection with:\n";
    echo "Host: $host\n";
    echo "Database: $dbname\n";
    echo "User: $username\n";
    echo "Password: " . (strlen($password) > 0 ? '***SET***' : 'EMPTY') . "\n\n";
    
    $dsn = "mysql:host={$host};dbname={$dbname};charset=utf8mb4";
    $pdo = new PDO($dsn, $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    echo "✓ Database connection successful!\n";
} catch (PDOException $e) {
    echo "✗ Database connection failed: " . $e->getMessage() . "\n";
}

echo "</pre>";


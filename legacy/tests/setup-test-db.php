<?php
/**
 * Setup script to create test database if it doesn't exist
 * Run this before running tests if you want a separate test database
 */

require_once __DIR__ . '/../vendor/autoload.php';

$host = $_ENV['DB_HOST'] ?? 'localhost';
$username = $_ENV['DB_USER'] ?? 'root';
$password = $_ENV['DB_PASS'] ?? '';
$testDbName = $_ENV['DB_NAME'] ?? 'south_ring_autos';

try {
    $pdo = new PDO("mysql:host={$host};charset=utf8mb4", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    // Check if database exists
    $stmt = $pdo->query("SELECT SCHEMA_NAME FROM INFORMATION_SCHEMA.SCHEMATA WHERE SCHEMA_NAME = '{$testDbName}'");
    $exists = $stmt->fetch();
    
    if (!$exists) {
        echo "Creating test database: {$testDbName}\n";
        $pdo->exec("CREATE DATABASE IF NOT EXISTS `{$testDbName}` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci");
        echo "Test database created successfully!\n";
    } else {
        echo "Test database already exists: {$testDbName}\n";
    }
    
    echo "Database setup complete. You can now run tests.\n";
} catch (PDOException $e) {
    echo "Error: " . $e->getMessage() . "\n";
    exit(1);
}


<?php
/**
 * Legacy Database Configuration
 * This file is kept for backwards compatibility
 * New code should use: use SouthRingAutos\Database\Database;
 */

// Load new system if available
if (file_exists(__DIR__ . '/../bootstrap.php')) {
    require_once __DIR__ . '/../bootstrap.php';
    
    // Use the new database instance
    if (!isset($pdo)) {
        $db = \SouthRingAutos\Database\Database::getInstance();
        $pdo = $db->getConnection();
    }
} else {
    // Fallback to old system
    $host = $_ENV['DB_HOST'] ?? 'localhost';
    $dbname = $_ENV['DB_NAME'] ?? 'south_ring_autos';
    $username = $_ENV['DB_USER'] ?? 'root';
    $password = $_ENV['DB_PASS'] ?? '';

    try {
        $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8mb4", $username, $password);
        $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        $pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
    } catch (PDOException $e) {
        die(json_encode(['success' => false, 'message' => 'Database connection failed: ' . $e->getMessage()]));
    }
}


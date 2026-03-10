<?php
/**
 * Migration Script: Add vehicle_id to bookings table
 */
require_once __DIR__ . '/../bootstrap.php';

use SouthRingAutos\Database\Database;

$db = Database::getInstance();
$pdo = $db->getConnection();

try {
    // Check if vehicle_id column already exists
    $stmt = $pdo->query("SHOW COLUMNS FROM bookings LIKE 'vehicle_id'");
    if ($stmt->rowCount() == 0) {
        // Add vehicle_id column
        $pdo->exec("ALTER TABLE bookings ADD COLUMN vehicle_id INT NULL AFTER client_id");
        $pdo->exec("ALTER TABLE bookings ADD FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE SET NULL");
        $pdo->exec("ALTER TABLE bookings ADD INDEX idx_vehicle_id (vehicle_id)");
        echo "✅ Successfully added vehicle_id column to bookings table\n";
    } else {
        echo "ℹ️  vehicle_id column already exists in bookings table\n";
    }
    
    // Check if vehicles table exists
    $stmt = $pdo->query("SHOW TABLES LIKE 'vehicles'");
    if ($stmt->rowCount() == 0) {
        echo "⚠️  Warning: vehicles table does not exist. Run Database::getInstance() to create it.\n";
    } else {
        echo "✅ Vehicles table exists\n";
    }
    
    echo "\n✅ Migration completed successfully!\n";
} catch (PDOException $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
    exit(1);
}


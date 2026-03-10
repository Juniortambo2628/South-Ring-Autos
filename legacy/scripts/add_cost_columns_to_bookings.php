<?php
/**
 * Migration Script: Add estimated_cost and actual_cost columns to bookings table
 */
require_once __DIR__ . '/../bootstrap.php';

use SouthRingAutos\Database\Database;

$db = Database::getInstance();
$pdo = $db->getConnection();

try {
    // Check if estimated_cost column exists
    $stmt = $pdo->query("SHOW COLUMNS FROM bookings LIKE 'estimated_cost'");
    if ($stmt->rowCount() == 0) {
        // Add estimated_cost column
        $pdo->exec("ALTER TABLE bookings ADD COLUMN estimated_cost DECIMAL(10,2) NULL AFTER status");
        echo "✅ Successfully added estimated_cost column to bookings table\n";
    } else {
        echo "ℹ️  estimated_cost column already exists in bookings table\n";
    }
    
    // Check if actual_cost column exists
    $stmt = $pdo->query("SHOW COLUMNS FROM bookings LIKE 'actual_cost'");
    if ($stmt->rowCount() == 0) {
        // Add actual_cost column
        $pdo->exec("ALTER TABLE bookings ADD COLUMN actual_cost DECIMAL(10,2) NULL AFTER estimated_cost");
        echo "✅ Successfully added actual_cost column to bookings table\n";
    } else {
        echo "ℹ️  actual_cost column already exists in bookings table\n";
    }
    
    echo "\n✅ Migration completed successfully!\n";
} catch (PDOException $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
    exit(1);
}


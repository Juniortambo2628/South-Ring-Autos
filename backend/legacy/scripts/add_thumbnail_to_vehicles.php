<?php
/**
 * Add thumbnail column to vehicles table if it doesn't exist
 */
require_once __DIR__ . '/../bootstrap.php';

use SouthRingAutos\Database\Database;

$db = Database::getInstance();
$pdo = $db->getConnection();

try {
    // Check if column exists
    $stmt = $pdo->query("SHOW COLUMNS FROM vehicles LIKE 'thumbnail'");
    if ($stmt->rowCount() === 0) {
        // Add thumbnail column
        $pdo->exec("ALTER TABLE vehicles ADD COLUMN thumbnail VARCHAR(255) NULL AFTER mileage");
        echo "✅ Thumbnail column added to vehicles table\n";
    } else {
        echo "ℹ️  thumbnail column already exists in vehicles table\n";
    }
    
    echo "✅ Migration completed successfully!\n";
} catch (PDOException $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
    exit(1);
}


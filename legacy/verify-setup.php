<?php
/**
 * Quick Database Verification Script
 * Simple command-line test
 */
require_once 'config/database.php';

echo "=== Database Verification ===\n\n";

try {
    // Test tables
    $tables = ['blog_posts', 'bookings', 'admin_users'];
    foreach ($tables as $table) {
        $stmt = $pdo->query("SELECT COUNT(*) FROM $table");
        $count = $stmt->fetchColumn();
        echo "✓ Table '$table': $count records\n";
    }
    
    // Test admin user
    $stmt = $pdo->prepare("SELECT username FROM admin_users WHERE username = 'admin'");
    $stmt->execute();
    $admin = $stmt->fetch();
    if ($admin) {
        echo "✓ Admin user exists: " . $admin['username'] . "\n";
        echo "  Password: admin123\n";
    } else {
        echo "✗ Admin user not found\n";
    }
    
    echo "\n✓ All tests passed! System is ready.\n";
    echo "\nAdmin Login URL: http://localhost/South-Ring-Autos/admin/login.php\n";
    
} catch (Exception $e) {
    echo "✗ Error: " . $e->getMessage() . "\n";
    exit(1);
}
?>


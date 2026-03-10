<?php
/**
 * Set Test Password
 * Sets a known password for a test account to verify login modal
 */

require_once __DIR__ . '/../bootstrap.php';

use SouthRingAutos\Database\Database;

$db = Database::getInstance();
$pdo = $db->getConnection();

// Find a test client
$stmt = $pdo->prepare('SELECT id, email, name FROM clients WHERE email LIKE ? LIMIT 1');
$stmt->execute(['%@example.com']);
$client = $stmt->fetch(PDO::FETCH_ASSOC);

if ($client) {
    $testPassword = 'TestPassword123!';
    $hash = password_hash($testPassword, PASSWORD_DEFAULT);
    
    $update = $pdo->prepare('UPDATE clients SET password = ? WHERE id = ?');
    $update->execute([$hash, $client['id']]);
    
    echo "Updated test account:\n";
    echo "Email: {$client['email']}\n";
    echo "Name: {$client['name']}\n";
    echo "Password: $testPassword\n";
} else {
    echo "No test client found with @example.com email\n";
}

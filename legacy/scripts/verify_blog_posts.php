<?php
require_once __DIR__ . '/../bootstrap.php';

use SouthRingAutos\Database\Database;

try {
    $db = Database::getInstance();
    $pdo = $db->getConnection();
    
    $stmt = $pdo->query("SELECT id, title, created_at FROM blog_posts ORDER BY created_at DESC");
    $posts = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo "Found " . count($posts) . " blog posts:\n";
    foreach ($posts as $post) {
        echo "- [{$post['id']}] {$post['title']} ({$post['created_at']})\n";
    }
    
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}

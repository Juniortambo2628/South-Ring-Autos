<?php
/**
 * Cache Management API
 * Allows clearing cache (admin only)
 */

header('Content-Type: application/json');

require_once __DIR__ . '/../bootstrap.php';

use SouthRingAutos\Utils\Cache;
use SouthRingAutos\Utils\SessionManager;

SessionManager::start();

// Check admin authentication
if (!SessionManager::isAdminLoggedIn()) {
    http_response_code(403);
    echo json_encode([
        'success' => false,
        'message' => 'Unauthorized'
    ]);
    exit;
}

$action = $_GET['action'] ?? 'clear';

if ($action === 'clear') {
    $deleted = Cache::clear();
    echo json_encode([
        'success' => true,
        'message' => "Cache cleared successfully. {$deleted} files deleted.",
        'deleted_count' => $deleted
    ]);
} elseif ($action === 'clear_logos') {
    // Clear only car logos cache
    $cacheKey = 'car_logos_data_%';
    $cacheDir = defined('CACHE_PATH') ? CACHE_PATH : (__DIR__ . '/../cache');
    $files = glob($cacheDir . '/car_logos_data_*.cache');
    $deleted = 0;
    
    foreach ($files as $file) {
        if (is_file($file)) {
            @unlink($file);
            $deleted++;
        }
    }
    
    echo json_encode([
        'success' => true,
        'message' => "Car logos cache cleared. {$deleted} files deleted.",
        'deleted_count' => $deleted
    ]);
} else {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => 'Invalid action'
    ]);
}


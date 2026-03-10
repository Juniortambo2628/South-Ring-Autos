<?php
/**
 * Car Logos API
 * Serves car logo data from the car-logos-dataset
 * Includes caching for improved performance
 */

header('Content-Type: application/json');
ini_set('display_errors', '0');
error_reporting(E_ALL);

try {
    require_once __DIR__ . '/../bootstrap.php';
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'System error. Please contact administrator.',
        'error' => DEBUG_MODE ? $e->getMessage() : null
    ]);
    exit;
}

use SouthRingAutos\Utils\Cache;

$action = $_GET['action'] ?? 'list';
$logosPath = __DIR__ . '/../car-logos-dataset-master/logos/data.json';

if (!file_exists($logosPath)) {
    http_response_code(404);
    echo json_encode([
        'success' => false,
        'message' => 'Car logos dataset not found'
    ]);
    exit;
}

// Try to get from cache first (cache for 24 hours)
$cacheKey = 'car_logos_data_' . md5($logosPath . filemtime($logosPath));
$logosData = Cache::get($cacheKey, 86400);

if ($logosData === null) {
    // Load from file and cache it
    $logosData = json_decode(file_get_contents($logosPath), true);
    if ($logosData !== null) {
        Cache::set($cacheKey, $logosData);
    }
}

if ($action === 'list') {
    // Return all logos
    echo json_encode([
        'success' => true,
        'logos' => $logosData,
        'count' => count($logosData)
    ]);
} elseif ($action === 'search') {
    // Search for specific brand
    $query = strtolower($_GET['q'] ?? '');
    
    if (empty($query)) {
        echo json_encode([
            'success' => true,
            'logos' => [],
            'count' => 0
        ]);
        exit;
    }
    
    $filtered = array_filter($logosData, function($logo) use ($query) {
        return strpos(strtolower($logo['name']), $query) !== false || 
               strpos(strtolower($logo['slug']), $query) !== false;
    });
    
    echo json_encode([
        'success' => true,
        'logos' => array_values($filtered),
        'count' => count($filtered)
    ]);
} elseif ($action === 'get') {
    // Get specific logo by slug or make
    $slug = $_GET['slug'] ?? '';
    $make = $_GET['make'] ?? '';
    
    if (empty($slug) && empty($make)) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'message' => 'Slug or make parameter required'
        ]);
        exit;
    }
    
    $logo = null;
    foreach ($logosData as $item) {
        // Try slug match first
        if (!empty($slug) && strtolower($item['slug']) === strtolower($slug)) {
            $logo = $item;
            break;
        }
        // Try make/name match
        if (!empty($make)) {
            $makeLower = strtolower(trim($make));
            $itemNameLower = strtolower(trim($item['name']));
            $itemSlugLower = strtolower(trim($item['slug']));
            
            if ($itemNameLower === $makeLower || 
                $itemSlugLower === $makeLower ||
                strpos($itemNameLower, $makeLower) !== false ||
                strpos($makeLower, $itemNameLower) !== false) {
                $logo = $item;
                break;
            }
        }
    }
    
    if ($logo) {
        echo json_encode([
            'success' => true,
            'logo' => $logo
        ]);
    } else {
        http_response_code(404);
        echo json_encode([
            'success' => false,
            'message' => 'Logo not found'
        ]);
    }
} else {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => 'Invalid action'
    ]);
}


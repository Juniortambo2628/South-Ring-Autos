<?php
/**
 * Car Brands Carousel API
 * Manages car brands displayed in the carousel
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

use SouthRingAutos\Database\Database;
use SouthRingAutos\Utils\SessionManager;

$db = Database::getInstance();
$pdo = $db->getConnection();
$action = $_GET['action'] ?? 'list';
$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET' && $action === 'list') {
    // Get active brands for carousel (public endpoint)
    $stmt = $pdo->prepare("SELECT * FROM car_brands_carousel WHERE is_active = 1 ORDER BY display_order ASC, brand_name ASC");
    $stmt->execute();
    $brands = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Get logo data for each brand
    $logosPath = __DIR__ . '/../car-logos-dataset-master/logos/data.json';
    $logosData = [];
    if (file_exists($logosPath)) {
        $allLogos = json_decode(file_get_contents($logosPath), true);
        foreach ($allLogos as $logo) {
            $logosData[strtolower($logo['slug'])] = $logo;
        }
    }
    
    // Merge logo data with brand records
    foreach ($brands as &$brand) {
        $slug = strtolower($brand['brand_slug']);
        if (isset($logosData[$slug])) {
            $brand['logo'] = $logosData[$slug]['image'];
        }
    }
    
    echo json_encode([
        'success' => true,
        'brands' => $brands,
        'count' => count($brands)
    ]);
} elseif ($method === 'POST' && $action === 'add') {
    // Add brand to carousel (admin only)
    SessionManager::start();
    if (!SessionManager::isAdminLoggedIn()) {
        http_response_code(403);
        echo json_encode(['success' => false, 'message' => 'Unauthorized']);
        exit;
    }
    
    $data = json_decode(file_get_contents('php://input'), true);
    $brandName = $data['brand_name'] ?? '';
    $brandSlug = $data['brand_slug'] ?? '';
    $displayOrder = $data['display_order'] ?? 0;
    
    if (empty($brandName) || empty($brandSlug)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Brand name and slug are required']);
        exit;
    }
    
    try {
        $stmt = $pdo->prepare("INSERT INTO car_brands_carousel (brand_name, brand_slug, display_order) VALUES (?, ?, ?)");
        $stmt->execute([$brandName, $brandSlug, $displayOrder]);
        
        echo json_encode([
            'success' => true,
            'id' => $pdo->lastInsertId(),
            'message' => 'Brand added successfully'
        ]);
    } catch (PDOException $e) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'message' => 'Failed to add brand. It may already exist.'
        ]);
    }
} elseif ($method === 'POST' && $action === 'update') {
    // Update brand (admin only)
    SessionManager::start();
    if (!SessionManager::isAdminLoggedIn()) {
        http_response_code(403);
        echo json_encode(['success' => false, 'message' => 'Unauthorized']);
        exit;
    }
    
    $data = json_decode(file_get_contents('php://input'), true);
    $id = $data['id'] ?? 0;
    $brandName = $data['brand_name'] ?? '';
    $displayOrder = $data['display_order'] ?? 0;
    $isActive = isset($data['is_active']) ? (int)$data['is_active'] : 1;
    
    if (empty($id)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Brand ID is required']);
        exit;
    }
    
    $stmt = $pdo->prepare("UPDATE car_brands_carousel SET brand_name = ?, display_order = ?, is_active = ? WHERE id = ?");
    $stmt->execute([$brandName, $displayOrder, $isActive, $id]);
    
    echo json_encode([
        'success' => true,
        'message' => 'Brand updated successfully'
    ]);
} elseif ($method === 'DELETE' || ($method === 'POST' && $action === 'delete')) {
    // Delete brand (admin only)
    SessionManager::start();
    if (!SessionManager::isAdminLoggedIn()) {
        http_response_code(403);
        echo json_encode(['success' => false, 'message' => 'Unauthorized']);
        exit;
    }
    
    $id = $_GET['id'] ?? ($_POST['id'] ?? 0);
    
    if (empty($id)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Brand ID is required']);
        exit;
    }
    
    $stmt = $pdo->prepare("DELETE FROM car_brands_carousel WHERE id = ?");
    $stmt->execute([$id]);
    
    echo json_encode([
        'success' => true,
        'message' => 'Brand deleted successfully'
    ]);
} elseif ($method === 'GET' && $action === 'all') {
    // Get all brands for admin (admin only)
    SessionManager::start();
    if (!SessionManager::isAdminLoggedIn()) {
        http_response_code(403);
        echo json_encode(['success' => false, 'message' => 'Unauthorized']);
        exit;
    }
    
    $stmt = $pdo->prepare("SELECT * FROM car_brands_carousel ORDER BY display_order ASC, brand_name ASC");
    $stmt->execute();
    $brands = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo json_encode([
        'success' => true,
        'brands' => $brands,
        'count' => count($brands)
    ]);
} else {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Invalid action']);
}


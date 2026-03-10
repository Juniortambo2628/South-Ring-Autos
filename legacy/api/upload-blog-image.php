<?php
/**
 * Blog Image Upload API
 * Handles file uploads for blog post images
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

require_once __DIR__ . '/../bootstrap.php';

use SouthRingAutos\Utils\SessionManager;

SessionManager::start();

// Check admin authentication
if (!SessionManager::isAdminLoggedIn()) {
    http_response_code(403);
    echo json_encode(['success' => false, 'message' => 'Unauthorized']);
    exit;
}

// Check if file was uploaded (FilePond sends as 'filepond' or 'image')
$fileKey = null;
if (isset($_FILES['filepond']) && $_FILES['filepond']['error'] === UPLOAD_ERR_OK) {
    $fileKey = 'filepond';
} elseif (isset($_FILES['image']) && $_FILES['image']['error'] === UPLOAD_ERR_OK) {
    $fileKey = 'image';
} else {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'No file uploaded or upload error']);
    exit;
}

$file = $_FILES[$fileKey];

// Validate file type
$allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
$finfo = finfo_open(FILEINFO_MIME_TYPE);
$mimeType = finfo_file($finfo, $file['tmp_name']);
finfo_close($finfo);

if (!in_array($mimeType, $allowedTypes)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed.']);
    exit;
}

// Validate file size (5MB max)
$maxSize = 5 * 1024 * 1024; // 5MB
if ($file['size'] > $maxSize) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'File size exceeds 5MB limit']);
    exit;
}

// Create upload directory if it doesn't exist
$uploadDir = __DIR__ . '/../storage/uploads/blog/';
if (!is_dir($uploadDir)) {
    mkdir($uploadDir, 0755, true);
}

// Generate unique filename
$extension = pathinfo($file['name'], PATHINFO_EXTENSION);
$filename = 'blog_' . uniqid() . '_' . time() . '.' . $extension;
$filepath = $uploadDir . $filename;

// Move uploaded file
if (!move_uploaded_file($file['tmp_name'], $filepath)) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Failed to save file']);
    exit;
}

// Return relative path for database storage
$relativePath = 'storage/uploads/blog/' . $filename;
// Get base URL from paths config
$baseUrl = defined('BASE_URL') ? BASE_URL : '';
if (empty($baseUrl)) {
    // Fallback: construct from current request
    $protocol = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ? 'https' : 'http';
    $host = $_SERVER['HTTP_HOST'] ?? 'localhost';
    $scriptDir = dirname(dirname($_SERVER['SCRIPT_NAME']));
    $baseUrl = $protocol . '://' . $host . $scriptDir;
}
$absoluteUrl = rtrim($baseUrl, '/') . '/' . $relativePath;

echo json_encode([
    'success' => true,
    'path' => $relativePath,
    'url' => $absoluteUrl,
    'filename' => $filename
]);


<?php
/**
 * Base Paths Configuration
 * Central configuration for all file paths
 */

// Prevent multiple includes
if (defined('BASE_PATH')) {
    return;
}

define('BASE_PATH', dirname(__DIR__));

if (!defined('CONFIG_PATH')) {
    define('CONFIG_PATH', BASE_PATH . DIRECTORY_SEPARATOR . 'config');
}

if (!defined('SRC_PATH')) {
    define('SRC_PATH', BASE_PATH . DIRECTORY_SEPARATOR . 'src');
}

if (!defined('PUBLIC_PATH')) {
    define('PUBLIC_PATH', BASE_PATH);
}

if (!defined('ADMIN_PATH')) {
    define('ADMIN_PATH', BASE_PATH . DIRECTORY_SEPARATOR . 'admin');
}

if (!defined('API_PATH')) {
    define('API_PATH', BASE_PATH . DIRECTORY_SEPARATOR . 'api');
}

if (!defined('VENDOR_PATH')) {
    define('VENDOR_PATH', BASE_PATH . DIRECTORY_SEPARATOR . 'vendor');
}

if (!defined('STORAGE_PATH')) {
    define('STORAGE_PATH', BASE_PATH . DIRECTORY_SEPARATOR . 'storage');
}

if (!defined('LOG_PATH')) {
    define('LOG_PATH', STORAGE_PATH . DIRECTORY_SEPARATOR . 'logs');
}

if (!defined('CACHE_PATH')) {
    define('CACHE_PATH', STORAGE_PATH . DIRECTORY_SEPARATOR . 'cache');
}

if (!defined('TEMPLATES_PATH')) {
    define('TEMPLATES_PATH', BASE_PATH . DIRECTORY_SEPARATOR . 'templates');
}

// URL paths (relative to web root)
if (!defined('BASE_URL')) {
    // Check if BASE_URL is set in environment
    $baseUrl = getenv('BASE_URL');
    if (!$baseUrl && isset($_ENV['BASE_URL'])) {
        $baseUrl = $_ENV['BASE_URL'];
    }
    
    // Auto-detect production domain
    if (!$baseUrl) {
        $host = $_SERVER['HTTP_HOST'] ?? $_SERVER['SERVER_NAME'] ?? 'localhost';
        $isProduction = in_array($host, ['okjtech.co.ke', 'www.okjtech.co.ke']);
        
        if ($isProduction) {
            // Production is in subdirectory
            $baseUrl = 'https://okjtech.co.ke/apps/SouthRingAutos';
        } else {
            // Development - detect subdirectory if running in subdirectory
            $scriptName = $_SERVER['SCRIPT_NAME'] ?? '';
            $baseUrl = dirname(dirname($scriptName));
            if ($baseUrl === '/' || $baseUrl === '\\') {
                $baseUrl = '/South-Ring-Autos';
            }
        }
    }
    
    define('BASE_URL', $baseUrl);
}

if (!defined('ADMIN_URL')) {
    define('ADMIN_URL', BASE_URL . '/admin');
}

if (!defined('API_URL')) {
    define('API_URL', BASE_URL . '/api');
}

if (!defined('ASSETS_URL')) {
    define('ASSETS_URL', BASE_URL . '/assets');
}


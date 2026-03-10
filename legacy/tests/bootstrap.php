<?php
/**
 * PHPUnit Bootstrap
 * Sets up testing environment
 */

// Set testing environment
if (!defined('APP_ENV')) {
    define('APP_ENV', 'testing');
}
$_ENV['APP_ENV'] = 'testing';
// Use existing database for testing (tests will clean up after themselves)
$_ENV['DB_NAME'] = $_ENV['DB_NAME'] ?? 'south_ring_autos';

// Load Composer autoloader
require_once __DIR__ . '/../vendor/autoload.php';

// Load configuration files
require_once __DIR__ . '/../config/paths.php';
require_once __DIR__ . '/../config/constants.php';

// Mock database for testing (can be overridden in tests)
if (!defined('USE_TEST_DB')) {
    define('USE_TEST_DB', true);
}

// Ensure storage directories exist
if (!defined('STORAGE_PATH')) {
    define('STORAGE_PATH', __DIR__ . '/../storage');
}
if (!defined('LOG_PATH')) {
    define('LOG_PATH', STORAGE_PATH . '/logs');
}

// Create directories if they don't exist
if (!is_dir(STORAGE_PATH)) {
    mkdir(STORAGE_PATH, 0775, true);
}
if (!is_dir(LOG_PATH)) {
    mkdir(LOG_PATH, 0775, true);
}



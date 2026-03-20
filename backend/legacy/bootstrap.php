<?php
/**
 * Bootstrap File
 * Initialize application and load all dependencies
 */

// Load Composer autoloader first
if (file_exists(__DIR__ . '/vendor/autoload.php')) {
    try {
        require_once __DIR__ . '/vendor/autoload.php';
    } catch (Throwable $e) {
        // If autoloader fails, fall back to manual loading
        error_log("Composer autoloader failed: " . $e->getMessage());
    }
}

// Fallback: Load classes manually if Composer is not installed or failed
if (!class_exists('SouthRingAutos\\Database\\Database')) {
    spl_autoload_register(function ($class) {
        $prefix = 'SouthRingAutos\\';
        $baseDir = __DIR__ . '/src/';
        
        $len = strlen($prefix);
        if (strncmp($prefix, $class, $len) !== 0) {
            return;
        }
        
        $relativeClass = substr($class, $len);
        $file = $baseDir . str_replace('\\', '/', $relativeClass) . '.php';
        
        if (file_exists($file)) {
            require $file;
        }
    });
}

// Load configuration
try {
    require_once __DIR__ . '/config/app.php';
} catch (Throwable $e) {
    // Log error but don't fail completely
    error_log("Config loading error: " . $e->getMessage());
    // Set minimal defaults
    if (!defined('BASE_PATH')) {
        define('BASE_PATH', __DIR__);
    }
    if (!defined('BASE_URL')) {
        $host = $_SERVER['HTTP_HOST'] ?? 'localhost';
        define('BASE_URL', 'https://' . $host . '/apps/SouthRingAutos');
    }
}

// Initialize environment detection
try {
    if (class_exists('SouthRingAutos\Utils\Environment')) {
        $envClass = 'SouthRingAutos\Utils\Environment';
        $envClass::detect();
        
        // Set error reporting based on environment
        error_reporting($envClass::getErrorReporting());
        ini_set('display_errors', $envClass::shouldDisplayErrors() ? '1' : '0');
    } else {
        // Fallback if Environment class doesn't exist
        error_reporting(E_ALL & ~E_DEPRECATED & ~E_STRICT);
        ini_set('display_errors', '0');
    }
} catch (Throwable $e) {
    error_log("Environment detection error: " . $e->getMessage());
    // Set defaults
    if (!defined('APP_ENV')) {
        define('APP_ENV', 'production');
    }
    if (!defined('DEBUG_MODE')) {
        define('DEBUG_MODE', false);
    }
    error_reporting(E_ALL & ~E_DEPRECATED & ~E_STRICT);
    ini_set('display_errors', '0');
}

// Define DEBUG_MODE constant if not already defined
if (!defined('DEBUG_MODE')) {
    if (class_exists('SouthRingAutos\Utils\Environment')) {
        $envClass = 'SouthRingAutos\Utils\Environment';
        define('DEBUG_MODE', $envClass::isDebugMode());
    } else {
        define('DEBUG_MODE', false);
    }
}

// Initialize error handler if class exists
if (class_exists('SouthRingAutos\Utils\ErrorHandler')) {
    \SouthRingAutos\Utils\ErrorHandler::init();
}

// Initialize session manager (but don't start session automatically - let each script decide)
// Session will be started on demand via SessionManager::start()
// Note: SessionManager is loaded via autoloader when needed

// Initialize database (will be done when Database class is used)
// Database connection is lazy-loaded via Database::getInstance()


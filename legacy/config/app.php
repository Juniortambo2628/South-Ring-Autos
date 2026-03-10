<?php
/**
 * Central Application Configuration
 * Load all configuration files and initialize the application
 */

// Load base paths first (required for constants.php which uses LOG_PATH)
// Check for a constant defined at the end of paths.php to ensure it was fully loaded
if (!defined('ASSETS_URL')) {
    require_once __DIR__ . '/paths.php';
}

// Load constants if not already loaded
if (!defined('APP_NAME')) {
    require_once __DIR__ . '/constants.php';
}

// Load Composer autoloader if it exists
if (file_exists(BASE_PATH . '/vendor/autoload.php')) {
    require_once BASE_PATH . '/vendor/autoload.php';
}

// Load environment variables
if (file_exists(BASE_PATH . '/.env')) {
    $envLoaded = false;
    
    // Try Dotenv first if available
    if (class_exists('Dotenv\Dotenv')) {
        try {
            $dotenv = Dotenv\Dotenv::createImmutable(BASE_PATH);
            $dotenv->load();
            $envLoaded = true;
            
            // Verify it actually loaded by checking a known key
            if (!isset($_ENV['DB_HOST']) && getenv('DB_HOST') === false) {
                $envLoaded = false; // Dotenv didn't actually load values
            }
        } catch (Exception $e) {
            // Dotenv failed, will use manual parsing
            $envLoaded = false;
        }
    }
    
    // Always do manual parsing as fallback or verification
    // This ensures values are loaded even if Dotenv fails silently
    $envFile = file_get_contents(BASE_PATH . '/.env');
    $lines = explode("\n", $envFile);
    foreach ($lines as $line) {
        $line = trim($line);
        if (empty($line) || strpos($line, '#') === 0) {
            continue;
        }
        if (strpos($line, '=') !== false) {
            // Split on first = only (in case value contains =)
            $pos = strpos($line, '=');
            $key = trim(substr($line, 0, $pos));
            $value = trim(substr($line, $pos + 1));
            
            // Remove quotes if present
            if ((substr($value, 0, 1) === '"' && substr($value, -1) === '"') ||
                (substr($value, 0, 1) === "'" && substr($value, -1) === "'")) {
                $value = substr($value, 1, -1);
            }
            
            // Set in both $_ENV and putenv for compatibility
            // Override any existing values to ensure .env takes precedence
            $_ENV[$key] = $value;
            putenv("$key=$value");
        }
    }
}

// Override constants with .env values if present
if (isset($_ENV['APP_ENV'])) {
    if (!defined('APP_ENV')) {
        define('APP_ENV', $_ENV['APP_ENV']);
    }
}

if (isset($_ENV['DEBUG_MODE'])) {
    if (!defined('DEBUG_MODE')) {
        define('DEBUG_MODE', filter_var($_ENV['DEBUG_MODE'], FILTER_VALIDATE_BOOLEAN));
    }
}

// Create storage directories if they don't exist
if (!is_dir(STORAGE_PATH)) {
    mkdir(STORAGE_PATH, 0755, true);
}

if (!is_dir(LOG_PATH)) {
    mkdir(LOG_PATH, 0755, true);
}

if (defined('CACHE_PATH') && !is_dir(CACHE_PATH)) {
    mkdir(CACHE_PATH, 0755, true);
}

// Error handling - will be set by bootstrap.php using Environment utility
// This is kept for backward compatibility
if (!defined('DEBUG_MODE')) {
    // Will be defined by bootstrap.php
}

// Timezone
date_default_timezone_set('Africa/Nairobi');

// Session settings are now handled by SessionManager utility
// SessionManager::start() will configure sessions with appropriate security settings

return [
    'app' => [
        'name' => APP_NAME,
        'version' => APP_VERSION,
        'env' => APP_ENV,
        'debug' => DEBUG_MODE,
    ],
    'company' => [
        'name' => COMPANY_NAME,
        'address' => COMPANY_ADDRESS,
        'po_box' => COMPANY_PO_BOX,
        'phone' => COMPANY_PHONE,
        'email' => COMPANY_EMAIL,
    ],
    'paths' => [
        'base' => BASE_PATH,
        'config' => CONFIG_PATH,
        'src' => SRC_PATH,
        'public' => PUBLIC_PATH,
        'admin' => ADMIN_PATH,
        'api' => API_PATH,
        'storage' => STORAGE_PATH,
        'logs' => LOG_PATH,
    ],
    'urls' => [
        'base' => BASE_URL,
        'admin' => ADMIN_URL,
        'api' => API_URL,
    ],
];


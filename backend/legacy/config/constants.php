<?php
/**
 * Application Constants
 * Central configuration for all constants
 */

// Prevent multiple definitions
if (defined('APP_NAME')) {
    return;
}

// Application Info
define('APP_NAME', 'South Ring Autos');
define('APP_VERSION', '1.0.0');

/**
 * Simple environment detection (used before autoloader is available)
 * This is a fallback - Environment class provides more robust detection
 */
if (!function_exists('simpleEnvironmentDetect')) {
    function simpleEnvironmentDetect() {
        // Production indicators
        $productionIps = ['51.89.113.223'];
        $productionDomains = ['southringautos.com', 'www.southringautos.com'];
        $productionPaths = ['/home/zhpebukm/southringautos.com', '/home/zhpebukm'];
        
        // Check IP
        $serverIp = $_SERVER['SERVER_ADDR'] ?? $_SERVER['LOCAL_ADDR'] ?? null;
        if ($serverIp && in_array($serverIp, $productionIps)) {
            return 'production';
        }
        
        // Check domain
        $host = $_SERVER['HTTP_HOST'] ?? $_SERVER['SERVER_NAME'] ?? null;
        if ($host) {
            $host = explode(':', $host)[0];
            foreach ($productionDomains as $domain) {
                if ($host === $domain || (function_exists('str_ends_with') && str_ends_with($host, '.' . $domain))) {
                    return 'production';
                }
                // Fallback for PHP < 8.0 (check if host ends with .domain)
                if ($host !== $domain && strlen($host) > strlen($domain) && substr($host, -strlen($domain) - 1) === '.' . $domain) {
                    return 'production';
                }
            }
        }
        
        // Check path
        $scriptPath = $_SERVER['SCRIPT_FILENAME'] ?? __FILE__;
        $realPath = realpath(dirname($scriptPath));
        if ($realPath) {
            foreach ($productionPaths as $prodPath) {
                if (strpos($realPath, $prodPath) === 0) {
                    return 'production';
                }
            }
        }
        
        return 'development';
    }
}

// Environment Detection
if (!defined('APP_ENV')) {
    // Try to load Environment utility if autoloader is available
    $envValue = null;
    
    // Check .env file first (if it exists and dotenv is loaded)
    if (isset($_ENV['APP_ENV'])) {
        $envValue = $_ENV['APP_ENV'];
    } elseif (function_exists('getenv') && getenv('APP_ENV')) {
        $envValue = getenv('APP_ENV');
    }
    
    // If not set in environment variables, use automatic detection
    if (!$envValue || ($envValue !== 'production' && $envValue !== 'development' && $envValue !== 'testing')) {
        // Use simple detection if Environment class isn't available yet
        $detectedEnv = simpleEnvironmentDetect();
        $envValue = $detectedEnv;
    }
    
    define('APP_ENV', $envValue);
}

// Company Information
define('COMPANY_NAME', 'South Ring Autos Ltd');
define('COMPANY_ADDRESS', 'Bogani East Lane, off Bogani East Road (Adjacent to Catholic University of East Africa)');
define('COMPANY_PO_BOX', 'P.O. Box 40664-00100, Nairobi');
define('COMPANY_PHONE', '+254 704 113 472');
define('COMPANY_EMAIL', 'southringautos@gmail.com');

// Business Hours
define('HOURS_MON_FRI', '8:00 — 18:00');
define('HOURS_SAT', '8:00 — 14:00');
define('HOURS_SUN', 'Closed (emergencies by appointment)');

// Pagination
define('POSTS_PER_PAGE', 6);
define('BOOKINGS_PER_PAGE', 20);

// Upload Settings
define('MAX_UPLOAD_SIZE', 5242880); // 5MB
define('ALLOWED_IMAGE_TYPES', ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']);

// Session Settings
define('SESSION_LIFETIME', 3600 * 2); // 2 hours
define('SESSION_NAME', 'southring_admin');

// Security
define('PASSWORD_MIN_LENGTH', 8);
define('CSRF_TOKEN_NAME', '_csrf_token');

// Email Settings (will be overridden by .env)
define('SMTP_HOST', getenv('SMTP_HOST') ?: 'localhost');
define('SMTP_PORT', getenv('SMTP_PORT') ?: 587);
define('SMTP_USER', getenv('SMTP_USER') ?: '');
define('SMTP_PASS', getenv('SMTP_PASS') ?: '');
define('SMTP_ENCRYPTION', getenv('SMTP_ENCRYPTION') ?: 'tls');
define('EMAIL_FROM', getenv('EMAIL_FROM') ?: COMPANY_EMAIL);
define('EMAIL_FROM_NAME', getenv('EMAIL_FROM_NAME') ?: COMPANY_NAME);

// Notification Settings (can be overridden by .env)
define('NOTIFY_ON_BOOKING', filter_var(getenv('NOTIFY_ON_BOOKING') ?: '1', FILTER_VALIDATE_BOOLEAN));
define('NOTIFY_ON_CONTACT', filter_var(getenv('NOTIFY_ON_CONTACT') ?: '1', FILTER_VALIDATE_BOOLEAN));
define('ADMIN_EMAIL', getenv('ADMIN_EMAIL') ?: COMPANY_EMAIL);

// Email Configuration (can be overridden via .env or admin settings)
if (!defined('MAIL_FROM_EMAIL')) {
    define('MAIL_FROM_EMAIL', getenv('MAIL_FROM_EMAIL') ?: EMAIL_FROM);
}
if (!defined('MAIL_FROM_NAME')) {
    define('MAIL_FROM_NAME', getenv('MAIL_FROM_NAME') ?: EMAIL_FROM_NAME);
}
if (!defined('MAIL_SMTP_ENABLED')) {
    define('MAIL_SMTP_ENABLED', filter_var(getenv('MAIL_SMTP_ENABLED') ?: false, FILTER_VALIDATE_BOOLEAN));
}
if (!defined('MAIL_SMTP_HOST')) {
    define('MAIL_SMTP_HOST', getenv('MAIL_SMTP_HOST') ?: 'smtp.gmail.com');
}
if (!defined('MAIL_SMTP_PORT')) {
    define('MAIL_SMTP_PORT', getenv('MAIL_SMTP_PORT') ?: 587);
}
if (!defined('MAIL_SMTP_USER')) {
    define('MAIL_SMTP_USER', getenv('MAIL_SMTP_USER') ?: '');
}
if (!defined('MAIL_SMTP_PASS')) {
    define('MAIL_SMTP_PASS', getenv('MAIL_SMTP_PASS') ?: '');
}
if (!defined('MAIL_SMTP_SECURE')) {
    define('MAIL_SMTP_SECURE', getenv('MAIL_SMTP_SECURE') ?: 'tls');
}

// Debug Settings
define('DEBUG_MODE', APP_ENV === 'development');
define('ERROR_LOG_FILE', LOG_PATH . DIRECTORY_SEPARATOR . 'errors.log');
define('DEBUG_LOG_FILE', LOG_PATH . DIRECTORY_SEPARATOR . 'debug.log');


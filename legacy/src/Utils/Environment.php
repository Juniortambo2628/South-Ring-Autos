<?php
/**
 * Environment Detection and Configuration
 * Automatically detects and manages application environment
 */

namespace SouthRingAutos\Utils;

class Environment
{
    private static $environment = null;
    private static $isProduction = null;
    private static $isDevelopment = null;
    private static $isLocal = null;

    /**
     * Detect environment automatically
     */
    public static function detect()
    {
        if (self::$environment !== null) {
            return self::$environment;
        }

        // Check for .env file first (if using dotenv)
        if (file_exists(__DIR__ . '/../../.env')) {
            // Try to load from .env if dotenv is available
            if (class_exists('\Dotenv\Dotenv')) {
                try {
                    $dotenv = \Dotenv\Dotenv::createImmutable(__DIR__ . '/../../');
                    $dotenv->load();
                } catch (\Exception $e) {
                    // .env file exists but couldn't be loaded
                }
            }
        }

        // Check environment variable first
        $env = getenv('APP_ENV');
        if ($env !== false) {
            self::$environment = strtolower($env);
            return self::$environment;
        }

        // Check for APP_ENV in $_ENV
        if (isset($_ENV['APP_ENV'])) {
            self::$environment = strtolower($_ENV['APP_ENV']);
            return self::$environment;
        }

        // Check for APP_ENV in $_SERVER
        if (isset($_SERVER['APP_ENV'])) {
            self::$environment = strtolower($_SERVER['APP_ENV']);
            return self::$environment;
        }

        // Auto-detect based on server name and host
        $hostname = $_SERVER['HTTP_HOST'] ?? $_SERVER['SERVER_NAME'] ?? 'localhost';
        $serverName = $_SERVER['SERVER_NAME'] ?? 'localhost';
        
        // Check if localhost or development indicators
        if (in_array(strtolower($hostname), ['localhost', '127.0.0.1', '::1']) ||
            strpos($hostname, '.local') !== false ||
            strpos($hostname, '.dev') !== false ||
            strpos($hostname, '.test') !== false ||
            strpos($serverName, 'localhost') !== false) {
            self::$environment = 'development';
            return self::$environment;
        }

        // Check for production indicators
        if (strpos($hostname, 'www.') === 0 ||
            strpos($hostname, 'okjtech.co.ke') !== false ||
            strpos($hostname, 'southringautos') !== false) {
            self::$environment = 'production';
            return self::$environment;
        }

        // Default to development for safety
        self::$environment = 'development';
        return self::$environment;
    }

    /**
     * Get current environment
     */
    public static function get()
    {
        return self::detect();
    }

    /**
     * Check if production environment
     */
    public static function isProduction()
    {
        if (self::$isProduction !== null) {
            return self::$isProduction;
        }
        self::$isProduction = self::detect() === 'production';
        return self::$isProduction;
    }

    /**
     * Check if development environment
     */
    public static function isDevelopment()
    {
        if (self::$isDevelopment !== null) {
            return self::$isDevelopment;
        }
        self::$isDevelopment = self::detect() === 'development';
        return self::$isDevelopment;
    }

    /**
     * Check if local environment
     */
    public static function isLocal()
    {
        if (self::$isLocal !== null) {
            return self::$isLocal;
        }
        $env = self::detect();
        self::$isLocal = in_array($env, ['development', 'local', 'test']);
        return self::$isLocal;
    }

    /**
     * Set environment manually (for testing)
     */
    public static function set($environment)
    {
        self::$environment = strtolower($environment);
        self::$isProduction = null;
        self::$isDevelopment = null;
        self::$isLocal = null;
    }

    /**
     * Get debug mode based on environment
     */
    public static function isDebugMode()
    {
        // Check for explicit DEBUG_MODE constant or env var
        if (defined('DEBUG_MODE')) {
            return DEBUG_MODE;
        }

        $debug = getenv('DEBUG_MODE');
        if ($debug !== false) {
            return filter_var($debug, FILTER_VALIDATE_BOOLEAN);
        }

        // Default: debug on in development, off in production
        return !self::isProduction();
    }

    /**
     * Get error reporting level based on environment
     */
    public static function getErrorReporting()
    {
        if (self::isProduction()) {
            return E_ALL & ~E_DEPRECATED & ~E_STRICT;
        }
        return E_ALL;
    }

    /**
     * Should display errors
     */
    public static function shouldDisplayErrors()
    {
        return self::isDevelopment();
    }
}

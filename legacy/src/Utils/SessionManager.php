<?php
/**
 * Session Manager
 * Centralized session handling to avoid duplication
 */

namespace SouthRingAutos\Utils;

class SessionManager
{
    private static $started = false;

    /**
     * Start session if not already started
     */
    public static function start()
    {
        if (self::$started || session_status() === PHP_SESSION_ACTIVE) {
            return true;
        }

        if (session_status() === PHP_SESSION_NONE) {
            // Configure session settings
            ini_set('session.cookie_httponly', '1');
            ini_set('session.use_strict_mode', '1');
            ini_set('session.cookie_samesite', 'Strict');
            
            // Set secure cookie in production
            if (self::isSecure()) {
                ini_set('session.cookie_secure', '1');
            }

            session_start();
            self::$started = true;
            return true;
        }

        return false;
    }

    /**
     * Check if session is active
     */
    public static function isActive()
    {
        return session_status() === PHP_SESSION_ACTIVE;
    }

    /**
     * Get session value
     */
    public static function get($key, $default = null)
    {
        self::start();
        return $_SESSION[$key] ?? $default;
    }

    /**
     * Set session value
     */
    public static function set($key, $value)
    {
        self::start();
        $_SESSION[$key] = $value;
    }

    /**
     * Check if session key exists
     */
    public static function has($key)
    {
        self::start();
        return isset($_SESSION[$key]);
    }

    /**
     * Remove session value
     */
    public static function remove($key)
    {
        self::start();
        unset($_SESSION[$key]);
    }

    /**
     * Destroy session
     */
    public static function destroy()
    {
        // Start session if not already started (needed to destroy it)
        if (!self::isActive() && session_status() === PHP_SESSION_NONE) {
            session_start();
        }
        
        if (self::isActive()) {
            // Clear all session data
            $_SESSION = [];
            
            // Get session cookie parameters before destroying
            $params = session_get_cookie_params();
            $sessionName = session_name();
            
            // Destroy the session first
            session_destroy();
            self::$started = false;
            
            // Delete the session cookie with all possible paths
            // Try multiple paths to ensure cookie is deleted
            $paths = [
                $params['path'],
                '/',
                '/South-Ring-Autos',
                '/South-Ring-Autos/',
                '/South-Ring-Autos/client',
                '/South-Ring-Autos/client/'
            ];
            
            foreach ($paths as $path) {
                setcookie(
                    $sessionName,
                    '',
                    time() - 3600,
                    $path,
                    $params['domain'],
                    $params['secure'],
                    $params['httponly']
                );
            }
            
            // Also unset from $_COOKIE superglobal
            if (isset($_COOKIE[$sessionName])) {
                unset($_COOKIE[$sessionName]);
            }
        }
    }

    /**
     * Regenerate session ID
     */
    public static function regenerate()
    {
        self::start();
        session_regenerate_id(true);
    }

    /**
     * Check if connection is secure (HTTPS)
     */
    private static function isSecure()
    {
        return (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') 
            || $_SERVER['SERVER_PORT'] == 443;
    }

    /**
     * Check if client is logged in
     */
    public static function isClientLoggedIn()
    {
        return self::has('client_logged_in') && self::get('client_logged_in') === true;
    }

    /**
     * Check if admin is logged in
     */
    public static function isAdminLoggedIn()
    {
        return self::has('admin_logged_in') && self::get('admin_logged_in') === true;
    }

    /**
     * Get client ID
     */
    public static function getClientId()
    {
        return self::get('client_id');
    }

    /**
     * Get admin ID
     */
    public static function getAdminId()
    {
        return self::get('admin_id');
    }

    /**
     * Get client name
     */
    public static function getClientName()
    {
        return self::get('client_name');
    }

    /**
     * Get client email
     */
    public static function getClientEmail()
    {
        return self::get('client_email');
    }
}


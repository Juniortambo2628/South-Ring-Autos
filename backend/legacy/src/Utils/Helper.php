<?php

namespace SouthRingAutos\Utils;

use SouthRingAutos\Utils\SessionManager;

/**
 * Helper Functions
 * Common utility functions used across the application
 */
class Helper
{
    /**
     * Sanitize input string
     */
    public static function sanitize($string)
    {
        return htmlspecialchars(trim($string), ENT_QUOTES, 'UTF-8');
    }

    /**
     * Generate CSRF token
     */
    public static function generateCsrfToken()
    {
        SessionManager::start();

        $tokenName = defined('CSRF_TOKEN_NAME') ? CSRF_TOKEN_NAME : 'csrf_token';
        if (!SessionManager::has($tokenName)) {
            SessionManager::set($tokenName, bin2hex(random_bytes(32)));
        }

        return SessionManager::get($tokenName);
    }

    /**
     * Verify CSRF token
     */
    public static function verifyCsrfToken($token)
    {
        SessionManager::start();
        
        $tokenName = defined('CSRF_TOKEN_NAME') ? CSRF_TOKEN_NAME : 'csrf_token';
        $storedToken = SessionManager::get($tokenName);
        
        return !empty($storedToken) && hash_equals($storedToken, $token);
    }

    /**
     * Format date for display
     */
    public static function formatDate($date, $format = 'Y-m-d H:i:s')
    {
        if (is_string($date)) {
            $date = new \DateTime($date);
        }

        return $date->format($format);
    }

    /**
     * Redirect to URL
     */
    public static function redirect($url, $statusCode = 302)
    {
        header('Location: ' . $url, true, $statusCode);
        exit;
    }

    /**
     * Get client IP address
     */
    public static function getClientIp()
    {
        $ipKeys = ['HTTP_CLIENT_IP', 'HTTP_X_FORWARDED_FOR', 'REMOTE_ADDR'];

        foreach ($ipKeys as $key) {
            if (array_key_exists($key, $_SERVER) === true) {
                foreach (explode(',', $_SERVER[$key]) as $ip) {
                    $ip = trim($ip);
                    if (filter_var($ip, FILTER_VALIDATE_IP, FILTER_FLAG_NO_PRIV_RANGE | FILTER_FLAG_NO_RES_RANGE) !== false) {
                        return $ip;
                    }
                }
            }
        }

        return $_SERVER['REMOTE_ADDR'] ?? '0.0.0.0';
    }

    /**
     * Slugify string for URLs
     */
    public static function slugify($string)
    {
        $string = strtolower(trim($string));
        $string = preg_replace('/[^a-z0-9-]/', '-', $string);
        $string = preg_replace('/-+/', '-', $string);

        return trim($string, '-');
    }

    /**
     * Truncate string with ellipsis
     */
    public static function truncate($string, $length = 100, $ellipsis = '...')
    {
        if (strlen($string) <= $length) {
            return $string;
        }

        return substr($string, 0, $length) . $ellipsis;
    }
}

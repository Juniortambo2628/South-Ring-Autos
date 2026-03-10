<?php

namespace SouthRingAutos\Config;

/**
 * Central Configuration Class
 * Provides access to all configuration settings
 */
class Config
{
    private static $config = null;

    /**
     * Initialize configuration
     */
    public static function init()
    {
        if (self::$config === null) {
            self::$config = require CONFIG_PATH . '/app.php';
        }

        return self::$config;
    }

    /**
     * Get configuration value
     *
     * @param string $key Dot notation key (e.g., 'app.name')
     * @param mixed $default Default value if key not found
     * @return mixed
     */
    public static function get($key, $default = null)
    {
        if (self::$config === null) {
            self::init();
        }

        $keys = explode('.', $key);
        $value = self::$config;

        foreach ($keys as $k) {
            if (! isset($value[$k])) {
                return $default;
            }
            $value = $value[$k];
        }

        return $value;
    }

    /**
     * Get all configuration
     */
    public static function all()
    {
        if (self::$config === null) {
            self::init();
        }

        return self::$config;
    }

    /**
     * Check if configuration key exists
     */
    public static function has($key)
    {
        if (self::$config === null) {
            self::init();
        }

        $keys = explode('.', $key);
        $value = self::$config;

        foreach ($keys as $k) {
            if (! isset($value[$k])) {
                return false;
            }
            $value = $value[$k];
        }

        return true;
    }
}

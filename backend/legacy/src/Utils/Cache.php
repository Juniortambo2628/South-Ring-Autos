<?php

namespace SouthRingAutos\Utils;

/**
 * Simple File-Based Cache Utility
 * Provides caching functionality for API responses and computed data
 */
class Cache
{
    private static $cacheDir = null;
    private const DEFAULT_TTL = 3600; // 1 hour

    /**
     * Get cache directory path
     */
    private static function getCacheDir()
    {
        if (self::$cacheDir === null) {
            $cachePath = defined('CACHE_PATH') ? CACHE_PATH : (__DIR__ . '/../../cache');
            if (!is_dir($cachePath)) {
                mkdir($cachePath, 0755, true);
            }
            self::$cacheDir = $cachePath;
        }
        return self::$cacheDir;
    }

    /**
     * Generate cache key from string
     */
    private static function getCacheKey($key)
    {
        return md5($key) . '.cache';
    }

    /**
     * Get cached data
     * 
     * @param string $key Cache key
     * @param int $ttl Time to live in seconds
     * @return mixed|null Cached data or null if not found/expired
     */
    public static function get($key, $ttl = self::DEFAULT_TTL)
    {
        $cacheFile = self::getCacheDir() . '/' . self::getCacheKey($key);
        
        if (!file_exists($cacheFile)) {
            return null;
        }

        // Check if cache is expired
        if (filemtime($cacheFile) + $ttl < time()) {
            @unlink($cacheFile);
            return null;
        }

        $data = file_get_contents($cacheFile);
        return unserialize($data);
    }

    /**
     * Store data in cache
     * 
     * @param string $key Cache key
     * @param mixed $data Data to cache
     * @return bool Success status
     */
    public static function set($key, $data)
    {
        $cacheFile = self::getCacheDir() . '/' . self::getCacheKey($key);
        $serialized = serialize($data);
        
        return file_put_contents($cacheFile, $serialized) !== false;
    }

    /**
     * Delete cached data
     * 
     * @param string $key Cache key
     * @return bool Success status
     */
    public static function delete($key)
    {
        $cacheFile = self::getCacheDir() . '/' . self::getCacheKey($key);
        
        if (file_exists($cacheFile)) {
            return unlink($cacheFile);
        }
        
        return true;
    }

    /**
     * Clear all cache
     * 
     * @return int Number of files deleted
     */
    public static function clear()
    {
        $cacheDir = self::getCacheDir();
        $files = glob($cacheDir . '/*.cache');
        $deleted = 0;
        
        foreach ($files as $file) {
            if (is_file($file)) {
                @unlink($file);
                $deleted++;
            }
        }
        
        return $deleted;
    }

    /**
     * Check if cache exists and is valid
     * 
     * @param string $key Cache key
     * @param int $ttl Time to live in seconds
     * @return bool
     */
    public static function has($key, $ttl = self::DEFAULT_TTL)
    {
        $cacheFile = self::getCacheDir() . '/' . self::getCacheKey($key);
        
        if (!file_exists($cacheFile)) {
            return false;
        }

        return filemtime($cacheFile) + $ttl >= time();
    }
}


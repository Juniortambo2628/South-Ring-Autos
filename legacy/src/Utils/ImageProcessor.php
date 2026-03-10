<?php
/**
 * Image Processor Service
 * Wrapper for Intervention Image for image manipulation
 */

namespace SouthRingAutos\Utils;

use Intervention\Image\ImageManager;
use Intervention\Image\Drivers\Gd\Driver;

class ImageProcessor
{
    private $manager;

    public function __construct()
    {
        $this->manager = new ImageManager(new Driver());
    }

    /**
     * Resize image
     * @param string $imagePath Path to image file
     * @param int $width Target width
     * @param int $height Target height
     * @param bool $maintainAspectRatio Maintain aspect ratio
     * @return string Path to resized image
     */
    public function resize($imagePath, $width, $height, $maintainAspectRatio = true)
    {
        try {
            $image = $this->manager->read($imagePath);
            
            if ($maintainAspectRatio) {
                $image->scale($width, $height);
            } else {
                $image->resize($width, $height);
            }
            
            $newPath = $this->getResizedPath($imagePath, $width, $height);
            $image->save($newPath);
            
            return $newPath;
        } catch (\Exception $e) {
            \SouthRingAutos\Utils\Logger::logError("ImageProcessor resize error: " . $e->getMessage());
            return $imagePath; // Return original on error
        }
    }

    /**
     * Create thumbnail
     * @param string $imagePath Path to image file
     * @param int $size Thumbnail size (square)
     * @return string Path to thumbnail
     */
    public function createThumbnail($imagePath, $size = 256)
    {
        return $this->resize($imagePath, $size, $size, true);
    }

    /**
     * Optimize image (compress)
     * @param string $imagePath Path to image file
     * @param int $quality Quality (1-100)
     * @return string Path to optimized image
     */
    public function optimize($imagePath, $quality = 85)
    {
        try {
            $image = $this->manager->read($imagePath);
            $newPath = $this->getOptimizedPath($imagePath);
            
            // In Intervention Image v3, quality can be set via save() with named argument (PHP 8.0+)
            // Since we're targeting PHP 8.2, we can use named arguments
            $image->save($newPath, quality: $quality);
            
            return $newPath;
        } catch (\Exception $e) {
            \SouthRingAutos\Utils\Logger::logError("ImageProcessor optimize error: " . $e->getMessage());
            return $imagePath;
        }
    }

    /**
     * Convert image format
     * @param string $imagePath Path to image file
     * @param string $format Target format (jpg, png, webp)
     * @return string Path to converted image
     */
    public function convert($imagePath, $format = 'webp')
    {
        try {
            $image = $this->manager->read($imagePath);
            $newPath = $this->getConvertedPath($imagePath, $format);
            $format = strtolower($format);
            
            // In Intervention Image v3, format conversion is done by saving with the new extension
            // The format is auto-detected from the file extension
            // Save with the new extension (format is detected from extension)
            $image->save($newPath);
            
            return $newPath;
        } catch (\Exception $e) {
            \SouthRingAutos\Utils\Logger::logError("ImageProcessor convert error: " . $e->getMessage());
            return $imagePath;
        }
    }

    /**
     * Get resized image path
     */
    private function getResizedPath($originalPath, $width, $height)
    {
        $pathInfo = pathinfo($originalPath);
        return $pathInfo['dirname'] . '/' . $pathInfo['filename'] . "_{$width}x{$height}." . $pathInfo['extension'];
    }

    /**
     * Get optimized image path
     */
    private function getOptimizedPath($originalPath)
    {
        $pathInfo = pathinfo($originalPath);
        return $pathInfo['dirname'] . '/' . $pathInfo['filename'] . '_optimized.' . $pathInfo['extension'];
    }

    /**
     * Get converted image path
     */
    private function getConvertedPath($originalPath, $format)
    {
        $pathInfo = pathinfo($originalPath);
        return $pathInfo['dirname'] . '/' . $pathInfo['filename'] . '.' . $format;
    }
}


<?php

namespace SouthRingAutos\Utils;

/**
 * Image Optimization Utility
 * Provides image compression and optimization for production
 */
class ImageOptimizer
{
    /**
     * Optimize image for web (if GD library is available)
     * 
     * @param string $imagePath Path to image file
     * @param int $quality JPEG quality (1-100)
     * @param int $maxWidth Maximum width (0 = no resize)
     * @param int $maxHeight Maximum height (0 = no resize)
     * @return array Result with success status and optimized path
     */
    public static function optimize($imagePath, $quality = 85, $maxWidth = 0, $maxHeight = 0)
    {
        if (!extension_loaded('gd')) {
            return [
                'success' => false,
                'message' => 'GD library not available',
                'path' => $imagePath
            ];
        }

        if (!file_exists($imagePath)) {
            return [
                'success' => false,
                'message' => 'Image file not found',
                'path' => $imagePath
            ];
        }

        $imageInfo = getimagesize($imagePath);
        if ($imageInfo === false) {
            return [
                'success' => false,
                'message' => 'Invalid image file',
                'path' => $imagePath
            ];
        }

        $mimeType = $imageInfo['mime'];
        $width = $imageInfo[0];
        $height = $imageInfo[1];

        // Load image based on type
        switch ($mimeType) {
            case 'image/jpeg':
                $source = imagecreatefromjpeg($imagePath);
                break;
            case 'image/png':
                $source = imagecreatefrompng($imagePath);
                break;
            case 'image/gif':
                $source = imagecreatefromgif($imagePath);
                break;
            case 'image/webp':
                if (function_exists('imagecreatefromwebp')) {
                    $source = imagecreatefromwebp($imagePath);
                } else {
                    return [
                        'success' => false,
                        'message' => 'WebP not supported',
                        'path' => $imagePath
                    ];
                }
                break;
            default:
                return [
                    'success' => false,
                    'message' => 'Unsupported image type',
                    'path' => $imagePath
                ];
        }

        if (!$source) {
            return [
                'success' => false,
                'message' => 'Failed to load image',
                'path' => $imagePath
            ];
        }

        // Calculate new dimensions if resizing needed
        $newWidth = $width;
        $newHeight = $height;
        
        if ($maxWidth > 0 && $width > $maxWidth) {
            $ratio = $maxWidth / $width;
            $newWidth = $maxWidth;
            $newHeight = (int)($height * $ratio);
        }
        
        if ($maxHeight > 0 && $newHeight > $maxHeight) {
            $ratio = $maxHeight / $newHeight;
            $newHeight = $maxHeight;
            $newWidth = (int)($newWidth * $ratio);
        }

        // Create new image if resizing
        if ($newWidth !== $width || $newHeight !== $height) {
            $optimized = imagecreatetruecolor($newWidth, $newHeight);
            
            // Preserve transparency for PNG and GIF
            if ($mimeType === 'image/png' || $mimeType === 'image/gif') {
                imagealphablending($optimized, false);
                imagesavealpha($optimized, true);
                $transparent = imagecolorallocatealpha($optimized, 255, 255, 255, 127);
                imagefilledrectangle($optimized, 0, 0, $newWidth, $newHeight, $transparent);
            }
            
            imagecopyresampled($optimized, $source, 0, 0, 0, 0, $newWidth, $newHeight, $width, $height);
            imagedestroy($source);
            $source = $optimized;
        }

        // Save optimized image
        $pathInfo = pathinfo($imagePath);
        $optimizedPath = $pathInfo['dirname'] . '/' . $pathInfo['filename'] . '_opt.' . $pathInfo['extension'];
        
        $saved = false;
        switch ($mimeType) {
            case 'image/jpeg':
                $saved = imagejpeg($source, $optimizedPath, $quality);
                break;
            case 'image/png':
                // PNG quality is 0-9 (inverse)
                $pngQuality = 9 - (int)(($quality / 100) * 9);
                $saved = imagepng($source, $optimizedPath, $pngQuality);
                break;
            case 'image/gif':
                $saved = imagegif($source, $optimizedPath);
                break;
            case 'image/webp':
                if (function_exists('imagewebp')) {
                    $saved = imagewebp($source, $optimizedPath, $quality);
                }
                break;
        }

        imagedestroy($source);

        if ($saved) {
            return [
                'success' => true,
                'path' => $optimizedPath,
                'original_size' => filesize($imagePath),
                'optimized_size' => filesize($optimizedPath),
                'savings' => filesize($imagePath) - filesize($optimizedPath)
            ];
        }

        return [
            'success' => false,
            'message' => 'Failed to save optimized image',
            'path' => $imagePath
        ];
    }

    /**
     * Check if WebP is supported
     */
    public static function supportsWebP()
    {
        return function_exists('imagewebp') && function_exists('imagecreatefromwebp');
    }

    /**
     * Convert image to WebP format
     */
    public static function convertToWebP($imagePath, $quality = 85)
    {
        if (!self::supportsWebP()) {
            return [
                'success' => false,
                'message' => 'WebP not supported'
            ];
        }

        $imageInfo = getimagesize($imagePath);
        if ($imageInfo === false) {
            return [
                'success' => false,
                'message' => 'Invalid image file'
            ];
        }

        $mimeType = $imageInfo['mime'];
        $source = null;

        switch ($mimeType) {
            case 'image/jpeg':
                $source = imagecreatefromjpeg($imagePath);
                break;
            case 'image/png':
                $source = imagecreatefrompng($imagePath);
                break;
            default:
                return [
                    'success' => false,
                    'message' => 'Unsupported source format'
                ];
        }

        if (!$source) {
            return [
                'success' => false,
                'message' => 'Failed to load image'
            ];
        }

        $pathInfo = pathinfo($imagePath);
        $webpPath = $pathInfo['dirname'] . '/' . $pathInfo['filename'] . '.webp';

        if (imagewebp($source, $webpPath, $quality)) {
            imagedestroy($source);
            return [
                'success' => true,
                'path' => $webpPath
            ];
        }

        imagedestroy($source);
        return [
            'success' => false,
            'message' => 'Failed to convert to WebP'
        ];
    }
}


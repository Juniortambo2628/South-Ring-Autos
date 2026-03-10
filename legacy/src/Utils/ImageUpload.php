<?php

namespace SouthRingAutos\Utils;

class ImageUpload
{
    private const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    private const MAX_FILE_SIZE = 5242880; // 5MB
    private const UPLOAD_DIR = 'storage/uploads/vehicles/';

    public static function upload($file, $vehicleId = null)
    {
        if (! isset($file) || $file['error'] !== UPLOAD_ERR_OK) {
            return ['success' => false, 'message' => 'No file uploaded or upload error'];
        }

        // Validate file type
        $finfo = finfo_open(FILEINFO_MIME_TYPE);
        $mimeType = finfo_file($finfo, $file['tmp_name']);
        finfo_close($finfo);

        if (! in_array($mimeType, self::ALLOWED_TYPES)) {
            return ['success' => false, 'message' => 'Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed.'];
        }

        // Validate file size
        if ($file['size'] > self::MAX_FILE_SIZE) {
            return ['success' => false, 'message' => 'File size exceeds 5MB limit'];
        }

        // Create upload directory if it doesn't exist
        $uploadDir = __DIR__ . '/../../' . self::UPLOAD_DIR;
        if (! is_dir($uploadDir)) {
            mkdir($uploadDir, 0755, true);
        }

        // Generate unique filename
        $extension = pathinfo($file['name'], PATHINFO_EXTENSION);
        $filename = ($vehicleId ? 'vehicle_' . $vehicleId . '_' : 'vehicle_') . uniqid() . '.' . $extension;
        $filepath = $uploadDir . $filename;

        // Move uploaded file
        if (! move_uploaded_file($file['tmp_name'], $filepath)) {
            return ['success' => false, 'message' => 'Failed to save file'];
        }

        // Return relative path for database storage
        $relativePath = self::UPLOAD_DIR . $filename;

        return [
            'success' => true,
            'path' => $relativePath,
            'filename' => $filename,
        ];
    }

    public static function delete($thumbnailPath)
    {
        if (empty($thumbnailPath)) {
            return true;
        }

        $filepath = __DIR__ . '/../../' . $thumbnailPath;

        if (file_exists($filepath) && is_file($filepath)) {
            return unlink($filepath);
        }

        return true;
    }

    public static function getDefaultThumbnail()
    {
        return 'South-ring-logos/SR-Logo-red-White-BG.png';
    }
}

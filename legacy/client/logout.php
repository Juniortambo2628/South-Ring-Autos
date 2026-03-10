<?php
/**
 * Client Logout
 * Destroy session and redirect to homepage
 */

// Start output buffering to prevent any output
ob_start();

require_once __DIR__ . '/../bootstrap.php';

use SouthRingAutos\Utils\SessionManager;

// Destroy the session
SessionManager::destroy();

// Clear output buffer
ob_end_clean();

// Redirect to homepage
header('Location: ../index.php');
exit;


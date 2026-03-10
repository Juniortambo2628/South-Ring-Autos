<?php
/**
 * Admin Authentication Check
 * Centralized authentication check for admin pages
 */

require_once __DIR__ . '/../../bootstrap.php';

use SouthRingAutos\Utils\SessionManager;

SessionManager::start();

if (!SessionManager::isAdminLoggedIn()) {
    header('Location: login.php');
    exit;
}


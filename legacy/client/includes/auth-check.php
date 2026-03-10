<?php
/**
 * Client Authentication Check
 * Centralized authentication check for client pages
 */

require_once __DIR__ . '/../../bootstrap.php';

use SouthRingAutos\Utils\SessionManager;

SessionManager::start();

if (!SessionManager::isClientLoggedIn()) {
    header('Location: login.php');
    exit;
}


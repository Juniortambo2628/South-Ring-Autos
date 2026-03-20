<?php
require_once __DIR__ . '/../bootstrap.php';

use SouthRingAutos\Utils\SessionManager;

SessionManager::destroy();
header('Location: login.php');
exit;

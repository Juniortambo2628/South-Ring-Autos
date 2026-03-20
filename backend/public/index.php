<?php

use Illuminate\Foundation\Application;
use Illuminate\Http\Request;

define('LARAVEL_START', microtime(true));

// Determine the path to the Laravel application core
$appPath = __DIR__ . '/../';
if (!file_exists($appPath . 'vendor/autoload.php')) {
    // Production path for cPanel deployment
    $appPath = __DIR__.'/../../repositories/South-Ring-Autos/backend/';
}

// Determine if the application is in maintenance mode...
if (file_exists($maintenance = $appPath . 'storage/framework/maintenance.php')) {
    require $maintenance;
}

// Register the Composer autoloader...
require $appPath . 'vendor/autoload.php';

// Bootstrap Laravel and handle the request...
/** @var Application $app */
$app = require_once $appPath . 'bootstrap/app.php';

$app->handleRequest(Request::capture());

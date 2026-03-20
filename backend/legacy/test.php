<?php
/**
 * Simple Test Page
 * Use this to verify basic PHP functionality
 */

// Enable error display
error_reporting(E_ALL);
ini_set('display_errors', '1');

echo "<h1>Basic PHP Test</h1>";
echo "<p>If you can see this, PHP is working.</p>";

echo "<h2>PHP Info</h2>";
echo "<p>PHP Version: " . phpversion() . "</p>";

echo "<h2>File System Checks</h2>";
$files = [
    'bootstrap.php',
    'vendor/autoload.php',
    'config/app.php',
    'index.php',
    'includes/header.php'
];

foreach ($files as $file) {
    $exists = file_exists(__DIR__ . '/' . $file);
    echo "<p>" . ($exists ? "✓" : "✗") . " $file</p>";
}

echo "<h2>Try Loading Bootstrap</h2>";
try {
    require_once __DIR__ . '/bootstrap.php';
    echo "<p style='color: green;'>✓ Bootstrap loaded successfully</p>";
} catch (Throwable $e) {
    echo "<p style='color: red;'>✗ Error: " . htmlspecialchars($e->getMessage()) . "</p>";
    echo "<p>File: " . htmlspecialchars($e->getFile()) . "</p>";
    echo "<p>Line: " . $e->getLine() . "</p>";
    echo "<pre>" . htmlspecialchars($e->getTraceAsString()) . "</pre>";
}

echo "<h2>Try Loading Header</h2>";
try {
    ob_start();
    include __DIR__ . '/includes/header.php';
    $output = ob_get_clean();
    echo "<p style='color: green;'>✓ Header loaded successfully</p>";
} catch (Throwable $e) {
    echo "<p style='color: red;'>✗ Error: " . htmlspecialchars($e->getMessage()) . "</p>";
    echo "<p>File: " . htmlspecialchars($e->getFile()) . "</p>";
    echo "<p>Line: " . $e->getLine() . "</p>";
}


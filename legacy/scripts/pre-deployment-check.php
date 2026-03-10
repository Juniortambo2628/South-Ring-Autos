<?php
/**
 * Pre-Deployment Check Script
 * Verifies system is ready for production deployment
 */

require_once __DIR__ . '/../bootstrap.php';

use SouthRingAutos\Utils\Environment;

echo "========================================\n";
echo "Pre-Deployment Check\n";
echo "========================================\n\n";

$errors = [];
$warnings = [];
$success = [];

// Check 1: Environment Detection
echo "1. Environment Detection:\n";
echo "   ";
$env = Environment::detect();
if ($env === 'production') {
    echo "✓ Environment detected as: $env\n";
    $success[] = "Environment detection";
} else {
    echo "⚠ Environment detected as: $env (should be 'production' on server)\n";
    $warnings[] = "Environment will auto-detect on production server";
}
echo "\n";

// Check 2: Composer Dependencies
echo "2. Composer Dependencies:\n";
echo "   ";
if (file_exists(__DIR__ . '/../vendor/autoload.php')) {
    echo "✓ Composer dependencies installed\n";
    $success[] = "Composer dependencies";
} else {
    echo "✗ Composer dependencies not found\n";
    $errors[] = "Run: composer install --no-dev --optimize-autoloader";
}
echo "\n";

// Check 3: Node Modules and Build
echo "3. JavaScript Assets:\n";
echo "   ";
$buildFiles = [
    'js/dist/client-auth.bundle.js',
    'js/dist/admin-dashboard.bundle.js',
    'js/dist/dashboard-components.bundle.js'
];
$allBuilt = true;
foreach ($buildFiles as $file) {
    if (!file_exists(__DIR__ . '/../' . $file)) {
        $allBuilt = false;
        break;
    }
}
if ($allBuilt) {
    echo "✓ JavaScript bundles found\n";
    $success[] = "JavaScript bundles";
} else {
    echo "⚠ JavaScript bundles not found\n";
    $warnings[] = "Run: npm run build (before or after deployment)";
}
echo "\n";

// Check 4: Storage Directories
echo "4. Storage Directories:\n";
$storageDirs = [
    'storage',
    'storage/logs',
    'storage/uploads',
    'storage/cache'
];
$allExist = true;
foreach ($storageDirs as $dir) {
    $path = __DIR__ . '/../' . $dir;
    if (!is_dir($path)) {
        echo "   ✗ Missing: $dir\n";
        $errors[] = "Create directory: $dir";
        $allExist = false;
    } else {
        if (!is_writable($path)) {
            echo "   ⚠ Not writable: $dir\n";
            $warnings[] = "Set permissions: chmod 755 $dir";
        }
    }
}
if ($allExist) {
    echo "   ✓ All storage directories exist\n";
    $success[] = "Storage directories";
}
echo "\n";

// Check 5: .env File
echo "5. Environment Configuration:\n";
echo "   ";
if (file_exists(__DIR__ . '/../.env.example')) {
    echo "✓ .env.example found\n";
    $success[] = ".env.example template";
} else {
    echo "⚠ .env.example not found\n";
    $warnings[] = "Create .env.example for reference";
}

if (file_exists(__DIR__ . '/../.env')) {
    echo "   ⚠ .env file exists (should be created on production server)\n";
    $warnings[] = ".env file should be created on production with production values";
} else {
    echo "   ✓ .env file not in repository (correct)\n";
}
echo "\n";

// Check 6: Database Configuration
echo "6. Database Configuration:\n";
echo "   ";
try {
    $db = \SouthRingAutos\Database\Database::getInstance();
    $pdo = $db->getConnection();
    echo "✓ Database connection successful\n";
    $success[] = "Database connection";
    
    // Check if production database name
    $stmt = $pdo->query("SELECT DATABASE()");
    $dbName = $stmt->fetchColumn();
    if ($dbName === 'zhpebukm_southringautos') {
        echo "   ✓ Production database name detected\n";
    } else {
        echo "   ⚠ Database name: $dbName (will be different on production)\n";
    }
} catch (\Exception $e) {
    echo "✗ Database connection failed: " . $e->getMessage() . "\n";
    $errors[] = "Database connection: " . $e->getMessage();
}
echo "\n";

// Check 7: File Permissions
echo "7. File Permissions:\n";
$checkPerms = [
    'storage' => '755',
    'storage/logs' => '755'
];
foreach ($checkPerms as $dir => $expected) {
    $path = __DIR__ . '/../' . $dir;
    if (is_dir($path)) {
        $perms = substr(sprintf('%o', fileperms($path)), -4);
        if ($perms === $expected || $perms === '0775') {
            echo "   ✓ $dir permissions: $perms\n";
        } else {
            echo "   ⚠ $dir permissions: $perms (should be $expected)\n";
            $warnings[] = "Set permissions: chmod $expected $dir";
        }
    }
}
echo "\n";

// Check 8: Git Ignore
echo "8. Security Files:\n";
$securityFiles = [
    '.env',
    'storage/logs/*.log',
    'deploy-production.php'
];
$gitignore = file_get_contents(__DIR__ . '/../.gitignore');
$allIgnored = true;
foreach ($securityFiles as $file) {
    if (strpos($gitignore, $file) !== false) {
        echo "   ✓ $file is in .gitignore\n";
    } else {
        echo "   ⚠ $file not in .gitignore\n";
        $warnings[] = "Add $file to .gitignore";
        $allIgnored = false;
    }
}
if ($allIgnored) {
    $success[] = "Security files ignored";
}
echo "\n";

// Summary
echo "========================================\n";
echo "Summary\n";
echo "========================================\n";
echo "✓ Successful checks: " . count($success) . "\n";
echo "⚠ Warnings: " . count($warnings) . "\n";
echo "✗ Errors: " . count($errors) . "\n\n";

if (count($errors) > 0) {
    echo "Errors that must be fixed:\n";
    foreach ($errors as $error) {
        echo "  - $error\n";
    }
    echo "\n";
}

if (count($warnings) > 0) {
    echo "Warnings (should be addressed):\n";
    foreach ($warnings as $warning) {
        echo "  - $warning\n";
    }
    echo "\n";
}

if (count($errors) === 0) {
    echo "✓ System is ready for deployment!\n";
    echo "\nNext steps:\n";
    echo "1. Build assets: npm run build\n";
    echo "2. Install production dependencies: composer install --no-dev --optimize-autoloader\n";
    echo "3. Upload files to production server\n";
    echo "4. Create .env file on production server\n";
    echo "5. Set file permissions\n";
    echo "6. Test deployment\n";
} else {
    echo "✗ Please fix errors before deploying\n";
    exit(1);
}

echo "\n";


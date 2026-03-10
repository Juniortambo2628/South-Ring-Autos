<?php
/**
 * Phinx Configuration
 * Database migration tool configuration
 */

// Load environment variables if available
if (file_exists(__DIR__ . '/.env')) {
    $dotenv = Dotenv\Dotenv::createImmutable(__DIR__);
    $dotenv->load();
}

return [
    'paths' => [
        'migrations' => '%%PHINX_CONFIG_DIR%%/db/migrations',
        'seeds' => '%%PHINX_CONFIG_DIR%%/db/seeds'
    ],
    'environments' => [
        'default_migration_table' => 'phinxlog',
        'default_environment' => 'development',
        'production' => [
            'adapter' => 'mysql',
            'host' => $_ENV['DB_HOST'] ?? 'localhost',
            'name' => $_ENV['DB_NAME'] ?? 'south_ring_autos',
            'user' => $_ENV['DB_USER'] ?? 'root',
            'pass' => $_ENV['DB_PASS'] ?? '',
            'port' => $_ENV['DB_PORT'] ?? 3306,
            'charset' => 'utf8mb4',
        ],
        'development' => [
            'adapter' => 'mysql',
            'host' => $_ENV['DB_HOST'] ?? 'localhost',
            'name' => $_ENV['DB_NAME'] ?? 'south_ring_autos',
            'user' => $_ENV['DB_USER'] ?? 'root',
            'pass' => $_ENV['DB_PASS'] ?? '',
            'port' => $_ENV['DB_PORT'] ?? 3306,
            'charset' => 'utf8mb4',
        ],
        'testing' => [
            'adapter' => 'mysql',
            'host' => $_ENV['DB_HOST'] ?? 'localhost',
            'name' => $_ENV['DB_NAME'] ?? 'south_ring_autos_test',
            'user' => $_ENV['DB_USER'] ?? 'root',
            'pass' => $_ENV['DB_PASS'] ?? '',
            'port' => $_ENV['DB_PORT'] ?? 3306,
            'charset' => 'utf8mb4',
        ]
    ],
    'version_order' => 'creation'
];


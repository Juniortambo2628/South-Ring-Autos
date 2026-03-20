<?php

namespace SouthRingAutos\Database;

use Monolog\Handler\StreamHandler;
use Monolog\Logger;
use PDO;
use PDOException;

/**
 * Database Connection Manager
 * Handles database connections and migrations
 */
class Database
{
    private static $instance = null;
    private PDO $pdo;
    private $logger;

    private function __construct()
    {
        $this->logger = new Logger('database');
        $this->logger->pushHandler(new StreamHandler(LOG_PATH . '/database.log', Logger::DEBUG));

        $this->connect();
        $this->createTables();
    }

    /**
     * Get database instance (Singleton)
     */
    public static function getInstance()
    {
        if (self::$instance === null) {
            self::$instance = new self();
        }

        return self::$instance;
    }

    /**
     * Get PDO connection
     * @return PDO
     */
    public function getConnection(): PDO
    {
        return $this->pdo;
    }

    /**
     * Connect to database
     */
    private function connect()
    {
        try {
            // Try multiple sources for database credentials
            $host = $_ENV['DB_HOST'] ?? getenv('DB_HOST') ?: 'localhost';
            $dbname = $_ENV['DB_NAME'] ?? getenv('DB_NAME') ?: 'south_ring_autos';
            $username = $_ENV['DB_USER'] ?? getenv('DB_USER') ?: 'root';
            $password = $_ENV['DB_PASS'] ?? getenv('DB_PASS') ?: '';

            $dsn = "mysql:host={$host};dbname={$dbname};charset=utf8mb4";
            $options = [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES => false,
                PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci",
            ];

            $this->pdo = new PDO($dsn, $username, $password, $options);
            $this->logger->info('Database connection established', ['database' => $dbname]);
        } catch (PDOException $e) {
            $this->logger->error('Database connection failed', ['error' => $e->getMessage()]);

            throw new \RuntimeException('Database connection failed: ' . $e->getMessage());
        }
    }

    /**
     * Create database tables if they don't exist
     */
    private function createTables()
    {
        try {
            // Blog posts table
            $this->pdo->exec("CREATE TABLE IF NOT EXISTS blog_posts (
                id INT AUTO_INCREMENT PRIMARY KEY,
                title VARCHAR(255) NOT NULL,
                content TEXT NOT NULL,
                excerpt VARCHAR(500),
                category VARCHAR(50),
                image VARCHAR(255),
                status VARCHAR(20) DEFAULT 'published',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                INDEX idx_category (category),
                INDEX idx_status (status),
                INDEX idx_created_at (created_at)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci");

            // Clients table
            $this->pdo->exec("CREATE TABLE IF NOT EXISTS clients (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(100) NOT NULL,
                email VARCHAR(100) UNIQUE NOT NULL,
                phone VARCHAR(20) NOT NULL,
                password VARCHAR(255) NOT NULL,
                address TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                INDEX idx_email (email),
                INDEX idx_phone (phone)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci");

            // Bookings table - Enhanced
            $this->pdo->exec("CREATE TABLE IF NOT EXISTS bookings (
                id INT AUTO_INCREMENT PRIMARY KEY,
                client_id INT,
                name VARCHAR(100) NOT NULL,
                phone VARCHAR(20) NOT NULL,
                email VARCHAR(100),
                registration VARCHAR(50) NOT NULL,
                service VARCHAR(100) NOT NULL,
                date DATE,
                message TEXT,
                status VARCHAR(20) DEFAULT 'pending',
                estimated_cost DECIMAL(10,2),
                actual_cost DECIMAL(10,2),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE SET NULL,
                INDEX idx_status (status),
                INDEX idx_client_id (client_id),
                INDEX idx_created_at (created_at)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci");

            // Payments table
            $this->pdo->exec("CREATE TABLE IF NOT EXISTS payments (
                id INT AUTO_INCREMENT PRIMARY KEY,
                booking_id INT NOT NULL,
                client_id INT,
                amount DECIMAL(10,2) NOT NULL,
                payment_method VARCHAR(50),
                transaction_id VARCHAR(255),
                status VARCHAR(20) DEFAULT 'pending',
                payment_date TIMESTAMP NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
                FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE SET NULL,
                INDEX idx_booking_id (booking_id),
                INDEX idx_status (status)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci");

            // Repair progress tracking table
            $this->pdo->exec("CREATE TABLE IF NOT EXISTS repair_progress (
                id INT AUTO_INCREMENT PRIMARY KEY,
                booking_id INT NOT NULL,
                stage VARCHAR(50) NOT NULL,
                description TEXT,
                progress_percentage INT DEFAULT 0,
                updated_by INT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
                FOREIGN KEY (updated_by) REFERENCES admin_users(id) ON DELETE SET NULL,
                INDEX idx_booking_id (booking_id),
                INDEX idx_created_at (created_at)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci");

            // Drop-off/Pick-up requests table
            $this->pdo->exec("CREATE TABLE IF NOT EXISTS delivery_requests (
                id INT AUTO_INCREMENT PRIMARY KEY,
                booking_id INT NOT NULL,
                client_id INT,
                type ENUM('pickup', 'dropoff') NOT NULL,
                address TEXT NOT NULL,
                city VARCHAR(100),
                postal_code VARCHAR(20),
                preferred_date DATE,
                preferred_time TIME,
                contact_phone VARCHAR(20) NOT NULL,
                special_instructions TEXT,
                status VARCHAR(20) DEFAULT 'pending',
                assigned_to INT,
                scheduled_date DATETIME NULL,
                completed_at TIMESTAMP NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
                FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE SET NULL,
                FOREIGN KEY (assigned_to) REFERENCES admin_users(id) ON DELETE SET NULL,
                INDEX idx_booking_id (booking_id),
                INDEX idx_status (status)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci");

            // Notifications table
            $this->pdo->exec("CREATE TABLE IF NOT EXISTS notifications (
                id INT AUTO_INCREMENT PRIMARY KEY,
                client_id INT,
                booking_id INT,
                type VARCHAR(50) NOT NULL,
                title VARCHAR(255) NOT NULL,
                message TEXT NOT NULL,
                read_status BOOLEAN DEFAULT FALSE,
                sent_email BOOLEAN DEFAULT FALSE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE,
                FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
                INDEX idx_client_id (client_id),
                INDEX idx_read_status (read_status),
                INDEX idx_created_at (created_at)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci");

            // Vehicles table
            $this->pdo->exec("CREATE TABLE IF NOT EXISTS vehicles (
                id INT AUTO_INCREMENT PRIMARY KEY,
                client_id INT NOT NULL,
                make VARCHAR(50) NOT NULL,
                model VARCHAR(50) NOT NULL,
                year INT,
                registration VARCHAR(50) NOT NULL,
                color VARCHAR(30),
                vin VARCHAR(50),
                engine_size VARCHAR(20),
                fuel_type VARCHAR(20),
                mileage INT,
                thumbnail VARCHAR(255),
                notes TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE,
                UNIQUE KEY unique_registration_per_client (client_id, registration),
                INDEX idx_client_id (client_id),
                INDEX idx_registration (registration)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci");

            // Admin users table
            $this->pdo->exec("CREATE TABLE IF NOT EXISTS admin_users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                username VARCHAR(50) UNIQUE NOT NULL,
                password VARCHAR(255) NOT NULL,
                email VARCHAR(100),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci");

            // Password reset tokens table
            $this->pdo->exec("CREATE TABLE IF NOT EXISTS password_reset_tokens (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_type ENUM('client', 'admin') NOT NULL,
                user_id INT NOT NULL,
                token VARCHAR(255) UNIQUE NOT NULL,
                expires_at TIMESTAMP NOT NULL,
                used TINYINT(1) DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                INDEX idx_token (token),
                INDEX idx_user (user_type, user_id),
                INDEX idx_expires (expires_at)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci");

            // Car brands carousel table
            $this->pdo->exec("CREATE TABLE IF NOT EXISTS car_brands_carousel (
                id INT AUTO_INCREMENT PRIMARY KEY,
                brand_name VARCHAR(100) NOT NULL,
                brand_slug VARCHAR(100) NOT NULL,
                logo_path VARCHAR(255),
                display_order INT DEFAULT 0,
                is_active TINYINT(1) DEFAULT 1,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                UNIQUE KEY unique_slug (brand_slug),
                INDEX idx_display_order (display_order),
                INDEX idx_is_active (is_active)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci");

            // Create default admin if doesn't exist
            $stmt = $this->pdo->prepare("SELECT COUNT(*) FROM admin_users WHERE username = ?");
            $stmt->execute(['admin']);
            if ($stmt->fetchColumn() == 0) {
                $hashed = password_hash('admin123', PASSWORD_DEFAULT);
                $this->pdo->prepare("INSERT INTO admin_users (username, password) VALUES (?, ?)")
                    ->execute(['admin', $hashed]);
                $this->logger->info('Default admin user created');
            }

            $this->logger->info('Database tables verified/created');
        } catch (PDOException $e) {
            $this->logger->error('Table creation failed', ['error' => $e->getMessage()]);

            throw new \RuntimeException('Table creation failed: ' . $e->getMessage());
        }
    }

    /**
     * Get logger instance
     */
    public function getLogger()
    {
        return $this->logger;
    }
}

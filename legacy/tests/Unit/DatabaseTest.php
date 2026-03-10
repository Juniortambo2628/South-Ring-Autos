<?php

namespace SouthRingAutos\Tests\Unit;

use PHPUnit\Framework\TestCase;
use SouthRingAutos\Database\Database;
use PDO;
use PDOException;

class DatabaseTest extends TestCase
{
    private Database $db;
    private PDO $pdo;

    protected function setUp(): void
    {
        parent::setUp();
        $this->db = Database::getInstance();
        $this->pdo = $this->db->getConnection();
    }

    public function testDatabaseConnection()
    {
        $this->assertInstanceOf(PDO::class, $this->pdo);
        $this->assertEquals(PDO::ERRMODE_EXCEPTION, $this->pdo->getAttribute(PDO::ATTR_ERRMODE));
    }

    public function testDatabaseSingleton()
    {
        $db1 = Database::getInstance();
        $db2 = Database::getInstance();
        
        $this->assertSame($db1, $db2);
    }

    public function testRequiredTablesExist()
    {
        $requiredTables = [
            'blog_posts',
            'bookings',
            'admin_users',
            'clients',
            'payments',
            'repair_progress',
            'delivery_requests',
            'notifications'
        ];
        
        foreach ($requiredTables as $table) {
            $stmt = $this->pdo->query("SHOW TABLES LIKE '{$table}'");
            $this->assertGreaterThanOrEqual(1, $stmt->rowCount(), "Table {$table} should exist");
        }
    }

    public function testBlogPostsTableStructure()
    {
        $stmt = $this->pdo->query("DESCRIBE blog_posts");
        $columns = $stmt->fetchAll(PDO::FETCH_COLUMN);
        
        $requiredColumns = ['id', 'title', 'content', 'status', 'created_at'];
        foreach ($requiredColumns as $column) {
            $this->assertContains($column, $columns, "Blog posts table should have {$column} column");
        }
    }

    public function testBookingsTableStructure()
    {
        $stmt = $this->pdo->query("DESCRIBE bookings");
        $columns = $stmt->fetchAll(PDO::FETCH_COLUMN);
        
        $requiredColumns = ['id', 'name', 'phone', 'registration', 'service', 'status', 'created_at'];
        foreach ($requiredColumns as $column) {
            $this->assertContains($column, $columns, "Bookings table should have {$column} column");
        }
    }

    public function testClientsTableStructure()
    {
        $stmt = $this->pdo->query("DESCRIBE clients");
        $columns = $stmt->fetchAll(PDO::FETCH_COLUMN);
        
        $requiredColumns = ['id', 'name', 'email', 'phone', 'password'];
        foreach ($requiredColumns as $column) {
            $this->assertContains($column, $columns, "Clients table should have {$column} column");
        }
    }

    public function testCanInsertAndRetrieveBlogPost()
    {
        $stmt = $this->pdo->prepare("INSERT INTO blog_posts (title, content, excerpt, status) VALUES (?, ?, ?, ?)");
        $stmt->execute(['Test Post', 'Test Content', 'Test Excerpt', 'published']);
        $postId = $this->pdo->lastInsertId();
        
        $this->assertIsNumeric($postId);
        
        $stmt = $this->pdo->prepare("SELECT * FROM blog_posts WHERE id = ?");
        $stmt->execute([$postId]);
        $post = $stmt->fetch(PDO::FETCH_ASSOC);
        
        $this->assertEquals('Test Post', $post['title']);
        $this->assertEquals('Test Content', $post['content']);
        
        // Cleanup
        $this->pdo->prepare("DELETE FROM blog_posts WHERE id = ?")->execute([$postId]);
    }

    public function testCanInsertAndRetrieveBooking()
    {
        $stmt = $this->pdo->prepare("INSERT INTO bookings (name, phone, email, registration, service, status) VALUES (?, ?, ?, ?, ?, ?)");
        $stmt->execute(['John Doe', '123456789', 'john@test.com', 'ABC123', 'Oil Change', 'pending']);
        $bookingId = $this->pdo->lastInsertId();
        
        $this->assertIsNumeric($bookingId);
        
        $stmt = $this->pdo->prepare("SELECT * FROM bookings WHERE id = ?");
        $stmt->execute([$bookingId]);
        $booking = $stmt->fetch(PDO::FETCH_ASSOC);
        
        $this->assertEquals('John Doe', $booking['name']);
        $this->assertEquals('ABC123', $booking['registration']);
        
        // Cleanup
        $this->pdo->prepare("DELETE FROM bookings WHERE id = ?")->execute([$bookingId]);
    }

    public function testClientsTableEmailUnique()
    {
        // Use unique email with timestamp to avoid conflicts
        $uniqueEmail = 'unique' . time() . '@test.com';
        
        $stmt = $this->pdo->prepare("INSERT INTO clients (name, email, phone, password) VALUES (?, ?, ?, ?)");
        $stmt->execute(['Test User', $uniqueEmail, '123456789', password_hash('password', PASSWORD_DEFAULT)]);
        $clientId = $this->pdo->lastInsertId();
        
        // Try to insert duplicate email
        $this->expectException(PDOException::class);
        $stmt->execute(['Test User 2', $uniqueEmail, '987654321', password_hash('password2', PASSWORD_DEFAULT)]);
        
        // Cleanup (this won't run if exception is thrown, but try anyway)
        try {
            $this->pdo->prepare("DELETE FROM clients WHERE id = ?")->execute([$clientId]);
        } catch (PDOException $e) {
            // Ignore cleanup errors
        }
    }

    public function testForeignKeysExist()
    {
        // Check if foreign keys are defined (MySQL InnoDB should enforce them)
        $stmt = $this->pdo->query("SELECT TABLE_NAME, CONSTRAINT_NAME, REFERENCED_TABLE_NAME 
            FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE 
            WHERE TABLE_SCHEMA = DATABASE() 
            AND REFERENCED_TABLE_NAME IS NOT NULL");
        $foreignKeys = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        $this->assertNotEmpty($foreignKeys, "Database should have foreign key constraints");
    }
}

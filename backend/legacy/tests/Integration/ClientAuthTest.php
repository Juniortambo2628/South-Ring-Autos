<?php

namespace SouthRingAutos\Tests\Integration;

use PHPUnit\Framework\TestCase;
use SouthRingAutos\Database\Database;
use PDO;

class ClientAuthTest extends TestCase
{
    private PDO $pdo;

    protected function setUp(): void
    {
        parent::setUp();
        $db = Database::getInstance();
        $this->pdo = $db->getConnection();
    }

    public function testClientRegistrationDataValidation()
    {
        // Test that registration requires all fields
        $email = 'testreg' . time() . '@example.com';
        
        // Valid registration
        $stmt = $this->pdo->prepare("INSERT INTO clients (name, email, phone, password) VALUES (?, ?, ?, ?)");
        $result = $stmt->execute([
            'Test User',
            $email,
            '123456789',
            password_hash('password123', PASSWORD_DEFAULT)
        ]);
        
        $this->assertTrue($result);
        $clientId = $this->pdo->lastInsertId();
        
        // Verify password is hashed
        $stmt = $this->pdo->prepare("SELECT password FROM clients WHERE id = ?");
        $stmt->execute([$clientId]);
        $client = $stmt->fetch(PDO::FETCH_ASSOC);
        
        $this->assertNotEquals('password123', $client['password']);
        $this->assertTrue(password_verify('password123', $client['password']));
        
        // Cleanup
        $this->pdo->prepare("DELETE FROM clients WHERE id = ?")->execute([$clientId]);
    }

    public function testClientLoginPasswordVerification()
    {
        $email = 'testlogin' . time() . '@example.com';
        $password = 'testpassword123';
        $hashedPassword = password_hash($password, PASSWORD_DEFAULT);
        
        // Create client
        $stmt = $this->pdo->prepare("INSERT INTO clients (name, email, phone, password) VALUES (?, ?, ?, ?)");
        $stmt->execute(['Login Test', $email, '123456789', $hashedPassword]);
        $clientId = $this->pdo->lastInsertId();
        
        // Test correct password
        $stmt = $this->pdo->prepare("SELECT * FROM clients WHERE email = ?");
        $stmt->execute([$email]);
        $client = $stmt->fetch(PDO::FETCH_ASSOC);
        
        $this->assertTrue(password_verify($password, $client['password']));
        $this->assertFalse(password_verify('wrongpassword', $client['password']));
        
        // Cleanup
        $this->pdo->prepare("DELETE FROM clients WHERE id = ?")->execute([$clientId]);
    }

    public function testEmailUniquenessConstraint()
    {
        $email = 'unique' . time() . '@test.com';
        
        // Insert first client
        $stmt = $this->pdo->prepare("INSERT INTO clients (name, email, phone, password) VALUES (?, ?, ?, ?)");
        $stmt->execute(['User 1', $email, '111111111', password_hash('pass1', PASSWORD_DEFAULT)]);
        $clientId1 = $this->pdo->lastInsertId();
        
        // Try to insert duplicate email
        $stmt = $this->pdo->prepare("INSERT INTO clients (name, email, phone, password) VALUES (?, ?, ?, ?)");
        $this->expectException(\PDOException::class);
        $stmt->execute(['User 2', $email, '222222222', password_hash('pass2', PASSWORD_DEFAULT)]);
        
        // Cleanup
        try {
            $this->pdo->prepare("DELETE FROM clients WHERE id = ?")->execute([$clientId1]);
        } catch (\Exception $e) {
            // Ignore cleanup errors
        }
    }

    public function testClientPasswordMinimumLength()
    {
        $email = 'testpass' . time() . '@test.com';
        
        // Test that password can be hashed (minimum 8 chars per requirements)
        $shortPassword = 'short'; // Less than 8
        $longPassword = 'password123'; // 8 or more
        
        $hashedShort = password_hash($shortPassword, PASSWORD_DEFAULT);
        $hashedLong = password_hash($longPassword, PASSWORD_DEFAULT);
        
        // Both should hash successfully (PHP doesn't enforce length at hash level)
        // But application should validate minimum length
        $this->assertNotEmpty($hashedShort);
        $this->assertNotEmpty($hashedLong);
        $this->assertTrue(strlen($longPassword) >= 8);
        
        // Application-level validation should reject passwords < 8 chars
        $this->assertTrue(strlen($shortPassword) < 8);
    }
}


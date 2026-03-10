<?php

namespace SouthRingAutos\Tests\Integration;

use PHPUnit\Framework\TestCase;
use SouthRingAutos\Database\Database;
use PDO;

class ApiTest extends TestCase
{
    private PDO $pdo;

    protected function setUp(): void
    {
        parent::setUp();
        $db = Database::getInstance();
        $this->pdo = $db->getConnection();
    }

    public function testCanCreateBooking()
    {
        $stmt = $this->pdo->prepare("INSERT INTO bookings (name, phone, email, registration, service, status) VALUES (?, ?, ?, ?, ?, ?)");
        $result = $stmt->execute(['Test User', '123456789', 'test@example.com', 'TEST123', 'Service Test', 'pending']);
        
        $this->assertTrue($result);
        $bookingId = $this->pdo->lastInsertId();
        
        // Verify it was created
        $stmt = $this->pdo->prepare("SELECT * FROM bookings WHERE id = ?");
        $stmt->execute([$bookingId]);
        $booking = $stmt->fetch(PDO::FETCH_ASSOC);
        
        $this->assertEquals('Test User', $booking['name']);
        $this->assertEquals('pending', $booking['status']);
        
        // Cleanup
        $this->pdo->prepare("DELETE FROM bookings WHERE id = ?")->execute([$bookingId]);
    }

    public function testCanCreateClient()
    {
        $email = 'testclient' . time() . '@example.com';
        $stmt = $this->pdo->prepare("INSERT INTO clients (name, email, phone, password) VALUES (?, ?, ?, ?)");
        $result = $stmt->execute(['Test Client', $email, '123456789', password_hash('password123', PASSWORD_DEFAULT)]);
        
        $this->assertTrue($result);
        $clientId = $this->pdo->lastInsertId();
        
        // Verify it was created
        $stmt = $this->pdo->prepare("SELECT * FROM clients WHERE id = ?");
        $stmt->execute([$clientId]);
        $client = $stmt->fetch(PDO::FETCH_ASSOC);
        
        $this->assertEquals('Test Client', $client['name']);
        $this->assertEquals($email, $client['email']);
        
        // Cleanup
        $this->pdo->prepare("DELETE FROM clients WHERE id = ?")->execute([$clientId]);
    }

    public function testCanCreateBlogPost()
    {
        $stmt = $this->pdo->prepare("INSERT INTO blog_posts (title, content, excerpt, status) VALUES (?, ?, ?, ?)");
        $result = $stmt->execute(['Test Post', 'Content here', 'Excerpt', 'published']);
        
        $this->assertTrue($result);
        $postId = $this->pdo->lastInsertId();
        
        // Verify it was created
        $stmt = $this->pdo->prepare("SELECT * FROM blog_posts WHERE id = ?");
        $stmt->execute([$postId]);
        $post = $stmt->fetch(PDO::FETCH_ASSOC);
        
        $this->assertEquals('Test Post', $post['title']);
        $this->assertEquals('published', $post['status']);
        
        // Cleanup
        $this->pdo->prepare("DELETE FROM blog_posts WHERE id = ?")->execute([$postId]);
    }

    public function testBookingProgressWorkflow()
    {
        // Create booking
        $stmt = $this->pdo->prepare("INSERT INTO bookings (name, phone, email, registration, service, status) VALUES (?, ?, ?, ?, ?, ?)");
        $stmt->execute(['Progress Test', '123456789', 'progress@test.com', 'PROG123', 'Repair', 'confirmed']);
        $bookingId = $this->pdo->lastInsertId();
        
        // Add progress update
        $stmt = $this->pdo->prepare("INSERT INTO repair_progress (booking_id, stage, description, progress_percentage) VALUES (?, ?, ?, ?)");
        $stmt->execute([$bookingId, 'Assessment', 'Testing progress tracking', 50]);
        $progressId = $this->pdo->lastInsertId();
        
        // Verify progress
        $stmt = $this->pdo->prepare("SELECT * FROM repair_progress WHERE id = ?");
        $stmt->execute([$progressId]);
        $progress = $stmt->fetch(PDO::FETCH_ASSOC);
        
        $this->assertEquals($bookingId, $progress['booking_id']);
        $this->assertEquals(50, $progress['progress_percentage']);
        
        // Cleanup
        $this->pdo->prepare("DELETE FROM repair_progress WHERE booking_id = ?")->execute([$bookingId]);
        $this->pdo->prepare("DELETE FROM bookings WHERE id = ?")->execute([$bookingId]);
    }

    public function testPaymentWorkflow()
    {
        // Create booking first
        $stmt = $this->pdo->prepare("INSERT INTO bookings (name, phone, email, registration, service, status) VALUES (?, ?, ?, ?, ?, ?)");
        $stmt->execute(['Payment Test', '123456789', 'payment@test.com', 'PAY123', 'Service', 'confirmed']);
        $bookingId = $this->pdo->lastInsertId();
        
        // Create payment
        $stmt = $this->pdo->prepare("INSERT INTO payments (booking_id, amount, payment_method, status) VALUES (?, ?, ?, ?)");
        $stmt->execute([$bookingId, 5000.00, 'Cash', 'pending']);
        $paymentId = $this->pdo->lastInsertId();
        
        // Verify payment
        $stmt = $this->pdo->prepare("SELECT * FROM payments WHERE id = ?");
        $stmt->execute([$paymentId]);
        $payment = $stmt->fetch(PDO::FETCH_ASSOC);
        
        $this->assertEquals($bookingId, $payment['booking_id']);
        $this->assertEquals('5000.00', $payment['amount']);
        $this->assertEquals('pending', $payment['status']);
        
        // Update payment status
        $stmt = $this->pdo->prepare("UPDATE payments SET status = ?, payment_date = NOW() WHERE id = ?");
        $stmt->execute(['completed', $paymentId]);
        
        // Verify update
        $stmt = $this->pdo->prepare("SELECT * FROM payments WHERE id = ?");
        $stmt->execute([$paymentId]);
        $payment = $stmt->fetch(PDO::FETCH_ASSOC);
        $this->assertEquals('completed', $payment['status']);
        
        // Cleanup
        $this->pdo->prepare("DELETE FROM payments WHERE booking_id = ?")->execute([$bookingId]);
        $this->pdo->prepare("DELETE FROM bookings WHERE id = ?")->execute([$bookingId]);
    }

    public function testDeliveryRequestWorkflow()
    {
        // Create booking
        $stmt = $this->pdo->prepare("INSERT INTO bookings (name, phone, email, registration, service, status) VALUES (?, ?, ?, ?, ?, ?)");
        $stmt->execute(['Delivery Test', '123456789', 'delivery@test.com', 'DEL123', 'Service', 'confirmed']);
        $bookingId = $this->pdo->lastInsertId();
        
        // Create delivery request
        $stmt = $this->pdo->prepare("INSERT INTO delivery_requests (booking_id, type, address, city, contact_phone, status) VALUES (?, ?, ?, ?, ?, ?)");
        $stmt->execute([$bookingId, 'pickup', '123 Test St', 'Nairobi', '123456789', 'pending']);
        $requestId = $this->pdo->lastInsertId();
        
        // Verify request
        $stmt = $this->pdo->prepare("SELECT * FROM delivery_requests WHERE id = ?");
        $stmt->execute([$requestId]);
        $request = $stmt->fetch(PDO::FETCH_ASSOC);
        
        $this->assertEquals($bookingId, $request['booking_id']);
        $this->assertEquals('pickup', $request['type']);
        $this->assertEquals('pending', $request['status']);
        
        // Cleanup
        $this->pdo->prepare("DELETE FROM delivery_requests WHERE booking_id = ?")->execute([$bookingId]);
        $this->pdo->prepare("DELETE FROM bookings WHERE id = ?")->execute([$bookingId]);
    }
}

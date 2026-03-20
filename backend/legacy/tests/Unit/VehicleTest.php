<?php

namespace SouthRingAutos\Tests\Unit;

use PHPUnit\Framework\TestCase;
use SouthRingAutos\Database\Database;
use PDO;
use PDOException;

class VehicleTest extends TestCase
{
    private PDO $pdo;

    protected function setUp(): void
    {
        parent::setUp();
        $db = Database::getInstance();
        $this->pdo = $db->getConnection();
    }

    public function testVehiclesTableExists()
    {
        $stmt = $this->pdo->query("SHOW TABLES LIKE 'vehicles'");
        $this->assertGreaterThanOrEqual(1, $stmt->rowCount(), "Vehicles table should exist");
    }

    public function testVehiclesTableStructure()
    {
        $stmt = $this->pdo->query("DESCRIBE vehicles");
        $columns = $stmt->fetchAll(PDO::FETCH_COLUMN);
        
        $requiredColumns = ['id', 'client_id', 'make', 'model', 'registration', 'created_at'];
        foreach ($requiredColumns as $column) {
            $this->assertContains($column, $columns, "Vehicles table should have {$column} column");
        }
    }

    public function testBookingsTableHasVehicleId()
    {
        $stmt = $this->pdo->query("DESCRIBE bookings");
        $columns = $stmt->fetchAll(PDO::FETCH_COLUMN);
        
        $this->assertContains('vehicle_id', $columns, "Bookings table should have vehicle_id column");
    }

    public function testCanInsertVehicle()
    {
        // Create a test client first
        $clientStmt = $this->pdo->prepare("INSERT INTO clients (name, email, phone, password) VALUES (?, ?, ?, ?)");
        $clientStmt->execute(['Test Client', 'testvehicle@example.com', '1234567890', password_hash('password', PASSWORD_DEFAULT)]);
        $clientId = $this->pdo->lastInsertId();
        
        // Insert vehicle
        $vehicleStmt = $this->pdo->prepare("INSERT INTO vehicles (client_id, make, model, year, registration) VALUES (?, ?, ?, ?, ?)");
        $vehicleStmt->execute([$clientId, 'Toyota', 'Corolla', 2020, 'TEST123']);
        $vehicleId = $this->pdo->lastInsertId();
        
        $this->assertIsNumeric($vehicleId);
        
        // Verify it was created
        $stmt = $this->pdo->prepare("SELECT * FROM vehicles WHERE id = ?");
        $stmt->execute([$vehicleId]);
        $vehicle = $stmt->fetch(PDO::FETCH_ASSOC);
        
        $this->assertEquals('Toyota', $vehicle['make']);
        $this->assertEquals('Corolla', $vehicle['model']);
        $this->assertEquals('TEST123', $vehicle['registration']);
        
        // Cleanup
        $this->pdo->prepare("DELETE FROM vehicles WHERE id = ?")->execute([$vehicleId]);
        $this->pdo->prepare("DELETE FROM clients WHERE id = ?")->execute([$clientId]);
    }

    public function testCanLinkBookingToVehicle()
    {
        // Create test client and vehicle
        $clientStmt = $this->pdo->prepare("INSERT INTO clients (name, email, phone, password) VALUES (?, ?, ?, ?)");
        $clientStmt->execute(['Test Client', 'testbooking@example.com', '1234567890', password_hash('password', PASSWORD_DEFAULT)]);
        $clientId = $this->pdo->lastInsertId();
        
        $vehicleStmt = $this->pdo->prepare("INSERT INTO vehicles (client_id, make, model, registration) VALUES (?, ?, ?, ?)");
        $vehicleStmt->execute([$clientId, 'Honda', 'Civic', 'BOOK123']);
        $vehicleId = $this->pdo->lastInsertId();
        
        // Create booking linked to vehicle
        $bookingStmt = $this->pdo->prepare("INSERT INTO bookings (client_id, vehicle_id, name, phone, registration, service) VALUES (?, ?, ?, ?, ?, ?)");
        $bookingStmt->execute([$clientId, $vehicleId, 'Test Client', '1234567890', 'BOOK123', 'General Service']);
        $bookingId = $this->pdo->lastInsertId();
        
        // Verify linkage
        $stmt = $this->pdo->prepare("SELECT vehicle_id FROM bookings WHERE id = ?");
        $stmt->execute([$bookingId]);
        $booking = $stmt->fetch(PDO::FETCH_ASSOC);
        
        $this->assertEquals($vehicleId, $booking['vehicle_id']);
        
        // Cleanup
        $this->pdo->prepare("DELETE FROM bookings WHERE id = ?")->execute([$bookingId]);
        $this->pdo->prepare("DELETE FROM vehicles WHERE id = ?")->execute([$vehicleId]);
        $this->pdo->prepare("DELETE FROM clients WHERE id = ?")->execute([$clientId]);
    }

    public function testVehicleUniquenessPerClient()
    {
        // Create test client with unique email
        $uniqueEmail = 'testunique' . time() . '@example.com';
        $clientStmt = $this->pdo->prepare("INSERT INTO clients (name, email, phone, password) VALUES (?, ?, ?, ?)");
        $clientStmt->execute(['Test Client', $uniqueEmail, '1234567890', password_hash('password', PASSWORD_DEFAULT)]);
        $clientId = $this->pdo->lastInsertId();
        
        // Insert first vehicle
        $vehicleStmt = $this->pdo->prepare("INSERT INTO vehicles (client_id, make, model, registration) VALUES (?, ?, ?, ?)");
        $vehicleStmt->execute([$clientId, 'Toyota', 'Camry', 'UNIQ123']);
        
        // Try to insert duplicate registration for same client (should fail)
        try {
            $vehicleStmt->execute([$clientId, 'Honda', 'Accord', 'UNIQ123']);
            $this->fail('Expected PDOException for duplicate registration');
        } catch (PDOException $e) {
            $this->assertStringContainsString('23000', $e->getCode()); // Integrity constraint violation
        }
        
        // Cleanup
        $this->pdo->prepare("DELETE FROM vehicles WHERE client_id = ?")->execute([$clientId]);
        $this->pdo->prepare("DELETE FROM clients WHERE id = ?")->execute([$clientId]);
    }

    public function testVehiclesTableHasThumbnailColumn()
    {
        $stmt = $this->pdo->query("DESCRIBE vehicles");
        $columns = $stmt->fetchAll(PDO::FETCH_COLUMN);
        
        $this->assertContains('thumbnail', $columns, "Vehicles table should have thumbnail column");
    }

    public function testCanUpdateVehicleThumbnail()
    {
        // Create test client and vehicle
        $uniqueEmail = 'testthumb' . time() . '@example.com';
        $clientStmt = $this->pdo->prepare("INSERT INTO clients (name, email, phone, password) VALUES (?, ?, ?, ?)");
        $clientStmt->execute(['Test Client', $uniqueEmail, '1234567890', password_hash('password', PASSWORD_DEFAULT)]);
        $clientId = $this->pdo->lastInsertId();
        
        $vehicleStmt = $this->pdo->prepare("INSERT INTO vehicles (client_id, make, model, registration) VALUES (?, ?, ?, ?)");
        $vehicleStmt->execute([$clientId, 'Honda', 'Civic', 'THUMB123']);
        $vehicleId = $this->pdo->lastInsertId();
        
        // Update thumbnail
        $thumbnailPath = 'storage/uploads/vehicles/test_thumbnail.jpg';
        $updateStmt = $this->pdo->prepare("UPDATE vehicles SET thumbnail = ? WHERE id = ?");
        $updateStmt->execute([$thumbnailPath, $vehicleId]);
        
        // Verify thumbnail was updated
        $stmt = $this->pdo->prepare("SELECT thumbnail FROM vehicles WHERE id = ?");
        $stmt->execute([$vehicleId]);
        $vehicle = $stmt->fetch(PDO::FETCH_ASSOC);
        
        $this->assertEquals($thumbnailPath, $vehicle['thumbnail']);
        
        // Cleanup
        $this->pdo->prepare("DELETE FROM vehicles WHERE id = ?")->execute([$vehicleId]);
        $this->pdo->prepare("DELETE FROM clients WHERE id = ?")->execute([$clientId]);
    }

    public function testThumbnailCanBeNull()
    {
        // Create test client and vehicle without thumbnail
        $uniqueEmail = 'testnull' . time() . '@example.com';
        $clientStmt = $this->pdo->prepare("INSERT INTO clients (name, email, phone, password) VALUES (?, ?, ?, ?)");
        $clientStmt->execute(['Test Client', $uniqueEmail, '1234567890', password_hash('password', PASSWORD_DEFAULT)]);
        $clientId = $this->pdo->lastInsertId();
        
        $vehicleStmt = $this->pdo->prepare("INSERT INTO vehicles (client_id, make, model, registration, thumbnail) VALUES (?, ?, ?, ?, ?)");
        $vehicleStmt->execute([$clientId, 'Toyota', 'Prius', 'NULL123', null]);
        $vehicleId = $this->pdo->lastInsertId();
        
        // Verify thumbnail is null
        $stmt = $this->pdo->prepare("SELECT thumbnail FROM vehicles WHERE id = ?");
        $stmt->execute([$vehicleId]);
        $vehicle = $stmt->fetch(PDO::FETCH_ASSOC);
        
        $this->assertNull($vehicle['thumbnail']);
        
        // Cleanup
        $this->pdo->prepare("DELETE FROM vehicles WHERE id = ?")->execute([$vehicleId]);
        $this->pdo->prepare("DELETE FROM clients WHERE id = ?")->execute([$clientId]);
    }
}


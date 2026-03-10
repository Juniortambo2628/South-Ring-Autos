<?php
/**
 * Bookings API
 * Refactored to use new architecture
 */

// Start output buffering to prevent any stray output
ob_start();

// Set error reporting to avoid warnings/notices in JSON response
error_reporting(E_ERROR | E_PARSE);

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST');
header('Access-Control-Allow-Headers: Content-Type');

require_once __DIR__ . '/../bootstrap.php';

use SouthRingAutos\Database\Database;
use SouthRingAutos\Utils\EmailService;
use SouthRingAutos\Utils\Logger;
use SouthRingAutos\Utils\Notification;
use SouthRingAutos\Utils\SessionManager;
use Respect\Validation\Validator as v;
use Exception;

$action = $_GET['action'] ?? '';

try {
    $db = Database::getInstance();
    $pdo = $db->getConnection();
    
    switch ($action) {
        case 'create':
            createBooking($pdo);
            break;
        case 'list':
            listBookings($pdo);
            break;
        case 'update':
            updateBooking($pdo);
            break;
        case 'delete':
            deleteBooking($pdo);
            break;
        default:
            echo json_encode(['success' => false, 'message' => 'Invalid action']);
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => DEBUG_MODE ? $e->getMessage() : 'An error occurred'
    ]);
}

function createBooking($pdo) {
    SessionManager::start();
    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        $data = json_decode(file_get_contents('php://input'), true);
    } else {
        $data = $_POST;
    }
    
    $isLoggedIn = SessionManager::isClientLoggedIn();
    $clientId = $isLoggedIn ? SessionManager::getClientId() : null;
    
    // Validate input
    $validator = v::key('registration', v::stringType()->notEmpty())
        ->key('service', v::stringType()->notEmpty());
    
    // Name and phone only required if not logged in
    if (!$isLoggedIn) {
        $validator = $validator
            ->key('name', v::stringType()->notEmpty())
            ->key('phone', v::stringType()->notEmpty());
    }
    
    try {
        $validator->assert($data);
    } catch (Exception $e) {
        echo json_encode(['success' => false, 'message' => 'Validation failed: ' . $e->getMessage()]);
        return;
    }
    
    // 1. Identify or Create Client
    if ($isLoggedIn && $clientId) {
        // Get client info from database
        $clientStmt = $pdo->prepare("SELECT name, phone, email FROM clients WHERE id = ?");
        $clientStmt->execute([$clientId]);
        $client = $clientStmt->fetch(PDO::FETCH_ASSOC);
        
        $name = $client['name'];
        $phone = $client['phone'];
        $email = $client['email'];
    } else {
        // User not logged in - Check if email exists
        $email = $data['email'] ?? '';
        $name = $data['name'] ?? '';
        $phone = $data['phone'] ?? '';
        
        if (!empty($email)) {
            $checkClient = $pdo->prepare("SELECT id, name FROM clients WHERE email = ?");
            $checkClient->execute([$email]);
            $existingClient = $checkClient->fetch(PDO::FETCH_ASSOC);
            
            if ($existingClient) {
                // Client exists - Link booking
                $clientId = $existingClient['id'];
                // Use existing name if not provided (though validation requires name)
            } else {
                // New Client - Create Account
                $password = bin2hex(random_bytes(4)); // 8 character random password
                $passwordHash = password_hash($password, PASSWORD_DEFAULT);
                
                $createClient = $pdo->prepare("INSERT INTO clients (name, email, phone, password) VALUES (?, ?, ?, ?)");
                $createClient->execute([$name, $email, $phone, $passwordHash]);
                $clientId = $pdo->lastInsertId();
                
                $isNewAccount = true;
                $generatedPassword = $password;
            }
        }
    }

    // 2. Handle Vehicle (Create or Link)
    $vehicleId = null;
    $vehicleCreated = false;
    
    // If vehicle_id is provided (logged-in user selecting existing vehicle)
    if (!empty($data['vehicle_id']) && $clientId) {
        $vId = intval($data['vehicle_id']);
        $checkStmt = $pdo->prepare("SELECT id FROM vehicles WHERE id = ? AND client_id = ?");
        $checkStmt->execute([$vId, $clientId]);
        if ($checkStmt->fetch()) {
            $vehicleId = $vId;
        }
    } 
    // If vehicle details provided (new vehicle for anyone)
    elseif (!empty($data['vehicle_make']) && !empty($data['vehicle_model']) && $clientId) {
        // Check if vehicle with this registration already exists for this client
        $checkStmt = $pdo->prepare("SELECT id FROM vehicles WHERE client_id = ? AND registration = ?");
        $checkStmt->execute([$clientId, $data['registration']]);
        $existingVehicle = $checkStmt->fetch();
        
        if ($existingVehicle) {
            $vehicleId = $existingVehicle['id'];
        } else {
            // Create new vehicle
            $vehicleStmt = $pdo->prepare("
                INSERT INTO vehicles (client_id, make, model, year, registration, color)
                VALUES (?, ?, ?, ?, ?, ?)
            ");
            $vehicleStmt->execute([
                $clientId,
                $data['vehicle_make'],
                $data['vehicle_model'],
                !empty($data['vehicle_year']) ? intval($data['vehicle_year']) : null,
                $data['registration'],
                !empty($data['vehicle_color']) ? $data['vehicle_color'] : null
            ]);
            $vehicleId = $pdo->lastInsertId();
            $vehicleCreated = true;
        }
    }
    
    // Insert booking with vehicle_id if available
    $sql = "INSERT INTO bookings (client_id, vehicle_id, name, phone, email, registration, service, date, message) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)";
    $stmt = $pdo->prepare($sql);
    $stmt->execute([
        $clientId,
        $vehicleId,
        $name,
        $phone,
        $email,
        $data['registration'] ?? '',
        $data['service'] ?? '',
        !empty($data['date']) ? $data['date'] : null,
        $data['message'] ?? ''
    ]);
    
    $bookingId = $pdo->lastInsertId();
    
    // Get full booking record for notification
    $booking = [
        'id' => $bookingId,
        'name' => $name,
        'phone' => $phone,
        'email' => $email,
        'registration' => $data['registration'],
        'service' => $data['service'],
        'date' => $data['date'] ?? null,
        'message' => $data['message'] ?? ''
    ];
    
        // Send notifications and booking confirmation email
    try {
        $notification = new Notification();
        $notification->notifyBooking($booking);
        
        // Send appropriate email based on user status
        if (!empty($email)) {
            try {
                $emailService = new EmailService();
                
                if (isset($isNewAccount) && $isNewAccount) {
                    // Send Welcome + Account Credentials email
                    $emailService->sendAccountCreationEmail($email, $generatedPassword, $name);
                    Logger::logInfo('Account creation email sent', ['client_id' => $clientId, 'email' => $email]);
                } elseif (!$isLoggedIn && $clientId) {
                    // Send Booking Linked email (for existing users who didn't log in)
                    $emailService->sendBookingLinkedEmail($email, $name, $bookingId);
                    Logger::logInfo('Booking linked email sent', ['client_id' => $clientId, 'email' => $email]);
                } else {
                    // Standard Booking Confirmation (logged in users)
                    $emailService->sendBookingConfirmation([
                        'id' => $bookingId,
                        'name' => $name,
                        'email' => $email,
                        'service' => $data['service'] ?? '',
                        'vehicle' => ($data['vehicle_make'] ?? '') . ' ' . ($data['vehicle_model'] ?? '') . ' - ' . ($data['registration'] ?? ''),
                        'date' => $data['date'] ?? date('Y-m-d')
                    ]);
                    Logger::logInfo('Booking confirmation email sent', ['booking_id' => $bookingId, 'email' => $email]);
                }
            } catch (Exception $e) {
                // Log but don't fail the booking
                Logger::logError('Email sending failed: ' . $e->getMessage());
            }
        }
    } catch (Exception $e) {
        // Log but don't fail the booking
        Logger::logError('Notification failed: ' . $e->getMessage());
    }
    
    
    // Generate booking reference
    $bookingRef = 'SRA-' . str_pad($bookingId, 6, '0', STR_PAD_LEFT);
    
    echo json_encode([
        'success' => true,
        'id' => $bookingId,
        'reference' => $bookingRef,
        'booking' => [
            'id' => $bookingId,
            'reference' => $bookingRef,
            'name' => $name,
            'email' => $email,
            'phone' => $phone,
            'registration' => $data['registration'],
            'service' => $data['service'],
            'date' => $data['date'] ?? null,
            'message' => $data['message'] ?? '',
            'vehicle_make' => $data['vehicle_make'] ?? null,
            'vehicle_model' => $data['vehicle_model'] ?? null
        ],
        'vehicle_created' => $vehicleCreated,
        'message' => 'Booking submitted successfully'
    ]);
}

function listBookings($pdo) {
    $status = $_GET['status'] ?? null;
    
    $sql = "SELECT 
                b.*,
                v.make as vehicle_make,
                v.model as vehicle_model,
                v.year as vehicle_year,
                v.color as vehicle_color,
                c.name as client_name,
                c.email as client_email,
                c.phone as client_phone
            FROM bookings b
            LEFT JOIN vehicles v ON b.vehicle_id = v.id
            LEFT JOIN clients c ON b.client_id = c.id";
    if ($status) {
        $sql .= " WHERE b.status = ?";
    }
    $sql .= " ORDER BY b.created_at DESC";
    
    $stmt = $pdo->prepare($sql);
    if ($status) {
        $stmt->execute([$status]);
    } else {
        $stmt->execute();
    }
    
    $bookings = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo json_encode(['success' => true, 'bookings' => $bookings]);
}

function updateBooking($pdo) {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        echo json_encode(['success' => false, 'message' => 'POST method required']);
        return;
    }
    
    SessionManager::start();
    if (!SessionManager::isAdminLoggedIn()) {
        http_response_code(403);
        echo json_encode(['success' => false, 'message' => 'Unauthorized']);
        return;
    }
    
    $data = json_decode(file_get_contents('php://input'), true);
    if (empty($data['id'])) {
        // Try to get from POST body if JSON parsing failed
        parse_str(file_get_contents('php://input'), $data);
    }
    
    // Get current booking data before update
    $getStmt = $pdo->prepare("SELECT b.*, c.name, c.email, v.make, v.model, v.registration 
                               FROM bookings b 
                               LEFT JOIN clients c ON b.client_id = c.id 
                               LEFT JOIN vehicles v ON b.vehicle_id = v.id 
                               WHERE b.id = ?");
    $getStmt->execute([$data['id']]);
    $booking = $getStmt->fetch(PDO::FETCH_ASSOC);
    
    $oldStatus = $booking['status'] ?? '';
    $newStatus = $data['status'] ?? '';
    
    // Update booking status
    $sql = "UPDATE bookings SET status = ? WHERE id = ?";
    $stmt = $pdo->prepare($sql);
    $stmt->execute([$newStatus, $data['id']]);
    
    // Send email notification if status changed and email exists
    if ($oldStatus !== $newStatus && !empty($booking['email'])) {
        try {
            $emailService = new EmailService();
            $emailService->sendBookingStatusUpdate([
                'id' => $booking['id'],
                'name' => $booking['name'] ?? 'Customer',
                'email' => $booking['email'],
                'service' => $booking['service'] ?? 'Service',
                'status' => $newStatus,
                'message' => $data['message'] ?? ''
            ]);
            Logger::logInfo('Booking status update email sent', [
                'booking_id' => $booking['id'],
                'status' => $newStatus
            ]);
        } catch (Exception $e) {
            Logger::logError('Booking status update email failed: ' . $e->getMessage());
        }
    }
    
    echo json_encode(['success' => true]);
}

function deleteBooking($pdo) {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        echo json_encode(['success' => false, 'message' => 'POST method required']);
        return;
    }
    
    SessionManager::start();
    if (!SessionManager::isAdminLoggedIn()) {
        http_response_code(403);
        echo json_encode(['success' => false, 'message' => 'Unauthorized']);
        return;
    }
    
    $id = $_POST['id'] ?? null;
    if (empty($id)) {
        // Try to get from JSON body
        $data = json_decode(file_get_contents('php://input'), true);
        $id = $data['id'] ?? null;
    }
    
    if (empty($id)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Booking ID is required']);
        return;
    }
    
    $stmt = $pdo->prepare("DELETE FROM bookings WHERE id = ?");
    $stmt->execute([$id]);
    
    echo json_encode(['success' => true, 'message' => 'Booking deleted successfully']);
}

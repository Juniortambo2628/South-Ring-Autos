<?php
/**
 * Vehicles API
 * Handles vehicle CRUD operations for clients
 */

require_once __DIR__ . '/../bootstrap.php';

use SouthRingAutos\Database\Database;
use SouthRingAutos\Utils\ImageUpload;
use SouthRingAutos\Utils\SessionManager;

// Start session and set JSON header
SessionManager::start();
header('Content-Type: application/json');

$db = Database::getInstance();
$pdo = $db->getConnection();

$action = $_GET['action'] ?? $_POST['action'] ?? '';

// Check authentication for client operations
if (in_array($action, ['list', 'create', 'update', 'delete', 'get', 'history'])) {
    if (!SessionManager::isClientLoggedIn()) {
        http_response_code(401);
        echo json_encode(['success' => false, 'message' => 'Unauthorized']);
        exit;
    }
    $clientId = SessionManager::getClientId();
}

try {
    switch ($action) {
        case 'list':
            // Get all vehicles for the logged-in client
            $stmt = $pdo->prepare("
                SELECT v.*,
                    (SELECT COUNT(*) FROM bookings b WHERE b.vehicle_id = v.id) as booking_count,
                    (SELECT SUM(p.amount) FROM payments p 
                     INNER JOIN bookings b ON p.booking_id = b.id 
                     WHERE b.vehicle_id = v.id AND p.status = 'completed') as total_spent
                FROM vehicles v
                WHERE v.client_id = ?
                ORDER BY v.created_at DESC
            ");
            $stmt->execute([$clientId]);
            $vehicles = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            echo json_encode([
                'success' => true,
                'vehicles' => $vehicles
            ]);
            break;

        case 'get':
            // Get single vehicle with full details
            $vehicleId = $_GET['id'] ?? null;
            if (!$vehicleId) {
                http_response_code(400);
                echo json_encode(['success' => false, 'message' => 'Vehicle ID required']);
                exit;
            }
            
            $stmt = $pdo->prepare("SELECT * FROM vehicles WHERE id = ? AND client_id = ?");
            $stmt->execute([$vehicleId, $clientId]);
            $vehicle = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if (!$vehicle) {
                http_response_code(404);
                echo json_encode(['success' => false, 'message' => 'Vehicle not found']);
                exit;
            }
            
            echo json_encode([
                'success' => true,
                'vehicle' => $vehicle
            ]);
            break;

        case 'create':
            // Create new vehicle
            // Check if this is a multipart form upload (file upload)
            $thumbnail = null;
            if (isset($_FILES['thumbnail']) && $_FILES['thumbnail']['error'] === UPLOAD_ERR_OK) {
                $uploadResult = ImageUpload::upload($_FILES['thumbnail']);
                if ($uploadResult['success']) {
                    $thumbnail = $uploadResult['path'];
                } else {
                    http_response_code(400);
                    echo json_encode(['success' => false, 'message' => $uploadResult['message']]);
                    exit;
                }
            }
            
            // Get data from POST or JSON
            if (!empty($_POST)) {
                $data = $_POST;
            } else {
                $data = json_decode(file_get_contents('php://input'), true) ?? [];
            }
            
            $make = trim($data['make'] ?? '');
            $model = trim($data['model'] ?? '');
            $year = $data['year'] ?? null;
            $registration = trim($data['registration'] ?? '');
            $color = trim($data['color'] ?? '');
            $vin = trim($data['vin'] ?? '');
            $engineSize = trim($data['engine_size'] ?? '');
            $fuelType = trim($data['fuel_type'] ?? '');
            $mileage = $data['mileage'] ?? null;
            $notes = trim($data['notes'] ?? '');
            
            // Validation
            if (empty($make) || empty($model) || empty($registration)) {
                http_response_code(400);
                echo json_encode(['success' => false, 'message' => 'Make, model, and registration are required']);
                exit;
            }
            
            // Check if registration already exists for this client
            $checkStmt = $pdo->prepare("SELECT id FROM vehicles WHERE client_id = ? AND registration = ?");
            $checkStmt->execute([$clientId, $registration]);
            if ($checkStmt->fetch()) {
                http_response_code(400);
                echo json_encode(['success' => false, 'message' => 'A vehicle with this registration already exists']);
                exit;
            }
            
            $stmt = $pdo->prepare("
                INSERT INTO vehicles (
                    client_id, make, model, year, registration, color, vin,
                    engine_size, fuel_type, mileage, thumbnail, notes
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ");
            
            $stmt->execute([
                $clientId, $make, $model, $year ?: null, $registration, $color ?: null,
                $vin ?: null, $engineSize ?: null, $fuelType ?: null,
                $mileage ?: null, $thumbnail, $notes ?: null
            ]);
            
            $vehicleId = $pdo->lastInsertId();
            
            echo json_encode([
                'success' => true,
                'message' => 'Vehicle added successfully',
                'vehicle_id' => $vehicleId
            ]);
            break;

        case 'update':
            // Update existing vehicle
            $vehicleId = null;
            $thumbnail = null;
            $deleteThumbnail = false;
            
            // Check if this is a multipart form upload
            if (!empty($_POST)) {
                $data = $_POST;
                $vehicleId = $data['id'] ?? null;
                
                // Handle file upload
                if (isset($_FILES['thumbnail']) && $_FILES['thumbnail']['error'] === UPLOAD_ERR_OK) {
                    $uploadResult = ImageUpload::upload($_FILES['thumbnail'], $vehicleId);
                    if ($uploadResult['success']) {
                        $thumbnail = $uploadResult['path'];
                    } else {
                        http_response_code(400);
                        echo json_encode(['success' => false, 'message' => $uploadResult['message']]);
                        exit;
                    }
                }
                
                // Check if thumbnail should be deleted
                if (isset($data['delete_thumbnail']) && $data['delete_thumbnail'] === '1') {
                    $deleteThumbnail = true;
                }
            } else {
                $data = json_decode(file_get_contents('php://input'), true) ?? [];
                $vehicleId = $data['id'] ?? null;
                
                // For JSON updates, handle thumbnail deletion
                if (isset($data['delete_thumbnail']) && $data['delete_thumbnail'] === true) {
                    $deleteThumbnail = true;
                }
            }
            
            if (!$vehicleId) {
                http_response_code(400);
                echo json_encode(['success' => false, 'message' => 'Vehicle ID required']);
                exit;
            }
            
            // Verify ownership
            $checkStmt = $pdo->prepare("SELECT id, thumbnail FROM vehicles WHERE id = ? AND client_id = ?");
            $checkStmt->execute([$vehicleId, $clientId]);
            $existingVehicle = $checkStmt->fetch(PDO::FETCH_ASSOC);
            if (!$existingVehicle) {
                http_response_code(403);
                echo json_encode(['success' => false, 'message' => 'Vehicle not found or access denied']);
                exit;
            }
            
            $make = trim($data['make'] ?? '');
            $model = trim($data['model'] ?? '');
            $year = $data['year'] ?? null;
            $registration = trim($data['registration'] ?? '');
            $color = trim($data['color'] ?? '');
            $vin = trim($data['vin'] ?? '');
            $engineSize = trim($data['engine_size'] ?? '');
            $fuelType = trim($data['fuel_type'] ?? '');
            $mileage = $data['mileage'] ?? null;
            $notes = trim($data['notes'] ?? '');
            
            if (empty($make) || empty($model) || empty($registration)) {
                http_response_code(400);
                echo json_encode(['success' => false, 'message' => 'Make, model, and registration are required']);
                exit;
            }
            
            // Check if registration already exists for another vehicle
            $checkStmt = $pdo->prepare("SELECT id FROM vehicles WHERE client_id = ? AND registration = ? AND id != ?");
            $checkStmt->execute([$clientId, $registration, $vehicleId]);
            if ($checkStmt->fetch()) {
                http_response_code(400);
                echo json_encode(['success' => false, 'message' => 'A vehicle with this registration already exists']);
                exit;
            }
            
            // Handle thumbnail
            $finalThumbnail = $existingVehicle['thumbnail'];
            if ($deleteThumbnail) {
                // Delete old thumbnail
                if ($finalThumbnail) {
                    ImageUpload::delete($finalThumbnail);
                }
                $finalThumbnail = null;
            } elseif ($thumbnail) {
                // Delete old thumbnail if it exists
                if ($finalThumbnail) {
                    ImageUpload::delete($finalThumbnail);
                }
                $finalThumbnail = $thumbnail;
            }
            
            $stmt = $pdo->prepare("
                UPDATE vehicles SET
                    make = ?, model = ?, year = ?, registration = ?, color = ?,
                    vin = ?, engine_size = ?, fuel_type = ?, mileage = ?, thumbnail = ?, notes = ?,
                    updated_at = CURRENT_TIMESTAMP
                WHERE id = ? AND client_id = ?
            ");
            
            $stmt->execute([
                $make, $model, $year ?: null, $registration, $color ?: null,
                $vin ?: null, $engineSize ?: null, $fuelType ?: null,
                $mileage ?: null, $finalThumbnail, $notes ?: null, $vehicleId, $clientId
            ]);
            
            echo json_encode([
                'success' => true,
                'message' => 'Vehicle updated successfully'
            ]);
            break;

        case 'delete':
            // Delete vehicle
            $data = json_decode(file_get_contents('php://input'), true);
            $vehicleId = $data['id'] ?? null;
            
            if (!$vehicleId) {
                http_response_code(400);
                echo json_encode(['success' => false, 'message' => 'Vehicle ID required']);
                exit;
            }
            
            // Verify ownership
            $checkStmt = $pdo->prepare("SELECT id, thumbnail FROM vehicles WHERE id = ? AND client_id = ?");
            $checkStmt->execute([$vehicleId, $clientId]);
            $vehicle = $checkStmt->fetch(PDO::FETCH_ASSOC);
            if (!$vehicle) {
                http_response_code(403);
                echo json_encode(['success' => false, 'message' => 'Vehicle not found or access denied']);
                exit;
            }
            
            // Check if vehicle has bookings
            $bookingStmt = $pdo->prepare("SELECT COUNT(*) FROM bookings WHERE vehicle_id = ?");
            $bookingStmt->execute([$vehicleId]);
            $bookingCount = $bookingStmt->fetchColumn();
            
            if ($bookingCount > 0) {
                http_response_code(400);
                echo json_encode([
                    'success' => false,
                    'message' => "Cannot delete vehicle. It has {$bookingCount} associated booking(s)."
                ]);
                exit;
            }
            
            // Delete thumbnail if it exists
            if ($vehicle['thumbnail']) {
                ImageUpload::delete($vehicle['thumbnail']);
            }
            
            $stmt = $pdo->prepare("DELETE FROM vehicles WHERE id = ? AND client_id = ?");
            $stmt->execute([$vehicleId, $clientId]);
            
            echo json_encode([
                'success' => true,
                'message' => 'Vehicle deleted successfully'
            ]);
            break;

        case 'history':
            // Get vehicle service/repair history
            $vehicleId = $_GET['id'] ?? null;
            if (!$vehicleId) {
                http_response_code(400);
                echo json_encode(['success' => false, 'message' => 'Vehicle ID required']);
                exit;
            }
            
            // Verify ownership
            $checkStmt = $pdo->prepare("SELECT id FROM vehicles WHERE id = ? AND client_id = ?");
            $checkStmt->execute([$vehicleId, $clientId]);
            if (!$checkStmt->fetch()) {
                http_response_code(403);
                echo json_encode(['success' => false, 'message' => 'Vehicle not found or access denied']);
                exit;
            }
            
            // Get bookings for this vehicle
            $stmt = $pdo->prepare("
                SELECT 
                    b.*,
                    (SELECT stage FROM repair_progress WHERE booking_id = b.id ORDER BY created_at DESC LIMIT 1) as current_stage,
                    (SELECT progress_percentage FROM repair_progress WHERE booking_id = b.id ORDER BY created_at DESC LIMIT 1) as progress
                FROM bookings b
                WHERE b.vehicle_id = ?
                ORDER BY b.created_at DESC
            ");
            $stmt->execute([$vehicleId]);
            $bookings = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            // Get payments for this vehicle
            $paymentStmt = $pdo->prepare("
                SELECT 
                    p.*,
                    b.service,
                    b.registration
                FROM payments p
                INNER JOIN bookings b ON p.booking_id = b.id
                WHERE b.vehicle_id = ?
                ORDER BY p.created_at DESC
            ");
            $paymentStmt->execute([$vehicleId]);
            $payments = $paymentStmt->fetchAll(PDO::FETCH_ASSOC);
            
            echo json_encode([
                'success' => true,
                'bookings' => $bookings,
                'payments' => $payments
            ]);
            break;

        default:
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Invalid action']);
            break;
    }
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Database error: ' . $e->getMessage()
    ]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Error: ' . $e->getMessage()
    ]);
}


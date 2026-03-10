<?php
/**
 * Test Booking Vehicle Creation
 * Verifies that a vehicle is created when a guest user books with vehicle details
 */

require_once __DIR__ . '/../bootstrap.php';
use SouthRingAutos\Database\Database;

// Helper to call API
function callApi($url, $data) {
    $ch = curl_init($url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query($data));
    $response = curl_exec($ch);
    curl_close($ch);
    return json_decode($response, true);
}

// Use a subprocess to simulate a real web request environment
// This avoids issues with headers already sent, session conflicts, etc.
$script = <<<'PHP'
<?php
// Mock environment
$_SERVER['REQUEST_METHOD'] = 'POST';
$_SERVER['REMOTE_ADDR'] = '127.0.0.1';
$_SERVER['HTTP_USER_AGENT'] = 'TestRunner';

// Capture output
ob_start();

require_once 'api/bookings.php';

$output = ob_get_clean();
echo $output;
PHP;

// Save temporary test script
$tmpScript = __DIR__ . '/../temp_test_runner.php';
file_put_contents($tmpScript, $script);

echo "Starting Vehicle Creation Verification...\n";

$db = Database::getInstance();
$pdo = $db->getConnection();

// 1. Test Data
$email = 'guest_vehicle_' . time() . '@example.com';
$registration = 'K' . rand(100, 999) . 'ABC';
$make = 'TestMake';
$model = 'TestModel';

$postData = [
    'name' => 'Guest User',
    'phone' => '0700000000',
    'email' => $email,
    'vehicle_make' => $make,
    'vehicle_model' => $model,
    'vehicle_year' => '2020',
    'vehicle_color' => 'Blue',
    'registration' => $registration,
    'service' => 'General Service',
    'date' => date('Y-m-d', strtotime('+1 day')),
    'message' => 'Test booking with new vehicle'
];

// 2. Run Request
// We use php-cgi to properly simulate a POST request with superglobals populated
$descriptors = [
    0 => ['pipe', 'r'], // stdin
    1 => ['pipe', 'w'], // stdout
    2 => ['pipe', 'w']  // stderr
];

// Add action to post data
$postData['action'] = 'create';

// Prepare input for php-cgi (JSON)
$input = json_encode($postData);
$contentLength = strlen($input);

$scriptPath = str_replace('\\', '/', realpath(__DIR__ . '/../api/bookings.php'));

// Set environment variables for php-cgi
$env = array_merge($_SERVER, [
    'SCRIPT_FILENAME' => $scriptPath,
    'REQUEST_METHOD' => 'POST',
    'CONTENT_TYPE' => 'application/json',
    'CONTENT_LENGTH' => $contentLength,
    'QUERY_STRING' => 'action=create',
    'REDIRECT_STATUS' => '200',
    'REMOTE_ADDR' => '127.0.0.1'
]);

$process = proc_open('php-cgi', $descriptors, $pipes, dirname($scriptPath), $env);

if (is_resource($process)) {
    fwrite($pipes[0], $input);
    fclose($pipes[0]);

    $response = stream_get_contents($pipes[1]);
    fclose($pipes[1]);
    
    $errors = stream_get_contents($pipes[2]);
    fclose($pipes[2]);
    
    proc_close($process);
    
    // Parse response (skip headers)
    $parts = explode("\r\n\r\n", $response, 2);
    $json = count($parts) > 1 ? $parts[1] : $parts[0];
    $result = json_decode($json, true);
    
    if ($result && $result['success']) {
        echo "API Response: Success\n";
        
        // 3. Verify Database
        // Check Client
        $stmt = $pdo->prepare("SELECT id FROM clients WHERE email = ?");
        $stmt->execute([$email]);
        $client = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if ($client) {
            echo "Client Created: YES (ID: {$client['id']})\n";
            
            // Check Vehicle
            $vStmt = $pdo->prepare("SELECT id, make, model FROM vehicles WHERE client_id = ? AND registration = ?");
            $vStmt->execute([$client['id'], $registration]);
            $vehicle = $vStmt->fetch(PDO::FETCH_ASSOC);
            
            if ($vehicle) {
                echo "Vehicle Created: YES (ID: {$vehicle['id']}, {$vehicle['make']} {$vehicle['model']})\n";
                
                // Check Booking Link
                $bStmt = $pdo->prepare("SELECT id, vehicle_id FROM bookings WHERE client_id = ? AND vehicle_id = ?");
                $bStmt->execute([$client['id'], $vehicle['id']]);
                $booking = $bStmt->fetch(PDO::FETCH_ASSOC);
                
                if ($booking) {
                    echo "Booking Linked to Vehicle: YES (Booking ID: {$booking['id']})\n";
                    echo "TEST PASSED!\n";
                } else {
                    echo "Booking Linked to Vehicle: NO\n";
                    echo "TEST FAILED\n";
                }
            } else {
                echo "Vehicle Created: NO\n";
                echo "TEST FAILED\n";
            }
        } else {
            echo "Client Created: NO\n";
            echo "TEST FAILED\n";
        }
        
    } else {
        echo "API Response: Failed\n";
        echo "Message: " . ($result['message'] ?? 'Unknown error') . "\n";
        echo "Debug: " . $json . "\n";
        if ($errors) echo "Errors: $errors\n";
    }
} else {
    echo "Failed to launch subprocess.\n";
}

// Cleanup
if (file_exists($tmpScript)) unlink($tmpScript);

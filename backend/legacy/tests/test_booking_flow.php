<?php
require_once __DIR__ . '/../bootstrap.php';
use SouthRingAutos\Database\Database;

function callApi($action, $data) {
    $scriptPath = str_replace('\\', '/', realpath(__DIR__ . '/../api/bookings.php'));
    $jsonData = json_encode($data);
    $contentLength = strlen($jsonData);
    
    $descriptorspec = [
        0 => ["pipe", "r"],  // stdin
        1 => ["pipe", "w"],  // stdout
        2 => ["pipe", "w"]   // stderr
    ];
    
    // Environment variables for CGI
    $env = array_merge($_SERVER, [
        'REQUEST_METHOD' => 'POST',
        'CONTENT_TYPE' => 'application/json',
        'CONTENT_LENGTH' => $contentLength,
        'SCRIPT_FILENAME' => $scriptPath,
        'QUERY_STRING' => "action=$action",
        'REDIRECT_STATUS' => '200',
        'REMOTE_ADDR' => '127.0.0.1'
    ]);
    
    // Use php-cgi to execute the script
    // We pass the script path as argument too, though SCRIPT_FILENAME is key
    $process = proc_open('php-cgi', $descriptorspec, $pipes, dirname($scriptPath), $env);
    
    if (is_resource($process)) {
        fwrite($pipes[0], $jsonData);
        fclose($pipes[0]);
        
        $output = stream_get_contents($pipes[1]);
        $errors = stream_get_contents($pipes[2]);
        
        fclose($pipes[1]);
        fclose($pipes[2]);
        
        $return_value = proc_close($process);
        
        // Output will include headers (Content-Type: ... \r\n\r\n Body)
        // We need to separate headers from body
        $parts = explode("\r\n\r\n", $output, 2);
        $body = count($parts) > 1 ? $parts[1] : $parts[0];
        
        // Extract JSON from body
        if (preg_match('/\{.*\}/s', $body, $matches)) {
            $decoded = json_decode($matches[0], true);
            if ($decoded === null) {
                return ['success' => false, 'message' => "JSON decode failed. Raw output: $output. Errors: $errors"];
            }
            return $decoded;
        }
        
        return ['success' => false, 'message' => "No JSON output found. Output: $output. Errors: $errors"];
    }
    
    return ['success' => false, 'message' => "Could not open process"];
}

echo "Starting Booking Flow Verification (Subprocess)...\n\n";

$db = Database::getInstance();
$pdo = $db->getConnection();

// Test Case 1: New User Booking
$newEmail = 'test_new_' . time() . '@example.com';
echo "1. Testing New User Booking ($newEmail)...\n";

$newData = [
    'name' => 'Test New User',
    'phone' => '0700000001',
    'email' => $newEmail,
    'registration' => 'KAA 001A',
    'service' => 'General Service',
    'date' => date('Y-m-d', strtotime('+1 day')),
    'message' => 'Test booking new user',
    'vehicle_make' => 'Toyota',
    'vehicle_model' => 'Corolla',
    'vehicle_year' => '2015',
    'vehicle_color' => 'White'
];

$response1 = callApi('create', $newData);

if ($response1 && ($response1['success'] ?? false)) {
    echo "   API Response: Success\n";
    
    // Verify DB
    $stmt = $pdo->prepare("SELECT * FROM clients WHERE email = ?");
    $stmt->execute([$newEmail]);
    $client = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if ($client) {
        echo "   [PASS] Client created in DB. ID: " . $client['id'] . "\n";
        
        $stmt = $pdo->prepare("SELECT * FROM bookings WHERE client_id = ?");
        $stmt->execute([$client['id']]);
        $booking = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if ($booking) {
            echo "   [PASS] Booking linked to new client. Booking ID: " . $booking['id'] . "\n";
        } else {
            echo "   [FAIL] Booking NOT found for new client.\n";
        }
    } else {
        echo "   [FAIL] Client NOT created in DB.\n";
    }
} else {
    echo "   [FAIL] API Request failed: " . json_encode($response1) . "\n";
}

echo "\n";

// Test Case 2: Existing User Booking
echo "2. Testing Existing User Booking ($newEmail)...\n";

$existingData = [
    'name' => 'Test New User Updated',
    'phone' => '0700000002',
    'email' => $newEmail,
    'registration' => 'KAA 002B',
    'service' => 'Oil Change',
    'date' => date('Y-m-d', strtotime('+2 days')),
    'message' => 'Test booking existing user',
    'vehicle_make' => 'Honda',
    'vehicle_model' => 'Civic'
];

$response2 = callApi('create', $existingData);

if ($response2 && ($response2['success'] ?? false)) {
    echo "   API Response: Success\n";
    
    // Verify DB - Client should NOT be updated
    $stmt = $pdo->prepare("SELECT * FROM clients WHERE email = ?");
    $stmt->execute([$newEmail]);
    $client = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if ($client['name'] === 'Test New User') {
        echo "   [PASS] Client details NOT updated (Name kept as original).\n";
    } else {
        echo "   [FAIL] Client details updated unexpectedly. Name is now: " . $client['name'] . "\n";
    }
    
    // Verify Booking linked to same client
    $stmt = $pdo->prepare("SELECT count(*) as count FROM bookings WHERE client_id = ?");
    $stmt->execute([$client['id']]);
    $count = $stmt->fetch(PDO::FETCH_ASSOC)['count'];
    
    if ($count >= 2) {
        echo "   [PASS] Second booking linked to same client. Total bookings: $count\n";
    } else {
        echo "   [FAIL] Second booking NOT linked correctly.\n";
    }
} else {
    echo "   [FAIL] API Request failed: " . json_encode($response2) . "\n";
}

echo "\nVerification Complete.\n";

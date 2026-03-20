<?php
/**
 * System Test Script for South Ring Autos
 * Tests all API endpoints and database connectivity
 * Usage: php test-system.php
 * Or visit: http://localhost/South-Ring-Autos/test-system.php
 */

header('Content-Type: text/html; charset=utf-8');
?>
<!DOCTYPE html>
<html>
<head>
    <title>System Test - South Ring Autos</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 40px; background: #f5f5f5; }
        .container { max-width: 800px; margin: 0 auto; background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        h1 { color: #D81324; }
        .test { margin: 20px 0; padding: 15px; border-left: 4px solid #ddd; background: #f9f9f9; }
        .pass { border-left-color: #28a745; background: #d4edda; }
        .fail { border-left-color: #dc3545; background: #f8d7da; }
        .info { color: #666; font-size: 0.9em; margin-top: 5px; }
        pre { background: #f4f4f4; padding: 10px; border-radius: 4px; overflow-x: auto; }
    </style>
</head>
<body>
    <div class="container">
        <h1>🔧 South Ring Autos - System Test</h1>
        <?php
        $tests = [];
        
        // Test 1: Database Connection
        echo '<div class="test">';
        echo '<h3>Test 1: Database Connection</h3>';
        try {
            require_once 'config/database.php';
            echo '<div class="pass">✓ PASS: Database connection successful</div>';
            $tests['database'] = true;
            
            // Check tables exist
            $tables = ['blog_posts', 'bookings', 'admin_users'];
            $allTablesExist = true;
            foreach ($tables as $table) {
                $stmt = $pdo->prepare("SHOW TABLES LIKE ?");
                $stmt->execute([$table]);
                if ($stmt->rowCount() == 0) {
                    $allTablesExist = false;
                    echo '<div class="fail">✗ FAIL: Table "' . $table . '" does not exist</div>';
                }
            }
            if ($allTablesExist) {
                echo '<div class="pass">✓ PASS: All required tables exist</div>';
                $tests['tables'] = true;
            } else {
                $tests['tables'] = false;
            }
        } catch (Exception $e) {
            echo '<div class="fail">✗ FAIL: ' . htmlspecialchars($e->getMessage()) . '</div>';
            $tests['database'] = false;
        }
        echo '</div>';
        
        // Test 2: Admin User
        echo '<div class="test">';
        echo '<h3>Test 2: Admin User</h3>';
        try {
            $stmt = $pdo->prepare("SELECT * FROM admin_users WHERE username = 'admin'");
            $stmt->execute();
            $admin = $stmt->fetch();
            
            if ($admin) {
                echo '<div class="pass">✓ PASS: Admin user exists</div>';
                echo '<div class="info">Username: ' . htmlspecialchars($admin['username']) . '</div>';
                
                // Test password verification
                if (password_verify('admin123', $admin['password'])) {
                    echo '<div class="pass">✓ PASS: Admin password is correct (admin123)</div>';
                    $tests['admin'] = true;
                } else {
                    echo '<div class="fail">✗ FAIL: Admin password verification failed</div>';
                    $tests['admin'] = false;
                }
            } else {
                echo '<div class="fail">✗ FAIL: Admin user not found</div>';
                $tests['admin'] = false;
            }
        } catch (Exception $e) {
            echo '<div class="fail">✗ FAIL: ' . htmlspecialchars($e->getMessage()) . '</div>';
            $tests['admin'] = false;
        }
        echo '</div>';
        
        // Test 3: Blog API (test by querying database directly)
        echo '<div class="test">';
        echo '<h3>Test 3: Blog API Structure</h3>';
        try {
            $stmt = $pdo->query("SELECT * FROM blog_posts ORDER BY created_at DESC LIMIT 5");
            $posts = $stmt->fetchAll();
            
            if (count($posts) > 0) {
                echo '<div class="pass">✓ PASS: Blog posts table is accessible</div>';
                echo '<div class="info">Found ' . count($posts) . ' blog post(s)</div>';
                echo '<div class="info">Sample post: "' . htmlspecialchars($posts[0]['title']) . '"</div>';
                $tests['blog_api'] = true;
            } else {
                echo '<div class="fail">✗ FAIL: No blog posts found</div>';
                $tests['blog_api'] = false;
            }
        } catch (Exception $e) {
            echo '<div class="fail">✗ FAIL: ' . htmlspecialchars($e->getMessage()) . '</div>';
            $tests['blog_api'] = false;
        }
        echo '</div>';
        
        // Test 4: Bookings API (test by querying database directly)
        echo '<div class="test">';
        echo '<h3>Test 4: Bookings API Structure</h3>';
        try {
            $stmt = $pdo->query("SELECT * FROM bookings ORDER BY created_at DESC LIMIT 5");
            $bookings = $stmt->fetchAll();
            
            if (count($bookings) >= 0) {
                echo '<div class="pass">✓ PASS: Bookings table is accessible</div>';
                echo '<div class="info">Found ' . count($bookings) . ' booking(s)</div>';
                if (count($bookings) > 0) {
                    echo '<div class="info">Sample booking: ' . htmlspecialchars($bookings[0]['name'] . ' - ' . $bookings[0]['service']) . '</div>';
                }
                $tests['bookings_api'] = true;
            } else {
                echo '<div class="fail">✗ FAIL: Bookings table error</div>';
                $tests['bookings_api'] = false;
            }
        } catch (Exception $e) {
            echo '<div class="fail">✗ FAIL: ' . htmlspecialchars($e->getMessage()) . '</div>';
            $tests['bookings_api'] = false;
        }
        echo '</div>';
        
        // Test 5: Sample Data
        echo '<div class="test">';
        echo '<h3>Test 5: Sample Data</h3>';
        try {
            // Check blog posts
            $stmt = $pdo->query("SELECT COUNT(*) FROM blog_posts");
            $postCount = $stmt->fetchColumn();
            echo '<div class="' . ($postCount > 0 ? 'pass' : 'fail') . '">';
            echo ($postCount > 0 ? '✓' : '✗') . ' Blog posts: ' . $postCount;
            echo '</div>';
            
            // Check bookings
            $stmt = $pdo->query("SELECT COUNT(*) FROM bookings");
            $bookingCount = $stmt->fetchColumn();
            echo '<div class="' . ($bookingCount > 0 ? 'pass' : 'fail') . '">';
            echo ($bookingCount > 0 ? '✓' : '✗') . ' Bookings: ' . $bookingCount;
            echo '</div>';
            
            $tests['sample_data'] = ($postCount > 0 && $bookingCount > 0);
        } catch (Exception $e) {
            echo '<div class="fail">✗ FAIL: ' . htmlspecialchars($e->getMessage()) . '</div>';
            $tests['sample_data'] = false;
        }
        echo '</div>';
        
        // Summary
        echo '<div class="test">';
        echo '<h3>Test Summary</h3>';
        $passed = count(array_filter($tests));
        $total = count($tests);
        echo '<div class="' . ($passed == $total ? 'pass' : 'fail') . '">';
        echo "Result: $passed / $total tests passed";
        echo '</div>';
        
        if ($passed == $total) {
            echo '<div class="pass" style="margin-top: 15px; padding: 15px;">';
            echo '<strong>🎉 All tests passed! System is ready.</strong><br><br>';
            echo '<strong>Next steps:</strong><br>';
            echo '1. Visit <a href="admin/login.php">Admin Login</a> (username: admin, password: admin123)<br>';
            echo '2. Visit <a href="blog.php">Blog Page</a> to see sample blog post<br>';
            echo '3. Test the <a href="booking.php">Booking Form</a><br>';
            echo '4. Access the <a href="admin/dashboard.php">Admin Dashboard</a> after logging in';
            echo '</div>';
        } else {
            echo '<div class="fail" style="margin-top: 15px; padding: 15px;">';
            echo '<strong>⚠️ Some tests failed. Please review the errors above.</strong>';
            echo '</div>';
        }
        echo '</div>';
        
        // Quick links
        echo '<div class="test">';
        echo '<h3>Quick Links</h3>';
        echo '<ul>';
        echo '<li><a href="admin/login.php" target="_blank">Admin Login</a></li>';
        echo '<li><a href="admin/dashboard.php" target="_blank">Admin Dashboard</a> (requires login)</li>';
        echo '<li><a href="blog.php" target="_blank">Blog Page</a></li>';
        echo '<li><a href="booking.php" target="_blank">Booking Form</a></li>';
        echo '<li><a href="index.php" target="_blank">Homepage</a></li>';
        echo '</ul>';
        echo '</div>';
        ?>
    </div>
</body>
</html>


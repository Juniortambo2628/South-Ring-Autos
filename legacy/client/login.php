<?php
/**
 * Client Login Page
 */

require_once __DIR__ . '/../bootstrap.php';

use SouthRingAutos\Utils\SessionManager;

SessionManager::start();

// If user is already logged in and accessing login page, log them out first (for testing with other accounts)
if (SessionManager::isClientLoggedIn()) {
    SessionManager::destroy();
    // Redirect to login page with a message
    header('Location: login.php?logged_out=1');
    exit;
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <title>Client Login | South Ring Autos</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link href="../css/bootstrap.min.css" rel="stylesheet">
    <link href="../css/style.css" rel="stylesheet">
    <link href="../css/client.css" rel="stylesheet">
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet">
</head>
<body class="client-auth-body">
    <div class="client-auth-back-home">
        <a href="../index.php" class="btn btn-outline-light">
            <i class="fas fa-arrow-left me-2"></i>Back to Home
        </a>
    </div>
    <div class="client-auth-container">
        <div class="client-auth-form-section">
            <div class="client-auth-logo">
                <img src="../South-ring-logos/SR-Logo-Transparent-BG.png" alt="South Ring Autos" onerror="this.style.display='none'">
            </div>
            <h3 class="text-center mb-4">Welcome Back</h3>
            <p class="text-center text-muted mb-4">Sign in to your account to continue</p>
            <?php if (isset($_GET['logged_out']) && $_GET['logged_out'] == '1'): ?>
                <div class="alert alert-info mb-3">You have been logged out. Please sign in with a different account.</div>
            <?php endif; ?>
            <div id="error-message" class="alert alert-danger client-auth-alert-hidden"></div>
            <form id="login-form">
                <div class="mb-3">
                    <label class="form-label">Email Address</label>
                    <input type="email" class="form-control" name="email" required autocomplete="email" placeholder="Enter your email">
                </div>
                <div class="mb-3">
                    <label class="form-label">Password</label>
                    <input type="password" class="form-control" name="password" required autocomplete="current-password" placeholder="Enter your password">
                </div>
                <button type="submit" class="btn btn-primary w-100 mb-3">Sign In</button>
                <div class="text-center mb-2">
                    <a href="forgot-password.php" class="text-decoration-none">Forgot your password?</a>
                </div>
                <div class="text-center">
                    <a href="register.php" class="text-decoration-none">Don't have an account? <strong>Sign up here</strong></a>
                </div>
            </form>
        </div>
        <div class="client-auth-benefits-section">
            <h4 class="mb-4">Why Choose South Ring Autos?</h4>
            <div class="client-auth-benefit-item">
                <div class="client-auth-benefit-icon">
                    <i class="fas fa-calendar-check"></i>
                </div>
                <div class="client-auth-benefit-text">
                    <h5>Easy Booking</h5>
                    <p>Schedule your service appointments online with our convenient booking system</p>
                </div>
            </div>
            <div class="client-auth-benefit-item">
                <div class="client-auth-benefit-icon">
                    <i class="fas fa-chart-line"></i>
                </div>
                <div class="client-auth-benefit-text">
                    <h5>Track Progress</h5>
                    <p>Monitor your vehicle's repair progress in real-time through your dashboard</p>
                </div>
            </div>
            <div class="client-auth-benefit-item">
                <div class="client-auth-benefit-icon">
                    <i class="fas fa-truck"></i>
                </div>
                <div class="client-auth-benefit-text">
                    <h5>Pickup & Delivery</h5>
                    <p>Request convenient pickup and delivery services for your vehicle</p>
                </div>
            </div>
            <div class="client-auth-benefit-item">
                <div class="client-auth-benefit-icon">
                    <i class="fas fa-file-invoice"></i>
                </div>
                <div class="client-auth-benefit-text">
                    <h5>Digital Records</h5>
                    <p>Access all your service history and invoices in one place</p>
                </div>
            </div>
        </div>
    </div>

    <script src="../js/dist/client-auth.bundle.js"></script>
</body>
</html>


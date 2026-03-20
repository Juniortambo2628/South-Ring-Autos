<?php
/**
 * Client Registration Page
 */

require_once __DIR__ . '/../bootstrap.php';

use SouthRingAutos\Utils\SessionManager;

SessionManager::start();

// If user is already logged in and accessing register page, log them out first (for testing with other accounts)
if (SessionManager::isClientLoggedIn()) {
    SessionManager::destroy();
    // Redirect to register page with a message
    header('Location: register.php?logged_out=1');
    exit;
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <title>Register | South Ring Autos</title>
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
    <div class="client-auth-container client-register-container">
        <div class="client-auth-form-section">
            <div class="client-auth-logo">
                <img src="../South-ring-logos/SR-Logo-Transparent-BG.png" alt="South Ring Autos" onerror="this.style.display='none'">
            </div>
            <h3 class="text-center mb-4">Create Your Account</h3>
            <p class="text-center text-muted mb-4">Join thousands of satisfied customers</p>
            <?php if (isset($_GET['logged_out']) && $_GET['logged_out'] == '1'): ?>
                <div class="alert alert-info mb-3">You have been logged out. Please register with a different account.</div>
            <?php endif; ?>
            <div id="error-message" class="alert alert-danger client-auth-alert-hidden"></div>
            <div id="success-message" class="alert alert-success client-auth-alert-hidden"></div>
            <form id="register-form">
                <div class="client-auth-form-row">
                    <div class="mb-3">
                        <label class="form-label">Full Name</label>
                        <input type="text" class="form-control" name="name" required placeholder="Enter your full name">
                    </div>
                    <div class="mb-3">
                        <label class="form-label">Phone Number</label>
                        <input type="tel" class="form-control" name="phone" required placeholder="Enter phone number">
                    </div>
                </div>
                <div class="mb-3">
                    <label class="form-label">Email Address</label>
                    <input type="email" class="form-control" name="email" required autocomplete="email" placeholder="Enter your email">
                </div>
                <div class="mb-3">
                    <label class="form-label">Address (Optional)</label>
                    <textarea class="form-control" name="address" rows="2" placeholder="Enter your address"></textarea>
                </div>
                <div class="client-auth-form-row">
                    <div class="mb-3">
                        <label class="form-label">Password</label>
                        <input type="password" class="form-control" name="password" required minlength="8" autocomplete="new-password" placeholder="Create password">
                        <small class="form-text text-muted">Minimum 8 characters</small>
                    </div>
                    <div class="mb-3">
                        <label class="form-label">Confirm Password</label>
                        <input type="password" class="form-control" name="confirm_password" required placeholder="Confirm password">
                    </div>
                </div>
                <button type="submit" class="btn btn-primary w-100 mb-3">Create Account</button>
                <div class="text-center">
                    <a href="login.php" class="text-decoration-none">Already have an account? <strong>Sign in here</strong></a>
                </div>
            </form>
        </div>
        <div class="client-auth-benefits-section">
            <h4 class="mb-4">Why Join South Ring Autos?</h4>
            <div class="client-auth-benefit-item">
                <div class="client-auth-benefit-icon">
                    <i class="fas fa-shield-alt"></i>
                </div>
                <div class="client-auth-benefit-text">
                    <h5>Trusted Service</h5>
                    <p>Over 10 years of reliable auto repair and maintenance expertise</p>
                </div>
            </div>
            <div class="client-auth-benefit-item">
                <div class="client-auth-benefit-icon">
                    <i class="fas fa-clock"></i>
                </div>
                <div class="client-auth-benefit-text">
                    <h5>24/7 Access</h5>
                    <p>Manage your bookings and track progress anytime, anywhere</p>
                </div>
            </div>
            <div class="client-auth-benefit-item">
                <div class="client-auth-benefit-icon">
                    <i class="fas fa-dollar-sign"></i>
                </div>
                <div class="client-auth-benefit-text">
                    <h5>Transparent Pricing</h5>
                    <p>No hidden fees - get upfront quotes and detailed cost breakdowns</p>
                </div>
            </div>
            <div class="client-auth-benefit-item">
                <div class="client-auth-benefit-icon">
                    <i class="fas fa-tools"></i>
                </div>
                <div class="client-auth-benefit-text">
                    <h5>Expert Technicians</h5>
                    <p>Certified professionals using the latest diagnostic equipment</p>
                </div>
            </div>
            <div class="client-auth-benefit-item">
                <div class="client-auth-benefit-icon">
                    <i class="fas fa-headset"></i>
                </div>
                <div class="client-auth-benefit-text">
                    <h5>Customer Support</h5>
                    <p>Dedicated support team to assist with all your automotive needs</p>
                </div>
            </div>
        </div>
    </div>

    <script src="../js/dist/client-auth.bundle.js"></script>
</body>
</html>


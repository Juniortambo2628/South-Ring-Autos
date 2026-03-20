<?php
require_once __DIR__ . '/../bootstrap.php';

use SouthRingAutos\Utils\SessionManager;

// Redirect if already logged in
SessionManager::start();
if (SessionManager::isClientLoggedIn()) {
    header('Location: dashboard.php');
    exit;
}

$pageTitle = 'Forgot Password';
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?php echo htmlspecialchars($pageTitle); ?> - South Ring Autos</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <link rel="stylesheet" href="../css/client.css">
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
            <h3 class="text-center mb-4">Forgot Password?</h3>
            <p class="text-center text-muted mb-4">Enter your email address and we'll send you a link to reset your password.</p>
            <div id="error-message" class="alert alert-danger client-auth-alert-hidden"></div>
            <div id="success-message" class="alert alert-success client-auth-alert-hidden"></div>
            <form id="forgot-password-form">
                <div class="mb-3">
                    <label class="form-label">Email Address</label>
                    <input type="email" class="form-control" name="email" required autocomplete="email" placeholder="Enter your email">
                </div>
                <button type="submit" class="btn btn-primary w-100 mb-3">
                    <i class="fas fa-paper-plane me-2"></i>Send Reset Link
                </button>
                <div class="text-center">
                    <a href="login.php" class="text-decoration-none">Remember your password? <strong>Sign in</strong></a>
                </div>
            </form>
        </div>
        <div class="client-auth-benefits-section">
            <h4>Why Choose South Ring Autos?</h4>
            <div class="client-auth-benefit-item">
                <div class="client-auth-benefit-icon">
                    <i class="fas fa-tools"></i>
                </div>
                <div>
                    <h5>Expert Service</h5>
                    <p>Professional mechanics with years of experience</p>
                </div>
            </div>
            <div class="client-auth-benefit-item">
                <div class="client-auth-benefit-icon">
                    <i class="fas fa-clock"></i>
                </div>
                <div>
                    <h5>Quick Turnaround</h5>
                    <p>Fast and efficient service delivery</p>
                </div>
            </div>
            <div class="client-auth-benefit-item">
                <div class="client-auth-benefit-icon">
                    <i class="fas fa-shield-alt"></i>
                </div>
                <div>
                    <h5>Quality Guarantee</h5>
                    <p>We stand behind our work with warranties</p>
                </div>
            </div>
            <div class="client-auth-benefit-item">
                <div class="client-auth-benefit-icon">
                    <i class="fas fa-dollar-sign"></i>
                </div>
                <div>
                    <h5>Fair Pricing</h5>
                    <p>Transparent and competitive rates</p>
                </div>
            </div>
        </div>
    </div>
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/toastr.js/latest/toastr.min.js"></script>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/toastr.js/latest/toastr.min.css">
    <script>
        document.getElementById('forgot-password-form').addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const formData = new FormData(this);
            const email = formData.get('email');
            
            const errorDiv = document.getElementById('error-message');
            const successDiv = document.getElementById('success-message');
            errorDiv.classList.add('client-auth-alert-hidden');
            successDiv.classList.add('client-auth-alert-hidden');
            
            try {
                const response = await fetch('../api/client-auth.php?action=forgot-password', {
                    method: 'POST',
                    body: formData
                });
                
                const data = await response.json();
                
                if (data.success) {
                    successDiv.textContent = data.message;
                    successDiv.classList.remove('client-auth-alert-hidden');
                    this.reset();
                    
                    // Redirect to login after 3 seconds
                    setTimeout(() => {
                        window.location.href = 'login.php';
                    }, 3000);
                } else {
                    errorDiv.textContent = data.message || 'An error occurred. Please try again.';
                    errorDiv.classList.remove('client-auth-alert-hidden');
                }
            } catch (error) {
                errorDiv.textContent = 'Network error. Please try again.';
                errorDiv.classList.remove('client-auth-alert-hidden');
            }
        });
    </script>
</body>
</html>


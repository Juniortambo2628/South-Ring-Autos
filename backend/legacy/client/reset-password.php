<?php
require_once __DIR__ . '/../bootstrap.php';

use SouthRingAutos\Utils\SessionManager;
use SouthRingAutos\Database\Database;

// Redirect if already logged in
SessionManager::start();
if (SessionManager::isClientLoggedIn()) {
    header('Location: dashboard.php');
    exit;
}

$token = $_GET['token'] ?? '';
$validToken = false;
$error = '';

if (!empty($token)) {
    try {
        $db = Database::getInstance();
        $pdo = $db->getConnection();
        
        $stmt = $pdo->prepare("SELECT prt.*, c.name 
                               FROM password_reset_tokens prt 
                               JOIN clients c ON prt.user_id = c.id 
                               WHERE prt.token = ? AND prt.user_type = 'client' AND prt.used = 0 AND prt.expires_at > NOW()");
        $stmt->execute([$token]);
        $tokenData = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if ($tokenData) {
            $validToken = true;
        } else {
            $error = 'Invalid or expired reset token. Please request a new password reset link.';
        }
    } catch (Exception $e) {
        $error = 'An error occurred. Please try again.';
    }
} else {
    $error = 'No reset token provided.';
}

$pageTitle = 'Reset Password';
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
            <h3 class="text-center mb-4">Reset Password</h3>
            
            <?php if (!empty($error)): ?>
                <div class="alert alert-danger">
                    <i class="fas fa-exclamation-circle me-2"></i><?php echo htmlspecialchars($error); ?>
                </div>
                <div class="text-center mt-3">
                    <a href="forgot-password.php" class="text-decoration-none">Request a new reset link</a>
                </div>
            <?php elseif ($validToken): ?>
                <p class="text-center text-muted mb-4">Enter your new password below.</p>
                <div id="error-message" class="alert alert-danger client-auth-alert-hidden"></div>
                <div id="success-message" class="alert alert-success client-auth-alert-hidden"></div>
                <form id="reset-password-form">
                    <input type="hidden" name="token" value="<?php echo htmlspecialchars($token); ?>">
                    <div class="mb-3">
                        <label class="form-label">New Password</label>
                        <input type="password" class="form-control" name="password" required autocomplete="new-password" placeholder="Enter new password" minlength="8">
                        <small class="form-text text-muted">Password must be at least 8 characters long.</small>
                    </div>
                    <div class="mb-3">
                        <label class="form-label">Confirm Password</label>
                        <input type="password" class="form-control" name="confirm_password" required autocomplete="new-password" placeholder="Confirm new password" minlength="8">
                    </div>
                    <button type="submit" class="btn btn-primary w-100 mb-3">
                        <i class="fas fa-key me-2"></i>Reset Password
                    </button>
                    <div class="text-center">
                        <a href="login.php" class="text-decoration-none">Back to login</a>
                    </div>
                </form>
            <?php endif; ?>
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
    <?php if ($validToken): ?>
    <script>
        document.getElementById('reset-password-form').addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const formData = new FormData(this);
            const password = formData.get('password');
            const confirmPassword = formData.get('confirm_password');
            
            const errorDiv = document.getElementById('error-message');
            const successDiv = document.getElementById('success-message');
            errorDiv.classList.add('client-auth-alert-hidden');
            successDiv.classList.add('client-auth-alert-hidden');
            
            if (password !== confirmPassword) {
                errorDiv.textContent = 'Passwords do not match.';
                errorDiv.classList.remove('client-auth-alert-hidden');
                return;
            }
            
            if (password.length < 8) {
                errorDiv.textContent = 'Password must be at least 8 characters long.';
                errorDiv.classList.remove('client-auth-alert-hidden');
                return;
            }
            
            try {
                const response = await fetch('../api/client-auth.php?action=reset-password', {
                    method: 'POST',
                    body: formData
                });
                
                const data = await response.json();
                
                if (data.success) {
                    successDiv.textContent = data.message;
                    successDiv.classList.remove('client-auth-alert-hidden');
                    this.reset();
                    
                    // Redirect to login after 2 seconds
                    setTimeout(() => {
                        window.location.href = 'login.php';
                    }, 2000);
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
    <?php endif; ?>
</body>
</html>


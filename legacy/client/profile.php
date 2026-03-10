<?php
/**
 * Client Profile Management Page
 */

require_once __DIR__ . '/includes/auth-check.php';

use SouthRingAutos\Database\Database;
use SouthRingAutos\Utils\SessionManager;

$db = Database::getInstance();
$pdo = $db->getConnection();

$clientId = SessionManager::getClientId();
$message = '';
$error = '';

// Handle form submission
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $name = $_POST['name'] ?? '';
    $phone = $_POST['phone'] ?? '';
    $address = $_POST['address'] ?? '';
    $currentPassword = $_POST['current_password'] ?? '';
    $newPassword = $_POST['new_password'] ?? '';
    $confirmPassword = $_POST['confirm_password'] ?? '';
    
    // Get current client data
    $stmt = $pdo->prepare("SELECT * FROM clients WHERE id = ?");
    $stmt->execute([$clientId]);
    $currentClient = $stmt->fetch(PDO::FETCH_ASSOC);
    
    // Validate name and phone
    if (empty($name) || empty($phone)) {
        $error = 'Name and phone are required fields.';
    } else {
        $updateData = [];
        $updateParams = [];
        
        // Update name
        if ($name !== $currentClient['name']) {
            $updateData[] = "name = ?";
            $updateParams[] = $name;
        }
        
        // Update phone
        if ($phone !== $currentClient['phone']) {
            $updateData[] = "phone = ?";
            $updateParams[] = $phone;
        }
        
        // Update address
        if ($address !== ($currentClient['address'] ?? '')) {
            $updateData[] = "address = ?";
            $updateParams[] = $address ?: null;
        }
        
        // Handle password change if provided
        if (!empty($currentPassword) || !empty($newPassword) || !empty($confirmPassword)) {
            if (empty($currentPassword)) {
                $error = 'Current password is required to change password.';
            } elseif (!password_verify($currentPassword, $currentClient['password'])) {
                $error = 'Current password is incorrect.';
            } elseif (empty($newPassword) || strlen($newPassword) < 8) {
                $error = 'New password must be at least 8 characters.';
            } elseif ($newPassword !== $confirmPassword) {
                $error = 'New passwords do not match.';
            } else {
                $updateData[] = "password = ?";
                $updateParams[] = password_hash($newPassword, PASSWORD_DEFAULT);
            }
        }
        
        if (empty($error) && !empty($updateData)) {
            $updateParams[] = $clientId;
            $sql = "UPDATE clients SET " . implode(', ', $updateData) . ", updated_at = CURRENT_TIMESTAMP WHERE id = ?";
            $updateStmt = $pdo->prepare($sql);
            
            if ($updateStmt->execute($updateParams)) {
                $message = 'Profile updated successfully!';
                // Update session if name changed
                if ($name !== $currentClient['name']) {
                    $_SESSION['client_name'] = $name;
                }
            } else {
                $error = 'Failed to update profile. Please try again.';
            }
        } elseif (empty($error)) {
            $message = 'No changes to save.';
        }
    }
}

// Get current client data
$stmt = $pdo->prepare("SELECT * FROM clients WHERE id = ?");
$stmt->execute([$clientId]);
$client = $stmt->fetch(PDO::FETCH_ASSOC);

$activeLink = 'profile';
$pageTitle = 'My Profile | South Ring Autos';
include __DIR__ . '/includes/layout-start.php';
?>
<style>
    body { background: #f5f5f5; }
    .profile-card { border: none; border-radius: 15px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
</style>
                <div class="d-flex justify-content-between align-items-center mb-4">
                    <div>
                        <h1 class="dashboard-heading"><i class="fas fa-user me-2"></i>My Profile</h1>
                        <p class="text-muted mb-0">Manage your account information</p>
                    </div>
                    <a href="dashboard.php" class="btn btn-outline-secondary">
                        <i class="fas fa-arrow-left me-2"></i>Back to Dashboard
                    </a>
                </div>

                <?php if ($message): ?>
                    <div class="alert alert-success alert-dismissible fade show" role="alert">
                        <i class="fas fa-check-circle me-2"></i><?php echo htmlspecialchars($message); ?>
                        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
                    </div>
                <?php endif; ?>

                <?php if ($error): ?>
                    <div class="alert alert-danger alert-dismissible fade show" role="alert">
                        <i class="fas fa-exclamation-circle me-2"></i><?php echo htmlspecialchars($error); ?>
                        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
                    </div>
                <?php endif; ?>

                <div class="row">
                    <div class="col-md-8">
                        <div class="card profile-card">
                            <div class="card-header bg-primary text-white">
                                <h5 class="mb-0"><i class="fas fa-user-edit me-2"></i>Profile Information</h5>
                            </div>
                            <div class="card-body">
                                <form method="POST" action="">
                                    <div class="mb-3">
                                        <label for="email" class="form-label">Email Address</label>
                                        <input type="email" class="form-control" id="email" value="<?php echo htmlspecialchars($client['email']); ?>" disabled>
                                        <small class="text-muted">Email cannot be changed. Contact support if you need to update it.</small>
                                    </div>

                                    <div class="mb-3">
                                        <label for="name" class="form-label">Full Name <span class="text-danger">*</span></label>
                                        <input type="text" class="form-control" id="name" name="name" value="<?php echo htmlspecialchars($client['name']); ?>" required>
                                    </div>

                                    <div class="mb-3">
                                        <label for="phone" class="form-label">Phone Number <span class="text-danger">*</span></label>
                                        <input type="tel" class="form-control" id="phone" name="phone" value="<?php echo htmlspecialchars($client['phone']); ?>" required>
                                    </div>

                                    <div class="mb-3">
                                        <label for="address" class="form-label">Address</label>
                                        <textarea class="form-control" id="address" name="address" rows="3"><?php echo htmlspecialchars($client['address'] ?? ''); ?></textarea>
                                    </div>

                                    <hr>

                                    <h5 class="mb-3">Change Password</h5>
                                    <small class="text-muted mb-3 d-block">Leave blank if you don't want to change your password.</small>

                                    <div class="mb-3">
                                        <label for="current_password" class="form-label">Current Password</label>
                                        <input type="password" class="form-control" id="current_password" name="current_password">
                                    </div>

                                    <div class="mb-3">
                                        <label for="new_password" class="form-label">New Password</label>
                                        <input type="password" class="form-control" id="new_password" name="new_password" minlength="8">
                                        <small class="text-muted">Must be at least 8 characters long.</small>
                                    </div>

                                    <div class="mb-3">
                                        <label for="confirm_password" class="form-label">Confirm New Password</label>
                                        <input type="password" class="form-control" id="confirm_password" name="confirm_password" minlength="8">
                                    </div>

                                    <button type="submit" class="btn btn-primary">
                                        <i class="fas fa-save me-2"></i>Save Changes
                                    </button>
                                    <a href="dashboard.php" class="btn btn-secondary ms-2">Cancel</a>
                                </form>
                            </div>
                        </div>
                    </div>

                    <div class="col-md-4">
                        <div class="card profile-card">
                            <div class="card-header">
                                <h5 class="mb-0"><i class="fas fa-info-circle me-2"></i>Account Information</h5>
                            </div>
                            <div class="card-body">
                                <div class="mb-3">
                                    <small class="text-muted d-block">Member Since</small>
                                    <div class="fw-bold"><?php echo date('F j, Y', strtotime($client['created_at'])); ?></div>
                                </div>
                                <div class="mb-3">
                                    <small class="text-muted d-block">Last Updated</small>
                                    <div class="fw-bold"><?php echo date('F j, Y g:i A', strtotime($client['updated_at'] ?? $client['created_at'])); ?></div>
                                </div>
                                <hr>
                                <div class="mb-3">
                                    <small class="text-muted d-block">Account Status</small>
                                    <span class="badge bg-success">Active</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
<?php include __DIR__ . '/includes/layout-end.php'; ?>


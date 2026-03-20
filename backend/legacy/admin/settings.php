<?php
/**
 * Admin Settings - User Management
 * Modern glass design interface
 */

require_once __DIR__ . '/includes/auth-check.php';

use SouthRingAutos\Utils\SessionManager;

// Set page variables for header
$pageTitle = 'Settings | South Ring Autos Admin';
$currentPage = 'settings.php';
$showNotifications = false;
include __DIR__ . '/includes/header.php';
?>

    <div class="container-fluid mt-4 admin-main-container">
        <div class="row h-100">
            <?php include __DIR__ . '/includes/sidebar.php'; ?>
            <div class="col-md-10 admin-content-area">
                <h1 class="admin-heading"><i class="fas fa-cog me-2"></i>Settings</h1>

                <!-- Change Password Section -->
                <div class="settings-card">
                    <h3 class="text-white mb-4"><i class="fas fa-key me-2"></i>Change Password</h3>
                    <form id="changePasswordForm">
                        <div class="mb-3">
                            <label class="form-label-glass">Current Password</label>
                            <input type="password" class="form-control form-control-glass" id="currentPassword" required>
                        </div>
                        <div class="mb-3">
                            <label class="form-label-glass">New Password</label>
                            <input type="password" class="form-control form-control-glass" id="newPassword" required minlength="8">
                        </div>
                        <div class="mb-3">
                            <label class="form-label-glass">Confirm New Password</label>
                            <input type="password" class="form-control form-control-glass" id="confirmPassword" required>
                        </div>
                        <button type="submit" class="btn btn-pill btn-primary">
                            <i class="fas fa-save me-2"></i>Update Password
                        </button>
                    </form>
                </div>

                <!-- Email Configuration Section -->
                <div class="settings-card mb-4">
                    <h3 class="text-white mb-4"><i class="fas fa-envelope me-2"></i>Email Configuration</h3>
                    <p class="text-white-50 mb-3">Configure SMTP settings for sending booking confirmations and notifications.</p>
                    <form id="emailConfigForm">
                        <div class="row">
                            <div class="col-md-6 mb-3">
                                <label class="form-label-glass">From Email</label>
                                <input type="email" class="form-control form-control-glass" id="mailFromEmail" name="mail_from_email" value="<?php echo defined('MAIL_FROM_EMAIL') ? htmlspecialchars(constant('MAIL_FROM_EMAIL')) : 'noreply@southringautos.com'; ?>" required>
                            </div>
                            <div class="col-md-6 mb-3">
                                <label class="form-label-glass">From Name</label>
                                <input type="text" class="form-control form-control-glass" id="mailFromName" name="mail_from_name" value="<?php echo defined('MAIL_FROM_NAME') ? htmlspecialchars(constant('MAIL_FROM_NAME')) : 'South Ring Autos'; ?>" required>
                            </div>
                        </div>
                        <div class="mb-3">
                            <div class="form-check form-switch">
                                <input class="form-check-input" type="checkbox" id="mailSmtpEnabled" name="mail_smtp_enabled" <?php echo (defined('MAIL_SMTP_ENABLED') && constant('MAIL_SMTP_ENABLED')) ? 'checked' : ''; ?>>
                                <label class="form-check-label text-white" for="mailSmtpEnabled">Enable SMTP</label>
                            </div>
                        </div>
                        <div id="smtpSettings" style="display: <?php echo (defined('MAIL_SMTP_ENABLED') && constant('MAIL_SMTP_ENABLED')) ? 'block' : 'none'; ?>;">
                            <div class="row">
                                <div class="col-md-6 mb-3">
                                    <label class="form-label-glass">SMTP Host</label>
                                    <input type="text" class="form-control form-control-glass" id="mailSmtpHost" name="mail_smtp_host" value="<?php echo defined('MAIL_SMTP_HOST') ? htmlspecialchars(constant('MAIL_SMTP_HOST')) : 'smtp.gmail.com'; ?>">
                                </div>
                                <div class="col-md-6 mb-3">
                                    <label class="form-label-glass">SMTP Port</label>
                                    <input type="number" class="form-control form-control-glass" id="mailSmtpPort" name="mail_smtp_port" value="<?php echo defined('MAIL_SMTP_PORT') ? htmlspecialchars(constant('MAIL_SMTP_PORT')) : '587'; ?>">
                                </div>
                            </div>
                            <div class="row">
                                <div class="col-md-6 mb-3">
                                    <label class="form-label-glass">SMTP Username</label>
                                    <input type="text" class="form-control form-control-glass" id="mailSmtpUser" name="mail_smtp_user" value="<?php echo defined('MAIL_SMTP_USER') ? htmlspecialchars(constant('MAIL_SMTP_USER')) : ''; ?>">
                                </div>
                                <div class="col-md-6 mb-3">
                                    <label class="form-label-glass">SMTP Password</label>
                                    <input type="password" class="form-control form-control-glass" id="mailSmtpPass" name="mail_smtp_pass" placeholder="Leave blank to keep current">
                                </div>
                            </div>
                            <div class="mb-3">
                                <label class="form-label-glass">SMTP Security</label>
                                <select class="form-select form-control-glass" id="mailSmtpSecure" name="mail_smtp_secure">
                                    <option value="tls" <?php echo (defined('MAIL_SMTP_SECURE') && constant('MAIL_SMTP_SECURE') === 'tls') ? 'selected' : ''; ?>>TLS</option>
                                    <option value="ssl" <?php echo (defined('MAIL_SMTP_SECURE') && constant('MAIL_SMTP_SECURE') === 'ssl') ? 'selected' : ''; ?>>SSL</option>
                                </select>
                            </div>
                        </div>
                        <button type="submit" class="btn btn-pill btn-primary">
                            <i class="fas fa-save me-2"></i>Save Email Settings
                        </button>
                        <button type="button" class="btn btn-pill btn-outline-light ms-2" onclick="testEmailConfig()">
                            <i class="fas fa-paper-plane me-2"></i>Test Email
                        </button>
                    </form>
                    <div id="email-config-message" class="mt-3"></div>
                </div>

                <!-- Cache Management Section -->
                <div class="settings-card mb-4">
                    <h3 class="text-white mb-4"><i class="fas fa-database me-2"></i>Cache Management</h3>
                    <p class="text-white-50 mb-3">Clear cached data to refresh content. Car logos cache is automatically refreshed when the dataset is updated.</p>
                    <div class="d-flex gap-2">
                        <button class="btn btn-pill btn-warning" onclick="clearCache('all')">
                            <i class="fas fa-trash me-2"></i>Clear All Cache
                        </button>
                        <button class="btn btn-pill btn-info" onclick="clearCache('logos')">
                            <i class="fas fa-images me-2"></i>Clear Car Logos Cache
                        </button>
                    </div>
                    <div id="cache-message" class="mt-3"></div>
                </div>

                <!-- User Management Section -->
                <div class="settings-card">
                    <div class="d-flex justify-content-between align-items-center mb-4">
                        <h3 class="text-white mb-0"><i class="fas fa-users me-2"></i>User Management</h3>
                        <button class="btn btn-pill btn-primary" onclick="openCreateUserModal()">
                            <i class="fas fa-plus me-2"></i>Add User
                        </button>
                    </div>
                    <div id="users-list">
                        <div class="loading-spinner">
                            <div class="spinner-border spinner-border-custom" role="status"></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Create/Edit User Modal -->
    <div class="modal fade" id="userModal" tabindex="-1">
        <div class="modal-dialog modal-dialog-centered">
            <div class="modal-content glass-card">
                <div class="modal-header border-0">
                    <h5 class="modal-title text-white" id="userModalTitle"><i class="fas fa-user-plus me-2"></i>Add New User</h5>
                    <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                </div>
                <div class="modal-body">
                    <form id="userForm">
                        <input type="hidden" id="userId" name="id">
                        <div class="mb-3">
                            <label class="form-label-glass">Username</label>
                            <input type="text" class="form-control form-control-glass" id="userUsername" name="username" required>
                        </div>
                        <div class="mb-3">
                            <label class="form-label-glass">Email (Optional)</label>
                            <input type="email" class="form-control form-control-glass" id="userEmail" name="email">
                        </div>
                        <div class="mb-3" id="passwordField">
                            <label class="form-label-glass">Password</label>
                            <input type="password" class="form-control form-control-glass" id="userPassword" name="password" minlength="8">
                        </div>
                        <div class="d-grid gap-2">
                            <button type="submit" class="btn btn-pill btn-primary">
                                <i class="fas fa-save me-2"></i>Save User
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    </div>

    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.0.0/dist/js/bootstrap.bundle.min.js"></script>
    <script>
        // Email configuration toggle
        document.getElementById('mailSmtpEnabled')?.addEventListener('change', function() {
            const smtpSettings = document.getElementById('smtpSettings');
            if (smtpSettings) {
                smtpSettings.style.display = this.checked ? 'block' : 'none';
            }
        });

        // Email configuration form
        document.getElementById('emailConfigForm')?.addEventListener('submit', function(e) {
            e.preventDefault();
            const formData = new FormData(this);
            const data = Object.fromEntries(formData);
            
            fetch('../api/settings.php?action=email', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            })
            .then(r => r.json())
            .then(result => {
                const messageEl = document.getElementById('email-config-message');
                if (result.success) {
                    if (typeof toastr !== 'undefined') {
                        toastr.success('Email settings saved successfully');
                    } else {
                        messageEl.innerHTML = '<div class="alert alert-success">Email settings saved successfully</div>';
                    }
                } else {
                    if (typeof toastr !== 'undefined') {
                        toastr.error(result.message || 'Failed to save email settings');
                    } else {
                        messageEl.innerHTML = '<div class="alert alert-danger">' + (result.message || 'Failed to save email settings') + '</div>';
                    }
                }
            })
            .catch(err => {
                console.error('Error:', err);
                if (typeof toastr !== 'undefined') {
                    toastr.error('Error saving email settings');
                } else {
                    document.getElementById('email-config-message').innerHTML = '<div class="alert alert-danger">Error saving email settings</div>';
                }
            });
        });

        // Test email configuration
        function testEmailConfig() {
            const formData = new FormData(document.getElementById('emailConfigForm'));
            const data = Object.fromEntries(formData);
            
            fetch('../api/settings.php?action=test-email', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            })
            .then(r => r.json())
            .then(result => {
                if (result.success) {
                    if (typeof toastr !== 'undefined') {
                        toastr.success('Test email sent successfully! Check your inbox.');
                    } else {
                        alert('Test email sent successfully! Check your inbox.');
                    }
                } else {
                    if (typeof toastr !== 'undefined') {
                        toastr.error(result.message || 'Failed to send test email');
                    } else {
                        alert('Failed to send test email: ' + (result.message || 'Unknown error'));
                    }
                }
            })
            .catch(err => {
                console.error('Error:', err);
                if (typeof toastr !== 'undefined') {
                    toastr.error('Error sending test email');
                } else {
                    alert('Error sending test email');
                }
            });
        }

        // Load users
        function loadUsers() {
            fetch('../api/users.php?action=list')
                .then(response => response.json())
                .then(data => {
                    if (data.success && data.users) {
                        renderUsers(data.users);
                    } else {
                        document.getElementById('users-list').innerHTML = '<div class="empty-state"><p>Error loading users</p></div>';
                    }
                })
                .catch(error => {
                    console.error('Error:', error);
                    document.getElementById('users-list').innerHTML = '<div class="empty-state"><p>Error loading users</p></div>';
                });
        }

        function renderUsers(users) {
            if (users.length === 0) {
                document.getElementById('users-list').innerHTML = '<div class="empty-state"><i class="fas fa-users"></i><p>No users found</p></div>';
                return;
            }

            const html = users.map(user => {
                const date = new Date(user.created_at);
                return `
                    <div class="user-item">
                        <div class="row align-items-center">
                            <div class="col-md-8">
                                <div class="item-title">
                                    <i class="fas fa-user me-2"></i>${escapeHtml(user.username)}
                                </div>
                                ${user.email ? `<div class="item-meta"><i class="fas fa-envelope me-2"></i>${escapeHtml(user.email)}</div>` : ''}
                                <div class="item-meta">
                                    <i class="fas fa-clock me-2"></i>Created: ${date.toLocaleDateString()}
                                </div>
                            </div>
                            <div class="col-md-4 text-end">
                                ${user.id != <?php echo $_SESSION['admin_id']; ?> ? `
                                    <button class="btn btn-pill btn-outline-light btn-sm" onclick="deleteUser(${user.id})">
                                        <i class="fas fa-trash me-2"></i>Delete
                                    </button>
                                ` : '<span class="badge badge-pill status-confirmed">Current User</span>'}
                            </div>
                        </div>
                    </div>
                `;
            }).join('');

            document.getElementById('users-list').innerHTML = html;
        }

        function openCreateUserModal() {
            document.getElementById('userModalTitle').innerHTML = '<i class="fas fa-user-plus me-2"></i>Add New User';
            document.getElementById('userForm').reset();
            document.getElementById('userId').value = '';
            document.getElementById('passwordField').classList.remove('d-none');
            document.getElementById('userPassword').required = true;
            const modal = new bootstrap.Modal(document.getElementById('userModal'));
            modal.show();
        }

        function deleteUser(id) {
            if (!confirm('Are you sure you want to delete this user?')) return;

            fetch(`../api/users.php?action=delete&id=${id}`)
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        loadUsers();
                    } else {
                        alert('Error deleting user: ' + (data.message || 'Unknown error'));
                    }
                })
                .catch(error => {
                    console.error('Error:', error);
                    alert('Error deleting user');
                });
        }

        // Change password form
        document.getElementById('changePasswordForm').addEventListener('submit', function(e) {
            e.preventDefault();
            const currentPassword = document.getElementById('currentPassword').value;
            const newPassword = document.getElementById('newPassword').value;
            const confirmPassword = document.getElementById('confirmPassword').value;

            if (newPassword !== confirmPassword) {
                alert('New passwords do not match');
                return;
            }

            fetch('../api/users.php?action=change-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    current_password: currentPassword,
                    new_password: newPassword
                })
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    alert('Password changed successfully');
                    document.getElementById('changePasswordForm').reset();
                } else {
                    alert('Error: ' + (data.message || 'Failed to change password'));
                }
            })
            .catch(error => {
                console.error('Error:', error);
                alert('Error changing password');
            });
        });

        // User form
        document.getElementById('userForm').addEventListener('submit', function(e) {
            e.preventDefault();
            const id = document.getElementById('userId').value;
            const isEdit = id !== '';
            
            const data = {
                username: document.getElementById('userUsername').value,
                email: document.getElementById('userEmail').value || null
            };

            if (!isEdit) {
                data.password = document.getElementById('userPassword').value;
            }

            const url = '../api/users.php?action=create';
            
            fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data)
            })
            .then(response => response.json())
            .then(result => {
                if (result.success) {
                    const modal = bootstrap.Modal.getInstance(document.getElementById('userModal'));
                    modal.hide();
                    loadUsers();
                } else {
                    alert('Error saving user: ' + (result.message || 'Unknown error'));
                }
            })
            .catch(error => {
                console.error('Error:', error);
                alert('Error saving user');
            });
        });

        function escapeHtml(text) {
            if (!text) return '';
            const map = {
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                '"': '&quot;',
                "'": '&#039;'
            };
            return text.toString().replace(/[&<>"']/g, m => map[m]);
        }

        loadUsers();

        // Cache management
        function clearCache(type) {
            const action = type === 'all' ? 'clear' : 'clear_logos';
            const messageEl = document.getElementById('cache-message');
            
            if (!confirm(`Are you sure you want to clear ${type === 'all' ? 'all' : 'car logos'} cache?`)) {
                return;
            }
            
            messageEl.innerHTML = '<div class="alert alert-info">Clearing cache...</div>';
            
            fetch(`../api/cache-clear.php?action=${action}`)
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        messageEl.innerHTML = `<div class="alert alert-success">${data.message}</div>`;
                        setTimeout(() => {
                            messageEl.innerHTML = '';
                        }, 3000);
                    } else {
                        messageEl.innerHTML = `<div class="alert alert-danger">Error: ${data.message || 'Failed to clear cache'}</div>`;
                    }
                })
                .catch(error => {
                    console.error('Error:', error);
                    messageEl.innerHTML = '<div class="alert alert-danger">Error clearing cache</div>';
                });
        }
    </script>
</body>
</html>


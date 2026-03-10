<?php
/**
 * Client Header Component
 * Reusable header with notifications dropdown, profile dropdown, and logout
 * 
 * @param array $client Client data array
 */
use SouthRingAutos\Database\Database;

if (!isset($client)) {
    // Get client info if not provided
    require_once __DIR__ . '/../../bootstrap.php';
    
    $db = Database::getInstance();
    $pdo = $db->getConnection();
    $clientId = $_SESSION['client_id'] ?? null;
    
    if ($clientId) {
        $stmt = $pdo->prepare("SELECT * FROM clients WHERE id = ?");
        $stmt->execute([$clientId]);
        $client = $stmt->fetch(PDO::FETCH_ASSOC);
    }
}
?>
<header class="client-content__topbar">
    <div class="client-topbar__welcome">Welcome, <?php echo htmlspecialchars($client['name'] ?? 'User'); ?></div>
    
    <div class="client-topbar__actions">
        <!-- Notifications Dropdown -->
        <div class="dropdown">
            <button class="btn btn-link text-decoration-none position-relative" type="button" id="notificationDropdown" data-bs-toggle="dropdown" aria-expanded="false">
                <i class="fas fa-bell fa-lg"></i>
                <span class="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger notification-badge" id="notification-badge" style="display: none;">0</span>
            </button>
            <ul class="dropdown-menu dropdown-menu-end notification-dropdown" aria-labelledby="notificationDropdown" style="min-width: 350px; max-height: 400px; overflow-y: auto;">
                <li class="dropdown-header">
                    <div class="d-flex justify-content-between align-items-center">
                        <span>Notifications</span>
                        <a href="notifications.php" class="btn btn-sm btn-link text-decoration-none p-0">View All</a>
                    </div>
                </li>
                <li><hr class="dropdown-divider"></li>
                <li>
                    <div id="notifications-dropdown-content" class="p-2">
                        <div class="text-center text-muted py-3">
                            <i class="fas fa-spinner fa-spin"></i> Loading...
                        </div>
                    </div>
                </li>
            </ul>
        </div>
        
        <!-- Profile Dropdown -->
        <div class="dropdown">
            <button class="btn btn-link text-decoration-none d-flex align-items-center" type="button" id="profileDropdown" data-bs-toggle="dropdown" aria-expanded="false">
                <i class="fas fa-user-circle fa-lg me-2"></i>
                <span><?php echo htmlspecialchars($client['name'] ?? 'User'); ?></span>
                <i class="fas fa-chevron-down fa-xs ms-2"></i>
            </button>
            <ul class="dropdown-menu dropdown-menu-end" aria-labelledby="profileDropdown">
                <li><a class="dropdown-item" href="profile.php"><i class="fas fa-user me-2"></i>My Profile</a></li>
                <li><a class="dropdown-item" href="dashboard.php"><i class="fas fa-gauge me-2"></i>Dashboard</a></li>
                <li><hr class="dropdown-divider"></li>
                <li><a class="dropdown-item text-danger" href="logout.php"><i class="fas fa-right-from-bracket me-2"></i>Logout</a></li>
            </ul>
        </div>
    </div>
</header>

<script>
// Load notifications for dropdown
(function() {
    function loadNotifications() {
        fetch('../api/notifications.php?action=list')
            .then(r => r.json())
            .then(data => {
                if (data.success && data.notifications) {
                    const unread = data.notifications.filter(n => !n.read_status);
                    const badge = document.getElementById('notification-badge');
                    const content = document.getElementById('notifications-dropdown-content');
                    
                    // Update badge
                    if (unread.length > 0) {
                        badge.textContent = unread.length > 99 ? '99+' : unread.length;
                        badge.style.display = 'block';
                    } else {
                        badge.style.display = 'none';
                    }
                    
                    // Show notifications (last 5)
                    const notifications = data.notifications.slice(0, 5);
                    if (notifications.length === 0) {
                        content.innerHTML = '<div class="text-center text-muted py-3"><i class="fas fa-bell-slash"></i><br>No notifications</div>';
                    } else {
                        content.innerHTML = notifications.map(n => `
                            <div class="notification-item p-2 border-bottom ${!n.read_status ? 'bg-light' : ''}" style="cursor: pointer;" onclick="window.location.href='notifications.php'">
                                <div class="d-flex justify-content-between align-items-start">
                                    <div class="flex-grow-1">
                                        <div class="fw-bold small ${!n.read_status ? 'text-primary' : ''}">${escapeHtml(n.title)}</div>
                                        <div class="small text-muted">${escapeHtml(n.message.substring(0, 80))}${n.message.length > 80 ? '...' : ''}</div>
                                    </div>
                                    ${!n.read_status ? '<span class="badge bg-primary rounded-circle ms-2" style="width: 8px; height: 8px; padding: 0;"></span>' : ''}
                                </div>
                            </div>
                        `).join('');
                    }
                }
            })
            .catch(err => {
                console.error('Error loading notifications:', err);
            });
    }
    
    function escapeHtml(text) {
        if (!text) return '';
        const map = {'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;'};
        return text.toString().replace(/[&<>"']/g, m => map[m]);
    }
    
    // Load on page load
    loadNotifications();
    
    // Auto-refresh every 30 seconds
    setInterval(loadNotifications, 30000);
})();
</script>


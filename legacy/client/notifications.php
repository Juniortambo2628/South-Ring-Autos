<?php
/**
 * Notifications Page
 * Standalone page to view all notifications
 */

require_once __DIR__ . '/includes/auth-check.php';

use SouthRingAutos\Database\Database;
use SouthRingAutos\Utils\SessionManager;

$db = Database::getInstance();
$pdo = $db->getConnection();

$clientId = SessionManager::getClientId();

// Get client info
$stmt = $pdo->prepare("SELECT * FROM clients WHERE id = ?");
$stmt->execute([$clientId]);
$client = $stmt->fetch(PDO::FETCH_ASSOC);

$activeLink = 'notifications';
$pageTitle = 'Notifications | South Ring Autos';
include __DIR__ . '/includes/layout-start.php';
?>

<?php
// Hero Section
$heroConfig = [
    'title' => 'Notifications',
    'subtitle' => 'View and manage all your notifications',
    'icon' => 'fas fa-bell',
    'theme' => 'client',
    'breadcrumbs' => [
        ['label' => 'Dashboard', 'url' => 'dashboard.php'],
        ['label' => 'Notifications', 'url' => 'notifications.php', 'active' => true]
    ]
];
include __DIR__ . '/../includes/hero-section.php';
?>

<!-- Search Container -->
<div class="card mb-4">
    <div class="card-body">
        <div class="d-flex justify-content-between align-items-center">
            <div class="flex-grow-1 me-3">
                <div id="search-container"></div>
            </div>
            <button class="btn btn-outline-primary" onclick="markAllAsRead()">
                <i class="fas fa-check-double me-2"></i>Mark All as Read
            </button>
        </div>
    </div>
</div>

<!-- Grid Container -->
<div class="card">
    <div class="card-body">
        <div id="grid-container"></div>
        <div id="pagination-container" class="mt-4"></div>
    </div>
</div>

<script>
function loadNotifications() {
    fetch('../api/notifications.php?action=list')
        .then(r => r.json())
        .then(data => {
            const container = document.getElementById('notifications-container');
            
            if (!data.success || !data.notifications || data.notifications.length === 0) {
                container.innerHTML = `
                    <div class="text-center py-5">
                        <i class="fas fa-bell-slash fa-3x text-muted mb-3"></i>
                        <p class="text-muted">No notifications yet</p>
                    </div>
                `;
                return;
            }
            
            const html = data.notifications.map(n => `
                <div class="alert ${n.read_status ? 'alert-light border' : 'alert-info'} alert-dismissible mb-3" style="cursor: pointer;" onclick="markRead(${n.id}, this)">
                    <div class="d-flex justify-content-between align-items-start">
                        <div class="flex-grow-1">
                            <h6 class="alert-heading mb-1 ${!n.read_status ? 'text-primary' : ''}">
                                ${escapeHtml(n.title)}
                                ${!n.read_status ? '<span class="badge bg-primary ms-2">New</span>' : ''}
                            </h6>
                            <div class="mb-2">${escapeHtml(n.message)}</div>
                            <small class="text-muted">
                                <i class="fas fa-clock me-1"></i>
                                ${formatDate(n.created_at)}
                            </small>
                        </div>
                        ${!n.read_status ? `
                            <button type="button" class="btn-close" onclick="event.stopPropagation(); markRead(${n.id}, this.closest('.alert'))" aria-label="Mark as read"></button>
                        ` : `
                            <button type="button" class="btn-close" onclick="event.stopPropagation(); deleteNotification(${n.id}, this.closest('.alert'))" aria-label="Delete"></button>
                        `}
                    </div>
                </div>
            `).join('');
            
            container.innerHTML = html;
        })
        .catch(err => {
            console.error('Error loading notifications:', err);
            document.getElementById('notifications-container').innerHTML = `
                <div class="alert alert-danger">
                    <i class="fas fa-exclamation-triangle me-2"></i>
                    Error loading notifications. Please refresh the page.
                </div>
            `;
        });
}

function markRead(id, element = null) {
    fetch(`../api/notifications.php?action=mark-read&id=${id}`, {method: 'POST'})
        .then(r => r.json())
        .then(result => {
            if (result.success) {
                loadNotifications(); // Reload grid
                // Refresh notification dropdown in header if function exists
                if (typeof window.loadHeaderNotifications === 'function') {
                    window.loadHeaderNotifications();
                }
            }
        });
}

function markAllAsRead() {
    if (!confirm('Mark all notifications as read?')) return;
    
    fetch('../api/notifications.php?action=mark-all-read', {method: 'POST'})
        .then(r => r.json())
        .then(result => {
            if (result.success) {
                loadNotifications();
                // Refresh notification dropdown in header
                setTimeout(() => window.location.reload(), 500);
            } else {
                alert('Error: ' + (result.message || 'Failed to mark all as read'));
            }
        });
}

function deleteNotification(id, element) {
    if (!confirm('Delete this notification?')) return;
    
    fetch(`../api/notifications.php?action=delete&id=${id}`, {method: 'POST'})
        .then(r => r.json())
        .then(result => {
            if (result.success) {
                loadNotifications(); // Reload grid
                // Refresh notification dropdown in header if function exists
                if (typeof window.loadHeaderNotifications === 'function') {
                    window.loadHeaderNotifications();
                }
            } else {
                alert('Error: ' + (result.message || 'Failed to delete notification'));
            }
        });
}

function escapeHtml(text) {
    if (!text) return '';
    const map = {'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;'};
    return text.toString().replace(/[&<>"']/g, m => map[m]);
}

function formatDate(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    
    return date.toLocaleDateString();
}

// Load on page load
loadNotifications();

// Auto-refresh every 30 seconds
setInterval(loadNotifications, 30000);
</script>

<?php include __DIR__ . '/includes/layout-end.php'; ?>


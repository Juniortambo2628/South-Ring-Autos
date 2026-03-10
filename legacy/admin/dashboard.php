<?php
/**
 * Admin Dashboard
 * Refactored to use new architecture with modern glass design
 */

require_once __DIR__ . '/includes/auth-check.php';

use SouthRingAutos\Services\AdminService;
use SouthRingAutos\Utils\SessionManager;

// Get dashboard stats using service
$adminService = new AdminService();
$stats = $adminService->getDashboardStats();

// Extract stats for template
$totalBookings = $stats['totalBookings'];
$pendingBookings = $stats['pendingBookings'];
$confirmedBookings = $stats['confirmedBookings'];
$completedBookings = $stats['completedBookings'];
$totalPosts = $stats['totalPosts'];
$totalClients = $stats['totalClients'];
$pendingDeliveries = $stats['pendingDeliveries'];
$totalRevenue = $stats['totalRevenue'];
$thisMonthRevenue = $stats['thisMonthRevenue'];
$recentPendingCount = $stats['recentPendingCount'];

// Set page variables for header
$pageTitle = 'Admin Dashboard | South Ring Autos';
$currentPage = 'dashboard.php';
$showNotifications = true;
include __DIR__ . '/includes/header.php';
?>

    <div class="container-fluid mt-4 admin-main-container">
        <div class="row h-100">
            <?php include __DIR__ . '/includes/sidebar.php'; ?>
            <div class="col-md-10 admin-content-area">
                <?php
                // Hero Section
                $heroConfig = [
                    'title' => 'Dashboard',
                    'subtitle' => 'Here\'s what\'s happening with your business today',
                    'icon' => 'fas fa-tachometer-alt',
                    'theme' => 'admin',
                    'breadcrumbs' => [
                        ['label' => 'Home', 'url' => 'dashboard.php']
                    ]
                ];
                include __DIR__ . '/../includes/hero-section.php';
                ?>
                
                <!-- Summary Cards Row 1 -->
                <div class="row mb-4">
                    <div class="col-md-3 mb-3">
                        <div class="stats-card primary">
                            <h5><i class="fas fa-calendar-alt me-2"></i>Total Bookings</h5>
                            <h2><?php echo $totalBookings; ?></h2>
                        </div>
                    </div>
                    <div class="col-md-3 mb-3">
                        <div class="stats-card warning">
                            <h5><i class="fas fa-clock me-2"></i>Pending</h5>
                            <h2><?php echo $pendingBookings; ?></h2>
                        </div>
                    </div>
                    <div class="col-md-3 mb-3">
                        <div class="stats-card info">
                            <h5><i class="fas fa-check-circle me-2"></i>Confirmed</h5>
                            <h2><?php echo $confirmedBookings; ?></h2>
                        </div>
                    </div>
                    <div class="col-md-3 mb-3">
                        <div class="stats-card success">
                            <h5><i class="fas fa-check-double me-2"></i>Completed</h5>
                            <h2><?php echo $completedBookings; ?></h2>
                        </div>
                    </div>
                </div>

                <!-- Summary Cards Row 2 -->
                <div class="row mb-4">
                    <div class="col-md-3 mb-3">
                        <div class="stats-card success">
                            <h5><i class="fas fa-users me-2"></i>Total Clients</h5>
                            <h2><?php echo $totalClients; ?></h2>
                        </div>
                    </div>
                    <div class="col-md-3 mb-3">
                        <div class="stats-card warning">
                            <h5><i class="fas fa-truck me-2"></i>Pending Deliveries</h5>
                            <h2><?php echo $pendingDeliveries; ?></h2>
                        </div>
                    </div>
                    <div class="col-md-3 mb-3">
                        <div class="stats-card primary">
                            <h5><i class="fas fa-money-bill-wave me-2"></i>Total Revenue</h5>
                            <h2>KES <?php echo number_format($totalRevenue, 0); ?></h2>
                        </div>
                    </div>
                    <div class="col-md-3 mb-3">
                        <div class="stats-card info">
                            <h5><i class="fas fa-chart-line me-2"></i>This Month</h5>
                            <h2>KES <?php echo number_format($thisMonthRevenue, 0); ?></h2>
                        </div>
                    </div>
                </div>

                <!-- Quick Actions -->
                <div class="content-card mb-4">
                    <div class="card-header">
                        <h5><i class="fas fa-bolt me-2"></i>Quick Actions</h5>
                    </div>
                    <div class="card-body">
                        <div class="row g-3">
                            <div class="col-md-3">
                                <a href="bookings.php?status=pending" class="quick-action-btn">
                                    <div class="quick-action-icon warning">
                                        <i class="fas fa-clock"></i>
                                    </div>
                                    <span>View Pending</span>
                                    <?php if ($pendingBookings > 0): ?>
                                        <span class="badge"><?php echo $pendingBookings; ?></span>
                                    <?php endif; ?>
                                </a>
                            </div>
                            <div class="col-md-3">
                                <a href="blog.php" class="quick-action-btn">
                                    <div class="quick-action-icon success">
                                        <i class="fas fa-plus-circle"></i>
                                    </div>
                                    <span>New Blog Post</span>
                                </a>
                            </div>
                            <div class="col-md-3">
                                <a href="deliveries.php?status=pending" class="quick-action-btn">
                                    <div class="quick-action-icon info">
                                        <i class="fas fa-truck"></i>
                                    </div>
                                    <span>Manage Deliveries</span>
                                    <?php if ($pendingDeliveries > 0): ?>
                                        <span class="badge"><?php echo $pendingDeliveries; ?></span>
                                    <?php endif; ?>
                                </a>
                            </div>
                            <div class="col-md-3">
                                <a href="analytics.php" class="quick-action-btn">
                                    <div class="quick-action-icon primary">
                                        <i class="fas fa-chart-bar"></i>
                                    </div>
                                    <span>View Analytics</span>
                                </a>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="content-card">
                    <div class="card-header">
                        <h5><i class="fas fa-list me-2"></i>Recent Bookings</h5>
                    </div>
                    <div class="card-body">
                        <div id="recent-bookings">
                            <div class="loading-spinner">
                                <div class="spinner-border spinner-border-custom" role="status">
                                    <span class="visually-hidden">Loading...</span>
                                </div>
                                <p class="mt-2">Loading bookings...</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Notifications Dropdown -->
    <div id="notifications-panel" class="content-card notifications-panel">
        <div class="card-header">
            <h5><i class="fas fa-bell me-2"></i>Recent Notifications</h5>
        </div>
        <div class="card-body" id="notifications-list">
            <div class="loading-spinner">
                <div class="spinner-border spinner-border-custom" role="status"></div>
            </div>
        </div>
    </div>

    <script>
        // Load notifications
        function loadNotifications() {
            fetch('../api/bookings.php?action=list&status=pending')
                .then(response => response.json())
                .then(data => {
                    if (data.success && data.bookings && data.bookings.length > 0) {
                        const recent = data.bookings.slice(0, 10);
                        const html = recent.map(booking => {
                            const date = new Date(booking.created_at);
                            return `
                                <div class="booking-item">
                                    <div class="item-title">New Booking: ${escapeHtml(booking.name)}</div>
                                    <div class="item-meta">
                                        <i class="fas fa-car me-2"></i>${escapeHtml(booking.registration)}
                                    </div>
                                    <div class="item-meta">
                                        <i class="fas fa-tools me-2"></i>${escapeHtml(booking.service)}
                                    </div>
                                    <div class="item-meta">
                                        <i class="fas fa-clock me-2"></i>${date.toLocaleDateString()} at ${date.toLocaleTimeString()}
                                    </div>
                                    <a href="bookings.php" class="btn btn-pill btn-primary btn-sm">
                                        <i class="fas fa-eye me-1"></i>View
                                    </a>
                                </div>
                            `;
                        }).join('');
                        document.getElementById('notifications-list').innerHTML = html;
                    } else {
                        document.getElementById('notifications-list').innerHTML = `
                            <div class="empty-state">
                                <i class="fas fa-bell-slash"></i>
                                <p>No pending bookings</p>
                            </div>
                        `;
                    }
                })
                .catch(error => {
                    console.error('Error loading notifications:', error);
                });
        }

        function toggleNotifications() {
            const panel = document.getElementById('notifications-panel');
            if (!panel.classList.contains('show')) {
                loadNotifications();
                panel.classList.add('show');
            } else {
                panel.classList.remove('show');
            }
        }

        // Close notifications when clicking outside
        document.addEventListener('click', function(event) {
            const panel = document.getElementById('notifications-panel');
            const bell = document.querySelector('.notification-bell');
            if (panel && !panel.contains(event.target) && !bell.contains(event.target)) {
                panel.classList.remove('show');
            }
        });

        // Auto-refresh notifications every 30 seconds
        setInterval(loadNotifications, 30000);

        // Load recent bookings
        fetch('../api/bookings.php?action=list')
            .then(response => response.json())
            .then(data => {
                if (data.success && data.bookings && data.bookings.length > 0) {
                    const recent = data.bookings.slice(0, 10);
                    const html = recent.map(booking => {
                        const date = new Date(booking.created_at);
                        const statusClass = booking.status === 'pending' ? 'status-pending' : 
                                          booking.status === 'confirmed' ? 'status-confirmed' : 
                                          booking.status === 'completed' ? 'status-completed' : 'status-cancelled';
                        return `
                            <div class="booking-item">
                                <div class="d-flex justify-content-between align-items-start mb-3">
                                    <div class="flex-grow-1">
                                        <div class="item-title">${escapeHtml(booking.name)} - ${escapeHtml(booking.registration)}</div>
                                        <div class="item-meta">
                                            <i class="fas fa-tools me-2"></i>${escapeHtml(booking.service)}
                                        </div>
                                        <div class="item-meta">
                                            <i class="fas fa-clock me-2"></i>${date.toLocaleDateString()} at ${date.toLocaleTimeString()}
                                        </div>
                                        ${booking.phone ? `<div class="item-meta"><i class="fas fa-phone me-2"></i>${escapeHtml(booking.phone)}</div>` : ''}
                                    </div>
                                    <span class="badge badge-pill ${statusClass} ms-3">${booking.status}</span>
                                </div>
                                <div class="d-flex gap-2 flex-wrap">
                                    <a href="bookings.php?view=${booking.id}" class="btn btn-sm btn-outline-primary">
                                        <i class="fas fa-eye me-1"></i>View Details
                                    </a>
                                    <a href="bookings.php?edit=${booking.id}" class="btn btn-sm btn-outline-warning">
                                        <i class="fas fa-edit me-1"></i>Update Progress
                                    </a>
                                    ${booking.status === 'pending' ? `
                                        <button class="btn btn-sm btn-outline-success" onclick="updateBookingStatus(${booking.id}, 'confirmed')">
                                            <i class="fas fa-check me-1"></i>Confirm
                                        </button>
                                    ` : ''}
                                    ${booking.status !== 'completed' ? `
                                        <button class="btn btn-sm btn-outline-info" onclick="updateBookingStatus(${booking.id}, 'completed')">
                                            <i class="fas fa-check-double me-1"></i>Mark Complete
                                        </button>
                                    ` : ''}
                                    <button class="btn btn-sm btn-outline-danger" onclick="deleteBooking(${booking.id})">
                                        <i class="fas fa-trash me-1"></i>Delete
                                    </button>
                                </div>
                            </div>
                        `;
                    }).join('');
                    document.getElementById('recent-bookings').innerHTML = html;
                } else {
                    document.getElementById('recent-bookings').innerHTML = `
                        <div class="empty-state">
                            <i class="fas fa-inbox"></i>
                            <h4>No bookings found</h4>
                            <p>New bookings will appear here</p>
                        </div>
                    `;
                }
            })
            .catch(error => {
                console.error('Error loading bookings:', error);
                document.getElementById('recent-bookings').innerHTML = `
                    <div class="empty-state">
                        <i class="fas fa-exclamation-triangle"></i>
                        <h4>Error loading bookings</h4>
                        <p>Please refresh the page</p>
                    </div>
                `;
            });

        function escapeHtml(text) {
            const map = {
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                '"': '&quot;',
                "'": '&#039;'
            };
            return text ? text.replace(/[&<>"']/g, m => map[m]) : '';
        }

        function updateBookingStatus(bookingId, status) {
            if (!confirm(`Are you sure you want to update this booking status to ${status}?`)) {
                return;
            }
            
            fetch('../api/bookings.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: `action=update&id=${bookingId}&status=${status}`
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    location.reload();
                } else {
                    alert('Error: ' + (data.message || 'Failed to update booking'));
                }
            })
            .catch(error => {
                console.error('Error:', error);
                alert('Error updating booking status');
            });
        }

        function deleteBooking(bookingId) {
            if (!confirm('Are you sure you want to delete this booking? This action cannot be undone.')) {
                return;
            }
            
            fetch('../api/bookings.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: `action=delete&id=${bookingId}`
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    location.reload();
                } else {
                    alert('Error: ' + (data.message || 'Failed to delete booking'));
                }
            })
            .catch(error => {
                console.error('Error:', error);
                alert('Error deleting booking');
            });
        }
    </script>
</body>
</html>

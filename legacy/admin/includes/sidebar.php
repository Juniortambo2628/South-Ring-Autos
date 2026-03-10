<?php
/**
 * Admin Sidebar
 * Centralized sidebar component for admin pages
 */

use SouthRingAutos\Services\AdminService;

// Get stats for sidebar badges
$adminService = new AdminService();
$stats = $adminService->getDashboardStats();
$pendingBookings = $stats['pendingBookings'];
$currentPage = $currentPage ?? basename($_SERVER['PHP_SELF']);
?>
<div class="col-md-<?php echo isset($sidebarWidth) ? $sidebarWidth : '2'; ?> mb-4">
    <div class="admin-sidebar">
        <img src="../South-ring-logos/SR-Logo-Transparent-BG.png" alt="South Ring Autos" class="sidebar-logo" onerror="this.style.display='none'">
        <div class="list-group">
            <a href="dashboard.php" class="list-group-item list-group-item-action <?php echo $currentPage === 'dashboard.php' ? 'active' : ''; ?>">
                <i class="fas fa-chart-line me-2"></i>Dashboard
            </a>
            <a href="bookings.php" class="list-group-item list-group-item-action <?php echo $currentPage === 'bookings.php' ? 'active' : ''; ?>">
                <i class="fas fa-calendar-check me-2"></i>Bookings
                <?php 
                $totalBookings = $stats['totalBookings'] ?? 0;
                if ($totalBookings > 0): ?>
                    <span class="badge"><?php echo $totalBookings; ?></span>
                <?php endif; ?>
            </a>
            <a href="blog.php" class="list-group-item list-group-item-action <?php echo $currentPage === 'blog.php' ? 'active' : ''; ?>">
                <i class="fas fa-blog me-2"></i>Blog Posts
            </a>
            <a href="analytics.php" class="list-group-item list-group-item-action <?php echo $currentPage === 'analytics.php' ? 'active' : ''; ?>">
                <i class="fas fa-chart-bar me-2"></i>Analytics
            </a>
            <a href="deliveries.php" class="list-group-item list-group-item-action <?php echo $currentPage === 'deliveries.php' ? 'active' : ''; ?>">
                <i class="fas fa-truck me-2"></i>Delivery Requests
            </a>
            <a href="car-brands.php" class="list-group-item list-group-item-action <?php echo $currentPage === 'car-brands.php' ? 'active' : ''; ?>">
                <i class="fas fa-car me-2"></i>Car Brands
            </a>
            <a href="settings.php" class="list-group-item list-group-item-action <?php echo $currentPage === 'settings.php' ? 'active' : ''; ?>">
                <i class="fas fa-cog me-2"></i>Settings
            </a>
        </div>
    </div>
</div>


<?php
/**
 * Client Sidebar Component
 * Reusable sidebar navigation for client pages
 * 
 * @param string $activeLink The active sidebar link (e.g., 'dashboard', 'profile', 'vehicles')
 */
$activeLink = $activeLink ?? 'dashboard';
?>
<button class="client-sidebar__toggle" id="sidebarToggle" aria-label="Toggle sidebar">
    <i class="fas fa-bars"></i>
</button>
<aside class="client-sidebar" id="clientSidebar" role="navigation">
    <div class="client-sidebar__brand">
        <img src="../South-ring-logos/SR-Logo-Transparent-BG.png" alt="South Ring Autos" class="client-sidebar__logo">
        <span class="client-sidebar__title">South Ring Autos</span>
        <button class="client-sidebar__close" id="sidebarClose" aria-label="Close sidebar">
            <i class="fas fa-times"></i>
        </button>
    </div>
    <nav class="client-sidebar__nav">
        <a href="dashboard.php" class="client-sidebar__link <?php echo $activeLink === 'dashboard' ? 'active' : ''; ?>">
            <i class="fas fa-gauge"></i><span>Dashboard</span>
        </a>
        <a href="profile.php" class="client-sidebar__link <?php echo $activeLink === 'profile' ? 'active' : ''; ?>">
            <i class="fas fa-user"></i><span>My Profile</span>
        </a>
        <a href="vehicles.php" class="client-sidebar__link <?php echo $activeLink === 'vehicles' ? 'active' : ''; ?>">
            <i class="fas fa-car"></i><span>My Vehicles</span>
        </a>
        <a href="../booking.php" class="client-sidebar__link <?php echo $activeLink === 'booking' ? 'active' : ''; ?>">
            <i class="fas fa-calendar-plus"></i><span>New Booking</span>
        </a>
        <a href="request-delivery.php" class="client-sidebar__link <?php echo $activeLink === 'delivery' ? 'active' : ''; ?>">
            <i class="fas fa-truck"></i><span>Pick-up / Drop-off</span>
        </a>
        <a href="payment-history.php" class="client-sidebar__link <?php echo $activeLink === 'payments' ? 'active' : ''; ?>">
            <i class="fas fa-receipt"></i><span>Payments</span>
        </a>
    </nav>
</aside>


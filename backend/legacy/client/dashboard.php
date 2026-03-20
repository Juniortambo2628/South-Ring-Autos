<?php
/**
 * Client Dashboard
 */

require_once __DIR__ . '/includes/auth-check.php';

use SouthRingAutos\Database\Database;
use SouthRingAutos\Utils\SessionManager;

$db = Database::getInstance();
$pdo = $db->getConnection();

// Get client info
$clientId = SessionManager::getClientId();
$stmt = $pdo->prepare("SELECT * FROM clients WHERE id = ?");
$stmt->execute([$clientId]);
$client = $stmt->fetch(PDO::FETCH_ASSOC);

// Get client stats
$activeBookingsStmt = $pdo->prepare("SELECT COUNT(*) FROM bookings WHERE client_id = ? AND status NOT IN ('completed', 'cancelled')");
$activeBookingsStmt->execute([$clientId]);
$activeBookings = $activeBookingsStmt->fetchColumn();

$completedBookingsStmt = $pdo->prepare("SELECT COUNT(*) FROM bookings WHERE client_id = ? AND status = 'completed'");
$completedBookingsStmt->execute([$clientId]);
$completedBookings = $completedBookingsStmt->fetchColumn();

$pendingPaymentStmt = $pdo->prepare("SELECT COALESCE(SUM(p.amount), 0) FROM payments p 
    INNER JOIN bookings b ON p.booking_id = b.id 
    WHERE b.client_id = ? AND p.status = 'pending'");
$pendingPaymentStmt->execute([$clientId]);
$pendingPayment = $pendingPaymentStmt->fetchColumn();

$totalSpentStmt = $pdo->prepare("SELECT COALESCE(SUM(p.amount), 0) FROM payments p 
    INNER JOIN bookings b ON p.booking_id = b.id 
    WHERE b.client_id = ? AND p.status = 'completed'");
$totalSpentStmt->execute([$clientId]);
$totalSpent = $totalSpentStmt->fetchColumn();

// Get vehicle stats
$totalVehiclesStmt = $pdo->prepare("SELECT COUNT(*) FROM vehicles WHERE client_id = ?");
$totalVehiclesStmt->execute([$clientId]);
$totalVehicles = $totalVehiclesStmt->fetchColumn();

// Get payment history stats
$recentPaymentsStmt = $pdo->prepare("SELECT COUNT(*) FROM payments p 
    INNER JOIN bookings b ON p.booking_id = b.id 
    WHERE b.client_id = ? AND p.created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)");
$recentPaymentsStmt->execute([$clientId]);
$recentPayments = $recentPaymentsStmt->fetchColumn();

$activeLink = 'dashboard';
$pageTitle = 'My Dashboard | South Ring Autos';
$extraStylesheets = ['https://cdn.jsdelivr.net/npm/chart.js@3.9.1/dist/chart.min.css'];
include __DIR__ . '/includes/layout-start.php';
?>

<?php
// Hero Section
$heroConfig = [
    'title' => 'My Dashboard',
    'subtitle' => 'Track your vehicle repairs and services',
    'icon' => 'fas fa-tachometer-alt',
    'theme' => 'client',
    'breadcrumbs' => [
        ['label' => 'Home', 'url' => 'dashboard.php']
    ]
];
include __DIR__ . '/../includes/hero-section.php';
?>

<!-- Summary Cards (Metric Tiles) -->
<div class="row mb-4">
    <div class="col-md-3 mb-3">
        <div class="metric-card metric-red">
            <div class="metric-card__body">
                <div class="metric-card__value">KES <?php echo number_format($totalSpent, 0); ?></div>
                <div class="metric-card__label">Total Spent</div>
            </div>
            <i class="fas fa-wallet metric-card__icon"></i>
        </div>
    </div>
    <div class="col-md-3 mb-3">
        <div class="metric-card metric-blue">
            <div class="metric-card__body">
                <div class="metric-card__value"><?php echo $activeBookings; ?></div>
                <div class="metric-card__label">Active Repairs</div>
            </div>
            <i class="fas fa-wrench metric-card__icon"></i>
        </div>
    </div>
    <div class="col-md-3 mb-3">
        <div class="metric-card metric-cyan">
            <div class="metric-card__body">
                <div class="metric-card__value"><?php echo $completedBookings; ?></div>
                <div class="metric-card__label">Completed</div>
            </div>
            <i class="fas fa-check-circle metric-card__icon"></i>
        </div>
    </div>
    <div class="col-md-3 mb-3">
        <div class="metric-card metric-magenta">
            <div class="metric-card__body">
                <div class="metric-card__value">KES <?php echo number_format($pendingPayment, 0); ?></div>
                <div class="metric-card__label">Pending Payment</div>
            </div>
            <i class="fas fa-money-bill-wave metric-card__icon"></i>
        </div>
    </div>
</div>

<div class="row mb-4">
    <!-- My Vehicles Card -->
    <div class="col-md-6 mb-3">
        <div class="card">
            <div class="card-header">
                <h5 class="mb-0"><i class="fas fa-car me-2"></i>My Vehicles</h5>
            </div>
            <div class="card-body">
                <div class="d-flex justify-content-between align-items-center mb-3">
                    <div>
                        <h3 class="mb-0"><?php echo $totalVehicles; ?></h3>
                        <small class="text-muted">Total Vehicles</small>
                    </div>
                    <i class="fas fa-car fa-3x text-primary opacity-25"></i>
                </div>
                <div id="vehicles-preview">
                    <div class="text-center text-muted py-2">
                        <i class="fas fa-spinner fa-spin"></i> Loading...
                    </div>
                </div>
                <div class="mt-3">
                    <a href="vehicles.php" class="btn btn-outline-white btn-sm w-100">
                        <i class="fas fa-arrow-right me-2"></i>View All Vehicles
                    </a>
                </div>
            </div>
        </div>
    </div>

    <!-- Payment History Card -->
    <div class="col-md-6 mb-3">
        <div class="card">
            <div class="card-header">
                <h5 class="mb-0"><i class="fas fa-receipt me-2"></i>Payment History</h5>
            </div>
            <div class="card-body">
                <div class="d-flex justify-content-between align-items-center mb-3">
                    <div>
                        <h3 class="mb-0">KES <?php echo number_format($totalSpent, 0); ?></h3>
                        <small class="text-muted">Total Paid</small>
                    </div>
                    <i class="fas fa-receipt fa-3x text-success opacity-25"></i>
                </div>
                <div class="mb-2">
                    <small class="text-muted d-block mb-1">Recent Payments (30 days)</small>
                    <div class="fw-bold"><?php echo $recentPayments; ?> transactions</div>
                </div>
                <div class="mb-2">
                    <small class="text-muted d-block mb-1">Pending</small>
                    <div class="fw-bold">KES <?php echo number_format($pendingPayment, 0); ?></div>
                </div>
                <div class="mt-3">
                    <a href="payment-history.php" class="btn btn-outline-white btn-sm w-100">
                        <i class="fas fa-arrow-right me-2"></i>View Payment History
                    </a>
                </div>
            </div>
        </div>
    </div>
</div>

<div class="row">
    <!-- Active Bookings -->
    <div class="col-md-8">
        <div class="card">
            <div class="card-header">
                <h5 class="mb-0"><i class="fas fa-wrench me-2"></i>My Bookings</h5>
            </div>
            <div class="card-body" id="bookings-container">
                <div class="text-center">Loading bookings...</div>
            </div>
        </div>
    </div>

    <!-- Quick Actions -->
    <div class="col-md-4">
        <div class="card mb-3">
            <div class="card-header bg-section text-white">
                <h5 class="mb-0"><i class="fas fa-bolt me-2"></i>Quick Actions</h5>
            </div>
            <div class="card-body">
                <div class="quick-actions">
                    <a href="../booking.php" class="qa-btn" aria-label="New Booking">
                        <span class="qa-icon"><i class="fas fa-calendar-plus"></i></span>
                        <span class="qa-text">New Booking</span>
                    </a>
                    <a href="vehicles.php" class="qa-btn" aria-label="My Vehicles">
                        <span class="qa-icon"><i class="fas fa-car"></i></span>
                        <span class="qa-text">My Vehicles</span>
                    </a>
                    <a href="request-delivery.php" class="qa-btn" aria-label="Request Pick-up/Drop-off">
                        <span class="qa-icon"><i class="fas fa-truck"></i></span>
                        <span class="qa-text">Pick-up/Drop-off</span>
                    </a>
                    <a href="profile.php" class="qa-btn" aria-label="My Profile">
                        <span class="qa-icon"><i class="fas fa-user"></i></span>
                        <span class="qa-text">My Profile</span>
                    </a>
                    <a href="payment-history.php" class="qa-btn" aria-label="Payment History">
                        <span class="qa-icon"><i class="fas fa-receipt"></i></span>
                        <span class="qa-text">Payment History</span>
                    </a>
                </div>
            </div>
        </div>

        <!-- Additional Summary Info -->
        <div class="card">
            <div class="card-header">
                <h5 class="mb-0"><i class="fas fa-info-circle me-2"></i>Account Info</h5>
            </div>
            <div class="card-body">
                <div class="mb-2">
                    <small class="text-muted">Email</small>
                    <div class="fw-bold"><?php echo htmlspecialchars($client['email']); ?></div>
                </div>
                <div class="mb-2">
                    <small class="text-muted">Phone</small>
                    <div class="fw-bold"><?php echo htmlspecialchars($client['phone']); ?></div>
                </div>
                <?php if ($client['address']): ?>
                <div>
                    <small class="text-muted">Address</small>
                    <div class="fw-bold"><?php echo htmlspecialchars($client['address']); ?></div>
                </div>
                <?php endif; ?>
            </div>
        </div>
    </div>
</div>

<script src="https://cdn.jsdelivr.net/npm/chart.js@3.9.1/dist/chart.min.js"></script>
<script src="../js/dist/client-dashboard.bundle.js"></script>

<?php
$extraScripts = ['https://cdn.jsdelivr.net/npm/chart.js@3.9.1/dist/chart.min.js'];
include __DIR__ . '/includes/layout-end.php';
?>

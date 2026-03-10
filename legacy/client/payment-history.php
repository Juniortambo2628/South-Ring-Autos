<?php
/**
 * Payment History Page
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

// Get payment history
$stmt = $pdo->prepare("
    SELECT 
        p.*,
        b.registration,
        b.service,
        b.status as booking_status
    FROM payments p
    INNER JOIN bookings b ON p.booking_id = b.id
    WHERE p.client_id = ?
    ORDER BY p.created_at DESC
");
$stmt->execute([$clientId]);
$payments = $stmt->fetchAll(PDO::FETCH_ASSOC);

// Calculate totals
$totalPaid = 0;
$totalPending = 0;
foreach ($payments as $payment) {
    if ($payment['status'] === 'completed') {
        $totalPaid += $payment['amount'];
    } elseif ($payment['status'] === 'pending') {
        $totalPending += $payment['amount'];
    }
    }
    
$activeLink = 'payments';
$pageTitle = 'Payment History | South Ring Autos';
include __DIR__ . '/includes/layout-start.php';
?>

<?php
// Hero Section
$heroConfig = [
    'title' => 'Payment History',
    'subtitle' => 'View all your payment transactions and invoices',
    'icon' => 'fas fa-credit-card',
    'theme' => 'client',
    'breadcrumbs' => [
        ['label' => 'Dashboard', 'url' => 'dashboard.php'],
        ['label' => 'Payment History', 'url' => 'payment-history.php', 'active' => true]
    ]
];
include __DIR__ . '/../includes/hero-section.php';
?>

<!-- Search and Filter Container -->
<div class="card mb-4">
    <div class="card-body">
        <div class="row g-3">
            <div class="col-md-6">
                <div id="search-container"></div>
            </div>
            <div class="col-md-6">
                <div id="filter-container"></div>
            </div>
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

<?php
// Convert payments array to JSON for JavaScript
$paymentsJson = json_encode($payments);
?>
<script>
    document.addEventListener('DOMContentLoaded', function() {
        const payments = <?php echo $paymentsJson; ?>;
        
        const grid = new DashboardGrid({
            containerId: 'grid-container',
            searchContainerId: 'search-container',
            filterContainerId: 'filter-container',
            paginationContainerId: 'pagination-container',
            data: payments,
            columns: [
                { 
                    id: 'payment_date', 
                    name: 'Date',
                    formatter: (value) => {
                        if (!value) return 'N/A';
                        const date = new Date(value);
                        return date.toLocaleDateString();
                    }
                },
                { id: 'service', name: 'Service' },
                { 
                    id: 'amount', 
                    name: 'Amount',
                    formatter: (value) => {
                        return 'KES ' + parseFloat(value).toLocaleString();
                    }
                },
                { id: 'payment_method', name: 'Method' },
                { 
                    id: 'status', 
                    name: 'Status',
                    formatter: (value) => {
                        const statusClass = value === 'completed' ? 'status-confirmed' : 
                                          value === 'pending' ? 'status-pending' : 'status-cancelled';
                        return `<span class="badge badge-pill ${statusClass}">${value}</span>`;
                    }
                }
            ],
            searchable: true,
            searchKeys: ['service', 'payment_method', 'status'],
            filterable: true,
            filters: [
                {
                    key: 'status',
                    label: 'Status',
                    options: [
                        { value: 'completed', label: 'Completed' },
                        { value: 'pending', label: 'Pending' },
                        { value: 'failed', label: 'Failed' }
                    ]
                }
            ],
            pagination: true,
            pageSize: 10
        });
    });
</script>
<?php
// Remove the old payment list display
// The grid will handle it now
?>
<style>
    body { background: #f5f5f5; }
    .payment-card { border: none; border-radius: 15px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
    .payment-item { border-bottom: 1px solid #eee; padding: 1rem 0; }
    .payment-item:last-child { border-bottom: none; }
    .status-badge { font-size: 0.85rem; padding: 0.35rem 0.75rem; }
</style>
                <div class="d-flex justify-content-between align-items-center mb-4">
                    <div>
                        <h1 class="dashboard-heading"><i class="fas fa-receipt me-2"></i>Payment History</h1>
                        <p class="text-muted mb-0">View all your payment transactions</p>
                    </div>
                    <a href="dashboard.php" class="btn btn-outline-secondary">
                        <i class="fas fa-arrow-left me-2"></i>Back to Dashboard
                    </a>
                </div>

                <!-- Summary Cards -->
                <div class="row mb-4">
                    <div class="col-md-4 mb-3">
                        <div class="card payment-card">
                            <div class="card-body">
                                <div class="d-flex justify-content-between align-items-center">
                                    <div>
                                        <div class="text-muted small mb-1">Total Paid</div>
                                        <div class="h4 mb-0 text-success">KES <?php echo number_format($totalPaid, 2); ?></div>
                                    </div>
                                    <div class="text-success" style="font-size: 2.5rem;">
                                        <i class="fas fa-check-circle"></i>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-4 mb-3">
                        <div class="card payment-card">
                            <div class="card-body">
                                <div class="d-flex justify-content-between align-items-center">
                                    <div>
                                        <div class="text-muted small mb-1">Pending Payment</div>
                                        <div class="h4 mb-0 text-warning">KES <?php echo number_format($totalPending, 2); ?></div>
                                    </div>
                                    <div class="text-warning" style="font-size: 2.5rem;">
                                        <i class="fas fa-clock"></i>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-4 mb-3">
                        <div class="card payment-card">
                            <div class="card-body">
                                <div class="d-flex justify-content-between align-items-center">
                                    <div>
                                        <div class="text-muted small mb-1">Total Transactions</div>
                                        <div class="h4 mb-0"><?php echo count($payments); ?></div>
                                    </div>
                                    <div class="text-primary" style="font-size: 2.5rem;">
                                        <i class="fas fa-list"></i>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Payment List -->
                <div class="card payment-card">
                    <div class="card-header bg-primary text-white">
                        <h5 class="mb-0"><i class="fas fa-history me-2"></i>All Payments</h5>
                    </div>
                    <div class="card-body">
                        <?php if (empty($payments)): ?>
                            <div class="text-center py-5">
                                <i class="fas fa-receipt fa-3x text-muted mb-3"></i>
                                <p class="text-muted">No payment history found.</p>
                                <a href="../booking.php" class="btn btn-primary">Make a Booking</a>
                            </div>
                        <?php else: ?>
                            <div class="table-responsive">
                                <table class="table table-hover">
                                    <thead>
                                        <tr>
                                            <th>Date</th>
                                            <th>Booking</th>
                                            <th>Service</th>
                                            <th>Amount</th>
                                            <th>Payment Method</th>
                                            <th>Transaction ID</th>
                                            <th>Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <?php foreach ($payments as $payment): ?>
                                            <tr>
                                                <td>
                                                    <?php 
                                                    $date = $payment['payment_date'] ?: $payment['created_at'];
                                                    echo date('M j, Y', strtotime($date));
                                                    if ($payment['payment_date']) {
                                                        echo '<br><small class="text-muted">' . date('g:i A', strtotime($date)) . '</small>';
                                                    }
                                                    ?>
                                                </td>
                                                <td>
                                                    <strong><?php echo htmlspecialchars($payment['registration']); ?></strong>
                                                    <br><small class="text-muted">Booking #<?php echo $payment['booking_id']; ?></small>
                                                </td>
                                                <td><?php echo htmlspecialchars($payment['service']); ?></td>
                                                <td><strong>KES <?php echo number_format($payment['amount'], 2); ?></strong></td>
                                                <td>
                                                    <?php 
                                                    $method = $payment['payment_method'] ?: 'N/A';
                                                    $icons = [
                                                        'mpesa' => 'mobile-alt',
                                                        'card' => 'credit-card',
                                                        'cash' => 'money-bill',
                                                        'bank' => 'university'
                                                    ];
                                                    $icon = $icons[strtolower($method)] ?? 'money-bill-wave';
                                                    ?>
                                                    <i class="fas fa-<?php echo $icon; ?> me-1"></i>
                                                    <?php echo ucfirst($method); ?>
                                                </td>
                                                <td>
                                                    <?php if ($payment['transaction_id']): ?>
                                                        <code class="small"><?php echo htmlspecialchars(substr($payment['transaction_id'], 0, 20)); ?>...</code>
                                                    <?php else: ?>
                                                        <span class="text-muted">-</span>
                                                    <?php endif; ?>
                                                </td>
                                                <td>
                                                    <?php
                                                    $statusColors = [
                                                        'completed' => 'success',
                                                        'pending' => 'warning',
                                                        'failed' => 'danger',
                                                        'cancelled' => 'secondary'
                                                    ];
                                                    $color = $statusColors[$payment['status']] ?? 'secondary';
                                                    ?>
                                                    <span class="badge bg-<?php echo $color; ?> status-badge">
                                                        <?php echo ucfirst($payment['status']); ?>
                                                    </span>
                                                </td>
                                            </tr>
                                        <?php endforeach; ?>
                                    </tbody>
                                </table>
                            </div>
                        <?php endif; ?>
                    </div>
                </div>
            </div>
<?php include __DIR__ . '/includes/layout-end.php'; ?>


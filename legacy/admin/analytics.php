<?php
/**
 * Advanced Analytics Dashboard
 */
require_once __DIR__ . '/includes/auth-check.php';

use SouthRingAutos\Database\Database;

$db = Database::getInstance();
$pdo = $db->getConnection();

// Revenue Analytics
$revenueStmt = $pdo->query("SELECT SUM(amount) as total, DATE_FORMAT(payment_date, '%Y-%m') as month 
    FROM payments 
    WHERE status = 'completed' AND payment_date >= DATE_SUB(NOW(), INTERVAL 12 MONTH)
    GROUP BY month ORDER BY month");
$revenueData = $revenueStmt->fetchAll(PDO::FETCH_ASSOC);

// Daily Revenue (Last 30 days)
$dailyRevenueStmt = $pdo->query("SELECT DATE_FORMAT(payment_date, '%Y-%m-%d') as day, SUM(amount) as total
    FROM payments 
    WHERE status = 'completed' AND payment_date >= DATE_SUB(NOW(), INTERVAL 30 DAY)
    GROUP BY day ORDER BY day");
$dailyRevenue = $dailyRevenueStmt->fetchAll(PDO::FETCH_ASSOC);

// Payment Methods Breakdown
$paymentMethodsStmt = $pdo->query("SELECT payment_method, COUNT(*) as count, SUM(amount) as total
    FROM payments 
    WHERE status = 'completed' AND payment_method IS NOT NULL
    GROUP BY payment_method");
$paymentMethods = $paymentMethodsStmt->fetchAll(PDO::FETCH_ASSOC);

// Turnaround Time by Service - Check if updated_at column exists
$hasUpdatedAt = false;
try {
    $checkColStmt = $pdo->query("SHOW COLUMNS FROM bookings LIKE 'updated_at'");
    $hasUpdatedAt = $checkColStmt->rowCount() > 0;
} catch (PDOException $e) {
    $hasUpdatedAt = false;
}

if ($hasUpdatedAt) {
    $turnaroundStmt = $pdo->query("SELECT 
        b.service,
        COUNT(*) as completed_count,
        AVG(DATEDIFF(COALESCE(b.updated_at, NOW()), b.created_at)) as avg_days,
        MIN(DATEDIFF(COALESCE(b.updated_at, NOW()), b.created_at)) as min_days,
        MAX(DATEDIFF(COALESCE(b.updated_at, NOW()), b.created_at)) as max_days
        FROM bookings b
        WHERE b.status = 'completed'
        GROUP BY b.service
        ORDER BY avg_days ASC");
} else {
    // Fallback: use created_at + estimated completion (7 days default for completed)
    $turnaroundStmt = $pdo->query("SELECT 
        b.service,
        COUNT(*) as completed_count,
        AVG(7) as avg_days,
        MIN(1) as min_days,
        MAX(14) as max_days
        FROM bookings b
        WHERE b.status = 'completed'
        GROUP BY b.service
        ORDER BY avg_days ASC");
}
$turnaroundData = $turnaroundStmt->fetchAll(PDO::FETCH_ASSOC);

// Check if estimated_cost and actual_cost columns exist
$hasCostColumns = false;
try {
    $checkColStmt = $pdo->query("SHOW COLUMNS FROM bookings LIKE 'estimated_cost'");
    $hasCostColumns = $checkColStmt->rowCount() > 0;
} catch (PDOException $e) {
    $hasCostColumns = false;
}

// Service Performance (Revenue & Count)
if ($hasCostColumns) {
    $servicePerformanceStmt = $pdo->query("SELECT 
        b.service,
        COUNT(DISTINCT b.id) as booking_count,
        COALESCE(SUM(p.amount), 0) as total_revenue,
        COALESCE(AVG(p.amount), 0) as avg_revenue,
        COALESCE(SUM(b.estimated_cost), 0) as total_estimated,
        COALESCE(SUM(b.actual_cost), 0) as total_actual
        FROM bookings b
        LEFT JOIN payments p ON b.id = p.booking_id AND p.status = 'completed'
        GROUP BY b.service
        ORDER BY total_revenue DESC");
} else {
    // Fallback: without cost columns
    $servicePerformanceStmt = $pdo->query("SELECT 
        b.service,
        COUNT(DISTINCT b.id) as booking_count,
        COALESCE(SUM(p.amount), 0) as total_revenue,
        COALESCE(AVG(p.amount), 0) as avg_revenue,
        0 as total_estimated,
        0 as total_actual
        FROM bookings b
        LEFT JOIN payments p ON b.id = p.booking_id AND p.status = 'completed'
        GROUP BY b.service
        ORDER BY total_revenue DESC");
}
$servicePerformance = $servicePerformanceStmt->fetchAll(PDO::FETCH_ASSOC);

// Bookings Analytics
$bookingsByStatusStmt = $pdo->query("SELECT status, COUNT(*) as count FROM bookings GROUP BY status");
$bookingsByStatus = $bookingsByStatusStmt->fetchAll(PDO::FETCH_ASSOC);

$monthlyBookingsStmt = $pdo->query("SELECT DATE_FORMAT(created_at, '%Y-%m') as month, COUNT(*) as count 
    FROM bookings 
    WHERE created_at >= DATE_SUB(NOW(), INTERVAL 12 MONTH)
    GROUP BY month ORDER BY month");
$monthlyBookings = $monthlyBookingsStmt->fetchAll(PDO::FETCH_ASSOC);

// Conversion Metrics
$conversionStmt = $pdo->query("SELECT 
    COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending,
    COUNT(CASE WHEN status = 'confirmed' THEN 1 END) as confirmed,
    COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed,
    COUNT(CASE WHEN status = 'cancelled' THEN 1 END) as cancelled,
    COUNT(*) as total
    FROM bookings");
$conversion = $conversionStmt->fetch(PDO::FETCH_ASSOC);

// Payment Status
$paymentStatusStmt = $pdo->query("SELECT status, COUNT(*) as count, SUM(amount) as total FROM payments GROUP BY status");
$paymentStatus = $paymentStatusStmt->fetchAll(PDO::FETCH_ASSOC);

// Client Insights
$clientGrowthStmt = $pdo->query("SELECT DATE_FORMAT(created_at, '%Y-%m') as month, COUNT(*) as count 
    FROM clients 
    WHERE created_at >= DATE_SUB(NOW(), INTERVAL 12 MONTH)
    GROUP BY month ORDER BY month");
$clientGrowth = $clientGrowthStmt->fetchAll(PDO::FETCH_ASSOC);

$repeatClientsStmt = $pdo->query("SELECT 
    COUNT(*) as repeat_clients
    FROM (
        SELECT client_id, COUNT(*) as booking_count
        FROM bookings
        WHERE client_id IS NOT NULL
        GROUP BY client_id
        HAVING booking_count > 1
    ) as repeat_customers");
$repeatClients = $repeatClientsStmt->fetch(PDO::FETCH_ASSOC);

$avgBookingsPerClientStmt = $pdo->query("SELECT 
    COUNT(DISTINCT client_id) as total_clients,
    COUNT(*) as total_bookings,
    COALESCE(ROUND(COUNT(*) / NULLIF(COUNT(DISTINCT client_id), 0), 2), 0) as avg_bookings
    FROM bookings
    WHERE client_id IS NOT NULL");
$avgBookings = $avgBookingsPerClientStmt->fetch(PDO::FETCH_ASSOC);

// Key Metrics
$totalRevenueStmt = $pdo->query("SELECT COALESCE(SUM(amount), 0) as total FROM payments WHERE status = 'completed'");
$totalRevenue = $totalRevenueStmt->fetchColumn();

$thisMonthRevenueStmt = $pdo->query("SELECT COALESCE(SUM(amount), 0) as total 
    FROM payments 
    WHERE status = 'completed' 
    AND MONTH(payment_date) = MONTH(CURDATE()) 
    AND YEAR(payment_date) = YEAR(CURDATE())");
$thisMonthRevenue = $thisMonthRevenueStmt->fetchColumn();

$lastMonthRevenueStmt = $pdo->query("SELECT COALESCE(SUM(amount), 0) as total 
    FROM payments 
    WHERE status = 'completed' 
    AND payment_date >= DATE_SUB(CURDATE(), INTERVAL 1 MONTH)
    AND payment_date < DATE_SUB(CURDATE(), INTERVAL 0 MONTH)");
$lastMonthRevenue = $lastMonthRevenueStmt->fetchColumn();

$revenueGrowth = $lastMonthRevenue > 0 ? (($thisMonthRevenue - $lastMonthRevenue) / $lastMonthRevenue) * 100 : 0;

// Average Turnaround Time (Overall)
if ($hasUpdatedAt) {
    $overallTurnaroundStmt = $pdo->query("SELECT 
        AVG(DATEDIFF(COALESCE(updated_at, NOW()), created_at)) as avg_days
        FROM bookings
        WHERE status = 'completed'");
} else {
    $overallTurnaroundStmt = $pdo->query("SELECT 7 as avg_days FROM bookings WHERE status = 'completed' LIMIT 1");
}
$overallTurnaround = $overallTurnaroundStmt->fetchColumn();

// Outstanding Payments
$outstandingStmt = $pdo->query("SELECT COALESCE(SUM(amount), 0) as total 
    FROM payments 
    WHERE status IN ('pending', 'processing')");
$outstandingPayments = $outstandingStmt->fetchColumn();

// Top Clients by Revenue
$topClientsStmt = $pdo->query("SELECT 
    c.name,
    c.email,
    COUNT(DISTINCT b.id) as booking_count,
    COALESCE(SUM(p.amount), 0) as total_spent
    FROM clients c
    LEFT JOIN bookings b ON c.id = b.client_id
    LEFT JOIN payments p ON b.id = p.booking_id AND p.status = 'completed'
    GROUP BY c.id, c.name, c.email
    HAVING total_spent > 0
    ORDER BY total_spent DESC
    LIMIT 10");
$topClients = $topClientsStmt->fetchAll(PDO::FETCH_ASSOC);

// Set page variables for header
$pageTitle = 'Analytics | South Ring Autos Admin';
$currentPage = 'analytics.php';
$showNotifications = false;
$additionalJS = ['https://cdn.jsdelivr.net/npm/chart.js@3.9.1/dist/chart.min.js'];
include __DIR__ . '/includes/header.php';
?>

    <div class="container-fluid mt-4 admin-main-container">
        <div class="row h-100">
            <?php include __DIR__ . '/includes/sidebar.php'; ?>
            <div class="col-md-10 admin-content-area">
                <h1 class="admin-heading mb-4"><i class="fas fa-chart-bar me-2"></i>Advanced Analytics Dashboard</h1>
                
                <!-- Key Metrics Cards -->
                <div class="row mb-4">
                    <div class="col-md-3 mb-3">
                        <div class="stats-card primary">
                            <h5><i class="fas fa-money-bill-wave me-2"></i>Total Revenue</h5>
                            <h2>KES <?php echo number_format($totalRevenue, 0); ?></h2>
                            <small class="text-white opacity-75">
                                <?php if ($revenueGrowth > 0): ?>
                                    <i class="fas fa-arrow-up"></i> <?php echo number_format(abs($revenueGrowth), 1); ?>% vs last month
                                <?php elseif ($revenueGrowth < 0): ?>
                                    <i class="fas fa-arrow-down"></i> <?php echo number_format(abs($revenueGrowth), 1); ?>% vs last month
                                <?php else: ?>
                                    No change
                                <?php endif; ?>
                            </small>
                        </div>
                    </div>
                    <div class="col-md-3 mb-3">
                        <div class="stats-card success">
                            <h5><i class="fas fa-clock me-2"></i>Avg Turnaround</h5>
                            <h2><?php echo $overallTurnaround ? number_format($overallTurnaround, 1) : '0'; ?> days</h2>
                            <small class="text-white opacity-75">Average completion time</small>
                        </div>
                    </div>
                    <div class="col-md-3 mb-3">
                        <div class="stats-card warning">
                            <h5><i class="fas fa-users me-2"></i>Repeat Clients</h5>
                            <h2><?php echo $repeatClients['repeat_clients'] ?? 0; ?></h2>
                            <small class="text-white opacity-75">
                                <?php echo $avgBookings['avg_bookings'] ?? 0; ?> avg bookings/client
                            </small>
                        </div>
                    </div>
                    <div class="col-md-3 mb-3">
                        <div class="stats-card info">
                            <h5><i class="fas fa-exclamation-circle me-2"></i>Outstanding</h5>
                            <h2>KES <?php echo number_format($outstandingPayments, 0); ?></h2>
                            <small class="text-white opacity-75">Pending payments</small>
                        </div>
                    </div>
                </div>

                <!-- Revenue Analytics Row -->
                <div class="row mb-4">
                    <div class="col-md-6">
                        <div class="content-card">
                            <div class="card-header">
                                <h5 class="mb-0">Revenue Over Time</h5>
                            </div>
                            <div class="card-body">
                                <canvas id="revenueChart"></canvas>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-6">
                        <div class="content-card">
                            <div class="card-header">
                                <h5 class="mb-0"><i class="fas fa-chart-line me-2"></i>Daily Revenue (Last 30 Days)</h5>
                            </div>
                            <div class="card-body">
                                <canvas id="dailyRevenueChart"></canvas>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Payment Analytics Row -->
                <div class="row mb-4">
                    <div class="col-md-6">
                        <div class="content-card">
                            <div class="card-header">
                                <h5 class="mb-0"><i class="fas fa-credit-card me-2"></i>Payment Methods Breakdown</h5>
                            </div>
                            <div class="card-body">
                                <canvas id="paymentMethodsChart"></canvas>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-6">
                        <div class="content-card">
                            <div class="card-header">
                                <h5 class="mb-0"><i class="fas fa-info-circle me-2"></i>Payment Status Overview</h5>
                            </div>
                            <div class="card-body">
                                <canvas id="paymentChart"></canvas>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Turnaround Time Analytics -->
                <div class="row mb-4">
                    <div class="col-12">
                        <div class="content-card">
                            <div class="card-header">
                                <h5 class="mb-0"><i class="fas fa-clock me-2"></i>Average Turnaround Time by Service</h5>
                            </div>
                            <div class="card-body">
                                <canvas id="turnaroundChart"></canvas>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Service Performance Row -->
                <div class="row mb-4">
                    <div class="col-md-6">
                        <div class="content-card">
                            <div class="card-header">
                                <h5 class="mb-0"><i class="fas fa-chart-bar me-2"></i>Service Revenue Performance</h5>
                            </div>
                            <div class="card-body">
                                <canvas id="serviceRevenueChart"></canvas>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-6">
                        <div class="content-card">
                            <div class="card-header">
                                <h5 class="mb-0"><i class="fas fa-list-alt me-2"></i>Bookings by Status</h5>
                            </div>
                            <div class="card-body">
                                <canvas id="statusChart"></canvas>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Conversion Funnel -->
                <div class="row mb-4">
                    <div class="col-md-6">
                        <div class="content-card">
                            <div class="card-header">
                                <h5 class="mb-0"><i class="fas fa-filter me-2"></i>Booking Conversion Funnel</h5>
                            </div>
                            <div class="card-body">
                                <canvas id="conversionChart"></canvas>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-6">
                        <div class="content-card">
                            <div class="card-header">
                                <h5 class="mb-0"><i class="fas fa-chart-area me-2"></i>Monthly Bookings Trend</h5>
                            </div>
                            <div class="card-body">
                                <canvas id="monthlyChart"></canvas>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Client Insights -->
                <div class="row mb-4">
                    <div class="col-md-6">
                        <div class="content-card">
                            <div class="card-header">
                                <h5 class="mb-0"><i class="fas fa-users me-2"></i>Client Growth</h5>
                            </div>
                            <div class="card-body">
                                <canvas id="growthChart"></canvas>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-6">
                        <div class="content-card">
                            <div class="card-header">
                                <h5 class="mb-0"><i class="fas fa-trophy me-2"></i>Top Clients by Revenue</h5>
                            </div>
                            <div class="card-body">
                                <?php if (count($topClients) > 0): ?>
                                    <div class="table-responsive">
                                        <table class="table table-glass">
                                            <thead>
                                                <tr>
                                                    <th>Client</th>
                                                    <th>Bookings</th>
                                                    <th>Total Spent</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                <?php foreach ($topClients as $client): ?>
                                                <tr>
                                                    <td>
                                                        <div><?php echo htmlspecialchars($client['name']); ?></div>
                                                        <small class="text-muted"><?php echo htmlspecialchars($client['email']); ?></small>
                                                    </td>
                                                    <td><?php echo $client['booking_count']; ?></td>
                                                    <td><strong>KES <?php echo number_format($client['total_spent'], 0); ?></strong></td>
                                                </tr>
                                                <?php endforeach; ?>
                                            </tbody>
                                        </table>
                                    </div>
                                <?php else: ?>
                                    <div class="empty-state">
                                        <i class="fas fa-user-slash"></i>
                                        <p>No client data available</p>
                                    </div>
                                <?php endif; ?>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <script>
        // Chart.js color configuration
        const chartColors = {
            primary: '#D81324',
            secondary: '#0B2154',
            success: '#10B981',
            warning: '#FFC107',
            info: '#06B6D4',
            danger: '#EF4444',
            purple: '#7209B7',
            teal: '#06B6D4'
        };

        const chartOptions = {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: { 
                    labels: { color: '#fff' },
                    position: 'bottom'
                },
                tooltip: {
                    mode: 'index',
                    intersect: false
                }
            },
            scales: {
                y: { 
                    ticks: { color: '#fff' }, 
                    grid: { color: 'rgba(255,255,255,0.1)' },
                    beginAtZero: true
                },
                x: { 
                    ticks: { color: '#fff' }, 
                    grid: { color: 'rgba(255,255,255,0.1)' }
                }
            }
        };

        // Revenue Chart (Monthly)
        new Chart(document.getElementById('revenueChart'), {
            type: 'line',
            data: {
                labels: <?php echo json_encode(array_column($revenueData, 'month')); ?>,
                datasets: [{
                    label: 'Revenue (KES)',
                    data: <?php echo json_encode(array_column($revenueData, 'total')); ?>,
                    borderColor: '#D81324',
                    backgroundColor: 'rgba(216, 19, 36, 0.1)',
                    tension: 0.4
                }]
            },
            options: chartOptions
        });

        // Daily Revenue Chart (Last 30 Days)
        new Chart(document.getElementById('dailyRevenueChart'), {
            type: 'bar',
            data: {
                labels: <?php echo json_encode(array_column($dailyRevenue, 'day')); ?>,
                datasets: [{
                    label: 'Daily Revenue (KES)',
                    data: <?php echo json_encode(array_column($dailyRevenue, 'total')); ?>,
                    backgroundColor: 'rgba(216, 19, 36, 0.8)',
                    borderColor: chartColors.primary,
                    borderWidth: 1
                }]
            },
            options: {
                ...chartOptions,
                scales: {
                    ...chartOptions.scales,
                    x: { 
                        ...chartOptions.scales.x,
                        ticks: { 
                            ...chartOptions.scales.x.ticks,
                            maxRotation: 45,
                            minRotation: 45,
                            maxTicksLimit: 15
                        }
                    }
                }
            }
        });

        // Payment Methods Chart
        new Chart(document.getElementById('paymentMethodsChart'), {
            type: 'doughnut',
            data: {
                labels: <?php echo json_encode(array_column($paymentMethods, 'payment_method')); ?>,
                datasets: [{
                    label: 'Revenue by Method',
                    data: <?php echo json_encode(array_column($paymentMethods, 'total')); ?>,
                    backgroundColor: [chartColors.primary, chartColors.success, chartColors.info, chartColors.warning, chartColors.purple]
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: { labels: { color: '#fff' }, position: 'bottom' },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                let label = context.label || '';
                                if (label) {
                                    label += ': ';
                                }
                                label += 'KES ' + context.parsed.toLocaleString();
                                return label;
                            }
                        }
                    }
                }
            }
        });

        // Payment Status Chart
        new Chart(document.getElementById('paymentChart'), {
            type: 'doughnut',
            data: {
                labels: <?php echo json_encode(array_column($paymentStatus, 'status')); ?>,
                datasets: [{
                    data: <?php echo json_encode(array_column($paymentStatus, 'count')); ?>,
                    backgroundColor: [chartColors.warning, chartColors.success, chartColors.danger, chartColors.info]
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: { labels: { color: '#fff' }, position: 'bottom' }
                }
            }
        });

        // Turnaround Time by Service Chart
        new Chart(document.getElementById('turnaroundChart'), {
            type: 'bar',
            data: {
                labels: <?php echo json_encode(array_column($turnaroundData, 'service')); ?>,
                datasets: [
                    {
                        label: 'Average Days',
                        data: <?php echo json_encode(array_column($turnaroundData, 'avg_days')); ?>,
                        backgroundColor: chartColors.primary,
                        yAxisID: 'y'
                    },
                    {
                        label: 'Min Days',
                        data: <?php echo json_encode(array_column($turnaroundData, 'min_days')); ?>,
                        backgroundColor: chartColors.success,
                        yAxisID: 'y'
                    },
                    {
                        label: 'Max Days',
                        data: <?php echo json_encode(array_column($turnaroundData, 'max_days')); ?>,
                        backgroundColor: chartColors.danger,
                        yAxisID: 'y'
                    }
                ]
            },
            options: {
                ...chartOptions,
                scales: {
                    ...chartOptions.scales,
                    x: {
                        ...chartOptions.scales.x,
                        ticks: {
                            ...chartOptions.scales.x.ticks,
                            maxRotation: 45,
                            minRotation: 45
                        }
                    }
                }
            }
        });

        // Service Revenue Performance Chart
        new Chart(document.getElementById('serviceRevenueChart'), {
            type: 'bar',
            data: {
                labels: <?php echo json_encode(array_column($servicePerformance, 'service')); ?>,
                datasets: [
                    {
                        label: 'Total Revenue (KES)',
                        data: <?php echo json_encode(array_column($servicePerformance, 'total_revenue')); ?>,
                        backgroundColor: chartColors.primary,
                        yAxisID: 'y'
                    },
                    {
                        label: 'Booking Count',
                        data: <?php echo json_encode(array_column($servicePerformance, 'booking_count')); ?>,
                        backgroundColor: chartColors.info,
                        type: 'line',
                        yAxisID: 'y1'
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                interaction: {
                    mode: 'index',
                    intersect: false,
                },
                plugins: {
                    legend: { labels: { color: '#fff' } },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                let label = context.dataset.label || '';
                                if (label.includes('Revenue')) {
                                    label += ': KES ' + context.parsed.y.toLocaleString();
                                } else {
                                    label += ': ' + context.parsed.y + ' bookings';
                                }
                                return label;
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        type: 'linear',
                        display: true,
                        position: 'left',
                        ticks: { color: '#fff' },
                        grid: { color: 'rgba(255,255,255,0.1)' },
                        beginAtZero: true
                    },
                    y1: {
                        type: 'linear',
                        display: true,
                        position: 'right',
                        ticks: { color: '#fff' },
                        grid: { drawOnChartArea: false },
                        beginAtZero: true
                    },
                    x: {
                        ticks: { 
                            color: '#fff',
                            maxRotation: 45,
                            minRotation: 45
                        },
                        grid: { color: 'rgba(255,255,255,0.1)' }
                    }
                }
            }
        });

        // Bookings by Status Chart
        new Chart(document.getElementById('statusChart'), {
            type: 'pie',
            data: {
                labels: <?php echo json_encode(array_column($bookingsByStatus, 'status')); ?>,
                datasets: [{
                    data: <?php echo json_encode(array_column($bookingsByStatus, 'count')); ?>,
                    backgroundColor: [chartColors.warning, chartColors.info, chartColors.success, chartColors.danger, '#6c757d']
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: { labels: { color: '#fff' }, position: 'bottom' }
                }
            }
        });

        // Conversion Funnel Chart
        new Chart(document.getElementById('conversionChart'), {
            type: 'bar',
            data: {
                labels: ['Pending', 'Confirmed', 'Completed', 'Cancelled'],
                datasets: [{
                    label: 'Bookings',
                    data: [
                        <?php echo $conversion['pending']; ?>,
                        <?php echo $conversion['confirmed']; ?>,
                        <?php echo $conversion['completed']; ?>,
                        <?php echo $conversion['cancelled']; ?>
                    ],
                    backgroundColor: [chartColors.warning, chartColors.info, chartColors.success, chartColors.danger],
                    borderColor: [chartColors.warning, chartColors.info, chartColors.success, chartColors.danger],
                    borderWidth: 2
                }]
            },
            options: chartOptions
        });

        // Monthly Bookings Trend
        new Chart(document.getElementById('monthlyChart'), {
            type: 'line',
            data: {
                labels: <?php echo json_encode(array_column($monthlyBookings, 'month')); ?>,
                datasets: [{
                    label: 'Bookings',
                    data: <?php echo json_encode(array_column($monthlyBookings, 'count')); ?>,
                    borderColor: chartColors.info,
                    backgroundColor: 'rgba(6, 182, 212, 0.3)',
                    tension: 0.4,
                    fill: true
                }]
            },
            options: chartOptions
        });

        // Client Growth Chart
        new Chart(document.getElementById('growthChart'), {
            type: 'line',
            data: {
                labels: <?php echo json_encode(array_column($clientGrowth, 'month')); ?>,
                datasets: [{
                    label: 'New Clients',
                    data: <?php echo json_encode(array_column($clientGrowth, 'count')); ?>,
                    borderColor: chartColors.success,
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    tension: 0.4,
                    fill: true
                }]
            },
            options: chartOptions
        });
    </script>
</body>
</html>


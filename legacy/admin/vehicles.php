<?php
/**
 * Admin Vehicles Management
 * View and manage all client vehicles
 */
require_once __DIR__ . '/includes/auth-check.php';

use SouthRingAutos\Database\Database;

$db = Database::getInstance();
$pdo = $db->getConnection();

// Get statistics
$totalVehiclesStmt = $pdo->query("SELECT COUNT(*) FROM vehicles");
$totalVehicles = $totalVehiclesStmt->fetchColumn();

$vehiclesWithBookingsStmt = $pdo->query("
    SELECT COUNT(DISTINCT v.id) 
    FROM vehicles v
    INNER JOIN bookings b ON v.id = b.vehicle_id
");
$vehiclesWithBookings = $vehiclesWithBookingsStmt->fetchColumn();

$totalClientsStmt = $pdo->query("SELECT COUNT(DISTINCT client_id) FROM vehicles");
$totalClients = $totalClientsStmt->fetchColumn();

// Set page variables for header
$pageTitle = 'Vehicles | South Ring Autos Admin';
$currentPage = 'vehicles.php';
$showNotifications = false;
include __DIR__ . '/includes/header.php';
?>

    <div class="container-fluid mt-4 admin-main-container">
        <div class="row h-100">
            <?php include __DIR__ . '/includes/sidebar.php'; ?>
            <div class="col-md-10 admin-content-area">
                <div class="d-flex justify-content-between align-items-center mb-4">
                    <h1 class="admin-heading"><i class="fas fa-car me-2"></i>Client Vehicles</h1>
                </div>

                <!-- Statistics -->
                <div class="row mb-4">
                    <div class="col-md-4 mb-3">
                        <div class="content-card">
                            <div class="card-body text-center">
                                <div class="h2 text-primary"><?php echo $totalVehicles; ?></div>
                                <div class="text-muted">Total Vehicles</div>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-4 mb-3">
                        <div class="content-card">
                            <div class="card-body text-center">
                                <div class="h2 text-success"><?php echo $vehiclesWithBookings; ?></div>
                                <div class="text-muted">Vehicles with Bookings</div>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-4 mb-3">
                        <div class="content-card">
                            <div class="card-body text-center">
                                <div class="h2 text-info"><?php echo $totalClients; ?></div>
                                <div class="text-muted">Clients with Vehicles</div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Vehicles List -->
                <div class="content-card">
                    <div class="card-body">
                        <div class="mb-3">
                            <input type="text" class="form-control form-control-glass" id="searchInput" placeholder="Search by registration, make, model, or client name...">
                        </div>
                        <div id="vehicles-list">
                            <div class="text-center py-5">
                                <div class="spinner-border text-primary" role="status"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.0.0/dist/js/bootstrap.bundle.min.js"></script>
    <script>
        let allVehicles = [];

        // Load vehicles
        function loadVehicles() {
            fetch('../api/admin-vehicles.php?action=list')
                .then(r => r.json())
                .then(data => {
                    if (data.success) {
                        allVehicles = data.vehicles;
                        renderVehicles(data.vehicles);
                    } else {
                        document.getElementById('vehicles-list').innerHTML = 
                            '<div class="alert alert-warning">No vehicles found.</div>';
                    }
                })
                .catch(err => {
                    console.error('Error:', err);
                    document.getElementById('vehicles-list').innerHTML = 
                        '<div class="alert alert-danger">Error loading vehicles.</div>';
                });
        }

        // Render vehicles
        function renderVehicles(vehicles) {
            if (vehicles.length === 0) {
                document.getElementById('vehicles-list').innerHTML = 
                    '<div class="text-center py-5"><p class="text-muted">No vehicles found.</p></div>';
                return;
            }

            const html = vehicles.map(v => `
                <div class="booking-item mb-3">
                    <div class="row align-items-center">
                        <div class="col-md-8">
                            <h5 class="mb-1">${escapeHtml(v.make)} ${escapeHtml(v.model || '')}</h5>
                            <div class="mb-2">
                                <small class="text-muted">
                                    <i class="fas fa-car me-1"></i>${escapeHtml(v.registration)}
                                    ${v.year ? ' • ' + v.year : ''}
                                    ${v.color ? ' • ' + escapeHtml(v.color) : ''}
                                </small>
                            </div>
                            <div class="mb-2">
                                <small class="text-muted">
                                    <i class="fas fa-user me-1"></i>${escapeHtml(v.client_name || 'Unknown Client')}
                                </small>
                                ${v.client_email ? `<br><small class="text-muted"><i class="fas fa-envelope me-1"></i>${escapeHtml(v.client_email)}</small>` : ''}
                            </div>
                            ${v.fuel_type ? `<div><small class="text-muted">Fuel: ${escapeHtml(v.fuel_type)}</small></div>` : ''}
                            ${v.mileage ? `<div><small class="text-muted">Mileage: ${parseInt(v.mileage).toLocaleString()} km</small></div>` : ''}
                        </div>
                        <div class="col-md-4 text-end">
                            <div class="mb-2">
                                <span class="badge bg-info">${v.booking_count || 0} Bookings</span>
                            </div>
                            <div class="mb-2">
                                <strong class="text-success">KES ${parseFloat(v.total_spent || 0).toLocaleString()}</strong>
                                <br><small class="text-muted">Total Spent</small>
                            </div>
                            <div>
                                <a href="bookings.php?vehicle_id=${v.id}" class="btn btn-pill btn-primary btn-sm">
                                    <i class="fas fa-eye me-1"></i>View Bookings
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            `).join('');

            document.getElementById('vehicles-list').innerHTML = html;
        }

        // Search functionality
        document.getElementById('searchInput')?.addEventListener('input', function(e) {
            const searchTerm = e.target.value.toLowerCase();
            const filtered = allVehicles.filter(v => 
                v.registration.toLowerCase().includes(searchTerm) ||
                (v.make || '').toLowerCase().includes(searchTerm) ||
                (v.model || '').toLowerCase().includes(searchTerm) ||
                (v.client_name || '').toLowerCase().includes(searchTerm) ||
                (v.client_email || '').toLowerCase().includes(searchTerm)
            );
            renderVehicles(filtered);
        });

        function escapeHtml(text) {
            if (!text) return '';
            const map = {'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;'};
            return text.toString().replace(/[&<>"']/g, m => map[m]);
        }

        loadVehicles();
    </script>
</body>
</html>


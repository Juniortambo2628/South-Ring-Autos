<?php
/**
 * Vehicle Details & History Page
 */

require_once __DIR__ . '/includes/auth-check.php';

use SouthRingAutos\Database\Database;
use SouthRingAutos\Utils\SessionManager;

$db = Database::getInstance();
$pdo = $db->getConnection();

$clientId = SessionManager::getClientId();
$vehicleId = $_GET['id'] ?? null;

if (!$vehicleId) {
    header('Location: vehicles.php');
    exit;
}

// Get vehicle info
$stmt = $pdo->prepare("SELECT * FROM vehicles WHERE id = ? AND client_id = ?");
$stmt->execute([$vehicleId, $clientId]);
$vehicle = $stmt->fetch(PDO::FETCH_ASSOC);

if (!$vehicle) {
    header('Location: vehicles.php');
    exit;
}

// Get client info
$stmt = $pdo->prepare("SELECT * FROM clients WHERE id = ?");
$stmt->execute([$clientId]);
$client = $stmt->fetch(PDO::FETCH_ASSOC);

$activeLink = 'vehicles';
$pageTitle = 'Vehicle Details | South Ring Autos';
$extraStylesheets = ['../css/client-vehicle-details.css'];
include __DIR__ . '/includes/layout-start.php';
?>
                <div class="d-flex justify-content-between align-items-center mb-4">
                    <div>
                        <h1 class="dashboard-heading"><i class="fas fa-car me-2"></i>Vehicle Details</h1>
                        <p class="text-muted mb-0">Service history and payment records</p>
                    </div>
                    <div>
                        <a href="vehicles.php" class="btn btn-outline-secondary me-2">
                            <i class="fas fa-arrow-left me-2"></i>Back to Vehicles
                        </a>
                        <a href="../booking.php?vehicle_id=<?php echo $vehicleId; ?>" class="btn btn-primary">
                            <i class="fas fa-calendar-plus me-2"></i>Book Service
                        </a>
                    </div>
                </div>

                <!-- Vehicle Information Card -->
                <div class="card mb-4">
                    <div class="vehicle-header p-4">
                        <div class="row align-items-center">
                            <div class="col-md-8">
                                <h3 class="mb-1"><?php echo htmlspecialchars($vehicle['make'] . ' ' . $vehicle['model']); ?></h3>
                                <p class="mb-0 opacity-75">
                                    <?php echo htmlspecialchars($vehicle['registration']); ?>
                                    <?php if ($vehicle['year']): ?>• <?php echo $vehicle['year']; ?><?php endif; ?>
                                </p>
                            </div>
                            <div class="col-md-4 text-end">
                                <i class="fas fa-car fa-4x opacity-50"></i>
                            </div>
                        </div>
                    </div>
                    <div class="text-center p-4 bg-light">
                        <?php 
                        // Use custom thumbnail if available, otherwise will be replaced with brand logo via JavaScript
                        $defaultThumbnail = $vehicle['thumbnail'] ? '../' . $vehicle['thumbnail'] : '../South-ring-logos/SR-Logo-red-White-BG.png';
                        ?>
                        <img id="vehicleLogo" 
                             src="<?php echo htmlspecialchars($defaultThumbnail); ?>" 
                             alt="<?php echo htmlspecialchars($vehicle['make'] . ' ' . $vehicle['model']); ?>" 
                             class="img-fluid rounded"
                             data-fallback-src="../South-ring-logos/SR-Logo-red-White-BG.png">
                    </div>
                    <div class="card-body">
                        <div class="row">
                            <div class="col-md-3 mb-3">
                                <small class="text-muted d-block">Color</small>
                                <div class="fw-bold"><?php echo htmlspecialchars($vehicle['color'] ?: 'N/A'); ?></div>
                            </div>
                            <?php if ($vehicle['fuel_type']): ?>
                            <div class="col-md-3 mb-3">
                                <small class="text-muted d-block">Fuel Type</small>
                                <div class="fw-bold"><?php echo htmlspecialchars($vehicle['fuel_type']); ?></div>
                            </div>
                            <?php endif; ?>
                            <?php if ($vehicle['engine_size']): ?>
                            <div class="col-md-3 mb-3">
                                <small class="text-muted d-block">Engine Size</small>
                                <div class="fw-bold"><?php echo htmlspecialchars($vehicle['engine_size']); ?></div>
                            </div>
                            <?php endif; ?>
                            <?php if ($vehicle['mileage']): ?>
                            <div class="col-md-3 mb-3">
                                <small class="text-muted d-block">Current Mileage</small>
                                <div class="fw-bold"><?php echo number_format($vehicle['mileage']); ?> km</div>
                            </div>
                            <?php endif; ?>
                            <?php if ($vehicle['vin']): ?>
                            <div class="col-md-6 mb-3">
                                <small class="text-muted d-block">VIN</small>
                                <div class="fw-bold"><code><?php echo htmlspecialchars($vehicle['vin']); ?></code></div>
                            </div>
                            <?php endif; ?>
                            <?php if ($vehicle['notes']): ?>
                            <div class="col-12 mb-3">
                                <small class="text-muted d-block">Notes</small>
                                <div><?php echo nl2br(htmlspecialchars($vehicle['notes'])); ?></div>
                            </div>
                            <?php endif; ?>
                        </div>
                    </div>
                </div>

                <!-- Statistics -->
                <div class="row mb-4" id="statistics-container">
                    <div class="col-12 text-center py-3">
                        <div class="spinner-border text-primary" role="status"></div>
                    </div>
                </div>

                <!-- Service History -->
                <div class="card mb-4">
                    <div class="card-header bg-primary text-white">
                        <h5 class="mb-0"><i class="fas fa-history me-2"></i>Service & Repair History</h5>
                    </div>
                    <div class="card-body" id="history-container">
                        <div class="text-center py-3">
                            <div class="spinner-border text-primary" role="status"></div>
                        </div>
                    </div>
                </div>

                <!-- Payment History -->
                <div class="card mb-4">
                    <div class="card-header bg-success text-white">
                        <h5 class="mb-0"><i class="fas fa-money-bill-wave me-2"></i>Payment History</h5>
                    </div>
                    <div class="card-body" id="payments-container">
                        <div class="text-center py-3">
                            <div class="spinner-border text-primary" role="status"></div>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    </div>

    <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/js/bootstrap.bundle.min.js"></script>
    <script src="../js/car-logos-helper.js"></script>
    <script>
        // Pass vehicle data to JavaScript
        window.vehicleId = <?php echo $vehicleId; ?>;
        window.vehicleMake = <?php echo json_encode($vehicle['make']); ?>;
        window.hasCustomThumbnail = <?php echo $vehicle['thumbnail'] ? 'true' : 'false'; ?>;
    </script>
    <script src="../js/dist/client-vehicle-details.bundle.js"></script>
<?php include __DIR__ . '/includes/layout-end.php'; ?>


<?php
/**
 * Booking Success Page
 * Displays booking confirmation details and tracking information
 */

require_once __DIR__ . '/bootstrap.php';
use SouthRingAutos\Database\Database;

session_start();

// Set page variables
$page_title = 'Booking Confirmed | South Ring Autos';
$page_description = 'Your service booking has been confirmed. View your booking details and tracking information.';

// Include header
include 'includes/header.php';

// Get booking details from session or URL parameters
$bookingId = $_GET['id'] ?? $_SESSION['last_booking_id'] ?? null;
$bookingRef = $_GET['ref'] ?? $_SESSION['last_booking_ref'] ?? null;

// If no booking info, redirect to booking page
if (!$bookingId && !$bookingRef) {
    header('Location: booking.php');
    exit;
}

// Fetch booking details from database if we have an ID
$booking = null;
if ($bookingId) {
    $db = Database::getInstance();
    $pdo = $db->getConnection();
    
    $stmt = $pdo->prepare("
        SELECT b.*, c.name as client_name, c.email as client_email, c.phone as client_phone,
               v.make as vehicle_make, v.model as vehicle_model, v.registration as vehicle_registration
        FROM bookings b
        LEFT JOIN clients c ON b.client_id = c.id
        LEFT JOIN vehicles v ON b.vehicle_id = v.id
        WHERE b.id = ?
        ORDER BY b.created_at DESC
        LIMIT 1
    ");
    $stmt->execute([$bookingId]);
    $booking = $stmt->fetch(PDO::FETCH_ASSOC);
}

// Clear session booking data
unset($_SESSION['last_booking_id']);
unset($_SESSION['last_booking_ref']);
?>

    <!-- Page Header Start -->
    <div class="container-fluid page-header mb-5 p-0" style="background-image: url(img/Garage-Images/Car-GX-1.jpg);">
        <div class="container-fluid page-header-inner py-5">
            <div class="container text-center">
                <h1 class="display-3 text-white mb-3 animated slideInDown">Booking Confirmed!</h1>
                <nav aria-label="breadcrumb">
                    <ol class="breadcrumb justify-content-center text-uppercase">
                        <li class="breadcrumb-item"><a href="index.php">Home</a></li>
                        <li class="breadcrumb-item"><a href="booking.php">Booking</a></li>
                        <li class="breadcrumb-item text-white active" aria-current="page">Confirmation</li>
                    </ol>
                </nav>
            </div>
        </div>
    </div>
    <!-- Page Header End -->

    <!-- Booking Confirmation Start -->
    <div class="container-xxl py-5">
        <div class="container">
            <div class="row justify-content-center">
                <div class="col-lg-8">
                    <!-- Success Message -->
                    <div class="alert alert-success text-center mb-5 wow fadeInUp" data-wow-delay="0.1s">
                        <i class="fa fa-check-circle fa-3x text-success mb-3"></i>
                        <h3 class="mb-3">Your Service Booking Has Been Confirmed!</h3>
                        <p class="mb-0">We've received your booking request and will contact you shortly to confirm the appointment details.</p>
                    </div>

                    <?php if ($booking): ?>
                    <!-- Booking Details -->
                    <div class="card mb-4 wow fadeInUp" data-wow-delay="0.2s">
                        <div class="card-header bg-primary text-white">
                            <h4 class="mb-0"><i class="fa fa-calendar-check me-2"></i>Booking Details</h4>
                        </div>
                        <div class="card-body">
                            <div class="row g-3">
                                <div class="col-md-6">
                                    <p class="mb-2"><strong>Booking Reference:</strong></p>
                                    <p class="text-primary fs-5"><?php echo htmlspecialchars($bookingRef ?? 'SRA-' . str_pad($booking['id'], 6, '0', STR_PAD_LEFT)); ?></p>
                                </div>
                                <div class="col-md-6">
                                    <p class="mb-2"><strong>Service Type:</strong></p>
                                    <p><?php echo htmlspecialchars($booking['service'] ?? 'N/A'); ?></p>
                                </div>
                                <div class="col-md-6">
                                    <p class="mb-2"><strong>Preferred Date:</strong></p>
                                    <p><?php echo !empty($booking['date']) ? date('F j, Y', strtotime($booking['date'])) : 'To be confirmed'; ?></p>
                                </div>
                                <div class="col-md-6">
                                    <p class="mb-2"><strong>Status:</strong></p>
                                    <p><span class="badge bg-warning text-dark"><?php echo ucfirst($booking['status'] ?? 'pending'); ?></span></p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Vehicle Details -->
                    <?php if ($booking['vehicle_registration']): ?>
                    <div class="card mb-4 wow fadeInUp" data-wow-delay="0.3s">
                        <div class="card-header bg-secondary text-white">
                            <h5 class="mb-0"><i class="fa fa-car me-2"></i>Vehicle Information</h5>
                        </div>
                        <div class="card-body">
                            <div class="row g-3">
                                <div class="col-md-6">
                                    <p class="mb-2"><strong>Registration:</strong></p>
                                    <p><?php echo htmlspecialchars($booking['vehicle_registration']); ?></p>
                                </div>
                                <?php if ($booking['vehicle_make']): ?>
                                <div class="col-md-6">
                                    <p class="mb-2"><strong>Make & Model:</strong></p>
                                    <p><?php echo htmlspecialchars($booking['vehicle_make'] . ' ' . ($booking['vehicle_model'] ?? '')); ?></p>
                                </div>
                                <?php endif; ?>
                            </div>
                        </div>
                    </div>
                    <?php endif; ?>

                    <!-- Contact Details -->
                    <div class="card mb-4 wow fadeInUp" data-wow-delay="0.4s">
                        <div class="card-header bg-dark text-white">
                            <h5 class="mb-0"><i class="fa fa-user me-2"></i>Contact Information</h5>
                        </div>
                        <div class="card-body">
                            <div class="row g-3">
                                <div class="col-md-6">
                                    <p class="mb-2"><strong>Name:</strong></p>
                                    <p><?php echo htmlspecialchars($booking['client_name'] ?? 'N/A'); ?></p>
                                </div>
                                <div class="col-md-6">
                                    <p class="mb-2"><strong>Phone:</strong></p>
                                    <p><?php echo htmlspecialchars($booking['client_phone'] ?? 'N/A'); ?></p>
                                </div>
                                <?php if ($booking['client_email']): ?>
                                <div class="col-12">
                                    <p class="mb-2"><strong>Email:</strong></p>
                                    <p><?php echo htmlspecialchars($booking['client_email']); ?></p>
                                </div>
                                <?php endif; ?>
                            </div>
                        </div>
                    </div>
                    <?php endif; ?>

                    <!-- Account & Dashboard Info -->
                    <div class="card mb-4 wow fadeInUp" data-wow-delay="0.45s" style="border-left: 4px solid #28a745;">
                        <div class="card-body">
                            <h5 class="card-title"><i class="fa fa-user-circle text-success me-2"></i>Your Account & Dashboard</h5>
                            <div class="alert alert-info mb-3">
                                <i class="fa fa-info-circle me-2"></i>
                                <strong>Important:</strong> Check your email for your booking confirmation and account details.
                            </div>
                            <ul class="list-unstyled mb-0">
                                <li class="mb-2"><i class="fa fa-check text-success me-2"></i><strong>Track Your Booking:</strong> Use your client dashboard to monitor booking status in real-time</li>
                                <li class="mb-2"><i class="fa fa-check text-success me-2"></i><strong>Vehicle Saved:</strong> We've added your vehicle information to your profile for faster bookings next time</li>
                                <li class="mb-2"><i class="fa fa-check text-success me-2"></i><strong>Manage Bookings:</strong> You can view and modify booking details from your dashboard</li>
                                <li class="mb-0"><i class="fa fa-check text-success me-2"></i><strong>Service History:</strong> Access your complete service history anytime</li>
                            </ul>
                            <?php if (!empty($booking['client_email'])): ?>
                            <div class="mt-3">
                                <a href="client/login.php" class="btn btn-success">
                                    <i class="fa fa-tachometer-alt me-2"></i>Go to Dashboard
                                </a>
                            </div>
                            <?php endif; ?>
                        </div>
                    </div>

                    <!-- What Happens Next -->
                    <div class="card mb-4 wow fadeInUp" data-wow-delay="0.5s">
                        <div class="card-header bg-success text-white">
                            <h5 class="mb-0"><i class="fa fa-info-circle me-2"></i>What Happens Next?</h5>
                        </div>
                        <div class="card-body">
                            <ol class="mb-0">
                                <li class="mb-2"><strong>Confirmation Call:</strong> Our team will contact you within 24 hours to confirm your booking and schedule a convenient time.</li>
                                <li class="mb-2"><strong>Preparation:</strong> We'll prepare for your vehicle's service based on the information provided.</li>
                                <li class="mb-2"><strong>Service Day:</strong> Bring your vehicle to our workshop at the scheduled time.</li>
                                <li class="mb-2"><strong>Updates:</strong> We'll keep you informed about the service progress via SMS/WhatsApp.</li>
                                <li class="mb-0"><strong>Collection:</strong> Once complete, collect your vehicle with a detailed invoice.</li>
                            </ol>
                        </div>
                    </div>

                    <!-- Contact Information -->
                    <div class="card mb-4 wow fadeInUp" data-wow-delay="0.6s">
                        <div class="card-body text-center">
                            <h5 class="mb-3">Need to Make Changes or Have Questions?</h5>
                            <p class="mb-3">Contact us directly:</p>
                            <div class="row g-3">
                                <div class="col-md-4">
                                    <i class="fa fa-phone fa-2x text-primary mb-2"></i>
                                    <p class="mb-0"><strong>Call Us</strong><br>+254 704 113 472</p>
                                </div>
                                <div class="col-md-4">
                                    <i class="fa fa-envelope fa-2x text-primary mb-2"></i>
                                    <p class="mb-0"><strong>Email Us</strong><br>southringautos@gmail.com</p>
                                </div>
                                <div class="col-md-4">
                                    <i class="fab fa-whatsapp fa-2x text-primary mb-2"></i>
                                    <p class="mb-0"><strong>WhatsApp</strong><br>+254 704 113 472</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Action Buttons -->
                    <div class="text-center wow fadeInUp" data-wow-delay="0.7s">
                        <a href="booking.php" class="btn btn-primary py-3 px-5 me-3">
                            <i class="fa fa-calendar-plus me-2"></i>Book Another Service
                        </a>
                        <a href="index.php" class="btn btn-secondary py-3 px-5">
                            <i class="fa fa-home me-2"></i>Back to Home
                        </a>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <!-- Booking Confirmation End -->

<?php
// Include footer
include 'includes/footer.php';
?>

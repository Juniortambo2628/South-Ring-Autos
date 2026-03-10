<?php 
require_once __DIR__ . '/bootstrap.php';
use SouthRingAutos\Utils\SessionManager;
SessionManager::start();
$isLoggedIn = SessionManager::isClientLoggedIn();
$clientId = $isLoggedIn ? SessionManager::getClientId() : null;
$vehicleIdParam = $_GET['vehicle_id'] ?? null;
include 'includes/header.php'; 
?>



    <!-- Page Header Start -->
    <div class="container-fluid page-header mb-5 p-0" style="background-image: url(img/Garage-Images/Car-GX-1.jpg);">
        <div class="container-fluid page-header-inner py-5">
            <div class="container text-center">
                <h1 class="display-3 text-white mb-3 animated slideInDown">Book a Service</h1>
                <nav aria-label="breadcrumb">
                    <ol class="breadcrumb justify-content-center text-uppercase">
                        <li class="breadcrumb-item"><a href="index.php">Home</a></li>
                        <li class="breadcrumb-item text-white active" aria-current="page">Booking</li>
                    </ol>
                </nav>
            </div>
        </div>
    </div>
    <!-- Page Header End -->


    <script>
        // Pass login status to JavaScript
        document.body.dataset.loggedIn = '<?php echo $isLoggedIn ? 'true' : 'false'; ?>';
    </script>
    <!-- Booking Start -->
    <div class="container-fluid bg-secondary booking my-5 wow fadeInUp" data-wow-delay="0.1s">
        <div class="container">
            <div class="row gx-5">
                <div class="col-lg-6 py-5">
                    <div class="py-5">
                        <h1 class="text-white mb-4">How It Works</h1>
                        <p class="text-white mb-3"><strong>Step 1: Book</strong> — Call or message with your registration number and issue. (+254 704 113 472 / southringautos@gmail.com)</p>
                        <p class="text-white mb-3"><strong>Step 2: Drop Off / Inspect</strong> — We perform a free initial inspection and give a clear estimate.</p>
                        <p class="text-white mb-3"><strong>Step 3: Repair / Approval</strong> — You approve the work — we get to work (we'll keep you updated by SMS/WhatsApp).</p>
                        <p class="text-white mb-0"><strong>Step 4: Collect</strong> — Collect your vehicle and receive an itemised invoice.</p>
                    </div>
                </div>
                <div class="col-lg-6">
                    <div class="bg-primary h-100 d-flex flex-column justify-content-center text-center p-5 wow zoomIn" data-wow-delay="0.6s">
                        <h1 class="text-white mb-4">Book For A Service</h1>
                        <?php if ($isLoggedIn): ?>
                        <div class="alert alert-info text-start mb-3" role="alert">
                            <i class="fa fa-info-circle me-2"></i>
                            <strong>Logged in:</strong> You can select a vehicle from your saved vehicles or add new details.
                        </div>
                        <?php endif; ?>
                        <form id="bookingForm">
                            <input type="hidden" id="vehicle_id" name="vehicle_id" value="<?php echo htmlspecialchars($vehicleIdParam ?? ''); ?>">
                                <?php if ($isLoggedIn): ?>
                                <!-- Vehicle Selection for Logged-in Users -->
                                <div class="col-12 mb-3">
                                    <div class="form-check form-check-inline">
                                        <input class="form-check-input" type="radio" name="vehicleOption" id="vehicleOptionSelect" value="select" <?php echo $vehicleIdParam ? 'checked' : ''; ?>>
                                        <label class="form-check-label text-white" for="vehicleOptionSelect">
                                            Select from My Vehicles
                                        </label>
                                    </div>
                                    <div class="form-check form-check-inline">
                                        <input class="form-check-input" type="radio" name="vehicleOption" id="vehicleOptionNew" value="new" <?php echo !$vehicleIdParam ? 'checked' : ''; ?>>
                                        <label class="form-check-label text-white" for="vehicleOptionNew">
                                            Add New Vehicle Details
                                        </label>
                                    </div>
                                </div>
                                <div class="col-12 mb-3" id="vehicleSelectContainer" style="display: <?php echo $vehicleIdParam ? 'block' : 'none'; ?>;">
                                    <select class="form-select border-0" id="selectedVehicle" name="selected_vehicle" style="height: 55px;">
                                        <option value="">Loading vehicles...</option>
                                    </select>
                                </div>
                                <div id="vehicleDetailsContainer" style="display: <?php echo $vehicleIdParam ? 'none' : 'block'; ?>;">
                                <?php else: ?>
                                <div id="vehicleDetailsContainer">
                                <?php endif; ?>
                                
                                <div class="row g-3">
                                    <?php if (!$isLoggedIn): ?>
                                    <div class="col-12">
                                        <input type="email" class="form-control border-0" id="emailInput" name="email" placeholder="Your Email" style="height: 55px;">
                                        <div id="emailFeedback" class="mt-2" style="display: none;"></div>
                                    </div>
                                    <div class="col-12 col-sm-6">
                                        <input type="text" class="form-control border-0" name="name" placeholder="Your Name" required style="height: 55px;">
                                    </div>
                                    <div class="col-12 col-sm-6">
                                        <input type="tel" class="form-control border-0" name="phone" placeholder="Your Phone" required style="height: 55px;">
                                    </div>
                                    <?php endif; ?>
                                    <div class="col-12">
                                        <input type="text" class="form-control border-0" id="registration" name="registration" placeholder="Vehicle Registration Number" required style="height: 55px;">
                                    </div>
                                    
                                    <!-- Vehicle Details - Now available for everyone -->
                                    <div class="col-12 col-sm-6">
                                        <div class="input-group">
                                            <input type="text" class="form-control border-0" id="vehicleMake" name="vehicle_make" placeholder="Vehicle Make (e.g., Toyota)" style="height: 55px;">
                                            <button class="btn btn-light" type="button" onclick="showMakeGrid()">
                                                <i class="fa fa-th"></i>
                                            </button>
                                        </div>
                                    </div>
                                    <div class="col-12 col-sm-6">
                                        <input type="text" class="form-control border-0" id="vehicleModel" name="vehicle_model" placeholder="Vehicle Model (e.g., Corolla)" style="height: 55px;">
                                    </div>
                                    <div class="col-12 col-sm-6">
                                        <input type="number" class="form-control border-0" id="vehicleYear" name="vehicle_year" placeholder="Year" min="1900" max="<?php echo date('Y') + 1; ?>" style="height: 55px;">
                                    </div>
                                    <div class="col-12 col-sm-6">
                                        <input type="text" class="form-control border-0" id="vehicleColor" name="vehicle_color" placeholder="Color" style="height: 55px;">
                                    </div>
                                </div>
                                </div>
                            <!-- Service and Date - Always visible -->
                            <div class="row g-3 mt-0">
                                <div class="col-12 col-sm-6">
                                    <select class="form-select border-0" id="serviceSelect" name="service" required style="height: 55px;">
                                        <option value="">Select A Service</option>
                                        <option value="General Service">General Service</option>
                                        <option value="Engine Overhaul">Engine Overhaul</option>
                                        <option value="Transmission Repair">Transmission Repair</option>
                                        <option value="Accident Repair">Accident Repair / Panel Beating</option>
                                        <option value="Diagnostics">Fault Diagnosis</option>
                                        <option value="Suspension">Suspension Work</option>
                                        <option value="Brakes">Brake Systems Repair</option>
                                        <option value="Injector Cleaning">Injector Testing & Cleaning</option>
                                        <option value="Coolant">Coolant System Repair</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>
                                <div class="col-12 col-sm-6">
                                    <div class="date" id="date1" data-target-input="nearest" style="position: relative;">
                                        <input type="text"
                                            class="form-control border-0 datetimepicker-input"
                                            name="date" placeholder="Preferred Date" data-target="#date1" data-toggle="datetimepicker" style="height: 55px;">
                                    </div>
                                </div>
                                <div class="col-12">
                                    <textarea class="form-control border-0" name="message" placeholder="Describe the issue or special request"></textarea>
                                </div>
                            </div>
                            <div class="col-12">

                                <button class="btn btn-secondary w-100 py-3" type="submit">Book Now</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <!-- Booking End -->


    <!-- Call To Action Start -->
    <div class="container-xxl py-5 wow fadeInUp" data-wow-delay="0.1s">
        <div class="container">
            <div class="row g-4">
                <div class="col-lg-8 col-md-6">
                    <h6 class="text-primary text-uppercase">// FAQ //</h6>
                    <h1 class="mb-4">Frequently Asked Questions</h1>
                    <div class="mb-3">
                        <h6 class="mb-2"><strong>Q: Do you provide a warranty on repairs?</strong></h6>
                        <p class="mb-3">A: Yes — we back our workmanship. Warranty terms depend on the job and parts used; we'll confirm specifics before starting.</p>
                    </div>
                    <div class="mb-3">
                        <h6 class="mb-2"><strong>Q: Can you collect and return my car?</strong></h6>
                        <p class="mb-3">A: We can discuss collection for larger jobs in Nairobi; contact us to arrange.</p>
                    </div>
                    <div class="mb-3">
                        <h6 class="mb-2"><strong>Q: How long will my repair take?</strong></h6>
                        <p class="mb-3">A: We'll give an estimate after inspection — we aim for speed without cutting corners.</p>
                    </div>
                    <div class="mb-0">
                        <h6 class="mb-2"><strong>Q: Do you use genuine parts?</strong></h6>
                        <p class="mb-0">A: We recommend quality parts and will always discuss options (genuine vs OEM vs aftermarket) so you make an informed choice.</p>
                    </div>
                </div>
                <div class="col-lg-4 col-md-6">
                    <div class="bg-primary d-flex flex-column justify-content-center text-center h-100 p-4">
                        <h3 class="text-white mb-4"><i class="fa fa-phone-alt me-3"></i>+254 704 113 472</h3>
                        <p class="text-white mb-3">Call us for immediate assistance or to book a free vehicle inspection.</p>
                        <a href="contact.php" class="btn btn-secondary py-3 px-5">Contact Us<i class="fa fa-arrow-right ms-3"></i></a>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <!-- Call To Action End -->

    <!-- Quick Login Modal -->
    <div class="modal fade" id="quickLoginModal" tabindex="-1" style="z-index: 10001;">
        <div class="modal-dialog modal-dialog-centered">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title text-dark">Welcome Back!</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                </div>
                <div class="modal-body">
                    <p class="text-muted mb-3">Log in to access your saved vehicles and booking history.</p>
                    <form id="quickLoginForm">
                        <div class="mb-3">
                            <label for="loginEmail" class="form-label">Email</label>
                            <input type="email" class="form-control" id="loginEmail" readonly>
                            <small class="text-muted">
                                <a href="#" id="changeEmailLink" class="text-decoration-none">Not you? Change email</a>
                            </small>
                        </div>
                        <div class="mb-3">
                            <label for="loginPassword" class="form-label">Password</label>
                            <input type="password" class="form-control" id="loginPassword" placeholder="Enter your password" required>
                            <small class="text-muted">
                                <a href="client/forgot-password.php" target="_blank" class="text-decoration-none">Forgot password?</a>
                            </small>
                        </div>
                        <div id="loginError" class="alert alert-danger d-none"></div>
                        <div class="d-grid gap-2">
                            <button type="submit" class="btn btn-primary" id="quickLoginBtn">
                                <i class="fas fa-sign-in-alt me-2"></i>Log In
                            </button>
                            <button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">
                                Continue as Guest
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    </div>

    <!-- Make Selection Grid Modal -->
    <div class="modal fade" id="makeGridModal" tabindex="-1" style="z-index: 10000;">
        <div class="modal-dialog modal-xl">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title text-dark">Select Vehicle Make</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                </div>
                <div class="modal-body">
                    <div class="mb-3">
                        <input type="text" class="form-control" id="makeSearch" placeholder="Search for a car brand..." onkeyup="filterMakes()">
                    </div>
                    <div id="makes-grid" class="row g-3" style="max-height: 500px; overflow-y: auto;">
                        <div class="col-12 text-center py-5">
                            <div class="spinner-border text-primary" role="status">
                                <span class="visually-hidden">Loading...</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

<?php include 'includes/footer.php'; ?>
<script src="js/notification-ui.js"></script>
<script src="js/car-logos-helper.js"></script>
<script src="js/booking-enhancements.js"></script>
<script src="js/booking-form-submit.js"></script>
<script src="js/dist/booking.bundle.js"></script>

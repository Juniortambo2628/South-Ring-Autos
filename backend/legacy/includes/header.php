<?php
/**
 * Header Include
 * Reusable header for all pages
 */
// Start session if not already started
require_once __DIR__ . '/../bootstrap.php';
use SouthRingAutos\Utils\SessionManager;
SessionManager::start();
// Check if user is logged in
$isLoggedIn = SessionManager::isClientLoggedIn();
$clientName = $isLoggedIn ? SessionManager::getClientName() : null;
// Check if we're on booking.php
$isBookingPage = basename($_SERVER['PHP_SELF']) == 'booking.php';
// Hide login/register buttons if on booking page and logged in
$hideAuthButtons = $isBookingPage && $isLoggedIn;
?>
<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="utf-8">
    <title><?php echo isset($page_title) ? $page_title : 'South Ring Autos | Auto Repair & Maintenance — Bogani East, Nairobi'; ?></title>
    <meta content="width=device-width, initial-scale=1.0" name="viewport">
    <meta content="auto repair, car servicing, panel beating, ECU diagnostics, Nairobi, Bogani East, engine repair, transmission repair" name="keywords">
    <meta content="<?php echo isset($page_description) ? $page_description : 'Professional auto repair, servicing, panel beating and ECU diagnostics in Bogani East, Nairobi. Transparent pricing, modern equipment and friendly service. Book a service today.'; ?>" name="description">

    <!-- Favicon -->
    <link href="South-ring-logos/SR-Logo-red-White-BG.png" rel="icon" type="image/png">
    <!-- Optional: Generate favicon.ico from logo for better browser compatibility -->
    <!-- <link href="img/favicon.ico" rel="shortcut icon" type="image/x-icon"> -->

    <!-- Google Web Fonts -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Barlow:wght@600;700&family=Ubuntu:wght@400;500&display=swap" rel="stylesheet"> 

    <!-- Icon Font Stylesheet -->
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.10.0/css/all.min.css" rel="stylesheet">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.4.1/font/bootstrap-icons.css" rel="stylesheet">

    <!-- Libraries Stylesheet -->
    <link href="lib/animate/animate.min.css" rel="stylesheet">
    <link href="lib/owlcarousel/assets/owl.carousel.min.css" rel="stylesheet">
    <link href="lib/tempusdominus/css/tempusdominus-bootstrap-4.min.css" rel="stylesheet" />

    <!-- Customized Bootstrap Stylesheet -->
    <link href="css/bootstrap.min.css" rel="stylesheet">

    <!-- Template Stylesheet -->
    <link href="css/style.css" rel="stylesheet">
</head>

<body>
    <!-- Spinner Start -->
    <div id="spinner" class="show position-fixed translate-middle w-100 vh-100 top-50 start-50 d-flex align-items-center justify-content-center">
        <div class="loader-container">
            <img src="loader-icon/cube-loader.svg" alt="Loading...">
        </div>
    </div>
    <!-- Spinner End -->

    <!-- Topbar Start -->
    <div class="container-fluid bg-light p-0 topbar-custom">
        <div class="row gx-0 d-none d-lg-flex">
            <div class="col-lg-7 px-5 text-start">
                <div class="h-100 d-inline-flex align-items-center py-2 me-4">
                    <small class="fa fa-map-marker-alt text-primary me-2"></small>
                    <small>Bogani East Lane, off Bogani East Road (Adjacent to Catholic University of East Africa)</small>
                </div>
                <div class="h-100 d-inline-flex align-items-center py-2">
                    <small class="far fa-clock text-primary me-2"></small>
                    <small>Mon - Fri : 8:00 — 18:00 · Sat : 8:00 — 14:00</small>
                </div>
            </div>
            <div class="col-lg-5 px-5 text-end">
                <div class="h-100 d-inline-flex align-items-center py-2 me-4">
                    <small class="fa fa-phone-alt text-primary me-2"></small>
                    <small>+254 704 113 472</small>
                </div>
                <div class="h-100 d-inline-flex align-items-center">
                    <a class="btn btn-sm-square bg-white text-primary me-1" href="https://www.facebook.com/share/1NWqV3J8YV/" target="_blank" rel="noopener noreferrer" title="Follow us on Facebook"><i class="fab fa-facebook-f"></i></a>
                    <a class="btn btn-sm-square bg-white text-primary me-1" href="https://x.com/southringautos?t=QACbWEcU9_ebu2bBhBv_eg&s=08" target="_blank" rel="noopener noreferrer" title="Follow us on Twitter/X"><i class="fab fa-twitter"></i></a>
                    <a class="btn btn-sm-square bg-white text-primary me-0" href="https://www.instagram.com/southring_autos?igsh=MTVvOWdrazZmOTAxcw==" target="_blank" rel="noopener noreferrer" title="Follow us on Instagram"><i class="fab fa-instagram"></i></a>
                </div>
            </div>
        </div>
    </div>
    <!-- Topbar End -->

    <!-- Navbar Start -->
    <nav class="navbar navbar-expand-lg bg-white navbar-light shadow sticky-top p-0">
        <a href="index.php" class="navbar-brand d-flex align-items-center px-4 px-lg-5">
            <img src="South-ring-logos/SR-Logo-Transparent-BG.png" alt="South Ring Autos" height="45" class="me-2">
            <span class="d-none d-md-inline"><small class="text-primary fw-bold">South Ring Autos</small></span>
        </a>
        <button type="button" class="navbar-toggler me-4" data-bs-toggle="collapse" data-bs-target="#navbarCollapse">
            <span class="navbar-toggler-icon"></span>
        </button>
        <div class="collapse navbar-collapse" id="navbarCollapse">
            <div class="navbar-nav ms-auto p-4 p-lg-0">
                <a href="index.php" class="nav-item nav-link <?php echo (basename($_SERVER['PHP_SELF']) == 'index.php') ? 'active' : ''; ?>">Home</a>
                <a href="about.php" class="nav-item nav-link <?php echo (basename($_SERVER['PHP_SELF']) == 'about.php') ? 'active' : ''; ?>">About</a>
                <a href="service.php" class="nav-item nav-link <?php echo (basename($_SERVER['PHP_SELF']) == 'service.php') ? 'active' : ''; ?>">Services</a>
                <a href="blog.php" class="nav-item nav-link <?php echo (basename($_SERVER['PHP_SELF']) == 'blog.php') ? 'active' : ''; ?>">Blog</a>
                <a href="contact.php" class="nav-item nav-link <?php echo (basename($_SERVER['PHP_SELF']) == 'contact.php') ? 'active' : ''; ?>">Contact</a>
            </div>
            <div class="d-none d-lg-flex align-items-center ms-3">
                <a href="booking.php" class="btn btn-nav btn-nav-book me-2"><i class="fa fa-calendar-check me-2"></i>Book Appointment</a>
                <?php if ($isLoggedIn): ?>
                <!-- User Profile Dropdown -->
                <div class="dropdown">
                    <button class="btn btn-nav btn-nav-profile dropdown-toggle" type="button" id="userDropdown" data-bs-toggle="dropdown" aria-expanded="false">
                        <i class="fa fa-user-circle me-2"></i><?php echo htmlspecialchars($clientName ?? 'My Account'); ?>
                    </button>
                    <ul class="dropdown-menu dropdown-menu-end" aria-labelledby="userDropdown">
                        <li><h6 class="dropdown-header"><i class="fa fa-user text-primary me-2"></i><?php echo htmlspecialchars($clientName ?? 'User'); ?></h6></li>
                        <li><hr class="dropdown-divider"></li>
                        <li><a class="dropdown-item" href="client/dashboard.php"><i class="fa fa-tachometer-alt text-primary me-2"></i>Dashboard</a></li>
                        <li><a class="dropdown-item" href="client/profile.php"><i class="fa fa-user-edit text-primary me-2"></i>My Profile</a></li>
                        <li><hr class="dropdown-divider"></li>
                        <li><a class="dropdown-item" href="client/logout.php"><i class="fa fa-sign-out-alt text-danger me-2"></i>Logout</a></li>
                    </ul>
                </div>
                <?php else: ?>
                <a href="client/login.php" class="btn btn-nav btn-nav-login me-2"><i class="fa fa-sign-in-alt me-2"></i>Login</a>
                <a href="client/register.php" class="btn btn-nav btn-nav-register"><i class="fa fa-user-plus me-2"></i>Sign Up</a>
                <?php endif; ?>
            </div>
            <div class="d-lg-none px-4 pb-3">
                <a href="booking.php" class="btn btn-nav btn-nav-book btn-sm w-100 mb-2"><i class="fa fa-calendar-check me-2"></i>Book Appointment</a>
                <?php if ($isLoggedIn): ?>
                <!-- Mobile User Menu -->
                <div class="card">
                    <div class="card-header bg-primary text-white">
                        <i class="fa fa-user-circle me-2"></i><?php echo htmlspecialchars($clientName ?? 'My Account'); ?>
                    </div>
                    <div class="list-group list-group-flush">
                        <a href="client/dashboard.php" class="list-group-item list-group-item-action"><i class="fa fa-tachometer-alt text-primary me-2"></i>Dashboard</a>
                        <a href="client/profile.php" class="list-group-item list-group-item-action"><i class="fa fa-user-edit text-primary me-2"></i>My Profile</a>
                        <a href="client/logout.php" class="list-group-item list-group-item-action text-danger"><i class="fa fa-sign-out-alt me-2"></i>Logout</a>
                    </div>
                </div>
                <?php else: ?>
                <a href="client/login.php" class="btn btn-nav btn-nav-login btn-sm w-100 mb-2"><i class="fa fa-sign-in-alt me-2"></i>Login</a>
                <a href="client/register.php" class="btn btn-nav btn-nav-register btn-sm w-100"><i class="fa fa-user-plus me-2"></i>Sign Up</a>
                <?php endif; ?>
            </div>
        </div>
    </nav>
    <!-- Navbar End -->

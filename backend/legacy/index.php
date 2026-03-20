<?php
/**
 * Home Page
 * Refactored to use includes for DRY code
 */

// Set page variables
$page_title = 'South Ring Autos | Auto Repair & Maintenance — Bogani East, Nairobi';
$page_description = 'Professional auto repair, servicing, panel beating and ECU diagnostics in Bogani East, Nairobi. Transparent pricing, modern equipment and friendly service. Book a service today.';

// Include header
include 'includes/header.php';
?>

    <!-- Carousel Start -->
    <div class="container-fluid p-0 mb-5">
        <div id="header-carousel" class="carousel slide" data-bs-ride="carousel">
            <div class="carousel-inner">
                <div class="carousel-item active">
                    <img class="w-100" src="img/stock-images/Hero-Slide-BG-1.jpg" alt="Image">
                    <div class="carousel-caption d-flex align-items-center">
                        <div class="container">
                            <div class="row align-items-center justify-content-center justify-content-lg-start">
                                <div class="col-10 col-lg-7 text-center text-lg-start">
                                    <h6 class="text-white text-uppercase mb-3 animated slideInDown">// South Ring Autos //</h6>
                                    <h1 class="display-3 text-white mb-4 pb-3 animated slideInDown">Transparent. Efficient. Reliable.</h1>
                                    <p class="text-white mb-4 animated slideInDown">Your neighbourhood auto clinic in 'Karen' — where experience meets good vibes. We fix, tune and care for cars so you can get back on the road faster (and with fewer headaches).</p>
                                    <a href="booking.php" class="btn btn-primary py-3 px-5 me-3 animated slideInDown">Book a Service<i class="fa fa-arrow-right ms-3"></i></a>
                                    <a href="contact.php" class="btn btn-secondary py-3 px-5 animated slideInDown">Get a Quote<i class="fa fa-arrow-right ms-3"></i></a>
                                </div>
                                <div class="col-lg-5 d-none d-lg-flex animated zoomIn">
                                    <img class="img-fluid" src="img/Garage-Images/Car-GX-1.jpg" alt="South Ring Autos Garage">
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="carousel-item">
                    <img class="w-100" src="img/stock-images/Hero-Slide-2-BG.jpg" alt="Engine Repair">
                    <div class="carousel-caption d-flex align-items-center">
                        <div class="container">
                            <div class="row align-items-center justify-content-center justify-content-lg-start">
                                <div class="col-10 col-lg-7 text-center text-lg-start">
                                    <h6 class="text-white text-uppercase mb-3 animated slideInDown">// Professional Auto Service //</h6>
                                    <h1 class="display-3 text-white mb-4 pb-3 animated slideInDown">From General Servicing to Full Engine Overhauls</h1>
                                    <p class="text-white mb-4 animated slideInDown">We treat every vehicle with respect and care making sure that every vehicle gets the best service possible done by our experienced technicians.</p>
                                    <a href="service.php" class="btn btn-primary py-3 px-5 me-3 animated slideInDown">Our Services<i class="fa fa-arrow-right ms-3"></i></a>
                                    <a href="contact.php" class="btn btn-secondary py-3 px-5 animated slideInDown">Contact Us<i class="fa fa-arrow-right ms-3"></i></a>
                                </div>
                                <div class="col-lg-5 d-none d-lg-flex animated zoomIn">
                                    <img class="img-fluid" src="img/Garage-Images/Car-LX-1.jpg" alt="Auto Service">
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <button class="carousel-control-prev" type="button" data-bs-target="#header-carousel"
                data-bs-slide="prev">
                <span class="carousel-control-prev-icon" aria-hidden="true"></span>
                <span class="visually-hidden">Previous</span>
            </button>
            <button class="carousel-control-next" type="button" data-bs-target="#header-carousel"
                data-bs-slide="next">
                <span class="carousel-control-next-icon" aria-hidden="true"></span>
                <span class="visually-hidden">Next</span>
            </button>
        </div>
    </div>
    <!-- Carousel End -->

    <!-- Service Start -->
    <div class="container-xxl py-5">
        <div class="container">
            <div class="row g-4">
                <div class="col-lg-4 col-md-6 wow fadeInUp" data-wow-delay="0.1s">
                    <div class="d-flex py-5 px-4">
                        <i class="fa fa-shield-alt fa-3x text-primary flex-shrink-0"></i>
                        <div class="ps-4">
                            <h5 class="mb-3">Transparent Pricing</h5>
                            <p>Honest estimates and itemised invoices — no hidden charges. We believe in clear invoices with full transparency.</p>
                            <a class="text-secondary border-bottom" href="about.php">Read More</a>
                        </div>
                    </div>
                </div>
                <div class="col-lg-4 col-md-6 wow fadeInUp" data-wow-delay="0.3s">
                    <div class="d-flex bg-light py-5 px-4">
                        <i class="fa fa-users-cog fa-3x text-primary flex-shrink-0"></i>
                        <div class="ps-4">
                            <h5 class="mb-3">Expert Technicians</h5>
                            <p>Trained staff with access to specialists for complex jobs. Over 500 satisfied customers since opening.</p>
                            <a class="text-secondary border-bottom" href="service.php">Read More</a>
                        </div>
                    </div>
                </div>
                <div class="col-lg-4 col-md-6 wow fadeInUp" data-wow-delay="0.5s">
                    <div class="d-flex py-5 px-4">
                        <i class="fa fa-tools fa-3x text-primary flex-shrink-0"></i>
                        <div class="ps-4">
                            <h5 class="mb-3">Modern Diagnostics</h5>
                            <p>We use proper equipment and ECU diagnostics so problems get fixed right the first time.</p>
                            <a class="text-secondary border-bottom" href="service.php">Read More</a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <!-- Service End -->

    <!-- About Start -->
    <div class="container-xxl py-5">
        <div class="container">
            <div class="row g-5">
                <div class="col-lg-6 wow fadeInUp" data-wow-delay="0.1s">
                    <div class="row g-0">
                        <div class="col-12">
                            <img class="img-fluid" src="img/Garage-Images/Client-Engagement.jpg" alt="">
                        </div>
                    </div>
                </div>
                <div class="col-lg-6 wow fadeInUp" data-wow-delay="0.3s">
                    <h1 class="mb-4">We're South Ring Autos — Your Neighbourhood Auto Clinic</h1>
                    <p class="mb-4">South Ring Autos Ltd was incorporated on 4 February 2021 as a private limited company. We're run by two full-time directors who keep things practical, honest and upbeat — supported by a lean team of highly trained technicians and a trusted pool of specialists for the tricky jobs.</p>
                    <p class="mb-4">Since day one we've built a strong family of repeat customers (over 500 happy clients and counting). We believe in transparency, quick turnarounds and service with a smile — because in Kenya, good service and a warm greeting go a long way.</p>
                    <div class="row g-4 mb-3 pb-3">
                        <div class="col-12 wow fadeIn" data-wow-delay="0.1s">
                            <div class="d-flex">
                                <div class="bg-light d-flex flex-shrink-0 align-items-center justify-content-center mt-1" style="width: 45px; height: 45px;">
                                    <span class="fw-bold text-primary">01</span>
                                </div>
                                <div class="ps-3">
                                    <h6>Transparent Pricing</h6>
                                    <span>No hidden fees — we explain everything upfront</span>
                                </div>
                            </div>
                        </div>
                        <div class="col-12 wow fadeIn" data-wow-delay="0.3s">
                            <div class="d-flex">
                                <div class="bg-light d-flex flex-shrink-0 align-items-center justify-content-center mt-1" style="width: 45px; height: 45px;">
                                    <span class="fw-bold text-primary">02</span>
                                </div>
                                <div class="ps-3">
                                    <h6>Friendly Service</h6>
                                    <span>We explain things in simple terms — no jargon</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <a class="btn btn-primary py-3 px-5 mt-3" href="about.php">Read More<i class="fa fa-arrow-right ms-3"></i></a>
                </div>
            </div>
        </div>
    </div>
    <!-- About End -->

    <!-- Facts Start -->
    <div class="container-fluid fact bg-dark my-5 py-5">
        <div class="container">
            <div class="row g-4">
                <div class="col-md-6 col-lg-3 text-center wow fadeIn" data-wow-delay="0.1s">
                    <i class="fa fa-check fa-2x text-white mb-3"></i>
                    <h2 class="text-white mb-2" data-toggle="counter-up">500</h2>
                    <p class="text-white mb-0">Satisfied Clients</p>
                </div>
                <div class="col-md-6 col-lg-3 text-center wow fadeIn" data-wow-delay="0.3s">
                    <i class="fa fa-users fa-2x text-white mb-3"></i>
                    <h2 class="text-white mb-2" data-toggle="counter-up">15</h2>
                    <p class="text-white mb-0">Expert Technicians</p>
                </div>
                <div class="col-md-6 col-lg-3 text-center wow fadeIn" data-wow-delay="0.5s">
                    <i class="fa fa-car fa-2x text-white mb-3"></i>
                    <h2 class="text-white mb-2" data-toggle="counter-up">1000</h2>
                    <p class="text-white mb-0">Cars Repaired</p>
                </div>
                <div class="col-md-6 col-lg-3 text-center wow fadeIn" data-wow-delay="0.7s">
                    <i class="fa fa-clock fa-2x text-white mb-3"></i>
                    <h2 class="text-white mb-2" data-toggle="counter-up">3</h2>
                    <p class="text-white mb-0">Years Experience</p>
                </div>
            </div>
        </div>
    </div>
    <!-- Facts End -->

    <!-- Service Start -->
    <div class="container-xxl service py-5">
        <div class="container">
            <div class="text-center wow fadeInUp" data-wow-delay="0.1s">
                <h6 class="text-primary text-uppercase">// Our Services //</h6>
                <h1 class="mb-5">Explore Our Services</h1>
            </div>
            <div class="row g-4 wow fadeInUp" data-wow-delay="0.3s">
                <div class="col-lg-4">
                    <div class="nav w-100 nav-pills me-4">
                        <button class="nav-link w-100 d-flex align-items-center text-start p-4 mb-4 active" data-bs-toggle="pill" data-bs-target="#tab-pane-1" type="button">
                            <i class="fa fa-tools fa-2x me-3"></i>
                            <h4 class="m-0">General Service</h4>
                        </button>
                        <button class="nav-link w-100 d-flex align-items-center text-start p-4 mb-4" data-bs-toggle="pill" data-bs-target="#tab-pane-2" type="button">
                            <i class="fa fa-car fa-2x me-3"></i>
                            <h4 class="m-0">Engine & Transmission</h4>
                        </button>
                        <button class="nav-link w-100 d-flex align-items-center text-start p-4 mb-4" data-bs-toggle="pill" data-bs-target="#tab-pane-3" type="button">
                            <i class="fa fa-wrench fa-2x me-3"></i>
                            <h4 class="m-0">Accident Repair</h4>
                        </button>
                        <button class="nav-link w-100 d-flex align-items-center text-start p-4 mb-4" data-bs-toggle="pill" data-bs-target="#tab-pane-4" type="button">
                            <i class="fa fa-cog fa-2x me-3"></i>
                            <h4 class="m-0">Diagnostics</h4>
                        </button>
                        <button class="nav-link w-100 d-flex align-items-center text-start p-4 mb-0" data-bs-toggle="pill" data-bs-target="#tab-pane-5" type="button">
                            <i class="fa fa-star fa-2x me-3"></i>
                            <h4 class="m-0">Specialized Services</h4>
                        </button>
                    </div>
                </div>
                <div class="col-lg-8">
                    <div class="tab-content w-100">
                        <div class="tab-pane fade show active" id="tab-pane-1">
                            <div class="row g-4">
                                <div class="col-md-6" style="min-height: 350px;">
                                    <div class="d-flex align-items-start">
                                        <img class="img-fluid flex-shrink-0" src="img/Garage-Images/Car-GX-2.jpg" alt=""
                                            style="object-fit: cover;" alt="General Service">
                                    </div>
                                </div>
                                <div class="col-md-6">
                                    <h3 class="mb-3">General Service (MPESA-friendly quick checks)</h3>
                                    <p class="mb-4">Oil change, filters, fluids, lights, battery test, and a 30-point safety check. We'll tell you what your car needs now and what can wait. Ideal for busy Nairobi mornings.</p>
                                    <p><i class="fa fa-check text-success me-3"></i>30-Point Safety Check</p>
                                    <p><i class="fa fa-check text-success me-3"></i>Oil & Filter Change</p>
                                    <p><i class="fa fa-check text-success me-3"></i>Fluid Top-ups</p>
                                    <a href="service.php" class="btn btn-primary py-3 px-5 mt-3">View All Services<i class="fa fa-arrow-right ms-3"></i></a>
                                </div>
                            </div>
                        </div>
                        <div class="tab-pane fade" id="tab-pane-2">
                            <div class="row g-4">
                                <div class="col-md-6" style="min-height: 350px;">
                                    <div class="d-flex align-items-start">
                                        <img class="img-fluid flex-shrink-0" src="img/Garage-Images/Engine-repairs.jpg" alt=""
                                            style="object-fit: cover;" alt="Engine Repair">
                                    </div>
                                </div>
                                <div class="col-md-6">
                                    <h3 class="mb-3">Engine & Transmission Repair</h3>
                                    <p class="mb-4">From minor tune-ups to complete engine overhauls. We handle everything from timing belt replacements to transmission rebuilds.</p>
                                    <p><i class="fa fa-check text-success me-3"></i>Engine Diagnostics</p>
                                    <p><i class="fa fa-check text-success me-3"></i>Transmission Service</p>
                                    <p><i class="fa fa-check text-success me-3"></i>Timing Belt Replacement</p>
                                    <a href="service.php" class="btn btn-primary py-3 px-5 mt-3">View All Services<i class="fa fa-arrow-right ms-3"></i></a>
                                </div>
                            </div>
                        </div>
                        <div class="tab-pane fade" id="tab-pane-3">
                            <div class="row g-4">
                                <div class="col-md-6" style="min-height: 350px;">
                                    <div class="d-flex align-items-start">
                                        <img class="img-fluid flex-shrink-0" src="img/Garage-Images/Painting-2.jpg" alt=""
                                            style="object-fit: cover;" alt="Accident Repair">
                                    </div>
                                </div>
                                <div class="col-md-6">
                                    <h3 class="mb-3">Accident Repair & Panel Beating</h3>
                                    <p class="mb-4">Professional bodywork and panel beating services. We restore your vehicle to its pre-accident condition with precision and care.</p>
                                    <p><i class="fa fa-check text-success me-3"></i>Panel Beating</p>
                                    <p><i class="fa fa-check text-success me-3"></i>Paint Matching</p>
                                    <p><i class="fa fa-check text-success me-3"></i>Frame Straightening</p>
                                    <a href="service.php" class="btn btn-primary py-3 px-5 mt-3">View All Services<i class="fa fa-arrow-right ms-3"></i></a>
                                </div>
                            </div>
                        </div>
                        <div class="tab-pane fade" id="tab-pane-4">
                            <div class="row g-4">
                                <div class="col-md-6" style="min-height: 350px;">
                                    <div class="d-flex align-items-start">
                                        <img class="img-fluid flex-shrink-0" src="img/Garage-Images/Car-Assessment-2.jpg" alt=""
                                            style="object-fit: cover;" alt="Diagnostics">
                                    </div>
                                </div>
                                <div class="col-md-6">
                                    <h3 class="mb-3">ECU Diagnostics & Computer Systems</h3>
                                    <p class="mb-4">Advanced diagnostic equipment to identify and fix complex electronic issues. We use the latest OBD scanners and diagnostic tools.</p>
                                    <p><i class="fa fa-check text-success me-3"></i>ECU Diagnostics</p>
                                    <p><i class="fa fa-check text-success me-3"></i>OBD Scanning</p>
                                    <p><i class="fa fa-check text-success me-3"></i>Sensor Testing</p>
                                    <a href="service.php" class="btn btn-primary py-3 px-5 mt-3">View All Services<i class="fa fa-arrow-right ms-3"></i></a>
                                </div>
                            </div>
                        </div>
                        <div class="tab-pane fade" id="tab-pane-5">
                            <div class="row g-4">
                                <div class="col-md-6" style="min-height: 350px;">
                                    <div class="d-flex align-items-start">
                                        <img class="img-fluid flex-shrink-0" src="img/Garage-Images/Car-GX-3.jpg" alt=""
                                            style="object-fit: cover;" alt="Specialized Services">
                                    </div>
                                </div>
                                <div class="col-md-6">
                                    <h3 class="mb-3">Specialized Services</h3>
                                    <p class="mb-4">We offer specialized services that go beyond standard maintenance, ensuring your vehicle gets the specific care it needs.</p>
                                    <p><i class="fa fa-check text-success me-3"></i>Pre-purchase Inspection</p>
                                    <p><i class="fa fa-check text-success me-3"></i>Restoration & Rebuilds</p>
                                    <p><i class="fa fa-check text-success me-3"></i>Injector Testing & Cleaning</p>
                                    <p><i class="fa fa-check text-success me-3"></i>Sourcing of Major Components (Overseas)</p>
                                    <a href="service.php" class="btn btn-primary py-3 px-5 mt-3">View All Services<i class="fa fa-arrow-right ms-3"></i></a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <!-- Service End -->

    <!-- Booking End -->

    <!-- Booking CTA Start -->
    <div id="book-service" class="container-fluid bg-secondary booking my-5 wow fadeInUp" data-wow-delay="0.1s">
        <div class="container">
            <div class="row justify-content-center text-center">
                <div class="col-lg-10 py-5">
                    <h1 class="text-white mb-4">Ready to Book Your Service?</h1>
                    <p class="text-white mb-4 fs-5">Experience our professional auto service with transparent pricing and expert technicians. Book your service today and get your vehicle back on the road fast.</p>
                    <div class="row g-4 mb-4">
                        <div class="col-md-4">
                            <i class="fa fa-clock fa-3x text-white mb-3"></i>
                            <h5 class="text-white">Quick Turnaround</h5>
                            <p class="text-white mb-0">Fast, efficient service without compromising quality</p>
                        </div>
                        <div class="col-md-4">
                            <i class="fa fa-shield-alt fa-3x text-white mb-3"></i>
                            <h5 class="text-white">Transparent Pricing</h5>
                            <p class="text-white mb-0">No hidden fees, clear estimates upfront</p>
                        </div>
                        <div class="col-md-4">
                            <i class="fa fa-wrench fa-3x text-white mb-3"></i>
                            <h5 class="text-white">Expert Service</h5>
                            <p class="text-white mb-0">Trained technicians with modern equipment</p>
                        </div>
                    </div>
                    <a href="booking.php" class="btn btn-light btn-lg py-3 px-5">
                        <i class="fa fa-calendar-alt me-2"></i>Book Now
                    </a>
                </div>
            </div>
        </div>
    </div>
    <!-- Booking CTA End -->

    <!-- Testimonial Start -->
    <div class="container-xxl py-5 wow fadeInUp" data-wow-delay="0.1s">
        <div class="container">
            <div class="text-center">
                <h6 class="text-primary text-uppercase">// Testimonial //</h6>
                <h1 class="mb-5">What Our Clients Say!</h1>
            </div>
            <div class="owl-carousel testimonial-carousel position-relative">
                <div class="testimonial-item text-center">
                    <img class="bg-light rounded-circle p-2 mx-auto mb-3" src="South-ring-logos/SR-Logo-White-BG.png" style="width: 80px; height: 80px; object-fit: contain;">
                    <h5 class="mb-0">David M.</h5>
                    <p>Langata</p>
                    <div class="testimonial-text bg-light text-center p-4">
                        <p class="mb-0">"Excellent service! They fixed my car's transmission issue quickly and at a fair price. Highly recommend South Ring Autos."</p>
                    </div>
                </div>
                <div class="testimonial-item text-center">
                    <img class="bg-light rounded-circle p-2 mx-auto mb-3" src="South-ring-logos/SR-Logo-White-BG.png" style="width: 80px; height: 80px; object-fit: contain;">
                    <h5 class="mb-0">Sarah K.</h5>
                    <p>Karen</p>
                    <div class="testimonial-text bg-light text-center p-4">
                        <p class="mb-0">"Professional team, transparent pricing, and my car runs like new. Will definitely come back for future services."</p>
                    </div>
                </div>
                <div class="testimonial-item text-center">
                    <img class="bg-light rounded-circle p-2 mx-auto mb-3" src="South-ring-logos/SR-Logo-White-BG.png" style="width: 80px; height: 80px; object-fit: contain;">
                    <h5 class="mb-0">John W.</h5>
                    <p>Westlands</p>
                    <div class="testimonial-text bg-light text-center p-4">
                        <p class="mb-0">"Great experience from start to finish. They explained everything clearly and delivered on time. Five stars!"</p>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <!-- Testimonial End -->

<?php
// Include footer
include 'includes/footer.php';
?>

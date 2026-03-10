<?php
/**
 * Footer Include
 * Reusable footer for all pages
 */
?>
    <!-- Car Brands Carousel -->
    <?php include __DIR__ . '/car-brands-carousel.php'; ?>
    
    <!-- Footer Start -->
    <div class="container-fluid bg-dark text-light footer pt-5 mt-5 wow fadeIn" data-wow-delay="0.1s">
        <div class="container py-5">
            <div class="row g-5">
                <div class="col-lg-3 col-md-6">
                    <h4 class="text-light mb-4">Address</h4>
                    <p class="mb-2"><i class="fa fa-map-marker-alt me-3"></i>Bogani East Lane, off Bogani East Road (Adjacent to Catholic University of East Africa)</p>
                    <p class="mb-2"><i class="fa fa-phone-alt me-3"></i>+254 704 113 472</p>
                    <p class="mb-2"><i class="fa fa-envelope me-3"></i>southringautos@gmail.com</p>
                    <div class="d-flex pt-2">
                        <a class="btn btn-outline-light btn-social" href="https://x.com/southringautos?t=QACbWEcU9_ebu2bBhBv_eg&s=08" target="_blank" rel="noopener noreferrer" title="Follow us on Twitter/X"><i class="fab fa-twitter"></i></a>
                        <a class="btn btn-outline-light btn-social" href="https://www.facebook.com/share/1NWqV3J8YV/" target="_blank" rel="noopener noreferrer" title="Follow us on Facebook"><i class="fab fa-facebook-f"></i></a>
                        <a class="btn btn-outline-light btn-social" href="https://www.instagram.com/southring_autos?igsh=MTVvOWdrazZmOTAxcw==" target="_blank" rel="noopener noreferrer" title="Follow us on Instagram"><i class="fab fa-instagram"></i></a>
                    </div>
                </div>
                <div class="col-lg-3 col-md-6">
                    <h4 class="text-light mb-4">Opening Hours</h4>
                    <h6 class="text-light">Monday - Friday:</h6>
                    <p class="mb-4">8:00 — 18:00</p>
                    <h6 class="text-light">Saturday:</h6>
                    <p class="mb-0">8:00 — 14:00</p>
                </div>
                <div class="col-lg-3 col-md-6">
                    <h4 class="text-light mb-4">Services</h4>
                    <a class="btn btn-link" href="service.php">General Service</a>
                    <a class="btn btn-link" href="service.php">Engine Overhaul</a>
                    <a class="btn btn-link" href="service.php">Accident Repair</a>
                    <a class="btn btn-link" href="service.php">ECU Diagnostics</a>
                    <a class="btn btn-link" href="service.php">Injector Cleaning</a>
                    <a class="btn btn-link" href="service.php">Transmission Repair</a>
                </div>
                <div class="col-lg-3 col-md-6">
                    <h4 class="text-light mb-4">Quick Links</h4>
                    <a class="btn btn-link" href="index.php">Home</a>
                    <a class="btn btn-link" href="about.php">About Us</a>
                    <a class="btn btn-link" href="service.php">Our Services</a>
                    <a class="btn btn-link" href="booking.php">Book a Service</a>
                    <a class="btn btn-link" href="contact.php">Contact Us</a>
                    <a class="btn btn-link" href="blog.php">Blog</a>
                </div>
            </div>
        </div>
        <div class="container">
            <div class="copyright">
                <div class="row">
                    <div class="col-md-6 text-center text-md-start mb-3 mb-md-0">
                        &copy; <a class="border-bottom" href="#">South Ring Autos</a>, All Right Reserved.
                    </div>
                    <div class="col-md-6 text-center text-md-end">
                        <div class="footer-menu">
                            <a href="index.php">Home</a>
                            <a href="about.php">About</a>
                            <a href="contact.php">Contact</a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <!-- Footer End -->

    <!-- Back to Top -->
    <a href="#" class="btn btn-lg btn-primary btn-lg-square back-to-top"><i class="bi bi-arrow-up"></i></a>

    <!-- JavaScript Libraries -->
    <script src="https://code.jquery.com/jquery-3.4.1.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.0.0/dist/js/bootstrap.bundle.min.js"></script>
    <script src="lib/wow/wow.min.js"></script>
    <script src="lib/easing/easing.min.js"></script>
    <script src="lib/waypoints/waypoints.min.js"></script>
    <script src="lib/counterup/counterup.min.js"></script>
    <script src="lib/owlcarousel/owl.carousel.min.js"></script>
    <script src="lib/tempusdominus/js/moment.min.js"></script>
    <script src="lib/tempusdominus/js/moment-timezone.min.js"></script>
    <script src="lib/tempusdominus/js/tempusdominus-bootstrap-4.min.js"></script>

    <!-- Template Javascript -->
    <script src="js/main.js"></script>
    
    <!-- Smooth Scroll Enhancement -->
    <script>
        // Enhanced smooth scroll for better UX
        document.addEventListener('DOMContentLoaded', function() {
            const smoothScrollLinks = document.querySelectorAll('.smooth-scroll');
            
            smoothScrollLinks.forEach(link => {
                link.addEventListener('click', function(e) {
                    e.preventDefault();
                    
                    const targetId = this.getAttribute('href');
                    const targetElement = document.querySelector(targetId);
                    
                    if (targetElement) {
                        const offsetTop = targetElement.offsetTop - 80; // Account for fixed navbar
                        
                        window.scrollTo({
                            top: offsetTop,
                            behavior: 'smooth'
                        });
                    }
                });
            });
        });
    </script>
</body>

</html>

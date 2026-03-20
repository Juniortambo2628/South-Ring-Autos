<?php
/**
 * Delivery Request Page
 */

require_once __DIR__ . '/includes/auth-check.php';

$bookingId = $_GET['booking_id'] ?? null;
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <title>Request Delivery | South Ring Autos</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link href="../css/bootstrap.min.css" rel="stylesheet">
    <link href="../css/style.css" rel="stylesheet">
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet">
</head>
<body>
    <nav class="navbar navbar-dark bg-dark">
        <div class="container-fluid">
            <a class="navbar-brand" href="dashboard.php">
                <img src="../South-ring-logos/SR-Logo-Transparent-BG.png" alt="Logo" height="40" class="me-2">
                South Ring Autos
            </a>
            <div>
                <a href="dashboard.php" class="btn btn-outline-light btn-sm">Back to Dashboard</a>
            </div>
        </div>
    </nav>

    <div class="container mt-4">
        <div class="row justify-content-center">
            <div class="col-md-8">
                <div class="card">
                    <div class="card-header bg-primary text-white">
                        <h4 class="mb-0"><i class="fas fa-truck me-2"></i>Request Pick-up/Drop-off</h4>
                    </div>
                    <div class="card-body">
                        <form id="delivery-form">
                            <input type="hidden" id="booking_id" value="<?php echo htmlspecialchars($bookingId ?? ''); ?>">
                            
                            <div class="mb-3">
                                <label class="form-label">Service Type</label>
                                <select class="form-select" id="type" required>
                                    <option value="pickup">Pick-up (We come to you)</option>
                                    <option value="dropoff">Drop-off (We deliver to you)</option>
                                </select>
                            </div>

                            <div class="mb-3">
                                <label class="form-label">Full Address</label>
                                <textarea class="form-control" id="address" rows="3" required></textarea>
                            </div>

                            <div class="row">
                                <div class="col-md-6 mb-3">
                                    <label class="form-label">City</label>
                                    <input type="text" class="form-control" id="city">
                                </div>
                                <div class="col-md-6 mb-3">
                                    <label class="form-label">Postal Code</label>
                                    <input type="text" class="form-control" id="postal_code">
                                </div>
                            </div>

                            <div class="row">
                                <div class="col-md-6 mb-3">
                                    <label class="form-label">Preferred Date</label>
                                    <input type="date" class="form-control" id="preferred_date" required>
                                </div>
                                <div class="col-md-6 mb-3">
                                    <label class="form-label">Preferred Time</label>
                                    <input type="time" class="form-control" id="preferred_time" required>
                                </div>
                            </div>

                            <div class="mb-3">
                                <label class="form-label">Contact Phone Number</label>
                                <input type="tel" class="form-control" id="contact_phone" required>
                            </div>

                            <div class="mb-3">
                                <label class="form-label">Special Instructions (Optional)</label>
                                <textarea class="form-control" id="special_instructions" rows="3"></textarea>
                            </div>

                            <div class="alert alert-info">
                                <i class="fas fa-info-circle me-2"></i>
                                Our team will contact you to confirm the delivery schedule.
                            </div>

                            <button type="submit" class="btn btn-primary w-100">
                                <i class="fas fa-paper-plane me-2"></i>Submit Request
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <script>
        // Set minimum date to today
        document.getElementById('preferred_date').min = new Date().toISOString().split('T')[0];

        document.getElementById('delivery-form').addEventListener('submit', function(e) {
            e.preventDefault();
            
            const data = {
                booking_id: document.getElementById('booking_id').value,
                type: document.getElementById('type').value,
                address: document.getElementById('address').value,
                city: document.getElementById('city').value,
                postal_code: document.getElementById('postal_code').value,
                preferred_date: document.getElementById('preferred_date').value,
                preferred_time: document.getElementById('preferred_time').value,
                contact_phone: document.getElementById('contact_phone').value,
                special_instructions: document.getElementById('special_instructions').value || null
            };

            if (!data.booking_id) {
                alert('Please select a booking first');
                return;
            }

            fetch('../api/delivery.php?action=create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            })
            .then(response => response.json())
            .then(result => {
                if (result.success) {
                    alert('Delivery request submitted successfully! We will contact you shortly.');
                    window.location.href = 'dashboard.php';
                } else {
                    alert('Error: ' + (result.message || 'Failed to submit request'));
                }
            })
            .catch(error => {
                console.error('Error:', error);
                alert('Error submitting request. Please try again.');
            });
        });
    </script>
</body>
</html>


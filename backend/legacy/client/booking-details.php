<?php
/**
 * Booking Details Page
 */

require_once __DIR__ . '/includes/auth-check.php';

$bookingId = $_GET['id'] ?? null;
if (!$bookingId) {
    header('Location: dashboard.php');
    exit;
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <title>Booking Details | South Ring Autos</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link href="../css/bootstrap.min.css" rel="stylesheet">
    <link href="../css/style.css" rel="stylesheet">
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet">
    <style>
        body { background: #f5f5f5; }
        .card { border: none; border-radius: 15px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); margin-bottom: 2rem; }
        .progress-track { position: relative; }
        .progress-step { padding: 1rem; margin-bottom: 1rem; border-left: 4px solid #ddd; background: #f8f9fa; }
        .progress-step.active { border-color: #D81324; background: #fff; }
        .progress-step.completed { border-color: #28a745; background: #f0f8f0; }
    </style>
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
        <h2 class="mb-4">Booking Details</h2>
        
        <div id="booking-info" class="card">
            <div class="card-body">
                <div class="text-center">Loading...</div>
            </div>
        </div>

        <div class="row">
            <div class="col-md-8">
                <div class="card">
                    <div class="card-header">
                        <h5 class="mb-0"><i class="fas fa-tasks me-2"></i>Repair Progress</h5>
                    </div>
                    <div class="card-body">
                        <div id="progress-timeline" class="progress-track">
                            <div class="text-center">Loading progress...</div>
                        </div>
                    </div>
                </div>

                <div class="card">
                    <div class="card-header">
                        <h5 class="mb-0"><i class="fas fa-money-bill me-2"></i>Payment Information</h5>
                    </div>
                    <div class="card-body" id="payment-info">
                        <div class="text-center">Loading...</div>
                    </div>
                </div>
            </div>

            <div class="col-md-4">
                <div class="card">
                    <div class="card-header bg-primary text-white">
                        <h5 class="mb-0"><i class="fas fa-bolt me-2"></i>Quick Actions</h5>
                    </div>
                    <div class="card-body">
                        <button class="btn btn-primary w-100 mb-2" onclick="requestDelivery()">
                            <i class="fas fa-truck me-2"></i>Request Pick-up/Drop-off
                        </button>
                        <button class="btn btn-outline-primary w-100" onclick="makePayment()">
                            <i class="fas fa-credit-card me-2"></i>Make Payment
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <script>
        const bookingId = <?php echo json_encode($bookingId); ?>;

        function loadBookingDetails() {
            fetch(`../api/client-bookings.php?action=get&id=${bookingId}`)
                .then(r => r.json())
                .then(data => {
                    if (data.success && data.booking) {
                        const booking = data.booking;
                        const date = new Date(booking.created_at);
                        const statusColors = {
                            'pending': 'warning',
                            'confirmed': 'info',
                            'in_progress': 'primary',
                            'completed': 'success',
                            'cancelled': 'danger'
                        };
                        
                        document.getElementById('booking-info').innerHTML = `
                            <div class="card-body">
                                <div class="row">
                                    <div class="col-md-6">
                                        <h4>${escapeHtml(booking.registration)}</h4>
                                        <p><strong>Service:</strong> ${escapeHtml(booking.service)}</p>
                                        <p><strong>Status:</strong> <span class="badge bg-${statusColors[booking.status] || 'secondary'}">${booking.status}</span></p>
                                        ${booking.estimated_cost ? `<p><strong>Estimated Cost:</strong> KES ${parseFloat(booking.estimated_cost).toLocaleString()}</p>` : ''}
                                        ${booking.actual_cost ? `<p><strong>Actual Cost:</strong> KES ${parseFloat(booking.actual_cost).toLocaleString()}</p>` : ''}
                                    </div>
                                    <div class="col-md-6">
                                        <p><strong>Created:</strong> ${date.toLocaleDateString()} at ${date.toLocaleTimeString()}</p>
                                        ${booking.message ? `<p><strong>Notes:</strong> ${escapeHtml(booking.message)}</p>` : ''}
                                    </div>
                                </div>
                            </div>
                        `;
                    }
                });
        }

        function loadProgress() {
            fetch(`../api/progress.php?action=get&booking_id=${bookingId}`)
                .then(r => r.json())
                .then(data => {
                    if (data.success) {
                        if (data.progress_history && data.progress_history.length > 0) {
                            const html = data.progress_history.reverse().map(p => {
                                const pDate = new Date(p.created_at);
                                return `
                                    <div class="progress-step ${parseInt(p.progress_percentage) === 100 ? 'completed' : 'active'}">
                                        <div class="d-flex justify-content-between">
                                            <strong>${escapeHtml(p.stage)}</strong>
                                            <span>${p.progress_percentage}%</span>
                                        </div>
                                        ${p.description ? `<p class="mb-1">${escapeHtml(p.description)}</p>` : ''}
                                        <small class="text-muted">${pDate.toLocaleDateString()} at ${pDate.toLocaleTimeString()}</small>
                                    </div>
                                `;
                            }).join('');
                            document.getElementById('progress-timeline').innerHTML = html;
                        } else {
                            document.getElementById('progress-timeline').innerHTML = '<p class="text-muted">No progress updates yet</p>';
                        }
                    }
                });
        }

        function loadPayments() {
            fetch(`../api/payments.php?action=list`)
                .then(r => r.json())
                .then(data => {
                    if (data.success && data.payments) {
                        const bookingPayments = data.payments.filter(p => p.booking_id == bookingId);
                        if (bookingPayments.length > 0) {
                            const html = bookingPayments.map(p => {
                                const pDate = p.payment_date ? new Date(p.payment_date) : null;
                                return `
                                    <div class="border-bottom pb-3 mb-3">
                                        <div class="d-flex justify-content-between">
                                            <div>
                                                <strong>KES ${parseFloat(p.amount).toLocaleString()}</strong>
                                                <span class="badge bg-${p.status === 'completed' ? 'success' : 'warning'} ms-2">${p.status}</span>
                                            </div>
                                        </div>
                                        <small class="text-muted">
                                            Method: ${p.payment_method || 'N/A'}
                                            ${pDate ? ` | Date: ${pDate.toLocaleDateString()}` : ''}
                                        </small>
                                    </div>
                                `;
                            }).join('');
                            document.getElementById('payment-info').innerHTML = html;
                        } else {
                            document.getElementById('payment-info').innerHTML = '<p class="text-muted">No payments recorded</p>';
                        }
                    }
                });
        }

        function requestDelivery() {
            window.location.href = `request-delivery.php?booking_id=${bookingId}`;
        }

        function makePayment() {
            alert('Payment gateway integration needed. Please contact us at +254 704 113 472 for payment.');
        }

        function escapeHtml(text) {
            if (!text) return '';
            const map = {'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;'};
            return text.toString().replace(/[&<>"']/g, m => map[m]);
        }

        loadBookingDetails();
        loadProgress();
        loadPayments();
    </script>
</body>
</html>


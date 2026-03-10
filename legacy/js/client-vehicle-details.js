/**
 * Vehicle Details Page JavaScript
 * Handles vehicle history loading, statistics, and logo display
 */

const { formatDate, formatDateShort } = require('./utils/date-formatter');

(function() {
    'use strict';

    // Get vehicle data from page
    const vehicleId = window.vehicleId;
    const vehicleMake = window.vehicleMake;
    const hasCustomThumbnail = window.hasCustomThumbnail;

    /**
     * Load and display car brand logo (only if no custom thumbnail)
     */
    async function loadBrandLogo() {
        if (vehicleMake && !hasCustomThumbnail && typeof getLogoUrl === 'function') {
            try {
                const logoUrl = await getLogoUrl(vehicleMake, 'optimized');
                if (logoUrl) {
                    const logoImg = document.getElementById('vehicleLogo');
                    if (logoImg) {
                        logoImg.src = logoUrl;
                        logoImg.alt = vehicleMake + ' logo';
                        // Add error handler to fallback to company logo if brand logo fails
                        const fallbackSrc = logoImg.getAttribute('data-fallback-src') || '../South-ring-logos/SR-Logo-red-White-BG.png';
                        logoImg.onerror = function() {
                            this.onerror = null;
                            this.src = fallbackSrc;
                        };
                    }
                }
            } catch (error) {
                console.error('Error loading brand logo:', error);
            }
        }
    }

    /**
     * Load vehicle history
     */
    function loadHistory() {
        if (!vehicleId) {
            console.error('Vehicle ID is required');
            return;
        }

        fetch(`../api/vehicles.php?action=history&id=${vehicleId}`)
            .then(r => r.json())
            .then(data => {
                if (data.success) {
                    renderStatistics(data);
                    renderHistory(data.bookings);
                    renderPayments(data.payments);
                } else {
                    showError('history-container', 'Error loading history. Please refresh the page.');
                }
            })
            .catch(err => {
                console.error('Error loading history:', err);
                showError('history-container', 'Error loading history. Please refresh the page.');
            });
    }

    /**
     * Show error message
     */
    function showError(containerId, message) {
        const container = document.getElementById(containerId);
        if (container) {
            container.innerHTML = `<div class="alert alert-danger">${escapeHtml(message)}</div>`;
        }
    }

    /**
     * Render statistics
     */
    function renderStatistics(data) {
        const bookings = data.bookings || [];
        const payments = data.payments || [];
        
        const totalBookings = bookings.length;
        const completedBookings = bookings.filter(b => b.status === 'completed').length;
        const totalSpent = payments
            .filter(p => p.status === 'completed')
            .reduce((sum, p) => sum + parseFloat(p.amount || 0), 0);
        const pendingPayments = payments
            .filter(p => p.status === 'pending')
            .reduce((sum, p) => sum + parseFloat(p.amount || 0), 0);

        const container = document.getElementById('statistics-container');
        if (!container) return;

        container.innerHTML = `
            <div class="col-md-3 mb-3">
                <div class="card text-center">
                    <div class="card-body">
                        <div class="h3 text-primary">${totalBookings}</div>
                        <div class="text-muted">Total Services</div>
                    </div>
                </div>
            </div>
            <div class="col-md-3 mb-3">
                <div class="card text-center">
                    <div class="card-body">
                        <div class="h3 text-success">${completedBookings}</div>
                        <div class="text-muted">Completed</div>
                    </div>
                </div>
            </div>
            <div class="col-md-3 mb-3">
                <div class="card text-center">
                    <div class="card-body">
                        <div class="h3 text-success">KES ${totalSpent.toLocaleString()}</div>
                        <div class="text-muted">Total Paid</div>
                    </div>
                </div>
            </div>
            <div class="col-md-3 mb-3">
                <div class="card text-center">
                    <div class="card-body">
                        <div class="h3 text-warning">KES ${pendingPayments.toLocaleString()}</div>
                        <div class="text-muted">Pending Payment</div>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Render service history
     */
    function renderHistory(bookings) {
        const container = document.getElementById('history-container');
        if (!container) return;
        
        if (bookings.length === 0) {
            container.innerHTML = '<p class="text-muted text-center py-4">No service history found for this vehicle.</p>';
            return;
        }

        container.innerHTML = bookings.map(booking => {
            const statusClass = booking.status === 'completed' ? 'completed' : 
                              booking.status === 'pending' ? 'pending' : '';
            const statusColors = {
                'pending': 'warning',
                'confirmed': 'info',
                'in_progress': 'primary',
                'completed': 'success',
                'cancelled': 'danger'
            };
            
            const progressBar = booking.progress ? `
                <div class="progress mb-2">
                    <div class="progress-bar" style="width: ${booking.progress}%">${booking.progress}%</div>
                </div>
            ` : '';
            
            return `
                <div class="history-item ${statusClass}">
                    <div class="d-flex justify-content-between align-items-start mb-2">
                        <div>
                            <h6 class="mb-1">${escapeHtml(booking.service)}</h6>
                            <small class="text-muted">${formatDate(booking.created_at)}</small>
                        </div>
                        <span class="badge bg-${statusColors[booking.status] || 'secondary'}">${booking.status}</span>
                    </div>
                    ${progressBar}
                    ${booking.current_stage ? `<small class="text-muted">Stage: ${escapeHtml(booking.current_stage)}</small><br>` : ''}
                    ${booking.estimated_cost ? `<small class="text-muted">Est. Cost: KES ${parseFloat(booking.estimated_cost).toLocaleString()}</small><br>` : ''}
                    ${booking.actual_cost ? `<small class="fw-bold">Actual Cost: KES ${parseFloat(booking.actual_cost).toLocaleString()}</small>` : ''}
                    <div class="mt-2">
                        <a href="booking-details.php?id=${booking.id}" class="btn btn-sm btn-outline-primary">
                            <i class="fas fa-eye me-1"></i>View Details
                        </a>
                    </div>
                </div>
            `;
        }).join('');
    }

    /**
     * Render payments
     */
    function renderPayments(payments) {
        const container = document.getElementById('payments-container');
        if (!container) return;
        
        if (payments.length === 0) {
            container.innerHTML = '<p class="text-muted text-center py-4">No payment records found for this vehicle.</p>';
            return;
        }

        container.innerHTML = `
            <div class="table-responsive">
                <table class="table table-hover">
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>Service</th>
                            <th>Amount</th>
                            <th>Method</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${payments.map(payment => {
                            const statusColors = {
                                'completed': 'success',
                                'pending': 'warning',
                                'failed': 'danger'
                            };
                            const date = payment.payment_date || payment.created_at;
                            return `
                                <tr>
                                    <td>${formatDateShort(date)}</td>
                                    <td>${escapeHtml(payment.service)}</td>
                                    <td class="fw-bold">KES ${parseFloat(payment.amount).toLocaleString()}</td>
                                    <td>${escapeHtml(payment.payment_method || 'N/A')}</td>
                                    <td><span class="badge bg-${statusColors[payment.status] || 'secondary'}">${payment.status}</span></td>
                                </tr>
                            `;
                        }).join('')}
                    </tbody>
                </table>
            </div>
        `;
    }

    /**
     * Escape HTML to prevent XSS
     */
    function escapeHtml(text) {
        if (!text) return '';
        const map = {'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;'};
        return text.toString().replace(/[&<>"']/g, m => map[m]);
    }

    // Initialize on page load
    document.addEventListener('DOMContentLoaded', function() {
        loadBrandLogo();
        loadHistory();
    });
})();


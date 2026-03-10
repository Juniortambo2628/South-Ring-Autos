/**
 * Client Dashboard JavaScript
 * Handles dashboard functionality including bookings, vehicles, and progress tracking
 */

// Utility functions
function getStatusColor(status) {
    const colors = {
        'pending': 'warning',
        'confirmed': 'info',
        'in_progress': 'primary',
        'completed': 'success',
        'cancelled': 'danger'
    };
    return colors[status] || 'secondary';
}

function escapeHtml(text) {
    if (!text) return '';
    const map = {'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;'};
    return text.toString().replace(/[&<>"']/g, m => map[m]);
}

// Load bookings
function loadBookings() {
    fetch('../api/client-bookings.php?action=list')
        .then(r => r.json())
        .then(data => {
            if (data.success && data.bookings) {
                const html = data.bookings.map(booking => {
                    return `
                    <div class="card progress-card mb-3">
                        <div class="card-body">
                            <div class="d-flex justify-content-between align-items-start mb-2">
                                <div>
                                    <h6>${escapeHtml(booking.registration)}</h6>
                                    <small class="text-muted">${escapeHtml(booking.service)}</small>
                                </div>
                                <span class="badge bg-${getStatusColor(booking.status)}">${booking.status}</span>
                            </div>
                            ${booking.progress !== null ? `
                                <div class="progress mb-2">
                                    <div class="progress-bar" role="progressbar" data-width="${booking.progress}">
                                        ${booking.progress}%
                                    </div>
                                </div>
                                <small>${escapeHtml(booking.current_stage || 'In Progress')}</small>
                            ` : ''}
                            <div class="mt-2">
                                <a href="booking-details.php?id=${booking.id}" class="btn btn-sm btn-outline-white">View Details</a>
                                ${booking.estimated_cost ? `<span class="ms-2 text-muted">Est. Cost: KES ${parseFloat(booking.estimated_cost).toLocaleString()}</span>` : ''}
                            </div>
                        </div>
                    </div>
                `;
                }).join('');
                
                const container = document.getElementById('bookings-container');
                if (container) {
                    container.innerHTML = html || '<p class="text-muted">No bookings found</p>';
                }
            }
        })
        .catch(err => {
            console.error('Error loading bookings:', err);
            const container = document.getElementById('bookings-container');
            if (container) {
                container.innerHTML = '<p class="text-muted">Error loading bookings</p>';
            }
        });
}

// Apply progress bar widths from data attributes
function applyProgressBars() {
    document.querySelectorAll('.progress-bar[data-width]').forEach(bar => {
        const width = bar.getAttribute('data-width');
        bar.style.width = width + '%';
    });
}

// Load vehicles preview
function loadVehiclesPreview() {
    fetch('../api/vehicles.php?action=list')
        .then(r => r.json())
        .then(data => {
            if (data.success && data.vehicles) {
                const vehicles = data.vehicles.slice(0, 3); // Show max 3
                const container = document.getElementById('vehicles-preview');
                if (!container) return;
                
                if (vehicles.length === 0) {
                    container.innerHTML = '<p class="text-muted mb-0">No vehicles yet</p>';
                } else {
                    const html = vehicles.map(v => {
                        return `
                            <div class="d-flex align-items-center justify-content-between mb-2 pb-2 border-bottom">
                                <div>
                                    <div class="fw-bold">${escapeHtml(v.make)} ${escapeHtml(v.model)}</div>
                                    <small class="text-muted">${escapeHtml(v.registration)}</small>
                                </div>
                                <small class="text-muted">${v.booking_count || 0} bookings</small>
                            </div>
                        `;
                    }).join('');
                    container.innerHTML = html;
                }
            }
        })
        .catch(err => {
            console.error('Error loading vehicles:', err);
            const container = document.getElementById('vehicles-preview');
            if (container) {
                container.innerHTML = '<p class="text-muted mb-0">Error loading vehicles</p>';
            }
        });
}

// Initialize dashboard on page load
document.addEventListener('DOMContentLoaded', function() {
    loadBookings();
    loadVehiclesPreview();
    applyProgressBars();
    
    // Auto-refresh every 30 seconds
    setInterval(() => { 
        loadBookings();
        loadVehiclesPreview();
        setTimeout(applyProgressBars, 100);
    }, 30000);
});


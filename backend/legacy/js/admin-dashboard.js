/**
 * Admin Dashboard JavaScript
 */
const { formatDateTable } = require('./utils/date-formatter');

// Load notifications
function loadNotifications() {
    fetch('../api/bookings.php?action=list&status=pending')
        .then(response => response.json())
        .then(data => {
            if (data.success && data.bookings) {
                const notificationPanel = document.getElementById('notification-panel');
                if (notificationPanel) {
                    if (data.bookings.length === 0) {
                        notificationPanel.innerHTML = '<p class="text-muted text-center py-3">No pending bookings</p>';
                    } else {
                        notificationPanel.innerHTML = data.bookings.slice(0, 5).map(booking => `
                            <div class="notification-item">
                                <div class="d-flex justify-content-between align-items-start">
                                    <div>
                                        <strong>${escapeHtml(booking.client_name || 'Unknown Client')}</strong>
                                        <p class="mb-1 small">${escapeHtml(booking.service)}</p>
                                        <small class="text-muted">${formatDateTable(booking.created_at)}</small>
                                    </div>
                                    <button class="btn btn-sm btn-primary" onclick="viewBooking(${booking.id})">View</button>
                                </div>
                            </div>
                        `).join('');
                    }
                }
            }
        })
        .catch(error => {
            console.error('Error loading notifications:', error);
        });
}

function toggleNotifications() {
    const panel = document.getElementById('notification-panel');
    if (panel) {
        if (panel.style.display === 'none' || !panel.style.display) {
            panel.style.display = 'block';
            loadNotifications();
        } else {
            panel.style.display = 'none';
        }
    }
}

function viewBooking(id) {
    window.location.href = `bookings.php?id=${id}`;
}

function escapeHtml(text) {
    if (!text) return '';
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
}

function updateBookingStatus(bookingId, status) {
    if (!confirm(`Are you sure you want to update this booking status to ${status}?`)) {
        return;
    }
    
    fetch('../api/bookings.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: `action=update&id=${bookingId}&status=${status}`
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            location.reload();
        } else {
            if (typeof toastr !== 'undefined') {
                toastr.error(data.message || 'Failed to update booking');
            } else {
                alert('Error: ' + (data.message || 'Failed to update booking'));
            }
        }
    })
    .catch(error => {
        console.error('Error:', error);
        if (typeof toastr !== 'undefined') {
            toastr.error('Error updating booking status');
        } else {
            alert('Error updating booking status');
        }
    });
}

function deleteBooking(bookingId) {
    if (!confirm('Are you sure you want to delete this booking? This action cannot be undone.')) {
        return;
    }
    
    fetch('../api/bookings.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: `action=delete&id=${bookingId}`
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            location.reload();
        } else {
            if (typeof toastr !== 'undefined') {
                toastr.error(data.message || 'Failed to delete booking');
            } else {
                alert('Error: ' + (data.message || 'Failed to delete booking'));
            }
        }
    })
    .catch(error => {
        console.error('Error:', error);
        if (typeof toastr !== 'undefined') {
            toastr.error('Error deleting booking');
        } else {
            alert('Error deleting booking');
        }
    });
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    loadNotifications();
});


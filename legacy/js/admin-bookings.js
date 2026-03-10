/**
 * Admin Bookings Management JavaScript
 * Handles grid/list toggle, date formatting, and booking actions
 */

/* eslint-env browser */
/* global bootstrap, renderBookingsGrid, loadBookingsGrid */
/* eslint-disable no-unused-vars */

const { formatDateTime } = require('./utils/date-formatter');

let gridInstance = null;

// Use date-fns for consistent date formatting
function formatDate(dateString) {
    return formatDateTime(dateString);
}

function formatStatus(status) {
    const statusClass = status === 'pending' ? 'status-pending' : 
                      status === 'confirmed' ? 'status-confirmed' : 
                      status === 'completed' ? 'status-completed' : 'status-cancelled';
    return `<span class="badge badge-pill ${statusClass}">${status}</span>`;
}

function toggleView(view) {
    const gridBtn = document.getElementById('view-grid-btn');
    const listBtn = document.getElementById('view-list-btn');
    
    if (view === 'grid') {
        gridBtn.classList.add('active');
        listBtn.classList.remove('active');
        if (gridInstance && gridInstance.data) {
            renderBookingsGrid(gridInstance.data);
        } else if (typeof loadBookingsGrid === 'function') {
            loadBookingsGrid();
        }
    } else {
        gridBtn.classList.remove('active');
        listBtn.classList.add('active');
        if (gridInstance && gridInstance.data) {
            renderListView(gridInstance.data);
        }
    }
}

function renderListView(data) {
    const container = document.getElementById('grid-container');
    if (!container) return;
    
    const filtered = gridInstance ? gridInstance.filteredData : data;
    const startIndex = gridInstance ? (gridInstance.currentPage - 1) * gridInstance.config.pageSize : 0;
    const endIndex = startIndex + (gridInstance ? gridInstance.config.pageSize : 20);
    const pageData = filtered.slice(startIndex, endIndex);
    
    if (pageData.length === 0) {
        container.innerHTML = '<div class="empty-state"><p class="text-muted">No bookings found</p></div>';
        return;
    }
    
    const html = pageData.map(booking => {
        const date = booking.created_at ? formatDate(booking.created_at) : 'N/A';
        const clientName = booking.client_name || booking.name || 'Guest';
        const statusClass = booking.status === 'pending' ? 'status-pending' : 
                          booking.status === 'confirmed' ? 'status-confirmed' : 
                          booking.status === 'completed' ? 'status-completed' : 'status-cancelled';
        
        return `
            <div class="booking-item mb-3">
                <div class="row align-items-center">
                    <div class="col-md-8">
                        <div class="d-flex align-items-center mb-2">
                            <strong class="text-white me-3">#${booking.id}</strong>
                            <span class="badge badge-pill ${statusClass}">${escapeHtml(booking.status || 'pending')}</span>
                        </div>
                        <div class="item-meta mb-1">
                            <i class="fas fa-user me-2"></i><strong>Client:</strong> ${escapeHtml(clientName)}
                        </div>
                        <div class="item-meta mb-1">
                            <i class="fas fa-car me-2"></i><strong>Registration:</strong> ${escapeHtml(booking.registration || 'N/A')}
                        </div>
                        <div class="item-meta mb-1">
                            <i class="fas fa-wrench me-2"></i><strong>Service:</strong> ${escapeHtml(booking.service || 'N/A')}
                        </div>
                        <div class="item-meta">
                            <i class="fas fa-clock me-2"></i><strong>Date:</strong> ${date}
                        </div>
                    </div>
                    <div class="col-md-4 text-end">
                        <button class="btn btn-pill btn-primary btn-sm me-2" onclick="openStatusModal(${booking.id}, '${escapeHtml(booking.status || 'pending')}')">
                            <i class="fas fa-edit me-2"></i>Update
                        </button>
                        <button class="btn btn-pill btn-outline-light btn-sm" onclick="openProgressModal(${booking.id})">
                            <i class="fas fa-chart-line me-2"></i>Progress
                        </button>
                    </div>
                </div>
            </div>
        `;
    }).join('');
    
    container.innerHTML = html;
    
    // Render pagination if needed
    if (gridInstance && gridInstance.config.pagination) {
        gridInstance.renderPagination();
    }
}

function escapeHtml(text) {
    if (!text) return '';
    const map = {'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;'};
    return text.toString().replace(/[&<>"']/g, m => map[m]);
}

function openStatusModal(id, currentStatus) {
    document.getElementById('bookingId').value = id;
    document.getElementById('bookingStatus').value = currentStatus;
    const modal = new bootstrap.Modal(document.getElementById('statusModal'));
    modal.show();
}

function openProgressModal(bookingId) {
    document.getElementById('progressBookingId').value = bookingId;
    document.getElementById('progressStage').value = 'Assessment';
    document.getElementById('progressPercentage').value = 0;
    document.getElementById('progressDescription').value = '';
    const modal = new bootstrap.Modal(document.getElementById('progressModal'));
    modal.show();
}

// Make functions globally available
window.formatDate = formatDate;
window.formatStatus = formatStatus;
window.toggleView = toggleView;
window.renderListView = renderListView;
window.openStatusModal = openStatusModal;
window.openProgressModal = openProgressModal;
// Note: renderBookingsGrid, loadBookingsGrid, openBookingDetailsModal, deleteBooking, escapeHtml
// are defined in admin/bookings.php and exposed globally there


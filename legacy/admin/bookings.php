<?php
/**
 * Admin Bookings Management
 * Modern glass design interface
 */

require_once __DIR__ . '/includes/auth-check.php';

use SouthRingAutos\Services\AdminService;
use SouthRingAutos\Utils\SessionManager;

// Get dashboard stats for notifications
$adminService = new AdminService();
$stats = $adminService->getDashboardStats();
$recentPendingCount = $stats['recentPendingCount'];

// Set page variables for header
$pageTitle = 'Manage Bookings | South Ring Autos Admin';
$currentPage = 'bookings.php';
$showNotifications = true;
include __DIR__ . '/includes/header.php';
?>

    <div class="container-fluid mt-4 admin-main-container">
        <div class="row h-100">
            <?php include __DIR__ . '/includes/sidebar.php'; ?>
            <div class="col-md-10 admin-content-area">
                <?php
                // Hero Section
                $heroConfig = [
                    'title' => 'Manage Bookings',
                    'subtitle' => 'View and manage all service bookings',
                    'icon' => 'fas fa-calendar-check',
                    'theme' => 'admin',
                    'breadcrumbs' => [
                        ['label' => 'Dashboard', 'url' => 'dashboard.php'],
                        ['label' => 'Bookings', 'url' => 'bookings.php', 'active' => true]
                    ]
                ];
                include __DIR__ . '/../includes/hero-section.php';
                ?>

                <!-- Search and Filter Container -->
                <div class="content-card mb-4">
                    <div class="card-body">
                        <div class="row g-3">
                            <div class="col-md-6">
                                <div id="search-container"></div>
                            </div>
                            <div class="col-md-6">
                                <div id="filter-container"></div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Grid Container -->
                <div class="content-card">
                    <div class="card-body">
                        <div class="d-flex justify-content-between align-items-center mb-3">
                            <h5 class="mb-0 text-white"><i class="fas fa-list me-2"></i>Bookings</h5>
                            <div class="btn-group" role="group">
                                <button type="button" class="btn btn-sm btn-outline-light active" id="view-grid-btn" onclick="toggleView('grid')">
                                    <i class="fas fa-th me-1"></i>Grid
                                </button>
                                <button type="button" class="btn btn-sm btn-outline-light" id="view-list-btn" onclick="toggleView('list')">
                                    <i class="fas fa-list me-1"></i>List
                                </button>
                            </div>
                        </div>
                        <div id="grid-container"></div>
                        <div id="pagination-container" class="mt-4"></div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Status Update Modal -->
    <div class="modal fade" id="statusModal" tabindex="-1">
        <div class="modal-dialog modal-dialog-centered">
            <div class="modal-content glass-card">
                <div class="modal-header border-0">
                    <h5 class="modal-title text-white"><i class="fas fa-edit me-2"></i>Update Booking Status</h5>
                    <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                </div>
                <div class="modal-body">
                    <form id="statusForm">
                        <input type="hidden" id="bookingId" name="id">
                        <div class="mb-3">
                            <label class="form-label-glass">Status</label>
                            <select class="form-select form-control-glass" id="bookingStatus" name="status" required>
                                <option value="pending">Pending</option>
                                <option value="confirmed">Confirmed</option>
                                <option value="in_progress">In Progress</option>
                                <option value="completed">Completed</option>
                                <option value="cancelled">Cancelled</option>
                            </select>
                        </div>
                        <div class="d-grid gap-2">
                            <button type="submit" class="btn btn-pill btn-primary">
                                <i class="fas fa-save me-2"></i>Update Status
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    </div>

    <!-- Booking Details Modal -->
    <div class="modal fade" id="bookingDetailsModal" tabindex="-1">
        <div class="modal-dialog modal-lg modal-dialog-centered">
            <div class="modal-content glass-card">
                <div class="modal-header border-0">
                    <h5 class="modal-title text-white"><i class="fas fa-eye me-2"></i>Booking Details</h5>
                    <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                </div>
                <div class="modal-body">
                    <div class="row">
                        <div class="col-md-4 text-center mb-3">
                            <img id="bookingDetailLogo" src="" alt="Brand Logo" class="img-fluid mb-3" style="max-height: 100px; display: none;" onerror="this.style.display='none'">
                            <div id="bookingDetailStatus"></div>
                        </div>
                        <div class="col-md-8">
                            <div class="mb-3">
                                <strong class="text-white">Booking ID:</strong>
                                <span id="bookingDetailId" class="text-muted"></span>
                            </div>
                            <div class="mb-3">
                                <strong class="text-white"><i class="fas fa-user me-2"></i>Client Name:</strong>
                                <span id="bookingDetailClient" class="text-muted"></span>
                            </div>
                            <div class="mb-3">
                                <strong class="text-white"><i class="fas fa-envelope me-2"></i>Email:</strong>
                                <span id="bookingDetailEmail" class="text-muted"></span>
                            </div>
                            <div class="mb-3">
                                <strong class="text-white"><i class="fas fa-phone me-2"></i>Phone:</strong>
                                <span id="bookingDetailPhone" class="text-muted"></span>
                            </div>
                            <div class="mb-3">
                                <strong class="text-white"><i class="fas fa-car me-2"></i>Vehicle:</strong>
                                <span id="bookingDetailVehicle" class="text-muted"></span>
                            </div>
                            <div class="mb-3">
                                <strong class="text-white"><i class="fas fa-id-card me-2"></i>Registration:</strong>
                                <span id="bookingDetailRegistration" class="text-muted"></span>
                            </div>
                            <div class="mb-3">
                                <strong class="text-white"><i class="fas fa-wrench me-2"></i>Service:</strong>
                                <span id="bookingDetailService" class="text-muted"></span>
                            </div>
                            <div class="mb-3">
                                <strong class="text-white"><i class="fas fa-calendar me-2"></i>Booking Date:</strong>
                                <span id="bookingDetailDate" class="text-muted"></span>
                            </div>
                            <div class="mb-3">
                                <strong class="text-white"><i class="fas fa-clock me-2"></i>Created:</strong>
                                <span id="bookingDetailCreated" class="text-muted"></span>
                            </div>
                            <div class="mb-3">
                                <strong class="text-white"><i class="fas fa-comment me-2"></i>Message:</strong>
                                <p id="bookingDetailMessage" class="text-muted mt-2"></p>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="modal-footer border-0">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                </div>
            </div>
        </div>
    </div>

    <!-- Progress Update Modal -->
    <div class="modal fade" id="progressModal" tabindex="-1">
        <div class="modal-dialog modal-dialog-centered">
            <div class="modal-content glass-card">
                <div class="modal-header border-0">
                    <h5 class="modal-title text-white"><i class="fas fa-tasks me-2"></i>Update Repair Progress</h5>
                    <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                </div>
                <div class="modal-body">
                    <form id="progressForm">
                        <input type="hidden" id="progressBookingId">
                        <div class="mb-3">
                            <label class="form-label-glass">Stage</label>
                            <select class="form-select form-control-glass" id="progressStage" required>
                                <option value="Assessment">Assessment</option>
                                <option value="Quotation">Quotation</option>
                                <option value="Approval">Approval</option>
                                <option value="Parts Ordering">Parts Ordering</option>
                                <option value="Repair">Repair</option>
                                <option value="Quality Check">Quality Check</option>
                                <option value="Ready for Collection">Ready for Collection</option>
                            </select>
                        </div>
                        <div class="mb-3">
                            <label class="form-label-glass">Progress Percentage (0-100%)</label>
                            <input type="number" class="form-control form-control-glass" id="progressPercentage" min="0" max="100" value="0" required>
                        </div>
                        <div class="mb-3">
                            <label class="form-label-glass">Description</label>
                            <textarea class="form-control form-control-glass" id="progressDescription" rows="3"></textarea>
                        </div>
                        <div class="d-grid gap-2">
                            <button type="submit" class="btn btn-pill btn-primary">
                                <i class="fas fa-save me-2"></i>Update Progress
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    </div>

    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.0.0/dist/js/bootstrap.bundle.min.js"></script>
    <script src="../js/dist/dashboard-components.bundle.js"></script>
    <script src="../js/dist/admin-bookings.bundle.js"></script>
    <script>
        let gridInstance = null;
        let allBookings = [];

        // Make renderBookingsGrid globally available FIRST
        window.renderBookingsGrid = function(bookings) {
            const container = document.getElementById('grid-container');
            if (!container) return;

            if (bookings.length === 0) {
                container.innerHTML = '<div class="text-center py-5"><p class="text-muted">No bookings found</p></div>';
                return;
            }

            // Fetch logo URLs for each booking
            Promise.all(bookings.map(booking => {
                const make = booking.vehicle_make || '';
                if (!make) {
                    return Promise.resolve({ ...booking, logoUrl: null });
                }
                
                return fetch(`../api/car-logos.php?action=get&make=${encodeURIComponent(make)}`)
                    .then(r => {
                        if (!r.ok) {
                            return { ...booking, logoUrl: null };
                        }
                        return r.json();
                    })
                    .then(data => {
                        const logoUrl = data.success && data.logo ? 
                            `../car-logos-dataset-master/logos/${data.logo.image?.localThumb?.replace('./', '') || data.logo.image?.thumb || ''}` : 
                            null;
                        return { ...booking, logoUrl };
                    })
                    .catch(() => ({ ...booking, logoUrl: null }));
            })).then(bookingsWithLogos => {
                // Apply search and filter if gridInstance exists
                let filtered = bookingsWithLogos;
                if (gridInstance && gridInstance.filteredData && gridInstance.filteredData.length > 0) {
                    // Map filtered data to include logos
                    const filteredIds = new Set(gridInstance.filteredData.map(b => b.id));
                    filtered = bookingsWithLogos.filter(b => filteredIds.has(b.id));
                }

                // Apply pagination
                const startIndex = gridInstance && gridInstance.currentPage ? (gridInstance.currentPage - 1) * gridInstance.config.pageSize : 0;
                const endIndex = startIndex + (gridInstance && gridInstance.config ? gridInstance.config.pageSize : 20);
                const pageData = filtered.slice(startIndex, endIndex);

                container.innerHTML = `
                    <div class="row g-3">
                        ${pageData.map(booking => {
                            const date = booking.created_at ? window.formatDate(booking.created_at) : 'N/A';
                            const clientName = booking.client_name || booking.name || 'Guest';
                            const statusClass = booking.status === 'pending' ? 'status-pending' : 
                                              booking.status === 'confirmed' ? 'status-confirmed' : 
                                              booking.status === 'completed' ? 'status-completed' : 'status-cancelled';
                            const vehicleInfo = booking.vehicle_make ? 
                                `${booking.vehicle_make} ${booking.vehicle_model || ''}`.trim() : 
                                booking.registration || 'N/A';
                            
                            return `
                                <div class="col-6 col-md-4 col-lg-3">
                                    <div class="card booking-grid-card h-100" data-booking-id="${booking.id}">
                                        <div class="card-body text-center p-3">
                                            ${booking.logoUrl ? `
                                                <img src="${booking.logoUrl}" alt="${escapeHtml(vehicleInfo)}" 
                                                     class="img-fluid mb-2 brand-logo"
                                                     loading="lazy"
                                                     onerror="this.style.display='none'">
                                            ` : '<div class="mb-2" style="height: 60px;"></div>'}
                                            <h6 class="mb-1" style="color: var(--admin-text-primary);">${escapeHtml(clientName)}</h6>
                                            <p class="small mb-1 text-muted">${escapeHtml(vehicleInfo)}</p>
                                            <p class="small mb-2 text-muted">${escapeHtml(booking.registration || 'N/A')}</p>
                                            <span class="badge badge-pill ${statusClass} mb-2">${escapeHtml(booking.status || 'pending')}</span>
                                            <p class="small mb-2 text-muted">${escapeHtml(booking.service || 'N/A')}</p>
                                            <p class="small mb-2 text-muted">${date}</p>
                                            <div class="mt-2">
                                                <button class="btn btn-sm btn-outline-primary me-1" onclick="openBookingDetailsModal(${booking.id})" title="View Details">
                                                    <i class="fas fa-eye"></i>
                                                </button>
                                                <button class="btn btn-sm btn-outline-success me-1" onclick="openStatusModal(${booking.id}, '${escapeHtml(booking.status || 'pending')}')" title="Update Status">
                                                    <i class="fas fa-edit"></i>
                                                </button>
                                                <button class="btn btn-sm btn-outline-danger" onclick="if(confirm('Delete this booking?')) { deleteBooking(${booking.id}); }" title="Delete">
                                                    <i class="fas fa-trash"></i>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            `;
                        }).join('')}
                    </div>
                `;

                // Render pagination if needed
                if (gridInstance && gridInstance.config.pagination) {
                    gridInstance.renderPagination();
                }
            });
        };

        window.escapeHtml = function(text) {
            if (!text) return '';
            const map = {'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;'};
            return text.toString().replace(/[&<>"']/g, m => map[m]);
        };

        // Custom grid renderer for bookings with thumbnails
        window.loadBookingsGrid = function() {
            fetch('../api/bookings.php?action=list')
                .then(r => r.json())
                .then(data => {
                    console.log('Bookings API response:', data); // Debug log
                    if (data.success && data.bookings) {
                        allBookings = data.bookings;
                        console.log('Loaded bookings:', allBookings.length); // Debug log
                        if (gridInstance) {
                            gridInstance.data = data.bookings;
                            gridInstance.filteredData = [...data.bookings];
                        }
                        // Always render, even if gridInstance doesn't exist yet
                        if (typeof window.renderBookingsGrid === 'function') {
                            window.renderBookingsGrid(data.bookings);
                        } else {
                            console.error('renderBookingsGrid function not available');
                        }
                    } else {
                        console.error('API returned no bookings:', data);
                        const container = document.getElementById('grid-container');
                        if (container) {
                            container.innerHTML = '<div class="text-center py-5"><p class="text-muted">No bookings found</p></div>';
                        }
                    }
                })
                .catch(err => {
                    console.error('Error loading bookings:', err);
                    const container = document.getElementById('grid-container');
                    if (container) {
                        container.innerHTML = '<div class="text-center py-5"><p class="text-danger">Error loading bookings. Please refresh the page.</p></div>';
                    }
                });
        };

        // Initialize Grid with custom renderer
        document.addEventListener('DOMContentLoaded', function() {
            // Wait a bit to ensure all functions are defined
            setTimeout(() => {
                // Load bookings and render as grid cards
                if (typeof window.loadBookingsGrid === 'function') {
                    window.loadBookingsGrid();
                } else {
                    console.error('loadBookingsGrid function not available');
                }
            }, 100);
        });

        window.deleteBooking = function(id) {
            fetch('../api/bookings.php?action=delete', {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: `id=${id}`
            })
            .then(() => {
                if (typeof window.loadBookingsGrid === 'function') {
                    window.loadBookingsGrid();
                }
            })
            .catch(err => {
                console.error('Error deleting booking:', err);
                alert('Error deleting booking');
            });
        };

        window.openBookingDetailsModal = function(bookingId) {
            // Fetch booking details
            fetch('../api/bookings.php?action=list')
                .then(r => r.json())
                .then(data => {
                    if (data.success && data.bookings) {
                        const booking = data.bookings.find(b => b.id == bookingId);
                        if (booking) {
                            showBookingDetails(booking);
                        } else {
                            alert('Booking not found');
                        }
                    }
                })
                .catch(err => {
                    console.error('Error loading booking details:', err);
                    alert('Error loading booking details');
                });
        };

        function showBookingDetails(booking) {
            const date = booking.created_at ? window.formatDate(booking.created_at) : 'N/A';
            const clientName = booking.client_name || booking.name || 'Guest';
            const vehicleInfo = booking.vehicle_make ? 
                `${booking.vehicle_make} ${booking.vehicle_model || ''} ${booking.vehicle_year || ''}`.trim() : 
                booking.registration || 'N/A';
            const statusClass = booking.status === 'pending' ? 'status-pending' : 
                              booking.status === 'confirmed' ? 'status-confirmed' : 
                              booking.status === 'completed' ? 'status-completed' : 'status-cancelled';
            
            // Get logo URL
            const make = booking.vehicle_make || '';
            let logoHtml = '';
            if (make) {
                fetch(`../api/car-logos.php?action=get&make=${encodeURIComponent(make)}`)
                    .then(r => r.json())
                    .then(data => {
                        if (data.success && data.logo) {
                            const logoUrl = `../car-logos-dataset-master/logos/${data.logo.image?.localThumb?.replace('./', '') || data.logo.image?.thumb || ''}`;
                            const logoImg = document.getElementById('bookingDetailLogo');
                            if (logoImg) {
                                logoImg.src = logoUrl;
                                logoImg.style.display = 'block';
                            }
                        }
                    })
                    .catch(() => {});
            }

            document.getElementById('bookingDetailId').textContent = booking.id;
            document.getElementById('bookingDetailClient').textContent = clientName;
            document.getElementById('bookingDetailEmail').textContent = booking.client_email || booking.email || 'N/A';
            document.getElementById('bookingDetailPhone').textContent = booking.client_phone || booking.phone || 'N/A';
            document.getElementById('bookingDetailVehicle').textContent = vehicleInfo;
            document.getElementById('bookingDetailRegistration').textContent = booking.registration || 'N/A';
            document.getElementById('bookingDetailService').textContent = booking.service || 'N/A';
            document.getElementById('bookingDetailDate').textContent = booking.date || 'N/A';
            document.getElementById('bookingDetailCreated').textContent = date;
            document.getElementById('bookingDetailStatus').innerHTML = `<span class="badge badge-pill ${statusClass}">${escapeHtml(booking.status || 'pending')}</span>`;
            document.getElementById('bookingDetailMessage').textContent = booking.message || 'No message';
            
            const modal = new bootstrap.Modal(document.getElementById('bookingDetailsModal'));
            modal.show();
        }

        // Progress form submit
        document.getElementById('progressForm').addEventListener('submit', function(e) {
            e.preventDefault();
            const bookingId = document.getElementById('progressBookingId').value;
            const stage = document.getElementById('progressStage').value;
            const percentage = document.getElementById('progressPercentage').value;
            const description = document.getElementById('progressDescription').value;

            fetch('../api/progress.php?action=update', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    booking_id: bookingId,
                    stage: stage,
                    progress_percentage: percentage,
                    description: description
                })
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    const modal = bootstrap.Modal.getInstance(document.getElementById('progressModal'));
                    modal.hide();
                    if (typeof window.loadBookingsGrid === 'function') {
                        window.loadBookingsGrid();
                    }
                    alert('Progress updated successfully!');
                } else {
                    alert('Error updating progress: ' + (data.message || 'Unknown error'));
                }
            })
                .catch(error => {
                    console.error('Error:', error);
                    alert('Error updating progress');
                });
            });

            // Status form submit
            document.getElementById('statusForm').addEventListener('submit', function(e) {
                e.preventDefault();
                const id = document.getElementById('bookingId').value;
                const status = document.getElementById('bookingStatus').value;

                fetch('../api/bookings.php?action=update', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ id, status })
                })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        const modal = bootstrap.Modal.getInstance(document.getElementById('statusModal'));
                        modal.hide();
                        if (typeof window.loadBookingsGrid === 'function') {
                            window.loadBookingsGrid();
                        }
                    } else {
                        alert('Error updating status: ' + (data.message || 'Unknown error'));
                    }
                })
                .catch(error => {
                    console.error('Error:', error);
                    alert('Error updating booking status');
                });
            });

            // Initialize search and filter (without GridJS rendering)
            // Wait for DashboardGrid to be available
            setTimeout(() => {
                if (typeof DashboardGrid !== 'undefined') {
                    gridInstance = new DashboardGrid({
                        containerId: 'grid-container',
                        searchContainerId: 'search-container',
                        filterContainerId: 'filter-container',
                        paginationContainerId: 'pagination-container',
                        apiUrl: '../api/bookings.php?action=list',
                        columns: [],
                        searchable: true,
                        searchKeys: ['name', 'registration', 'service', 'phone', 'email', 'status', 'client_name', 'vehicle_make'],
                        filterable: true,
                        filters: [
                            {
                                key: 'status',
                                label: 'Status',
                                options: [
                                    { value: 'pending', label: 'Pending' },
                                    { value: 'confirmed', label: 'Confirmed' },
                                    { value: 'completed', label: 'Completed' },
                                    { value: 'cancelled', label: 'Cancelled' }
                                ]
                            }
                        ],
                        pagination: true,
                        pageSize: 20
                    });

                    // Prevent GridJS from rendering - we'll use custom grid
                    gridInstance.setupGrid = function() {
                        // Override to prevent GridJS initialization
                        return;
                    };

                    // Override render to use custom grid
                    gridInstance.render = function() {
                        if (this.data && this.data.length > 0 && typeof window.renderBookingsGrid === 'function') {
                            window.renderBookingsGrid(this.data);
                        }
                    };

                    // Load data and render
                    gridInstance.loadData().then(() => {
                        if (gridInstance.data && gridInstance.data.length > 0 && typeof window.renderBookingsGrid === 'function') {
                            window.renderBookingsGrid(gridInstance.data);
                        }
                    });
                }
            }, 200);
    </script>
</body>
</html>


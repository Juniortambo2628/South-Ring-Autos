<?php
/**
 * Delivery Requests Management
 */
require_once __DIR__ . '/includes/auth-check.php';

use SouthRingAutos\Utils\SessionManager;

// Set page variables for header
$pageTitle = 'Delivery Requests | South Ring Autos Admin';
$currentPage = 'deliveries.php';
include __DIR__ . '/includes/header.php';
?>

    <div class="container-fluid mt-4 admin-main-container">
        <div class="row h-100">
            <?php include __DIR__ . '/includes/sidebar.php'; ?>
            <div class="col-md-10 admin-content-area">
                <?php
                // Hero Section
                $heroConfig = [
                    'title' => 'Delivery Requests',
                    'subtitle' => 'Manage pickup and drop-off requests from clients',
                    'icon' => 'fas fa-truck',
                    'theme' => 'admin',
                    'breadcrumbs' => [
                        ['label' => 'Dashboard', 'url' => 'dashboard.php'],
                        ['label' => 'Delivery Requests', 'url' => 'deliveries.php', 'active' => true]
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
                        <div id="grid-container"></div>
                        <div id="pagination-container" class="mt-4"></div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Update Delivery Modal -->
    <div class="modal fade" id="deliveryModal" tabindex="-1">
        <div class="modal-dialog modal-dialog-centered">
            <div class="modal-content glass-card">
                <div class="modal-header border-0">
                    <h5 class="modal-title text-white"><i class="fas fa-edit me-2"></i>Update Delivery Request</h5>
                    <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                </div>
                <div class="modal-body">
                    <form id="deliveryForm">
                        <input type="hidden" id="deliveryId">
                        <div class="mb-3">
                            <label class="form-label-glass">Status</label>
                            <select class="form-select form-control-glass" id="deliveryStatus" required>
                                <option value="pending">Pending</option>
                                <option value="confirmed">Confirmed</option>
                                <option value="scheduled">Scheduled</option>
                                <option value="in_transit">In Transit</option>
                                <option value="completed">Completed</option>
                                <option value="cancelled">Cancelled</option>
                            </select>
                        </div>
                        <div class="mb-3">
                            <label class="form-label-glass">Scheduled Date & Time</label>
                            <input type="datetime-local" class="form-control form-control-glass" id="scheduledDate">
                        </div>
                        <div class="d-grid gap-2">
                            <button type="submit" class="btn btn-pill btn-primary">
                                <i class="fas fa-save me-2"></i>Update Request
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    </div>

    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.0.0/dist/js/bootstrap.bundle.min.js"></script>
    <script src="../js/dist/dashboard-components.bundle.js"></script>
    <script>
        let gridInstance = null;

        // Initialize Grid for delivery requests
        document.addEventListener('DOMContentLoaded', function() {
            setTimeout(() => {
                fetch('../api/delivery.php?action=list')
                    .then(r => r.json())
                    .then(data => {
                        if (data.success && data.requests && typeof DashboardGrid !== 'undefined') {
                            const requests = Array.isArray(data.requests) ? data.requests : [];
                            
                            gridInstance = new DashboardGrid({
                                containerId: 'grid-container',
                                searchContainerId: 'search-container',
                                filterContainerId: 'filter-container',
                                paginationContainerId: 'pagination-container',
                                data: requests,
                                columns: [
                                    { id: 'id', name: 'ID' },
                                    { 
                                        id: 'type', 
                                        name: 'Type',
                                        formatter: (value) => {
                                            const icon = value === 'pickup' ? 'arrow-down' : 'arrow-up';
                                            const label = value === 'pickup' ? 'Pick-up' : 'Drop-off';
                                            return `<i class="fas fa-${icon} me-2"></i>${label}`;
                                        }
                                    },
                                    { id: 'registration', name: 'Registration' },
                                    { id: 'address', name: 'Address' },
                                    { id: 'city', name: 'City' },
                                    { 
                                        id: 'status', 
                                        name: 'Status',
                                        formatter: (value) => {
                                            const statusClass = value === 'pending' ? 'status-pending' : 
                                                              value === 'completed' ? 'status-confirmed' : 
                                                              value === 'cancelled' ? 'status-cancelled' : 'status-confirmed';
                                            return `<span class="badge badge-pill ${statusClass}">${value || 'N/A'}</span>`;
                                        }
                                    },
                                    { 
                                        id: 'created_at', 
                                        name: 'Requested',
                                        formatter: (value) => {
                                            if (!value) return 'N/A';
                                            const date = new Date(value);
                                            return date.toLocaleDateString();
                                        }
                                    }
                                ],
                                searchable: true,
                                searchKeys: ['registration', 'address', 'city', 'status', 'type'],
                                filterable: true,
                                filters: [
                                    {
                                        key: 'status',
                                        label: 'Status',
                                        options: [
                                            { value: 'pending', label: 'Pending' },
                                            { value: 'confirmed', label: 'Confirmed' },
                                            { value: 'scheduled', label: 'Scheduled' },
                                            { value: 'in_transit', label: 'In Transit' },
                                            { value: 'completed', label: 'Completed' },
                                            { value: 'cancelled', label: 'Cancelled' }
                                        ]
                                    },
                                    {
                                        key: 'type',
                                        label: 'Type',
                                        options: [
                                            { value: 'pickup', label: 'Pick-up' },
                                            { value: 'dropoff', label: 'Drop-off' }
                                        ]
                                    }
                                ],
                                pagination: true,
                                pageSize: 10,
                                contextMenu: [
                                    {
                                        label: 'Update Status',
                                        icon: 'fas fa-edit',
                                        action: (data) => {
                                            openDeliveryModal(data.id, data.status);
                                        }
                                    }
                                ]
                            });
                        } else if (!data.success) {
                            console.error('Error loading deliveries:', data.message || 'Unknown error');
                        } else if (typeof DashboardGrid === 'undefined') {
                            console.error('DashboardGrid is not available');
                        } else if (!data.requests || data.requests.length === 0) {
                            const container = document.getElementById('grid-container');
                            if (container) {
                                container.innerHTML = `
                                    <div class="empty-state">
                                        <i class="fas fa-inbox fa-3x mb-3"></i>
                                        <h4>No delivery requests found</h4>
                                    </div>
                                `;
                            }
                        }
                    })
                    .catch(err => {
                        console.error('Error loading deliveries:', err);
                        const container = document.getElementById('grid-container');
                        if (container) {
                            container.innerHTML = `
                                <div class="empty-state error">
                                    <i class="fas fa-exclamation-triangle fa-3x mb-3"></i>
                                    <h4>Error loading deliveries</h4>
                                    <p>Please refresh the page</p>
                                </div>
                            `;
                        }
                    });
            }, 100);
        });

        function reloadDeliveryGrid() {
            fetch('../api/delivery.php?action=list')
                .then(r => r.json())
                .then(data => {
                    if (data.success && data.requests && gridInstance) {
                        const requests = Array.isArray(data.requests) ? data.requests : [];
                        gridInstance.data = requests;
                        gridInstance.filteredData = [...requests];
                        gridInstance.render();
                    }
                })
                .catch(err => {
                    console.error('Error reloading deliveries:', err);
                });
        }

        window.reloadDeliveryGrid = reloadDeliveryGrid;

        function openDeliveryModal(id, currentStatus) {
            document.getElementById('deliveryId').value = id;
            document.getElementById('deliveryStatus').value = currentStatus;
            document.getElementById('scheduledDate').value = '';
            const modal = new bootstrap.Modal(document.getElementById('deliveryModal'));
            modal.show();
        }

        document.getElementById('deliveryForm').addEventListener('submit', function(e) {
            e.preventDefault();
            const id = document.getElementById('deliveryId').value;
            const status = document.getElementById('deliveryStatus').value;
            const scheduledDate = document.getElementById('scheduledDate').value;

            fetch('../api/delivery.php?action=update', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id: id,
                    status: status,
                    scheduled_date: scheduledDate || null
                })
            })
            .then(r => r.json())
            .then(data => {
                if (data.success) {
                    const modal = bootstrap.Modal.getInstance(document.getElementById('deliveryModal'));
                    modal.hide();
                    if (typeof reloadDeliveryGrid === 'function') {
                        reloadDeliveryGrid();
                    }
                    alert('Delivery request updated successfully!');
                } else {
                    alert('Error: ' + (data.message || 'Failed to update'));
                }
            })
            .catch(error => {
                console.error('Error:', error);
                alert('Error updating delivery request');
            });
        });

        function escapeHtml(text) {
            if (!text) return '';
            const map = {'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;'};
            return text.toString().replace(/[&<>"']/g, m => map[m]);
        }

        loadDeliveries();
    </script>
</body>
</html>


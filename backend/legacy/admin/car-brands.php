<?php
/**
 * Car Brands Management
 * Admin interface for managing car brands in the carousel
 */

require_once __DIR__ . '/includes/auth-check.php';

// Set page variables for header
$pageTitle = 'Car Brands Management | Admin';
$currentPage = 'car-brands.php';
$additionalCSS = ['../css/admin-car-brands.css'];
include __DIR__ . '/includes/header.php';
?>

    <div class="container-fluid mt-4 admin-main-container">
        <div class="row h-100">
            <?php 
            $sidebarWidth = '3';
            include __DIR__ . '/includes/sidebar.php'; 
            ?>
            <div class="col-md-9 admin-content-area">
                <?php
                // Hero Section
                $heroConfig = [
                    'title' => 'Car Brands Management',
                    'subtitle' => 'Manage which car brands appear in the website carousel',
                    'icon' => 'fas fa-car',
                    'theme' => 'admin',
                    'breadcrumbs' => [
                        ['label' => 'Dashboard', 'url' => 'dashboard.php'],
                        ['label' => 'Car Brands', 'url' => 'car-brands.php', 'active' => true]
                    ]
                ];
                include __DIR__ . '/../includes/hero-section.php';
                ?>

                <!-- Search Container -->
                <div class="content-card mb-4">
                    <div class="card-body">
                        <div id="search-container"></div>
                    </div>
                </div>

                <!-- Grid Container -->
                <div class="glass-card mb-4">
                    <div class="d-flex justify-content-between align-items-center mb-4">
                        <h5 class="mb-0 text-white"><i class="fas fa-list me-2"></i>Current Carousel Brands</h5>
                        <button class="btn btn-primary btn-sm" onclick="showAddBrandModal()">
                            <i class="fas fa-plus me-1"></i>Add Brand
                        </button>
                    </div>
                    <div id="grid-container"></div>
                    <div id="pagination-container" class="mt-4"></div>
                </div>
            </div>
        </div>
    </div>

    <!-- Add Brand Modal -->
    <div class="modal fade" id="addBrandModal" tabindex="-1">
        <div class="modal-dialog modal-xl">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title text-white">Add Brand to Carousel</h5>
                    <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                </div>
                <div class="modal-body">
                    <div class="mb-3">
                        <input type="text" class="form-control form-control-glass" id="brandSearch" placeholder="Search for a car brand..." onkeyup="filterBrands()">
                    </div>
                    <div id="brands-grid" class="row g-3 brands-grid-scrollable">
                        <div class="col-12 text-center py-5">
                            <div class="spinner-border text-primary" role="status">
                                <span class="visually-hidden">Loading...</span>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                    <button type="button" class="btn btn-primary" id="addSelectedBrandsBtn" onclick="handleAddSelectedBrands()" disabled>
                        Add Selected
                    </button>
                </div>
            </div>
        </div>
    </div>

    <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/js/bootstrap.bundle.min.js"></script>
    <script src="../js/dist/dashboard-components.bundle.js"></script>
    <script src="../js/dist/admin-car-brands.bundle.js"></script>
    <script>
        let gridInstance = null;

        // Initialize Grid for car brands with thumbnail view
        document.addEventListener('DOMContentLoaded', function() {
            // Wait a bit for DashboardGrid to be available
            setTimeout(() => {
                // Load brands and initialize custom grid renderer
                fetch('../api/car-brands-carousel.php?action=all')
                    .then(r => r.json())
                    .then(data => {
                        if (data.success && data.brands) {
                            const brands = Array.isArray(data.brands) ? data.brands : [];
                            renderCarBrandsGrid(brands);
                        } else if (!data.success) {
                            console.error('Error loading brands:', data.message || 'Unknown error');
                        }
                    })
                    .catch(err => {
                        console.error('Error loading brands:', err);
                    });
            }, 100);
        });

        // Custom grid renderer for car brands with thumbnails
        function renderCarBrandsGrid(brands) {
            const container = document.getElementById('grid-container');
            if (!container) return;

            if (brands.length === 0) {
                container.innerHTML = '<div class="text-center py-5"><p class="text-muted">No brands added yet. Click "Add Brand" to get started.</p></div>';
                return;
            }

            // Fetch logo URLs for each brand
            Promise.all(brands.map(brand => {
                return fetch(`../api/car-logos.php?action=get&slug=${encodeURIComponent(brand.brand_slug)}`)
                    .then(r => r.json())
                    .then(data => {
                        return {
                            ...brand,
                            logoUrl: data.success && data.logo ? 
                                `../car-logos-dataset-master/logos/${data.logo.image?.localThumb?.replace('./', '') || data.logo.image?.thumb || ''}` : 
                                null
                        };
                    })
                    .catch(() => ({ ...brand, logoUrl: null }));
            })).then(brandsWithLogos => {
                container.innerHTML = `
                    <div class="row g-3">
                        ${brandsWithLogos.map(brand => {
                            const statusClass = brand.is_active ? 'status-confirmed' : 'status-pending';
                            return `
                                <div class="col-6 col-md-4 col-lg-3">
                                    <div class="card brand-grid-card h-100" data-brand-id="${brand.id}">
                                        <div class="card-body text-center p-3">
                                            ${brand.logoUrl ? `
                                                <img src="${brand.logoUrl}" alt="${escapeHtml(brand.brand_name)}" 
                                                     class="img-fluid mb-2 brand-logo"
                                                     loading="lazy"
                                                     onerror="this.style.display='none'">
                                            ` : ''}
                                            <h6 class="mb-2" style="color: var(--admin-text-primary);">${escapeHtml(brand.brand_name)}</h6>
                                            <span class="badge badge-pill ${statusClass} mb-2">${brand.is_active ? 'Active' : 'Inactive'}</span>
                                            <div class="mt-2">
                                                <button class="btn btn-sm btn-outline-primary me-1" onclick="toggleBrand(${brand.id}, ${brand.is_active})">
                                                    <i class="fas fa-eye${brand.is_active ? '' : '-slash'}"></i>
                                                </button>
                                                <button class="btn btn-sm btn-outline-danger" onclick="deleteBrand(${brand.id})">
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
            });
        }

        function escapeHtml(text) {
            if (!text) return '';
            const map = {'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;'};
            return text.toString().replace(/[&<>"']/g, m => map[m]);
        }

        function handleAddSelectedBrands() {
            if (typeof window.addSelectedBrands === 'function') {
                const brandsToAdd = Array.from(window.selectedBrands || new Set()).map(key => {
                    const [name, slug] = key.split('|');
                    return { name, slug };
                });
                window.addSelectedBrands(brandsToAdd);
            }
        }

        function toggleBrand(id, currentStatus) {
            fetch('../api/car-brands-carousel.php?action=update', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: id, is_active: currentStatus ? 0 : 1 })
            })
            .then(r => r.json())
            .then(data => {
                if (data.success) {
                    // Reload grid
                    reloadCarBrandsGrid();
                } else {
                    alert('Error: ' + (data.message || 'Failed to update brand'));
                }
            })
            .catch(err => {
                console.error('Error updating brand:', err);
                alert('Error updating brand');
            });
        }

        function reloadCarBrandsGrid() {
            fetch('../api/car-brands-carousel.php?action=all')
                .then(r => r.json())
                .then(result => {
                    if (result.success && result.brands) {
                        const brands = Array.isArray(result.brands) ? result.brands : [];
                        renderCarBrandsGrid(brands);
                    }
                })
                .catch(err => {
                    console.error('Error reloading brands grid:', err);
                });
        }

        // Make reload function globally available
        window.reloadCarBrandsGrid = reloadCarBrandsGrid;

        function deleteBrand(id) {
            if (!confirm('Are you sure you want to remove this brand from the carousel?')) {
                return;
            }
            
            fetch('../api/car-brands-carousel.php?action=delete&id=' + id, {
                method: 'DELETE'
            })
            .then(r => r.json())
            .then(data => {
                if (data.success) {
                    // Reload grid
                    reloadCarBrandsGrid();
                    // Also refresh available brands in modal
                    if (typeof loadAllBrands === 'function') {
                        loadAllBrands();
                    }
                } else {
                    alert('Error: ' + (data.message || 'Failed to delete brand'));
                }
            })
            .catch(err => {
                console.error('Error deleting brand:', err);
                alert('Error deleting brand');
            });
        }
    </script>
</body>
</html>


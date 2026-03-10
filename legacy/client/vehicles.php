<?php
/**
 * My Vehicles Page
 * Manage vehicle information and view history
 */

require_once __DIR__ . '/includes/auth-check.php';

use SouthRingAutos\Database\Database;
use SouthRingAutos\Utils\SessionManager;

$db = Database::getInstance();
$pdo = $db->getConnection();

$clientId = SessionManager::getClientId();

// Get client info
$stmt = $pdo->prepare("SELECT * FROM clients WHERE id = ?");
$stmt->execute([$clientId]);
$client = $stmt->fetch(PDO::FETCH_ASSOC);

$activeLink = 'vehicles';
$pageTitle = 'My Vehicles | South Ring Autos';
include __DIR__ . '/includes/layout-start.php';
?>

<?php
// Hero Section
$heroConfig = [
    'title' => 'My Vehicles',
    'subtitle' => 'Manage your vehicle information and view service history',
    'icon' => 'fas fa-car',
    'theme' => 'client',
    'breadcrumbs' => [
        ['label' => 'Dashboard', 'url' => 'dashboard.php'],
        ['label' => 'My Vehicles', 'url' => 'vehicles.php', 'active' => true]
    ]
];
include __DIR__ . '/../includes/hero-section.php';
?>

                <!-- Search Container -->
                <div class="card mb-4">
                    <div class="card-body">
                        <div id="search-container"></div>
                    </div>
                </div>

                <div class="d-flex justify-content-between align-items-center mb-4">
                    <h5 class="mb-0">Your Vehicles</h5>
                    <button class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#addVehicleModal">
                        <i class="fas fa-plus me-2"></i>Add Vehicle
                    </button>
                </div>

                <div id="vehicles-container" class="row">
                    <div class="col-12 text-center py-5">
                        <div class="spinner-border text-primary" role="status">
                            <span class="visually-hidden">Loading...</span>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    </div>

    <!-- Add/Edit Vehicle Modal -->
    <div class="modal fade" id="addVehicleModal" tabindex="-1">
        <div class="modal-dialog modal-lg">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="modalTitle">Add New Vehicle</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                </div>
                <div class="modal-body">
                    <form id="vehicleForm">
                        <input type="hidden" id="vehicle_id">
                        <div class="row">
                            <div class="col-md-6 mb-3">
                                <label for="make" class="form-label">Make <span class="text-danger">*</span></label>
                                <input type="text" class="form-control" id="make" required>
                                <button type="button" class="btn btn-sm btn-outline-primary mt-2" onclick="showMakeGrid()">
                                    <i class="fas fa-th me-1"></i>Select from Grid
                                </button>
                            </div>
                            <div class="col-md-6 mb-3">
                                <label for="model" class="form-label">Model <span class="text-danger">*</span></label>
                                <input type="text" class="form-control" id="model" required>
                            </div>
                        </div>
                        <div class="row">
                            <div class="col-md-4 mb-3">
                                <label for="year" class="form-label">Year</label>
                                <input type="number" class="form-control" id="year" min="1900" max="<?php echo date('Y') + 1; ?>">
                            </div>
                            <div class="col-md-4 mb-3">
                                <label for="registration" class="form-label">Registration <span class="text-danger">*</span></label>
                                <input type="text" class="form-control" id="registration" required>
                            </div>
                            <div class="col-md-4 mb-3">
                                <label for="color" class="form-label">Color</label>
                                <input type="text" class="form-control" id="color">
                            </div>
                        </div>
                        <div class="row">
                            <div class="col-md-6 mb-3">
                                <label for="vin" class="form-label">VIN (Vehicle Identification Number)</label>
                                <input type="text" class="form-control" id="vin">
                            </div>
                            <div class="col-md-6 mb-3">
                                <label for="mileage" class="form-label">Current Mileage</label>
                                <input type="number" class="form-control" id="mileage" min="0">
                            </div>
                        </div>
                        <div class="row">
                            <div class="col-md-6 mb-3">
                                <label for="engine_size" class="form-label">Engine Size</label>
                                <input type="text" class="form-control" id="engine_size" placeholder="e.g., 2.0L, 2000cc">
                            </div>
                            <div class="col-md-6 mb-3">
                                <label for="fuel_type" class="form-label">Fuel Type</label>
                                <select class="form-select" id="fuel_type">
                                    <option value="">Select...</option>
                                    <option value="Petrol">Petrol</option>
                                    <option value="Diesel">Diesel</option>
                                    <option value="Hybrid">Hybrid</option>
                                    <option value="Electric">Electric</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>
                        </div>
                        <div class="mb-3">
                            <label for="thumbnail" class="form-label">Vehicle Thumbnail</label>
                            <input type="file" class="form-control" id="thumbnail" accept="image/*">
                            <small class="text-muted">Max size: 5MB. Supported formats: JPEG, PNG, GIF, WebP</small>
                            <div id="thumbnail-preview" class="mt-2" style="display: none;">
                                <img id="thumbnail-preview-img" src="" alt="Thumbnail preview" class="img-thumbnail" style="max-width: 200px; max-height: 200px;">
                                <button type="button" class="btn btn-sm btn-danger mt-2" onclick="removeThumbnail()">
                                    <i class="fas fa-times"></i> Remove
                                </button>
                            </div>
                            <div id="current-thumbnail" class="mt-2" style="display: none;">
                                <p class="small text-muted">Current thumbnail:</p>
                                <img id="current-thumbnail-img" src="" alt="Current thumbnail" class="img-thumbnail" style="max-width: 200px; max-height: 200px;">
                                <button type="button" class="btn btn-sm btn-danger mt-2" onclick="deleteCurrentThumbnail()">
                                    <i class="fas fa-trash"></i> Delete Current
                                </button>
                            </div>
                        </div>
                        <div class="mb-3">
                            <label for="notes" class="form-label">Notes</label>
                            <textarea class="form-control" id="notes" rows="3" placeholder="Any additional information about this vehicle..."></textarea>
                        </div>
                        <input type="hidden" id="delete_thumbnail" value="0">
                    </form>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                    <button type="button" class="btn btn-primary" onclick="saveVehicle()">
                        <i class="fas fa-save me-2"></i>Save Vehicle
                    </button>
                </div>
            </div>
        </div>
    </div>

    <!-- Make Selection Grid Modal -->
    <div class="modal fade" id="makeGridModal" tabindex="-1">
        <div class="modal-dialog modal-xl">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">Select Vehicle Make</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                </div>
                <div class="modal-body">
                    <div class="mb-3">
                        <input type="text" class="form-control" id="makeSearch" placeholder="Search for a car brand..." onkeyup="filterMakes()">
                    </div>
                    <div id="makes-grid" class="row g-3" style="max-height: 500px; overflow-y: auto;">
                        <div class="col-12 text-center py-5">
                            <div class="spinner-border text-primary" role="status">
                                <span class="visually-hidden">Loading...</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

<?php include __DIR__ . '/includes/layout-end.php'; ?>
<script src="../js/car-logos-helper.js"></script>
<script>
        let vehicles = [];
        let editModal = null;
        let carLogos = {};

        // Load car logos
        async function loadCarLogos() {
            try {
                const response = await fetch('../api/car-logos.php?action=list');
                const data = await response.json();
                if (data.success) {
                    data.logos.forEach(logo => {
                        carLogos[logo.slug.toLowerCase()] = logo;
                        carLogos[logo.name.toLowerCase()] = logo;
                    });
                }
            } catch (err) {
                console.error('Error loading car logos:', err);
            }
        }

        // Get logo URL for a make
        function getLogoUrl(make, size = 'thumb') {
            if (!make) return null;
            const makeLower = make.toLowerCase().trim();
            let logo = carLogos[makeLower];
            
            if (!logo) {
                for (const key in carLogos) {
                    if (key.includes(makeLower) || makeLower.includes(key)) {
                        logo = carLogos[key];
                        break;
                    }
                }
            }
            
            if (!logo || !logo.image) return null;
            
            const localPath = logo.image[`local${size.charAt(0).toUpperCase() + size.slice(1)}`];
            if (localPath) {
                return `../car-logos-dataset-master/logos/${localPath.replace('./', '')}`;
            }
            return logo.image[size] || logo.image.thumb || null;
        }

        // Load vehicles
        async function loadVehicles() {
            await loadCarLogos();
            fetch('../api/vehicles.php?action=list')
                .then(r => r.json())
                .then(data => {
                    if (data.success) {
                        vehicles = data.vehicles;
                        renderVehicles();
                    }
                })
                .catch(err => {
                    console.error('Error loading vehicles:', err);
                    document.getElementById('vehicles-container').innerHTML = 
                        '<div class="col-12"><div class="alert alert-danger">Error loading vehicles. Please refresh the page.</div></div>';
                });
        }

        // Render vehicles
        async function renderVehicles() {
            const container = document.getElementById('vehicles-container');
            
            if (vehicles.length === 0) {
                container.innerHTML = `
                    <div class="col-12">
                        <div class="card vehicle-card text-center py-5">
                            <div class="card-body">
                                <i class="fas fa-car fa-3x text-muted mb-3"></i>
                                <h5 class="text-muted">No vehicles added yet</h5>
                                <p class="text-muted">Add your first vehicle to get started</p>
                                <button class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#addVehicleModal">
                                    <i class="fas fa-plus me-2"></i>Add Your First Vehicle
                                </button>
                            </div>
                        </div>
                    </div>
                `;
                return;
            }

            container.innerHTML = vehicles.map(vehicle => `
                <div class="col-md-6 col-lg-4 mb-4">
                    <div class="card vehicle-card">
                        <div class="vehicle-header p-3">
                            <div class="d-flex justify-content-between align-items-start">
                                <div>
                                    <h5 class="mb-1">${escapeHtml(vehicle.make)} ${escapeHtml(vehicle.model)}</h5>
                                    <small class="opacity-75">${vehicle.year || 'N/A'} • ${escapeHtml(vehicle.registration)}</small>
                                </div>
                            </div>
                        </div>
                        <div class="text-center p-3 bg-light" id="vehicle-thumb-${vehicle.id}">
                            <div class="d-flex align-items-center justify-content-center" style="min-height: 150px;">
                                <div class="spinner-border spinner-border-sm text-primary" role="status">
                                    <span class="visually-hidden">Loading...</span>
                            </div>
                        </div>
                        </div>
                        <div class="card-body">
                            <div class="mb-3">
                                <small class="text-muted d-block">Color</small>
                                <div>${escapeHtml(vehicle.color || 'N/A')}</div>
                            </div>
                            ${vehicle.fuel_type ? `
                                <div class="mb-3">
                                    <small class="text-muted d-block">Fuel Type</small>
                                    <div>${escapeHtml(vehicle.fuel_type)}</div>
                                </div>
                            ` : ''}
                            ${vehicle.mileage ? `
                                <div class="mb-3">
                                    <small class="text-muted d-block">Mileage</small>
                                    <div>${parseInt(vehicle.mileage).toLocaleString()} km</div>
                                </div>
                            ` : ''}
                            <div class="row text-center mb-3">
                                <div class="col-6">
                                    <div class="fw-bold text-primary">${vehicle.booking_count || 0}</div>
                                    <small class="text-muted">Bookings</small>
                                </div>
                                <div class="col-6">
                                    <div class="fw-bold text-success">KES ${parseFloat(vehicle.total_spent || 0).toLocaleString()}</div>
                                    <small class="text-muted">Total Spent</small>
                                </div>
                            </div>
                            <div class="d-grid gap-2">
                                <a href="vehicle-details.php?id=${vehicle.id}" class="btn btn-primary btn-sm">
                                    <i class="fas fa-eye me-1"></i>View Details
                                </a>
                                <div class="btn-group">
                                    <button class="btn btn-outline-secondary btn-sm" onclick="editVehicle(${vehicle.id})">
                                        <i class="fas fa-edit"></i>
                                    </button>
                                    <button class="btn btn-outline-danger btn-sm" onclick="deleteVehicle(${vehicle.id})">
                                        <i class="fas fa-trash"></i>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `).join('');
        }

        // Save vehicle (create or update)
        function saveVehicle() {
            const form = document.getElementById('vehicleForm');
            if (!form.checkValidity()) {
                form.reportValidity();
                return;
            }

            const vehicleId = document.getElementById('vehicle_id').value;
            const thumbnailFile = document.getElementById('thumbnail').files[0];
            const deleteThumbnail = document.getElementById('delete_thumbnail').value === '1';
            
            // Use FormData for file uploads
            const formData = new FormData();
            formData.append('action', vehicleId ? 'update' : 'create');
            formData.append('make', document.getElementById('make').value);
            formData.append('model', document.getElementById('model').value);
            formData.append('year', document.getElementById('year').value || '');
            formData.append('registration', document.getElementById('registration').value);
            formData.append('color', document.getElementById('color').value || '');
            formData.append('vin', document.getElementById('vin').value || '');
            formData.append('engine_size', document.getElementById('engine_size').value || '');
            formData.append('fuel_type', document.getElementById('fuel_type').value || '');
            formData.append('mileage', document.getElementById('mileage').value || '');
            formData.append('notes', document.getElementById('notes').value || '');
            
            if (vehicleId) {
                formData.append('id', vehicleId);
            }
            
            if (thumbnailFile) {
                formData.append('thumbnail', thumbnailFile);
            }
            
            if (deleteThumbnail) {
                formData.append('delete_thumbnail', '1');
            }

            const url = '../api/vehicles.php';

            fetch(url, {
                method: 'POST',
                body: formData
            })
            .then(r => r.json())
            .then(result => {
                if (result.success) {
                    bootstrap.Modal.getInstance(document.getElementById('addVehicleModal')).hide();
                    resetForm();
                    loadVehicles();
                    alert(result.message || 'Vehicle saved successfully!');
                } else {
                    alert('Error: ' + (result.message || 'Failed to save vehicle'));
                }
            })
            .catch(err => {
                console.error('Error:', err);
                alert('An error occurred. Please try again.');
            });
        }

        // Edit vehicle
        function editVehicle(id) {
            const vehicle = vehicles.find(v => v.id == id);
            if (!vehicle) return;

            document.getElementById('modalTitle').textContent = 'Edit Vehicle';
            document.getElementById('vehicle_id').value = vehicle.id;
            document.getElementById('make').value = vehicle.make || '';
            document.getElementById('model').value = vehicle.model || '';
            document.getElementById('year').value = vehicle.year || '';
            document.getElementById('registration').value = vehicle.registration || '';
            document.getElementById('color').value = vehicle.color || '';
            document.getElementById('vin').value = vehicle.vin || '';
            document.getElementById('engine_size').value = vehicle.engine_size || '';
            document.getElementById('fuel_type').value = vehicle.fuel_type || '';
            document.getElementById('mileage').value = vehicle.mileage || '';
            document.getElementById('notes').value = vehicle.notes || '';
            document.getElementById('delete_thumbnail').value = '0';
            
            // Show current thumbnail if exists
            if (vehicle.thumbnail) {
                document.getElementById('current-thumbnail-img').src = '../' + vehicle.thumbnail;
                document.getElementById('current-thumbnail').style.display = 'block';
            } else {
                document.getElementById('current-thumbnail').style.display = 'none';
            }
            
            // Reset preview
            document.getElementById('thumbnail-preview').style.display = 'none';
            document.getElementById('thumbnail').value = '';

            const modal = new bootstrap.Modal(document.getElementById('addVehicleModal'));
            modal.show();
        }
        
        // Thumbnail preview
        document.getElementById('thumbnail').addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(event) {
                    document.getElementById('thumbnail-preview-img').src = event.target.result;
                    document.getElementById('thumbnail-preview').style.display = 'block';
                };
                reader.readAsDataURL(file);
            } else {
                document.getElementById('thumbnail-preview').style.display = 'none';
            }
        });
        
        // Remove thumbnail preview
        function removeThumbnail() {
            document.getElementById('thumbnail').value = '';
            document.getElementById('thumbnail-preview').style.display = 'none';
        }
        
        // Delete current thumbnail
        function deleteCurrentThumbnail() {
            if (confirm('Delete the current thumbnail?')) {
                document.getElementById('delete_thumbnail').value = '1';
                document.getElementById('current-thumbnail').style.display = 'none';
            }
        }

        // Delete vehicle
        function deleteVehicle(id) {
            if (!confirm('Are you sure you want to delete this vehicle? This action cannot be undone.')) {
                return;
            }

            fetch('../api/vehicles.php?action=delete', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({id: id})
            })
            .then(r => r.json())
            .then(result => {
                if (result.success) {
                    loadVehicles();
                    alert(result.message || 'Vehicle deleted successfully!');
                } else {
                    alert('Error: ' + (result.message || 'Failed to delete vehicle'));
                }
            })
            .catch(err => {
                console.error('Error:', err);
                alert('An error occurred. Please try again.');
            });
        }

        // Reset form
        function resetForm() {
            document.getElementById('vehicleForm').reset();
            document.getElementById('vehicle_id').value = '';
            document.getElementById('modalTitle').textContent = 'Add New Vehicle';
            document.getElementById('thumbnail-preview').style.display = 'none';
            document.getElementById('current-thumbnail').style.display = 'none';
            document.getElementById('delete_thumbnail').value = '0';
        }

        // Reset form when modal is closed
        document.getElementById('addVehicleModal').addEventListener('hidden.bs.modal', resetForm);

        // Escape HTML
        function escapeHtml(text) {
            if (!text) return '';
            const map = {'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;'};
            return text.toString().replace(/[&<>"']/g, m => map[m]);
        }

        // Load on page load
        loadVehicles();

        // Load thumbnails after rendering
        async function loadVehicleThumbnails() {
            for (const vehicle of vehicles) {
                const thumbContainer = document.getElementById(`vehicle-thumb-${vehicle.id}`);
                if (!thumbContainer) continue;
                
                let imgSrc = vehicle.thumbnail || null;
                
                // Try to get logo if no custom thumbnail
                if (!imgSrc) {
                    imgSrc = getLogoUrl(vehicle.make, 'optimized');
                }
                
                // Fallback to default logo
                if (!imgSrc) {
                    imgSrc = '../South-ring-logos/SR-Logo-red-White-BG.png';
                }
                
                thumbContainer.innerHTML = `
                    <img src="${imgSrc}" 
                         alt="${escapeHtml(vehicle.make)} ${escapeHtml(vehicle.model)}" 
                         class="img-fluid rounded" 
                         style="max-height: 200px; width: auto; background: white; padding: 10px;"
                         loading="lazy"
                         onerror="this.src='../South-ring-logos/SR-Logo-red-White-BG.png'">
                `;
            }
        }

        // Update renderVehicles to load thumbnails
        const originalRenderVehicles = renderVehicles;
        renderVehicles = async function() {
            await originalRenderVehicles();
            setTimeout(loadVehicleThumbnails, 100);
        };

        // Make grid selection
        let allMakes = [];
        
        async function loadMakesGrid() {
            try {
                const response = await fetch('../api/car-logos.php?action=list');
                const data = await response.json();
                if (data.success) {
                    allMakes = data.logos;
                    renderMakesGrid(allMakes);
                }
            } catch (err) {
                console.error('Error loading makes:', err);
            }
        }

        function renderMakesGrid(makes) {
            const grid = document.getElementById('makes-grid');
            if (!grid) return;
            
            if (makes.length === 0) {
                grid.innerHTML = '<div class="col-12 text-center py-5"><p class="text-muted">No makes found</p></div>';
                return;
            }
            
            grid.innerHTML = makes.map(make => {
                const logoUrl = make.image?.localThumb 
                    ? `../car-logos-dataset-master/logos/${make.image.localThumb.replace('./', '')}`
                    : (make.image?.thumb || '');
                
                return `
                    <div class="col-6 col-md-4 col-lg-3">
                        <div class="card make-card h-100" style="cursor: pointer; transition: transform 0.2s;" 
                             onclick="selectMake('${escapeHtml(make.name)}', '${escapeHtml(make.slug)}')"
                             onmouseover="this.style.transform='scale(1.05)'" 
                             onmouseout="this.style.transform='scale(1)'">
                            <div class="card-body text-center p-3">
                                ${logoUrl ? `
                                    <img src="${logoUrl}" alt="${escapeHtml(make.name)}" 
                                         class="img-fluid mb-2" style="max-height: 60px; width: auto;"
                                         loading="lazy"
                                         onerror="this.style.display='none'">
                                ` : ''}
                                <div class="small fw-bold text-white">${escapeHtml(make.name)}</div>
                            </div>
                        </div>
                    </div>
                `;
            }).join('');
        }

        function filterMakes() {
            const search = document.getElementById('makeSearch').value.toLowerCase();
            const filtered = allMakes.filter(make => 
                make.name.toLowerCase().includes(search) || 
                make.slug.toLowerCase().includes(search)
            );
            renderMakesGrid(filtered);
        }

        function showMakeGrid() {
            const modal = new bootstrap.Modal(document.getElementById('makeGridModal'));
            modal.show();
            if (allMakes.length === 0) {
                loadMakesGrid();
            } else {
                renderMakesGrid(allMakes);
            }
        }

        function selectMake(name, slug) {
            document.getElementById('make').value = name;
            const modal = bootstrap.Modal.getInstance(document.getElementById('makeGridModal'));
            modal.hide();
        }
</script>


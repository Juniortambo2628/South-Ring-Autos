/**
 * Admin Car Brands Management JavaScript
 */

/* eslint-env browser */
/* global bootstrap, reloadCarBrandsGrid, toastr */
/* eslint-disable no-console */

let allBrands = [];
let currentBrands = [];

// Load current brands
function loadBrands() {
    fetch('../api/car-brands-carousel.php?action=all')
        .then(r => r.json())
        .then(data => {
            if (data.success) {
                currentBrands = data.brands;
                // Only render to brands-list if it exists (old structure)
                const brandsList = document.getElementById('brands-list');
                if (brandsList) {
                    renderBrands();
                }
                // New structure uses DashboardGrid, reload via global function if available
                if (typeof reloadCarBrandsGrid === 'function') {
                    reloadCarBrandsGrid();
                }
            }
        })
        .catch(err => {
            console.error('Error loading brands:', err);
            const container = document.getElementById('brands-list');
            if (container) {
                container.innerHTML = '<div class="alert alert-danger">Error loading brands</div>';
            }
        });
}

// Render current brands
function renderBrands() {
    const container = document.getElementById('brands-list');
    if (!container) {
        console.warn('brands-list container not found');
        return;
    }
    if (currentBrands.length === 0) {
        container.innerHTML = '<p class="text-center py-3" style="color: var(--admin-text-muted);">No brands added yet. Click "Add Brand" to get started.</p>';
        return;
    }

    container.innerHTML = currentBrands.map(brand => `
        <div class="brand-card">
            <div class="d-flex justify-content-between align-items-center">
                <div class="d-flex align-items-center">
                    <div class="me-3">
                        <strong class="text-white">${escapeHtml(brand.brand_name)}</strong>
                        <div class="small" style="color: var(--admin-text-muted);">Slug: ${escapeHtml(brand.brand_slug)}</div>
                        <div class="small mt-1">
                            <span class="badge ${brand.is_active ? 'bg-success' : 'bg-secondary'}">
                                ${brand.is_active ? 'Active' : 'Inactive'}
                            </span>
                            <span style="color: var(--admin-text-muted);" class="ms-2">Order: ${brand.display_order}</span>
                        </div>
                    </div>
                </div>
                <div>
                    <button class="btn btn-sm btn-outline-primary me-2" onclick="toggleBrand(${brand.id}, ${brand.is_active})">
                        <i class="fas fa-${brand.is_active ? 'eye-slash' : 'eye'}"></i>
                        ${brand.is_active ? 'Deactivate' : 'Activate'}
                    </button>
                    <button class="btn btn-sm btn-outline-danger" onclick="deleteBrand(${brand.id})">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

// Load all available brands for selection
function loadAllBrands() {
    fetch('../api/car-logos.php?action=list')
        .then(r => r.json())
        .then(data => {
            if (data.success) {
                // Filter out already added brands
                const addedSlugs = currentBrands.map(b => b.brand_slug.toLowerCase());
                allBrands = (data.logos || data.brands || []).filter(logo => 
                    !addedSlugs.includes(logo.slug.toLowerCase())
                );
                renderBrandsGrid(allBrands);
            }
        })
        .catch(err => {
            console.error('Error loading all brands:', err);
        });
}

// Selected brands for multiselect
let selectedBrands = new Set();
// Expose globally for modal
window.selectedBrands = selectedBrands;

// Render brands grid with multiselect
function renderBrandsGrid(brands) {
    const grid = document.getElementById('brands-grid');
    if (!grid) return;
    
    if (brands.length === 0) {
        grid.innerHTML = '<div class="col-12 text-center py-5"><p class="text-muted">No brands found</p></div>';
        return;
    }
    
    grid.innerHTML = brands.map(brand => {
        const logoUrl = brand.image?.localThumb 
            ? `../car-logos-dataset-master/logos/${brand.image.localThumb.replace('./', '')}`
            : (brand.image?.thumb || '');
        
        const brandKey = `${brand.name}|${brand.slug}`;
        const isSelected = selectedBrands.has(brandKey);
        
        return `
            <div class="col-6 col-md-4 col-lg-3">
                <div class="card make-grid-item h-100 ${isSelected ? 'selected' : ''}" 
                     data-brand-name="${escapeHtml(brand.name)}" 
                     data-brand-slug="${escapeHtml(brand.slug)}"
                     onclick="toggleBrandSelection(this, '${escapeHtml(brand.name)}', '${escapeHtml(brand.slug)}')">
                    <div class="card-body text-center p-3 position-relative">
                        <div class="form-check position-absolute top-0 end-0 m-2">
                            <input class="form-check-input" type="checkbox" 
                                   ${isSelected ? 'checked' : ''} 
                                   onclick="event.stopPropagation(); toggleBrandSelection(this.closest('.make-grid-item'), '${escapeHtml(brand.name)}', '${escapeHtml(brand.slug)}')">
                        </div>
                        ${logoUrl ? `
                            <img src="${logoUrl}" alt="${escapeHtml(brand.name)}" 
                                 class="img-fluid mb-2 brand-logo"
                                 loading="lazy"
                                 onerror="this.style.display='none'">
                        ` : ''}
                        <div class="small fw-bold" style="color: var(--admin-text-primary);">${escapeHtml(brand.name)}</div>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

// Toggle brand selection
function toggleBrandSelection(element, name, slug) {
    const brandKey = `${name}|${slug}`;
    if (selectedBrands.has(brandKey)) {
        selectedBrands.delete(brandKey);
        element.classList.remove('selected');
        const checkbox = element.querySelector('input[type="checkbox"]');
        if (checkbox) checkbox.checked = false;
    } else {
        selectedBrands.add(brandKey);
        element.classList.add('selected');
        const checkbox = element.querySelector('input[type="checkbox"]');
        if (checkbox) checkbox.checked = true;
    }
    window.selectedBrands = selectedBrands; // Update global reference
    updateAddButton();
}

// Update add button state
function updateAddButton() {
    const addBtn = document.getElementById('addSelectedBrandsBtn');
    if (addBtn) {
        addBtn.disabled = selectedBrands.size === 0;
        addBtn.textContent = selectedBrands.size > 0 
            ? `Add Selected (${selectedBrands.size})` 
            : 'Add Selected';
    }
}

function filterBrands() {
    const searchInput = document.getElementById('makeSearch') || document.getElementById('brandSearch');
    if (!searchInput) return;
    
    const search = searchInput.value.toLowerCase();
    const filtered = allBrands.filter(brand => 
        brand.name.toLowerCase().includes(search) || 
        brand.slug.toLowerCase().includes(search)
    );
    renderBrandsGrid(filtered);
}

function showAddBrandModal() {
    // Clear selections when opening modal
    selectedBrands.clear();
    window.selectedBrands = selectedBrands; // Update global reference
    const modal = new bootstrap.Modal(document.getElementById('addBrandModal'));
    modal.show();
    if (allBrands.length === 0) {
        loadAllBrands();
    } else {
        renderBrandsGrid(allBrands);
        updateAddButton();
    }
}

function addBrand(name, slug) {
    // Single brand add (for backward compatibility)
    addSelectedBrands([{ name, slug }]);
}

function addSelectedBrands(brandsToAdd) {
    if (!brandsToAdd || brandsToAdd.length === 0) {
        if (typeof toastr !== 'undefined') {
            toastr.warning('Please select at least one brand');
        } else {
            alert('Please select at least one brand');
        }
        return;
    }

    // Add brands sequentially
    let added = 0;
    let failed = 0;
    const total = brandsToAdd.length;

    brandsToAdd.forEach((brand, index) => {
        fetch('../api/car-brands-carousel.php?action=add', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                brand_name: brand.name,
                brand_slug: brand.slug,
                display_order: currentBrands.length + index
            })
        })
        .then(r => r.json())
        .then(data => {
            if (data.success) {
                added++;
            } else {
                failed++;
            }

            // Check if all requests are done
            if (added + failed === total) {
                if (added > 0) {
                    // Clear selections
                    selectedBrands.clear();
                    const modal = bootstrap.Modal.getInstance(document.getElementById('addBrandModal'));
                    if (modal) modal.hide();
                    
                    // Reload grid if available (new structure)
                    if (typeof reloadCarBrandsGrid === 'function') {
                        reloadCarBrandsGrid();
                    } else {
                        // Fallback to old structure
                        loadBrands();
                    }
                    loadAllBrands(); // Refresh available brands
                    
                    if (failed > 0) {
                            if (typeof toastr !== 'undefined') {
                                toastr.warning(`Added ${added} brand(s), but ${failed} failed.`);
                            } else {
                                alert(`Added ${added} brand(s), but ${failed} failed.`);
                            }
                        } else {
                            if (typeof toastr !== 'undefined') {
                                toastr.success(`Successfully added ${added} brand(s)!`);
                            } else {
                                alert(`Successfully added ${added} brand(s)!`);
                            }
                        }
                    } else {
                        if (typeof toastr !== 'undefined') {
                            toastr.error('Failed to add brands: ' + (failed > 0 ? 'All brands failed to add' : 'Unknown error'));
                        } else {
                            alert('Failed to add brands: ' + (failed > 0 ? 'All brands failed to add' : 'Unknown error'));
                        }
                }
            }
        })
        .catch(err => {
            console.error('Error adding brand:', err);
            failed++;
            if (added + failed === total) {
                        if (typeof toastr !== 'undefined') {
                            toastr.error('Error adding brands. Please try again.');
                        } else {
                            alert('Error adding brands. Please try again.');
                        }
            }
        });
    });
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
            loadBrands();
        } else {
                    if (typeof toastr !== 'undefined') {
                        toastr.error(data.message || 'Failed to update brand');
                    } else {
                        alert('Error: ' + (data.message || 'Failed to update brand'));
                    }
        }
    })
    .catch(err => {
        console.error('Error updating brand:', err);
            if (typeof toastr !== 'undefined') {
                toastr.error('Error updating brand');
            } else {
                alert('Error updating brand');
            }
    });
}

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
            // Reload grid if available (new structure)
            if (typeof reloadCarBrandsGrid === 'function') {
                reloadCarBrandsGrid();
            } else {
                // Fallback to old structure
                loadBrands();
            }
            loadAllBrands(); // Refresh available brands
        } else {
                    if (typeof toastr !== 'undefined') {
                        toastr.error(data.message || 'Failed to delete brand');
                    } else {
                        alert('Error: ' + (data.message || 'Failed to delete brand'));
                    }
        }
    })
    .catch(err => {
        console.error('Error deleting brand:', err);
            if (typeof toastr !== 'undefined') {
                toastr.error('Error deleting brand');
            } else {
                alert('Error deleting brand');
            }
    });
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Initialize on page load - only if brands-list exists (old structure)
// New structure uses DashboardGrid component
document.addEventListener('DOMContentLoaded', function() {
    // Only load brands if using old structure
    const brandsList = document.getElementById('brands-list');
    if (brandsList) {
        loadBrands();
    }
    // New structure will be initialized by inline script in car-brands.php
});

// Make functions globally available
window.showAddBrandModal = showAddBrandModal;
window.filterBrands = filterBrands;
window.addBrand = addBrand;
window.addSelectedBrands = addSelectedBrands;
window.toggleBrandSelection = toggleBrandSelection;
window.toggleBrand = toggleBrand;
window.deleteBrand = deleteBrand;


/**
 * Booking Form Enhancements
 * Handles car selection grid and live email check
 */

// Make Grid Selection Logic
let allMakes = [];

async function loadMakesGrid() {
    try {
        const response = await fetch('api/car-logos.php?action=list');
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
            ? `car-logos-dataset-master/logos/${make.image.localThumb.replace('./', '')}`
            : (make.image?.thumb || '');
        
        return `
            <div class="col-6 col-md-4 col-lg-3">
                <div class="card make-card h-100" style="cursor: pointer; transition: transform 0.2s;" 
                     onclick="selectMake('${escapeHtml(make.name)}')"
                     onmouseover="this.style.transform='scale(1.05)'" 
                     onmouseout="this.style.transform='scale(1)'">
                    <div class="card-body text-center p-3">
                        ${logoUrl ? `
                            <img src="${logoUrl}" alt="${escapeHtml(make.name)}" 
                                 class="img-fluid mb-2" style="max-height: 60px; width: auto;"
                                 loading="lazy"
                                 onerror="this.style.display='none'">
                        ` : ''}
                        <div class="small fw-bold text-dark">${escapeHtml(make.name)}</div>
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

function selectMake(name) {
    document.getElementById('vehicleMake').value = name;
    const modal = bootstrap.Modal.getInstance(document.getElementById('makeGridModal'));
    modal.hide();
}

function escapeHtml(text) {
    if (!text) return '';
    const map = {'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;'};
    return text.toString().replace(/[&<>"']/g, m => map[m]);
}

// Live Email Check Logic
document.addEventListener('DOMContentLoaded', function() {
    const emailInput = document.getElementById('emailInput');
    const feedbackDiv = document.getElementById('emailFeedback');
    
    if (emailInput && feedbackDiv) {
        let timeout = null;
        
        emailInput.addEventListener('input', function() {
            clearTimeout(timeout);
            feedbackDiv.style.display = 'none';
            
            const email = this.value.trim();
            if (email && validateEmail(email)) {
                timeout = setTimeout(() => checkEmail(email), 500);
            }
        });
        
        emailInput.addEventListener('blur', function() {
            const email = this.value.trim();
            if (email && validateEmail(email)) {
                checkEmail(email);
            }
        });
    }
});

function validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

async function checkEmail(email) {
    const feedbackDiv = document.getElementById('emailFeedback');
    
    try {
        const response = await fetch('api/check-email.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email: email })
        });
        
        const data = await response.json();
        
        if (data.success && data.exists) {
            feedbackDiv.innerHTML = `
                <div class="alert alert-info mb-0 py-2">
                    <i class="fas fa-info-circle me-2"></i>
                    Looks like you already have an account! 
                    <a href="#" onclick="showQuickLogin('${escapeHtml(email)}'); return false;" class="alert-link">Log in here</a> 
                    to load your saved vehicles.
                </div>
            `;
            feedbackDiv.style.display = 'block';
        } else {
            feedbackDiv.style.display = 'none';
        }
    } catch (err) {
        console.error('Error checking email:', err);
    }
}

// Quick Login Modal Functions
function showQuickLogin(email) {
    document.getElementById('loginEmail').value = email;
    document.getElementById('loginPassword').value = '';
    document.getElementById('loginError').classList.add('d-none');
    
    const modal = new bootstrap.Modal(document.getElementById('quickLoginModal'));
    modal.show();
    
    // Focus password field
    setTimeout(() => {
        document.getElementById('loginPassword').focus();
    }, 500);
}

// Handle change email link
document.addEventListener('DOMContentLoaded', function() {
    const changeEmailLink = document.getElementById('changeEmailLink');
    if (changeEmailLink) {
        changeEmailLink.addEventListener('click', function(e) {
            e.preventDefault();
            const modal = bootstrap.Modal.getInstance(document.getElementById('quickLoginModal'));
            if (modal) modal.hide();
            document.getElementById('emailInput').focus();
        });
    }
    
    // Handle quick login form submission
    const quickLoginForm = document.getElementById('quickLoginForm');
    if (quickLoginForm) {
        quickLoginForm.addEventListener('submit', handleQuickLogin);
    }
});

async function handleQuickLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    const errorDiv = document.getElementById('loginError');
    const submitBtn = document.getElementById('quickLoginBtn');
    
    // Disable button and show loading
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Logging in...';
    errorDiv.classList.add('d-none');
    
    try {
        // Use FormData to match the API's expectation of $_POST
        const formData = new FormData();
        formData.append('email', email);
        formData.append('password', password);
        
        const response = await fetch('api/client-auth.php?action=login', {
            method: 'POST',
            body: formData
        });
        
        const data = await response.json();
        
        if (data.success) {
            // Close modal
            const modal = bootstrap.Modal.getInstance(document.getElementById('quickLoginModal'));
            if (modal) modal.hide();
            
            // Reload page to reflect logged-in state
            window.location.reload();
        } else {
            errorDiv.textContent = data.message || 'Invalid email or password';
            errorDiv.classList.remove('d-none');
            submitBtn.disabled = false;
            submitBtn.innerHTML = '<i class="fas fa-sign-in-alt me-2"></i>Log In';
        }
    } catch (err) {
        console.error('Error logging in:', err);
        errorDiv.textContent = 'An error occurred. Please try again.';
        errorDiv.classList.remove('d-none');
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<i class="fas fa-sign-in-alt me-2"></i>Log In';
    }
}

// Expose functions globally
window.showMakeGrid = showMakeGrid;
window.filterMakes = filterMakes;
window.selectMake = selectMake;

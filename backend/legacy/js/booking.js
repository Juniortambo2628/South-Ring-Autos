// Booking Form Handler
/* eslint-env browser */
/* global toastr */
/* eslint-disable no-console */

const { isValidPhone, validateAndSanitizeEmail } = require('./utils/validator');

// Function to populate form from selected vehicle
function populateFromSelectedVehicle(selectedVehicle, vehicleIdInput, registrationInput, vehicleMakeInput, vehicleModelInput, vehicleYearInput, vehicleColorInput) {
    const option = selectedVehicle.options[selectedVehicle.selectedIndex];
    if (option.value) {
        vehicleIdInput.value = option.value;
        registrationInput.value = option.dataset.reg || '';
        vehicleMakeInput.value = option.dataset.make || '';
        vehicleModelInput.value = option.dataset.model || '';
        vehicleYearInput.value = option.dataset.year || '';
        vehicleColorInput.value = option.dataset.color || '';
    }
}

document.addEventListener('DOMContentLoaded', function() {
    const bookingForm = document.getElementById('bookingForm');
    if (!bookingForm) return;
    
    // Check if user is logged in by checking for session indicator
    // This will be set via a data attribute or inline script in booking.php
    const isLoggedIn = document.body.dataset.loggedIn === 'true' || false;
    
    // Vehicle selection toggle for logged-in users
    if (isLoggedIn) {
        const vehicleOptionSelect = document.getElementById('vehicleOptionSelect');
        const vehicleOptionNew = document.getElementById('vehicleOptionNew');
        const vehicleSelectContainer = document.getElementById('vehicleSelectContainer');
        const vehicleDetailsContainer = document.getElementById('vehicleDetailsContainer');
        const selectedVehicle = document.getElementById('selectedVehicle');
        const registrationInput = document.getElementById('registration');
        const vehicleMakeInput = document.getElementById('vehicleMake');
        const vehicleModelInput = document.getElementById('vehicleModel');
        const vehicleYearInput = document.getElementById('vehicleYear');
        const vehicleColorInput = document.getElementById('vehicleColor');
        const vehicleIdInput = document.getElementById('vehicle_id');
        
        // Load vehicles
        fetch('api/vehicles.php?action=list')
            .then(r => r.json())
            .then(data => {
                if (data.success && data.vehicles.length > 0) {
                    selectedVehicle.innerHTML = '<option value="">Select a vehicle...</option>' +
                        data.vehicles.map(v => 
                            `<option value="${v.id}" data-reg="${v.registration}" data-make="${v.make || ''}" data-model="${v.model || ''}" data-year="${v.year || ''}" data-color="${v.color || ''}">${v.make} ${v.model} - ${v.registration}${v.year ? ' (' + v.year + ')' : ''}</option>`
                        ).join('');
                    
                    // Set selected vehicle if coming from vehicle details page
                    const urlParams = new URLSearchParams(window.location.search);
                    const vehicleId = urlParams.get('vehicle_id');
                    if (vehicleId) {
                        selectedVehicle.value = vehicleId;
                        populateFromSelectedVehicle(selectedVehicle, vehicleIdInput, registrationInput, vehicleMakeInput, vehicleModelInput, vehicleYearInput, vehicleColorInput);
                    }
                } else {
                    selectedVehicle.innerHTML = '<option value="">No vehicles saved. Add vehicle details below.</option>';
                    vehicleOptionSelect.disabled = true;
                    vehicleOptionNew.checked = true;
                    vehicleSelectContainer.style.display = 'none';
                    vehicleDetailsContainer.style.display = 'block';
                }
            })
            .catch(err => {
                console.error('Error loading vehicles:', err);
                selectedVehicle.innerHTML = '<option value="">Error loading vehicles</option>';
            });
        
        // Toggle between select and new vehicle
        vehicleOptionSelect?.addEventListener('change', function() {
            if (this.checked) {
                vehicleSelectContainer.style.display = 'block';
                vehicleDetailsContainer.style.display = 'none';
                selectedVehicle.required = true;
                vehicleMakeInput.required = false;
                vehicleModelInput.required = false;
            }
        });
        
        vehicleOptionNew?.addEventListener('change', function() {
            if (this.checked) {
                vehicleSelectContainer.style.display = 'none';
                vehicleDetailsContainer.style.display = 'block';
                selectedVehicle.required = false;
                vehicleMakeInput.required = false;
                vehicleModelInput.required = false;
                vehicleIdInput.value = '';
            }
        });
        
        // Populate form when vehicle is selected
        selectedVehicle?.addEventListener('change', function() {
            populateFromSelectedVehicle(selectedVehicle, vehicleIdInput, registrationInput, vehicleMakeInput, vehicleModelInput, vehicleYearInput, vehicleColorInput);
        });
    }
    
    // Form submission
    bookingForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Ensure service select is visible and accessible for validation
        const serviceSelect = document.getElementById('serviceSelect');
        if (serviceSelect) {
            // Make sure it's not hidden
            serviceSelect.style.display = '';
            serviceSelect.style.visibility = 'visible';
            serviceSelect.removeAttribute('disabled');
            
            // Check if service is selected
            if (!serviceSelect.value) {
                serviceSelect.focus();
                serviceSelect.classList.add('is-invalid');
                if (typeof toastr !== 'undefined') {
                    toastr.warning('Please select a service.');
                } else {
                    window.NotificationUI ? window.NotificationUI.showWarning('Missing Information', 'Please select a service.') : alert('Please select a service.');
                }
                return;
            }
            serviceSelect.classList.remove('is-invalid');
        }
        
        // Validate form
        if (!bookingForm.checkValidity()) {
            // Find first invalid field and focus it
            const firstInvalid = bookingForm.querySelector(':invalid');
            if (firstInvalid) {
                firstInvalid.focus();
                firstInvalid.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
            return;
        }
        
        const formData = new FormData(bookingForm);
        const data = Object.fromEntries(formData);
        
        // Validate email if provided
        if (data.email && data.email.trim()) {
            const emailValidation = validateAndSanitizeEmail(data.email);
            if (!emailValidation.valid) {
                const emailInput = bookingForm.querySelector('[name="email"]');
                if (emailInput) {
                    emailInput.focus();
                    emailInput.classList.add('is-invalid');
                }
                if (typeof toastr !== 'undefined') {
                    toastr.error(emailValidation.error);
                } else {
                    window.NotificationUI ? window.NotificationUI.showWarning('Invalid Email', emailValidation.error) : alert(emailValidation.error);
                }
                return;
            }
            data.email = emailValidation.email;
        }
        
        // Validate phone if provided
        if (data.phone && data.phone.trim() && !isValidPhone(data.phone)) {
            const phoneInput = bookingForm.querySelector('[name="phone"]');
            if (phoneInput) {
                phoneInput.focus();
                phoneInput.classList.add('is-invalid');
            }
            if (typeof toastr !== 'undefined') {
                toastr.error('Please enter a valid phone number (e.g., +254712345678 or 0712345678)');
            } else {
                window.NotificationUI ? window.NotificationUI.showWarning('Invalid Phone', 'Please enter a valid phone number') : alert('Please enter a valid phone number');
            }
            return;
        }
        
        // For logged-in users, get client info from session or form
        if (isLoggedIn) {
            // Remove vehicle option radio from data
            delete data.vehicleOption;
            delete data.selected_vehicle;
            
            // If vehicle was selected, use its ID
            if (data.vehicle_id && !data.vehicle_id.trim()) {
                delete data.vehicle_id;
            }
            
            // Get client info from session (will be set server-side)
            // Client ID and email will be set from session in the API
        }
        
        // Send to backend
        fetch('api/bookings.php?action=create', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                if (typeof toastr !== 'undefined') {
                    toastr.success('Thank you! Your booking request has been submitted. We will contact you shortly.');
                } else {
                    window.NotificationUI ? window.NotificationUI.showSuccess('Booking Submitted', 'Thank you! Your booking request has been submitted. We will contact you shortly.') : alert('Thank you! Your booking request has been submitted. We will contact you shortly.');
                }
                bookingForm.reset();
                if (isLoggedIn) {
                    // Redirect logged-in clients to their dashboard
                    window.location.href = 'client/dashboard.php';
                } else {
                    // Redirect non-logged-in users to home page
                    window.location.href = 'index.php';
                }
            } else {
                if (typeof toastr !== 'undefined') {
                    toastr.error('Error: ' + (data.message || 'Failed to submit booking'));
                } else {
                    window.NotificationUI ? window.NotificationUI.showError('Booking Failed', data.message || 'Failed to submit booking', 0) : alert('Error: ' + (data.message || 'Failed to submit booking'));
                }
            }
        })
        .catch(error => {
            console.error('Error:', error);
            if (typeof toastr !== 'undefined') {
                toastr.error('Sorry, there was an error submitting your booking. Please call us at +254 704 113 472');
            } else {
                window.NotificationUI ? window.NotificationUI.showError('Booking Error', 'Sorry, there was an error submitting your booking. Please call us at +254 704 113 472', 0) : alert('Sorry, there was an error submitting your booking. Please call us at +254 704 113 472');
            }
        });
    });
});


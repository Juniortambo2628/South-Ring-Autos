/**
 * Booking Form Submission Handler
 * Handles form submission to API and redirects to success page
 */

document.addEventListener('DOMContentLoaded', function() {
    const bookingForm = document.getElementById('bookingForm');
    
    if (bookingForm) {
        bookingForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const submitButton = bookingForm.querySelector('[type="submit"]');
            const originalText = submitButton.textContent;
            
            // Disable submit button and show loading state
            submitButton.disabled = true;
            submitButton.innerHTML = '<i class="fa fa-spinner fa-spin me-2"></i>Submitting...';
            
            try {
                // Get form data
                const formData = new FormData(bookingForm);
                const data = {};
                
                // Convert FormData to object
                for (let [key, value] of formData.entries()) {
                    // Skip empty values except for message
                    if (value || key === 'message') {
                        data[key] = value;
                    }
                }
                
                // Handle vehicle option selection for logged-in users
                const vehicleOption = document.querySelector('input[name="vehicleOption"]:checked');
                if (vehicleOption && vehicleOption.value === 'select') {
                    const selectedVehicle = document.getElementById('selectedVehicle');
                    if (selectedVehicle && selectedVehicle.value) {
                        data.vehicle_id = selectedVehicle.value;
                        // Remove new vehicle fields when selecting existing vehicle
                        delete data.vehicle_make;
                        delete data.vehicle_model;
                        delete data.vehicle_year;
                        delete data.vehicle_color;
                    }
                } else {
                    // Clear vehicle_id when adding new vehicle
                    delete data.vehicle_id;
                }
                
                // Submit to API
                const response = await fetch('api/bookings.php?action=create', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(data)
                });
                
                const result = await response.json();
                
                if (result.success) {
                    // Store booking details in session for success page
                    if (result.id && result.reference) {
                        // Redirect to success page with booking details
                        window.location.href = `booking-success.php?id=${result.id}&ref=${result.reference}`;
                    } else {
                        // Fallback: redirect with just ID
                        window.location.href = `booking-success.php?id=${result.id}`;
                    }
                } else {
                    // Show error message
                    showError(result.message || 'An error occurred. Please try again.');
                    
                    // Re-enable submit button
                    submitButton.disabled = false;
                    submitButton.textContent = originalText;
                }
            } catch (error) {
                console.error('Booking submission error:', error);
                showError('An error occurred while submitting your booking. Please try again.');
                
                // Re-enable submit button
                submitButton.disabled = false;
                submitButton.textContent = originalText;
            }
        });
    }
    
    /**
     * Display error message using custom notification UI
     */
    function showError(message) {
        // Use NotificationUI if available, otherwise fall back to alert
        if (window.NotificationUI) {
            window.NotificationUI.showError(
                'Booking Error',
                message,
                0 // Don't auto-dismiss errors
            );
        } else {
            // Fallback: show inline error
            let errorContainer = document.getElementById('bookingError');
            
            if (!errorContainer) {
                errorContainer = document.createElement('div');
                errorContainer.id = 'bookingError';
                errorContainer.className = 'alert alert-danger mt-3';
                errorContainer.setAttribute('role', 'alert');
                
                const submitButton = bookingForm.querySelector('[type="submit"]');
                submitButton.parentElement.insertBefore(errorContainer, submitButton);
            }
            
            errorContainer.innerHTML = `
                <i class="fa fa-exclamation-triangle me-2"></i>
                <strong>Error:</strong> ${message}
            `;
            errorContainer.style.display = 'block';
            
            // Scroll to error
            errorContainer.scrollIntoView({ behavior: 'smooth', block: 'center' });
            
            // Auto-hide after 10 seconds
            setTimeout(() => {
                errorContainer.style.display = 'none';
            }, 10000);
        }
    }
});

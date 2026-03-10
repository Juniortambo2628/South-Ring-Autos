/**
 * Client Authentication JavaScript
 * Handles login and registration forms
 */
const { isValidEmail, isValidPhone, validatePassword, validateAndSanitizeEmail } = require('./utils/validator');

// Login form handler
if (document.getElementById('login-form')) {
    document.getElementById('login-form').addEventListener('submit', function(e) {
        e.preventDefault();
        const formData = new FormData(this);
        
        fetch('../api/client-auth.php?action=login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams(formData)
        })
        .then(response => {
            const contentType = response.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) {
                return response.text().then(text => {
                    console.error('Non-JSON response:', text);
                    throw new Error('Server error. Please try again.');
                });
            }
            return response.json();
        })
        .then(data => {
            if (data.success) {
                window.location.href = 'dashboard.php';
            } else {
                const errorEl = document.getElementById('error-message');
                if (errorEl) {
                    errorEl.textContent = data.message || 'Invalid credentials';
                    errorEl.classList.remove('alert-hidden');
                }
            }
        })
        .catch(error => {
            console.error('Login error:', error);
            const errorEl = document.getElementById('error-message');
            if (errorEl) {
                errorEl.textContent = 'Error: ' + error.message;
                errorEl.style.display = 'block';
            }
        });
    });
}

// Registration form handler
if (document.getElementById('register-form')) {
    document.getElementById('register-form').addEventListener('submit', function(e) {
        e.preventDefault();
        const formData = new FormData(this);
        const name = formData.get('name');
        const email = formData.get('email');
        const phone = formData.get('phone');
        const password = formData.get('password');
        const confirmPassword = formData.get('confirm_password');
        
        // Validate email
        const emailValidation = validateAndSanitizeEmail(email);
        if (!emailValidation.valid) {
            const errorEl = document.getElementById('error-message');
            if (errorEl) {
                errorEl.textContent = emailValidation.error;
                errorEl.style.display = 'block';
            }
            if (typeof toastr !== 'undefined') {
                toastr.error(emailValidation.error);
            }
            return;
        }
        
        // Validate phone (Kenya format)
        if (!isValidPhone(phone)) {
            const errorEl = document.getElementById('error-message');
            if (errorEl) {
                errorEl.textContent = 'Please enter a valid phone number (e.g., +254712345678 or 0712345678)';
                errorEl.style.display = 'block';
            }
            if (typeof toastr !== 'undefined') {
                toastr.error('Please enter a valid phone number');
            }
            return;
        }
        
        // Validate password
        const passwordValidation = validatePassword(password, {
            minLength: 8,
            requireUppercase: true,
            requireLowercase: true,
            requireNumbers: true,
            requireSpecial: false
        });
        
        if (!passwordValidation.valid) {
            const errorEl = document.getElementById('error-message');
            if (errorEl) {
                errorEl.textContent = passwordValidation.errors.join('. ');
                errorEl.style.display = 'block';
            }
            if (typeof toastr !== 'undefined') {
                toastr.error(passwordValidation.errors.join('. '));
            }
            return;
        }
        
        // Check password match
        if (password !== confirmPassword) {
            const errorEl = document.getElementById('error-message');
            if (errorEl) {
                errorEl.textContent = 'Passwords do not match';
                errorEl.style.display = 'block';
            }
            if (typeof toastr !== 'undefined') {
                toastr.error('Passwords do not match');
            }
            return;
        }
        
        const data = {
            name: name.trim(),
            email: emailValidation.email,
            phone: phone.trim(),
            address: formData.get('address') || null,
            password: password
        };
        
        fetch('../api/client-auth.php?action=register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        })
        .then(response => {
            const contentType = response.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) {
                return response.text().then(text => {
                    console.error('Non-JSON response:', text);
                    throw new Error('Server error. Please try again.');
                });
            }
            return response.json();
        })
        .then(data => {
            if (data.success) {
                if (typeof toastr !== 'undefined') {
                    toastr.success('Registration successful! Redirecting...');
                } else {
                    const successEl = document.getElementById('success-message');
                    if (successEl) {
                        successEl.textContent = 'Registration successful! Redirecting...';
                        successEl.classList.remove('alert-hidden');
                    }
                }
                setTimeout(() => {
                    window.location.href = 'dashboard.php';
                }, 1000);
            } else {
                const errorEl = document.getElementById('error-message');
                if (errorEl) {
                    errorEl.textContent = data.message || 'Registration failed';
                    errorEl.classList.remove('alert-hidden');
                }
                if (typeof toastr !== 'undefined') {
                    toastr.error(data.message || 'Registration failed');
                }
            }
        })
        .catch(error => {
            console.error('Registration error:', error);
            const errorEl = document.getElementById('error-message');
            if (errorEl) {
                errorEl.textContent = 'Error: ' + error.message;
                errorEl.style.display = 'block';
            }
        });
    });
}


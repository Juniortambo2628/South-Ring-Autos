/**
 * Admin Login JavaScript
 */
document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('login-form');
    const errorMessage = document.getElementById('error-message');
    
    if (!loginForm) return;
    
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const formData = new FormData(this);
        
        fetch('../api/auth.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams(formData)
        })
        .then(response => {
            // Check if response is actually JSON
            const contentType = response.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) {
                return response.text().then(text => {
                    console.error('Non-JSON response:', text);
                    throw new Error('Server returned non-JSON response. Please check if the API is accessible.');
                });
            }
            return response.json();
        })
        .then(data => {
            if (data.success) {
                sessionStorage.setItem('admin_token', data.token);
                window.location.href = 'dashboard.php';
            } else {
                errorMessage.textContent = data.message || 'Invalid credentials';
                errorMessage.classList.remove('alert-hidden');
                errorMessage.style.display = 'block';
            }
        })
        .catch(error => {
            console.error('Login error:', error);
            errorMessage.textContent = 'Error: ' + error.message;
            errorMessage.classList.remove('alert-hidden');
            errorMessage.style.display = 'block';
        });
    });
});


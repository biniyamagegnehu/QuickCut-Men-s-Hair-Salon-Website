// login.js - Login page JavaScript
document.addEventListener('DOMContentLoaded', function() {
    initLoginPage();
});

// Initialize login page
function initLoginPage() {
    // Setup event listeners
    setupLoginEventListeners();
    
    // Load saved username if remember me was checked
    loadSavedCredentials();
    
    // Check if already logged in
    checkLoginStatus();
}

// Setup event listeners
function setupLoginEventListeners() {
    // Login form submission
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
    
    // Toggle password visibility
    const togglePassword = document.getElementById('togglePassword');
    if (togglePassword) {
        togglePassword.addEventListener('click', togglePasswordVisibility);
    }
    
    // Forgot password link
    const forgotPassword = document.getElementById('forgotPassword');
    if (forgotPassword) {
        forgotPassword.addEventListener('click', handleForgotPassword);
    }
}

// Load saved credentials from localStorage
function loadSavedCredentials() {
    const savedUsername = localStorage.getItem('quickcut-remember-username');
    const rememberMe = localStorage.getItem('quickcut-remember-me') === 'true';
    
    if (savedUsername && rememberMe) {
        document.getElementById('username').value = savedUsername;
        document.getElementById('rememberMe').checked = true;
    }
}

// Check if user is already logged in
function checkLoginStatus() {
    const isLoggedIn = localStorage.getItem('quickcut-admin-loggedin') === 'true';
    
    if (isLoggedIn) {
        // Redirect to dashboard if already logged in
        window.location.href = 'dashboard.html';
    }
}

// Toggle password visibility
function togglePasswordVisibility() {
    const passwordInput = document.getElementById('password');
    const toggleIcon = this.querySelector('i');
    
    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        toggleIcon.classList.remove('fa-eye');
        toggleIcon.classList.add('fa-eye-slash');
    } else {
        passwordInput.type = 'password';
        toggleIcon.classList.remove('fa-eye-slash');
        toggleIcon.classList.add('fa-eye');
    }
}

// Handle login form submission
function handleLogin(e) {
    e.preventDefault();
    
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;
    const rememberMe = document.getElementById('rememberMe').checked;
    
    // Validate credentials
    if (validateCredentials(username, password)) {
        // Save remember me preference
        if (rememberMe) {
            localStorage.setItem('quickcut-remember-username', username);
            localStorage.setItem('quickcut-remember-me', 'true');
        } else {
            localStorage.removeItem('quickcut-remember-username');
            localStorage.setItem('quickcut-remember-me', 'false');
        }
        
        // Set login status
        localStorage.setItem('quickcut-admin-loggedin', 'true');
        localStorage.setItem('quickcut-admin-username', username);
        localStorage.setItem('quickcut-admin-logintime', new Date().toISOString());
        
        // Redirect to dashboard
        window.location.href = 'dashboard.html';
    } else {
        showError('Invalid username or password');
    }
}

// Validate admin credentials
function validateCredentials(username, password) {
    // Get saved credentials or use defaults
    const savedCredentials = JSON.parse(localStorage.getItem('quickcut-admin-credentials')) || {
        username: 'admin',
        password: 'admin123' // Default password
    };
    
    // In a real application, this would be a server-side validation
    // For demo purposes, we're using localStorage
    return username === savedCredentials.username && password === savedCredentials.password;
}

// Handle forgot password
function handleForgotPassword(e) {
    e.preventDefault();
    
    const username = document.getElementById('username').value.trim();
    
    if (!username) {
        showError('Please enter your username first');
        return;
    }
    
    // In a real application, this would send a password reset email
    // For demo purposes, we'll show a simple alert
    showError('Password reset feature is not implemented in this demo. Default credentials: admin / admin123', 'info');
}

// Show error message
function showError(message, type = 'danger') {
    const errorAlert = document.getElementById('errorAlert');
    const errorMessage = document.getElementById('errorMessage');
    
    if (errorAlert && errorMessage) {
        errorMessage.textContent = message;
        errorAlert.className = `alert alert-${type} alert-dismissible fade show`;
        
        // Auto-hide after 5 seconds
        setTimeout(() => {
            hideError();
        }, 5000);
    }
}

// Hide error message
function hideError() {
    const errorAlert = document.getElementById('errorAlert');
    if (errorAlert) {
        errorAlert.classList.remove('show');
    }
}

// Check session timeout (to be called on admin pages)
function checkSessionTimeout() {
    const lastActivity = localStorage.getItem('quickcut-admin-lastactivity');
    const loginTime = localStorage.getItem('quickcut-admin-logintime');
    const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes in milliseconds
    
    if (lastActivity && loginTime) {
        const now = new Date().getTime();
        const lastActivityTime = new Date(lastActivity).getTime();
        const loginTimeValue = new Date(loginTime).getTime();
        
        // Check if session expired
        if (now - lastActivityTime > SESSION_TIMEOUT || now - loginTimeValue > SESSION_TIMEOUT) {
            logout();
        }
    }
}

// Update last activity time
function updateLastActivity() {
    localStorage.setItem('quickcut-admin-lastactivity', new Date().toISOString());
}

// Logout function
function logout() {
    localStorage.removeItem('quickcut-admin-loggedin');
    localStorage.removeItem('quickcut-admin-username');
    localStorage.removeItem('quickcut-admin-lastactivity');
    window.location.href = 'login.html';
}

// Make functions available globally
window.checkSessionTimeout = checkSessionTimeout;
window.updateLastActivity = updateLastActivity;
window.logout = logout;
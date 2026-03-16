// login.js - QuickCut Login Page JavaScript
document.addEventListener('DOMContentLoaded', function() {
    console.log('QuickCut Login Page Initialized');
    
    // ========== CHECK LOGIN STATUS ==========
    checkLoginStatus();
    
    // ========== NAVBAR SCROLL EFFECT ==========
    const navbar = document.getElementById('login-nav');
    
    if (navbar) {
        window.addEventListener('scroll', function() {
            if (window.scrollY > 50) {
                navbar.style.padding = '0.5rem 0';
                navbar.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
                navbar.style.backgroundColor = 'rgba(0, 0, 0, 0.95)';
            } else {
                navbar.style.padding = '1rem 0';
                navbar.style.boxShadow = 'none';
                navbar.style.backgroundColor = '';
            }
        });
        
        window.dispatchEvent(new Event('scroll'));
    }
    
    // ========== FORM VALIDATION ==========
    const loginForm = document.getElementById('login-form');
    
    if (loginForm) {
        const emailInput = document.getElementById('login-email');
        const passwordInput = document.getElementById('login-password');
        const emailError = document.getElementById('email-error');
        const passwordError = document.getElementById('password-error');
        
        // Email validation
        function validateEmail(email) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            return emailRegex.test(email);
        }
        
        // Real-time email validation
        emailInput.addEventListener('blur', function() {
            const email = this.value.trim();
            
            if (!email) {
                showError(emailInput, emailError, 'Email is required');
                return false;
            }
            
            if (!validateEmail(email)) {
                showError(emailInput, emailError, 'Please enter a valid email address');
                return false;
            }
            
            clearError(emailInput, emailError);
            return true;
        });
        
        // Real-time password validation
        passwordInput.addEventListener('blur', function() {
            const password = this.value.trim();
            
            if (!password) {
                showError(passwordInput, passwordError, 'Password is required');
                return false;
            }
            
            if (password.length < 6) {
                showError(passwordInput, passwordError, 'Password must be at least 6 characters');
                return false;
            }
            
            clearError(passwordInput, passwordError);
            return true;
        });
        
        // Clear errors on input
        emailInput.addEventListener('input', function() {
            clearError(emailInput, emailError);
        });
        
        passwordInput.addEventListener('input', function() {
            clearError(passwordInput, passwordError);
        });
        
        // Form submission
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            let isValid = true;
            
            // Validate email
            const email = emailInput.value.trim();
            if (!email) {
                showError(emailInput, emailError, 'Email is required');
                isValid = false;
            } else if (!validateEmail(email)) {
                showError(emailInput, emailError, 'Please enter a valid email address');
                isValid = false;
            }
            
            // Validate password
            const password = passwordInput.value.trim();
            if (!password) {
                showError(passwordInput, passwordError, 'Password is required');
                isValid = false;
            } else if (password.length < 6) {
                showError(passwordInput, passwordError, 'Password must be at least 6 characters');
                isValid = false;
            }
            
            if (isValid) {
                // Simulate login process
                simulateLogin(email);
            }
        });
        
        // Helper functions for error handling
        function showError(input, errorElement, message) {
            input.classList.add('is-invalid');
            errorElement.textContent = message;
            errorElement.style.display = 'block';
            
            // Add shake animation
            input.classList.add('shake');
            setTimeout(() => {
                input.classList.remove('shake');
            }, 500);
        }
        
        function clearError(input, errorElement) {
            input.classList.remove('is-invalid');
            errorElement.textContent = '';
            errorElement.style.display = 'none';
        }
    }
    
    // ========== PASSWORD VISIBILITY TOGGLE ==========
    const togglePasswordBtn = document.getElementById('toggle-password');
    
    if (togglePasswordBtn) {
        togglePasswordBtn.addEventListener('click', function() {
            const passwordInput = document.getElementById('login-password');
            const icon = this.querySelector('i');
            
            if (passwordInput.type === 'password') {
                passwordInput.type = 'text';
                icon.classList.remove('fa-eye');
                icon.classList.add('fa-eye-slash');
                this.setAttribute('aria-label', 'Hide password');
            } else {
                passwordInput.type = 'password';
                icon.classList.remove('fa-eye-slash');
                icon.classList.add('fa-eye');
                this.setAttribute('aria-label', 'Show password');
            }
            
            // Focus back on password input
            passwordInput.focus();
        });
    }
    
    // ========== FORGOT PASSWORD LINK ==========
    const forgotPasswordLink = document.getElementById('forgot-password-link');
    
    if (forgotPasswordLink) {
        forgotPasswordLink.addEventListener('click', function(e) {
            e.preventDefault();
            showForgotPasswordModal();
        });
    }
    
    // ========== SIMULATE LOGIN PROCESS ==========
    function simulateLogin(email) {
        const submitBtn = document.getElementById('login-submit-btn');
        const originalHTML = submitBtn.innerHTML;
        
        // Show loading state
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Logging in...';
        submitBtn.disabled = true;
        
        // Check if user exists in localStorage
        const users = JSON.parse(localStorage.getItem('quickcutUsers') || '[]');
        const userExists = users.some(user => user.email === email);
        
        // Simulate API call delay
        setTimeout(() => {
            if (userExists) {
                // Successful login
                const loginMessage = document.getElementById('login-message');
                loginMessage.innerHTML = '<div class="alert alert-success alert-dismissible fade show" role="alert">' +
                    '<i class="fas fa-check-circle me-2"></i>Login successful! Redirecting...' +
                    '<button type="button" class="btn-close" data-bs-dismiss="alert"></button>' +
                    '</div>';
                
                // Save current user session
                const currentUser = users.find(user => user.email === email);
                sessionStorage.setItem('quickcutCurrentUser', JSON.stringify(currentUser));
                sessionStorage.setItem('lastLogin', new Date().toISOString());
                
                // Setup auto-logout
                setupAutoLogout();
                
                // Redirect after delay
                setTimeout(() => {
                    window.location.href = 'bookappointment.html';
                }, 1500);
            } else {
                // User doesn't exist - show create account suggestion
                const loginMessage = document.getElementById('login-message');
                loginMessage.innerHTML = '<div class="alert alert-warning alert-dismissible fade show" role="alert">' +
                    '<i class="fas fa-exclamation-circle me-2"></i>Account not found. Please create an account.' +
                    '<button type="button" class="btn-close" data-bs-dismiss="alert"></button>' +
                    '</div>';
                
                // Reset button
                submitBtn.innerHTML = originalHTML;
                submitBtn.disabled = false;
            }
        }, 1500);
    }
    
    // ========== LOGOUT FUNCTIONALITY ==========
    function logoutUser() {
        // Clear all session data
        sessionStorage.removeItem('quickcutCurrentUser');
        sessionStorage.removeItem('lastLogin');
        
        // Optional: Clear temporary data
        sessionStorage.clear();
        
        // Immediately redirect to home page
        window.location.href = 'index.html';
    }
    
    // ========== CHECK LOGIN STATUS ==========
    function checkLoginStatus() {
        const currentUser = sessionStorage.getItem('quickcutCurrentUser');
        const currentPage = window.location.pathname.split('/').pop();
        
        // If user is on login page but already logged in, redirect to appointment page
        if (currentUser && currentPage === 'login.html') {
            setTimeout(() => {
                window.location.href = 'bookappointment.html';
            }, 100);
            return;
        }
        
        // If user is not logged in but trying to access protected pages
        const protectedPages = ['bookappointment.html', 'profile.html', 'dashboard.html', 'appointments.html'];
        
        if (!currentUser && protectedPages.includes(currentPage)) {
            // Redirect to login page
            showToast('Access Denied', 'Please login to continue', 'error');
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 1500);
            return;
        }
        
        // Add logout button if user is logged in (for pages other than login)
        if (currentUser && currentPage !== 'login.html') {
            addLogoutButton();
        }
    }
    
    // ========== ADD LOGOUT BUTTON ==========
    function addLogoutButton() {
        // Check if logout button already exists
        if (document.getElementById('logout-btn')) return;
        
        // Find the navbar menu
        const navMenu = document.getElementById('login-nav-menu');
        
        if (navMenu) {
            // Create logout button
            const logoutBtn = document.createElement('li');
            logoutBtn.className = 'nav-item';
            logoutBtn.innerHTML = `
                <a href="#" class="nav-link text-danger" id="logout-btn">
                    <i class="fas fa-sign-out-alt me-1"></i> Logout
                </a>
            `;
            
            // Add to navbar
            navMenu.appendChild(logoutBtn);
            
            // Add logout event listener
            logoutBtn.querySelector('#logout-btn').addEventListener('click', function(e) {
                e.preventDefault();
                showLogoutConfirmation();
            });
            
            // Update login link to dashboard if it exists
            const loginLink = document.querySelector('a[href="login.html"]');
            if (loginLink && currentPage !== 'login.html') {
                loginLink.innerHTML = '<i class="fas fa-user me-1"></i> Dashboard';
                loginLink.href = 'bookappointment.html';
            }
        }
    }
    
    // ========== LOGOUT CONFIRMATION MODAL ==========
    function showLogoutConfirmation() {
        // Create modal if it doesn't exist
        let modal = document.getElementById('logout-confirm-modal');
        
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'logout-confirm-modal';
            modal.className = 'modal fade';
            modal.innerHTML = `
                <div class="modal-dialog modal-dialog-centered">
                    <div class="modal-content border-danger">
                        <div class="modal-header bg-danger text-white">
                            <h5 class="modal-title"><i class="fas fa-sign-out-alt me-2"></i>Confirm Logout</h5>
                            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <div class="alert alert-warning mb-3">
                                <i class="fas fa-exclamation-triangle me-2"></i>
                                Are you sure you want to logout? You will be redirected to the home page.
                            </div>
                            <p class="text-muted mb-0"><small>Any unsaved changes will be lost.</small></p>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                            <button type="button" class="btn btn-danger" id="confirm-logout-btn">Logout Now</button>
                        </div>
                    </div>
                </div>
            `;
            document.body.appendChild(modal);
            
            // Add logout confirmation functionality
            const confirmBtn = modal.querySelector('#confirm-logout-btn');
            confirmBtn.addEventListener('click', function() {
                logoutUser();
            });
        }
        
        // Initialize Bootstrap modal
        const bsModal = new bootstrap.Modal(modal);
        bsModal.show();
    }
    
    // ========== AUTO-LOGOUT FOR INACTIVITY ==========
    function setupAutoLogout() {
        let timeout;
        
        function resetTimer() {
            clearTimeout(timeout);
            // Set timeout for 30 minutes (1800000 ms) of inactivity
            timeout = setTimeout(() => {
                const currentUser = sessionStorage.getItem('quickcutCurrentUser');
                if (currentUser) {
                    showToast('Session Expired', 'You have been logged out due to inactivity', 'warning');
                    setTimeout(logoutUser, 2000);
                }
            }, 1800000); // 30 minutes
        }
        
        // Reset timer on user activity
        ['click', 'mousemove', 'keypress', 'scroll', 'touchstart'].forEach(event => {
            document.addEventListener(event, resetTimer);
        });
        
        // Start the timer
        resetTimer();
    }
    
    // ========== FORCE LOGOUT FUNCTION ==========
    function forceLogout() {
        // Clear all user data
        sessionStorage.clear();
        localStorage.removeItem('quickcutCurrentUser');
        
        // Immediately redirect to home page
        window.location.replace('index.html');
    }
    
    // ========== FORGOT PASSWORD MODAL ==========
    function showForgotPasswordModal() {
        // Create modal if it doesn't exist
        let modal = document.getElementById('forgot-password-modal');
        
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'forgot-password-modal';
            modal.className = 'modal fade';
            modal.innerHTML = `
                <div class="modal-dialog modal-dialog-centered">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">Reset Password</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <div class="alert alert-info mb-3">
                                <i class="fas fa-info-circle me-2"></i>
                                Enter your email address and we'll send you a link to reset your password.
                            </div>
                            
                            <div class="mb-3">
                                <label for="reset-email" class="form-label">Email Address</label>
                                <input type="email" class="form-control" id="reset-email" placeholder="your@email.com">
                                <div class="invalid-feedback" id="reset-email-error"></div>
                            </div>
                            
                            <div class="alert alert-success d-none" id="reset-success">
                                <i class="fas fa-check-circle me-2"></i>
                                Reset link sent! Check your email.
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                            <button type="button" class="btn btn-primary" id="send-reset-link">Send Reset Link</button>
                        </div>
                    </div>
                </div>
            `;
            document.body.appendChild(modal);
            
            // Add functionality to send reset link
            const sendBtn = modal.querySelector('#send-reset-link');
            const resetEmailInput = modal.querySelector('#reset-email');
            const resetEmailError = modal.querySelector('#reset-email-error');
            const resetSuccess = modal.querySelector('#reset-success');
            
            sendBtn.addEventListener('click', function() {
                const email = resetEmailInput.value.trim();
                
                // Basic email validation
                if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
                    resetEmailInput.classList.add('is-invalid');
                    resetEmailError.textContent = 'Please enter a valid email address';
                    return;
                }
                
                // Simulate sending reset link
                sendBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Sending...';
                sendBtn.disabled = true;
                
                setTimeout(() => {
                    resetEmailInput.classList.remove('is-invalid');
                    resetEmailError.textContent = '';
                    resetSuccess.classList.remove('d-none');
                    sendBtn.classList.add('d-none');
                    
                    // Auto-close after 3 seconds
                    setTimeout(() => {
                        const bsModal = bootstrap.Modal.getInstance(modal);
                        bsModal.hide();
                        
                        // Reset modal state
                        setTimeout(() => {
                            resetEmailInput.value = '';
                            resetSuccess.classList.add('d-none');
                            sendBtn.classList.remove('d-none');
                            sendBtn.innerHTML = 'Send Reset Link';
                            sendBtn.disabled = false;
                        }, 300);
                    }, 3000);
                }, 1500);
            });
        }
        
        // Initialize Bootstrap modal
        const bsModal = new bootstrap.Modal(modal);
        bsModal.show();
    }
    
    // ========== BACK TO TOP BUTTON ==========
    const backToTopBtn = document.getElementById('back-to-top');
    
    if (backToTopBtn) {
        window.addEventListener('scroll', function() {
            if (window.scrollY > 300) {
                backToTopBtn.style.display = 'flex';
            } else {
                backToTopBtn.style.display = 'none';
            }
        });
        
        backToTopBtn.addEventListener('click', function() {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }
    
    // ========== SHOW TOAST NOTIFICATION ==========
    function showToast(title, message, type = 'info') {
        // Create toast container if it doesn't exist
        let toastContainer = document.querySelector('.toast-container');
        if (!toastContainer) {
            toastContainer = document.createElement('div');
            toastContainer.className = 'toast-container position-fixed top-0 end-0 p-3';
            document.body.appendChild(toastContainer);
        }
        
        const toastId = 'toast-' + Date.now();
        const toast = document.createElement('div');
        toast.id = toastId;
        toast.className = `toast align-items-center text-bg-${type === 'success' ? 'success' : type === 'error' ? 'danger' : type === 'warning' ? 'warning' : 'info'} border-0`;
        toast.setAttribute('role', 'alert');
        toast.style.zIndex = '9999';
        
        toast.innerHTML = `
            <div class="d-flex">
                <div class="toast-body">
                    <strong>${title}</strong><br>
                    <small>${message}</small>
                </div>
                <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
            </div>
        `;
        
        toastContainer.appendChild(toast);
        
        const bsToast = new bootstrap.Toast(toast, { delay: 4000 });
        bsToast.show();
        
        toast.addEventListener('hidden.bs.toast', function() {
            toast.remove();
        });
    }
    
    // ========== FEATURE CARDS ANIMATION ==========
    const featureCards = document.querySelectorAll('.feature-card');
    
    featureCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-5px)';
            this.style.transition = 'all 0.3s ease';
            this.style.boxShadow = '0 10px 25px rgba(0,0,0,0.1)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
            this.style.boxShadow = '';
        });
    });
    
    // ========== ACTIVE NAV LINK HIGHLIGHT ==========
    function setActiveNavLink() {
        const currentPage = window.location.pathname.split('/').pop();
        const navLinks = document.querySelectorAll('#login-nav-menu .nav-link');
        
        navLinks.forEach(link => {
            link.classList.remove('active');
            
            if (link.getAttribute('href') === currentPage || 
                (currentPage === 'login.html' && link.getAttribute('href') === 'login.html')) {
                link.classList.add('active');
            }
        });
    }
    
    // ========== ADD ANIMATION STYLES ==========
    const animationStyles = document.createElement('style');
    animationStyles.textContent = `
        @keyframes shake {
            0%, 100% { transform: translateX(0); }
            10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
            20%, 40%, 60%, 80% { transform: translateX(5px); }
        }
        
        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(-10px); }
            to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes pulse {
            0% { transform: scale(1); }
            50% { transform: scale(1.05); }
            100% { transform: scale(1); }
        }
        
        .shake {
            animation: shake 0.5s ease;
        }
        
        .feature-card {
            border-radius: 15px;
            background: #fff;
            border: 2px solid transparent;
            transition: all 0.3s ease;
        }
        
        .feature-card:hover {
            border-color: var(--bs-primary);
        }
        
        .feature-icon {
            width: 60px;
            height: 60px;
            background: rgba(var(--bs-primary-rgb), 0.1);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto;
        }
        
        .login-card {
            border-radius: 20px;
            border: none;
            animation: fadeIn 0.5s ease;
        }
        
        .login-card .input-group-text {
            background-color: #f8f9fa;
            border-right: none;
        }
        
        .login-card .form-control {
            border-left: none;
            padding-left: 0;
        }
        
        .login-card .form-control:focus {
            box-shadow: none;
            border-color: #ced4da;
        }
        
        .login-card .form-control:focus + .input-group-text {
            border-color: #86b7fe;
        }
        
        .scroll-to-top {
            position: fixed;
            bottom: 20px;
            right: 20px;
            width: 50px;
            height: 50px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 1000;
            opacity: 0.9;
            transition: all 0.3s ease;
        }
        
        .scroll-to-top:hover {
            opacity: 1;
            transform: translateY(-3px);
        }
        
        .footer-section {
            background: linear-gradient(135deg, #2d3436 0%, #000000 100%);
            color: #fff;
            margin-top: 50px;
        }
        
        .social-links a {
            transition: all 0.3s ease;
        }
        
        .social-links a:hover {
            transform: translateY(-3px);
            color: var(--bs-primary) !important;
        }
        
        /* Logout button styles */
        #logout-btn {
            color: #dc3545 !important;
            transition: all 0.3s ease;
        }
        
        #logout-btn:hover {
            color: #fff !important;
            background-color: #dc3545;
            border-radius: 5px;
            padding: 0.375rem 0.75rem !important;
        }
        
        /* Logout modal styles */
        .border-danger {
            border: 2px solid #dc3545 !important;
        }
        
        /* Responsive adjustments */
        @media (max-width: 768px) {
            .login-card {
                margin: 0 15px;
            }
            
            #welcome-title {
                font-size: 2.5rem;
            }
            
            #logout-btn {
                padding: 0.5rem !important;
                text-align: center;
            }
        }
    `;
    document.head.appendChild(animationStyles);
    
    // ========== INITIALIZATION ==========
    function initializePage() {
        setActiveNavLink();
        
        // Add fade-in effect
        document.body.style.opacity = '0';
        document.body.style.transition = 'opacity 0.5s ease';
        
        setTimeout(() => {
            document.body.style.opacity = '1';
        }, 100);
    }
    
    // Start initialization
    initializePage();
});

// ========== GLOBAL LOGOUT FUNCTIONS ==========
// These can be called from anywhere in your application

/**
 * Immediately logout and redirect to home page
 */
function logoutUserImmediately() {
    // Clear all session data
    sessionStorage.clear();
    
    // Immediately redirect to home page
    window.location.href = 'index.html';
}

/**
 * Logout with confirmation
 */
function logoutWithConfirmation() {
    if (confirm('Are you sure you want to logout? You will be redirected to the home page.')) {
        logoutUserImmediately();
    }
}

/**
 * Check if user is logged in
 * @returns {boolean} True if user is logged in
 */
function isUserLoggedIn() {
    return !!sessionStorage.getItem('quickcutCurrentUser');
}

/**
 * Get current user data
 * @returns {Object|null} User data or null if not logged in
 */
function getCurrentUser() {
    const userData = sessionStorage.getItem('quickcutCurrentUser');
    return userData ? JSON.parse(userData) : null;
}
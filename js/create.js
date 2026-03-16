// create.js - QuickCut Create Account Page JavaScript
document.addEventListener('DOMContentLoaded', function() {
    console.log('QuickCut Create Account Page Initialized');
    
    // ========== NAVBAR SCROLL EFFECT ==========
    const navbar = document.getElementById('create-nav');
    
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
    
    // ========== FORM ELEMENTS ==========
    const createForm = document.getElementById('create-form');
    const firstNameInput = document.getElementById('create-first-name');
    const lastNameInput = document.getElementById('create-last-name');
    const emailInput = document.getElementById('create-email');
    const phoneInput = document.getElementById('create-phone');
    const passwordInput = document.getElementById('create-password');
    const confirmPasswordInput = document.getElementById('create-confirm-password');
    const termsCheckbox = document.getElementById('create-terms-check');
    
    // Error elements
    const firstNameError = document.getElementById('first-name-error');
    const lastNameError = document.getElementById('last-name-error');
    const emailError = document.getElementById('email-error');
    const phoneError = document.getElementById('phone-error');
    const passwordError = document.getElementById('password-error');
    const confirmPasswordError = document.getElementById('confirm-password-error');
    const termsError = document.getElementById('terms-error');
    const createMessage = document.getElementById('create-message');
    
    // ========== VALIDATION FUNCTIONS ==========
    
    // Name validation
    function validateName(name) {
        const nameRegex = /^[A-Za-z\s]{2,50}$/;
        return nameRegex.test(name.trim());
    }
    
    // Email validation
    function validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email.trim());
    }
    
    // Ethiopian phone validation
    function validateEthiopianPhone(phone) {
        const phoneRegex = /^(09|07)\d{8}$/; // Accept 10-digit Ethiopian numbers starting with 09 or 07
        return phoneRegex.test(phone.trim());
    }
    
    // Password validation - Updated to 6-digit numeric password
    function validatePassword(password) {
        const passwordRegex = /^\d{6}$/;
        return passwordRegex.test(password);
    }
    
    // Check if email already exists
    function checkEmailExists(email) {
        const users = JSON.parse(localStorage.getItem('quickcutUsers') || '[]');
        return users.some(user => user.email.toLowerCase() === email.toLowerCase());
    }
    
    // ========== REAL-TIME VALIDATION ==========
    
    // First name validation
    firstNameInput.addEventListener('blur', function() {
        const name = this.value.trim();
        
        if (!name) {
            showError(this, firstNameError, 'First name is required');
            return false;
        }
        
        if (!validateName(name)) {
            showError(this, firstNameError, 'Please enter a valid first name (2-50 letters)');
            return false;
        }
        
        clearError(this, firstNameError);
        return true;
    });
    
    // Last name validation
    lastNameInput.addEventListener('blur', function() {
        const name = this.value.trim();
        
        if (!name) {
            showError(this, lastNameError, 'Last name is required');
            return false;
        }
        
        if (!validateName(name)) {
            showError(this, lastNameError, 'Please enter a valid last name (2-50 letters)');
            return false;
        }
        
        clearError(this, lastNameError);
        return true;
    });
    
    // Email validation
    emailInput.addEventListener('blur', function() {
        const email = this.value.trim();
        
        if (!email) {
            showError(this, emailError, 'Email is required');
            return false;
        }
        
        if (!validateEmail(email)) {
            showError(this, emailError, 'Please enter a valid email address');
            return false;
        }
        
        if (checkEmailExists(email)) {
            showError(this, emailError, 'This email is already registered. Please login instead.');
            return false;
        }
        
        clearError(this, emailError);
        return true;
    });
    
    // Phone validation
    phoneInput.addEventListener('blur', function() {
        const phone = this.value.trim();
        
        if (!phone) {
            showError(this, phoneError, 'Phone number is required');
            return false;
        }
        
        if (!validateEthiopianPhone(phone)) {
            showError(this, phoneError, 'Please enter a valid Ethiopian phone number (09xxxxxxxx)');
            return false;
        }
        
        clearError(this, phoneError);
        return true;
    });
    
    // Password validation - Updated for 6-digit numeric
    passwordInput.addEventListener('blur', function() {
        const password = this.value;
        
        if (!password) {
            showError(this, passwordError, 'Password is required');
            return false;
        }
        
        if (!validatePassword(password)) {
            showError(this, passwordError, 'Password must be exactly 6 digits (numbers only)');
            return false;
        }
        
        clearError(this, passwordError);
        return true;
    });
    
    // Confirm password validation
    confirmPasswordInput.addEventListener('blur', function() {
        const password = passwordInput.value;
        const confirmPassword = this.value;
        
        if (!confirmPassword) {
            showError(this, confirmPasswordError, 'Please confirm your password');
            return false;
        }
        
        if (password !== confirmPassword) {
            showError(this, confirmPasswordError, 'Passwords do not match');
            return false;
        }
        
        clearError(this, confirmPasswordError);
        return true;
    });
    
    // Real-time password match check
    confirmPasswordInput.addEventListener('input', function() {
        const password = passwordInput.value;
        const confirmPassword = this.value;
        
        if (confirmPassword && password !== confirmPassword) {
            this.classList.add('is-invalid');
            confirmPasswordError.textContent = 'Passwords do not match';
            confirmPasswordError.style.display = 'block';
        } else {
            this.classList.remove('is-invalid');
            confirmPasswordError.style.display = 'none';
        }
    });
    
    // Limit password input to numbers only
    passwordInput.addEventListener('input', function() {
        // Allow only numbers
        this.value = this.value.replace(/\D/g, '');
        
        // Limit to 6 digits
        if (this.value.length > 6) {
            this.value = this.value.slice(0, 6);
        }
        
        // Clear error as user types
        this.classList.remove('is-invalid');
        passwordError.style.display = 'none';
    });
    
    // Limit confirm password input to numbers only
    confirmPasswordInput.addEventListener('input', function() {
        // Allow only numbers
        this.value = this.value.replace(/\D/g, '');
        
        // Limit to 6 digits
        if (this.value.length > 6) {
            this.value = this.value.slice(0, 6);
        }
        
        // Clear error as user types
        this.classList.remove('is-invalid');
        confirmPasswordError.style.display = 'none';
    });
    
    // Clear errors on input for other fields
    [firstNameInput, lastNameInput, emailInput, phoneInput].forEach(input => {
        input.addEventListener('input', function() {
            const errorId = this.id.replace('create-', '') + '-error';
            const errorElement = document.getElementById(errorId);
            if (errorElement) {
                this.classList.remove('is-invalid');
                errorElement.style.display = 'none';
            }
        });
    });
    
    // ========== PASSWORD VISIBILITY TOGGLE ==========
    const toggleCreatePasswordBtn = document.getElementById('toggle-create-password');
    const toggleConfirmPasswordBtn = document.getElementById('toggle-confirm-password');
    
    function setupPasswordToggle(buttonId, inputId) {
        const button = document.getElementById(buttonId);
        const input = document.getElementById(inputId);
        
        if (button && input) {
            button.addEventListener('click', function() {
                const icon = this.querySelector('i');
                
                if (input.type === 'password') {
                    input.type = 'text';
                    icon.classList.remove('fa-eye');
                    icon.classList.add('fa-eye-slash');
                    this.setAttribute('aria-label', 'Hide password');
                } else {
                    input.type = 'password';
                    icon.classList.remove('fa-eye-slash');
                    icon.classList.add('fa-eye');
                    this.setAttribute('aria-label', 'Show password');
                }
                
                // Focus back on input
                input.focus();
            });
        }
    }
    
    setupPasswordToggle('toggle-create-password', 'create-password');
    setupPasswordToggle('toggle-confirm-password', 'create-confirm-password');
    
    // ========== FORM SUBMISSION ==========
    createForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        let isValid = true;
        
        // Validate all fields
        isValid = validateField(firstNameInput, firstNameError, 'First name is required') && isValid;
        isValid = validateField(lastNameInput, lastNameError, 'Last name is required') && isValid;
        isValid = validateEmailField() && isValid;
        isValid = validatePhoneField() && isValid;
        isValid = validatePasswordField() && isValid;
        isValid = validateConfirmPasswordField() && isValid;
        
        // Validate terms agreement
        if (!termsCheckbox.checked) {
            termsCheckbox.classList.add('is-invalid');
            termsError.style.display = 'block';
            isValid = false;
        } else {
            termsCheckbox.classList.remove('is-invalid');
            termsError.style.display = 'none';
        }
        
        if (isValid) {
            createAccount();
        }
    });
    
    // ========== HELPER VALIDATION FUNCTIONS ==========
    function validateField(input, errorElement, requiredMessage) {
        const value = input.value.trim();
        
        if (!value) {
            showError(input, errorElement, requiredMessage);
            return false;
        }
        
        return true;
    }
    
    function validateEmailField() {
        const email = emailInput.value.trim();
        
        if (!email) {
            showError(emailInput, emailError, 'Email is required');
            return false;
        }
        
        if (!validateEmail(email)) {
            showError(emailInput, emailError, 'Please enter a valid email address');
            return false;
        }
        
        if (checkEmailExists(email)) {
            showError(emailInput, emailError, 'This email is already registered. Please login instead.');
            return false;
        }
        
        return true;
    }
    
    function validatePhoneField() {
        const phone = phoneInput.value.trim();
        
        if (!phone) {
            showError(phoneInput, phoneError, 'Phone number is required');
            return false;
        }
        
        if (!validateEthiopianPhone(phone)) {
            showError(phoneInput, phoneError, 'Please enter a valid Ethiopian phone number (09xxxxxxxx)');
            return false;
        }
        
        return true;
    }
    
    function validatePasswordField() {
        const password = passwordInput.value;
        
        if (!password) {
            showError(passwordInput, passwordError, 'Password is required');
            return false;
        }
        
        // Updated validation for 6-digit numeric password
        if (!validatePassword(password)) {
            showError(passwordInput, passwordError, 'Password must be exactly 6 digits (numbers only)');
            return false;
        }
        
        return true;
    }
    
    function validateConfirmPasswordField() {
        const password = passwordInput.value;
        const confirmPassword = confirmPasswordInput.value;
        
        if (!confirmPassword) {
            showError(confirmPasswordInput, confirmPasswordError, 'Please confirm your password');
            return false;
        }
        
        if (password !== confirmPassword) {
            showError(confirmPasswordInput, confirmPasswordError, 'Passwords do not match');
            return false;
        }
        
        return true;
    }
    
    // ========== ERROR HANDLING FUNCTIONS ==========
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
    
    // ========== CREATE ACCOUNT FUNCTION ==========
    function createAccount() {
        const submitBtn = document.getElementById('create-account-btn');
        const originalHTML = submitBtn.innerHTML;
        
        // Show loading state
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Creating Account...';
        submitBtn.disabled = true;
        
        // Get form data
        const userData = {
            id: Date.now().toString(),
            firstName: firstNameInput.value.trim(),
            lastName: lastNameInput.value.trim(),
            fullName: `${firstNameInput.value.trim()} ${lastNameInput.value.trim()}`,
            email: emailInput.value.trim().toLowerCase(),
            phone: phoneInput.value.trim(),
            password: passwordInput.value, // Note: Now stored as 6-digit number
            marketingOptIn: document.getElementById('create-marketing-check').checked,
            createdAt: new Date().toISOString(),
            lastLogin: null,
            bookings: []
        };
        
        // Simulate API call delay
        setTimeout(() => {
            // Save user to localStorage
            const users = JSON.parse(localStorage.getItem('quickcutUsers') || '[]');
            users.push(userData);
            localStorage.setItem('quickcutUsers', JSON.stringify(users));
            
            // Save current user session
            sessionStorage.setItem('quickcutCurrentUser', JSON.stringify(userData));
            
            // Show success message
            createMessage.innerHTML = `
                <div class="alert alert-success alert-dismissible fade show" role="alert">
                    <i class="fas fa-check-circle me-2"></i>
                    Account created successfully! Welcome to QuickCut. Redirecting...
                    <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
                </div>
            `;
            
            // Scroll to success message
            createMessage.scrollIntoView({ behavior: 'smooth', block: 'center' });
            
            // Show welcome notification
            showToast('Welcome to QuickCut!', 'Your account has been created successfully.', 'success');
            
            // Redirect to booking page after delay
            setTimeout(() => {
                window.location.href = 'bookappointment.html';
            }, 2000);
            
            // Reset button (just in case)
            submitBtn.innerHTML = originalHTML;
            submitBtn.disabled = false;
        }, 1500);
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
        toast.className = `toast align-items-center text-bg-${type === 'success' ? 'success' : type === 'error' ? 'danger' : 'info'} border-0`;
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
    
    // ========== BENEFIT ITEMS ANIMATION ==========
    const benefitItems = document.querySelectorAll('.benefit-item');
    
    benefitItems.forEach(item => {
        item.addEventListener('mouseenter', function() {
            const icon = this.querySelector('.benefit-icon i');
            icon.style.transform = 'scale(1.1)';
            icon.style.transition = 'transform 0.3s ease';
        });
        
        item.addEventListener('mouseleave', function() {
            const icon = this.querySelector('.benefit-icon i');
            icon.style.transform = 'scale(1)';
        });
    });
    
    // ========== ACTIVE NAV LINK HIGHLIGHT ==========
    function setActiveNavLink() {
        const currentPage = window.location.pathname.split('/').pop();
        const navLinks = document.querySelectorAll('#create-nav-menu .nav-link');
        
        navLinks.forEach(link => {
            link.classList.remove('active');
            
            if (link.getAttribute('href') === currentPage || 
                (currentPage === 'create.html' && link.getAttribute('href') === 'create.html')) {
                link.classList.add('active');
            }
        });
    }
    
    // ========== STATISTICS ANIMATION ==========
    function animateStatistics() {
        const statNumbers = document.querySelectorAll('.stat-number');
        
        statNumbers.forEach(stat => {
            const originalText = stat.textContent;
            const targetNumber = parseInt(originalText) || 0;
            let currentNumber = 0;
            
            // Only animate if it's a number
            if (targetNumber > 0) {
                const increment = Math.ceil(targetNumber / 50);
                const interval = setInterval(() => {
                    currentNumber += increment;
                    if (currentNumber >= targetNumber) {
                        currentNumber = targetNumber;
                        clearInterval(interval);
                    }
                    stat.textContent = currentNumber.toLocaleString() + '+';
                }, 30);
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
        
        .benefit-icon {
            width: 60px;
            height: 60px;
            background: rgba(var(--bs-primary-rgb), 0.1);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
        }
        
        .benefit-item {
            padding: 15px;
            border-radius: 10px;
            transition: all 0.3s ease;
        }
        
        .benefit-item:hover {
            background: rgba(var(--bs-primary-rgb), 0.05);
            transform: translateX(5px);
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
        
        .stat-number {
            font-size: 2rem;
            font-weight: bold;
            color: var(--bs-primary);
        }
        
        .stat-label {
            font-size: 0.9rem;
        }
        
        /* Responsive adjustments */
        @media (max-width: 768px) {
            .login-card {
                margin: 0 15px;
            }
            
            #benefits-title {
                font-size: 2.5rem;
            }
            
            .benefit-item {
                padding: 10px;
            }
        }
    `;
    document.head.appendChild(animationStyles);
    
    // ========== INITIALIZATION ==========
    function initializePage() {
        setActiveNavLink();
        
        // Animate statistics after a delay
        setTimeout(animateStatistics, 1000);
        
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
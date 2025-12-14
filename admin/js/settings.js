// settings.js - Settings specific JavaScript
document.addEventListener('DOMContentLoaded', function() {
    initSettings();
});

// Initialize settings
function initSettings() {
    loadSettings();
    setupSettingsEventListeners();
    setupPasswordChangeListeners(); // Add this line
}

// Add new function for password change listeners
function setupPasswordChangeListeners() {
    // Password change form
    const changePasswordForm = document.getElementById('changePasswordForm');
    if (changePasswordForm) {
        changePasswordForm.addEventListener('submit', handlePasswordChange);
    }
    
    // Toggle password visibility buttons
    document.getElementById('toggleCurrentPassword')?.addEventListener('click', function() {
        togglePasswordVisibility('current-password', this);
    });
    
    document.getElementById('toggleNewPassword')?.addEventListener('click', function() {
        togglePasswordVisibility('new-password', this);
    });
    
    document.getElementById('toggleConfirmPassword')?.addEventListener('click', function() {
        togglePasswordVisibility('confirm-password', this);
    });
    
    // Password strength checker
    const newPasswordInput = document.getElementById('new-password');
    if (newPasswordInput) {
        newPasswordInput.addEventListener('input', checkPasswordStrength);
    }
}

// Toggle password visibility
function togglePasswordVisibility(inputId, button) {
    const input = document.getElementById(inputId);
    const icon = button.querySelector('i');
    
    if (input.type === 'password') {
        input.type = 'text';
        icon.classList.remove('fa-eye');
        icon.classList.add('fa-eye-slash');
    } else {
        input.type = 'password';
        icon.classList.remove('fa-eye-slash');
        icon.classList.add('fa-eye');
    }
}

// Check password strength
function checkPasswordStrength() {
    const password = document.getElementById('new-password').value;
    const strengthBar = document.getElementById('password-strength-bar');
    const strengthText = document.getElementById('password-strength-text');
    
    if (!strengthBar || !strengthText) return;
    
    // Reset
    strengthBar.className = 'strength-bar';
    strengthText.textContent = '';
    
    if (password.length === 0) return;
    
    // Calculate strength
    let strength = 0;
    let text = '';
    let className = '';
    
    // Length check
    if (password.length >= 8) strength += 25;
    
    // Lowercase check
    if (/[a-z]/.test(password)) strength += 25;
    
    // Uppercase check
    if (/[A-Z]/.test(password)) strength += 25;
    
    // Number/Special character check
    if (/[0-9]/.test(password) || /[^A-Za-z0-9]/.test(password)) strength += 25;
    
    // Determine strength level
    if (strength < 50) {
        text = 'Weak password';
        className = 'weak';
    } else if (strength < 75) {
        text = 'Fair password';
        className = 'fair';
    } else {
        text = 'Strong password';
        className = 'good';
    }
    
    // Update display
    strengthBar.classList.add(className);
    strengthText.textContent = text;
    strengthText.className = `form-text ${className === 'weak' ? 'text-danger' : className === 'fair' ? 'text-warning' : 'text-success'}`;
}

// Handle password change
function handlePasswordChange(e) {
    e.preventDefault();
    
    const currentPassword = document.getElementById('current-password').value;
    const newPassword = document.getElementById('new-password').value;
    const confirmPassword = document.getElementById('confirm-password').value;
    
    // Get current credentials
    const currentCredentials = JSON.parse(localStorage.getItem('quickcut-admin-credentials')) || {
        username: 'admin',
        password: 'admin123'
    };
    
    // Validate current password
    if (currentPassword !== currentCredentials.password) {
        showPasswordError('Current password is incorrect');
        return;
    }
    
    // Validate new password
    if (newPassword.length < 6) {
        showPasswordError('New password must be at least 6 characters long');
        return;
    }
    
    // Validate password match
    if (newPassword !== confirmPassword) {
        showPasswordError('New passwords do not match');
        return;
    }
    
    // Check if new password is same as current
    if (newPassword === currentCredentials.password) {
        showPasswordError('New password must be different from current password');
        return;
    }
    
    // Update password
    currentCredentials.password = newPassword;
    localStorage.setItem('quickcut-admin-credentials', JSON.stringify(currentCredentials));
    
    // Show success message
    showPasswordSuccess('Password changed successfully!');
    
    // Reset form
    document.getElementById('changePasswordForm').reset();
    
    // Reset strength meter
    const strengthBar = document.getElementById('password-strength-bar');
    const strengthText = document.getElementById('password-strength-text');
    if (strengthBar) strengthBar.className = 'strength-bar';
    if (strengthText) strengthText.textContent = '';
}

// Show password error
function showPasswordError(message) {
    // Create error alert if it doesn't exist
    let errorAlert = document.getElementById('passwordErrorAlert');
    
    if (!errorAlert) {
        errorAlert = document.createElement('div');
        errorAlert.id = 'passwordErrorAlert';
        errorAlert.className = 'alert alert-danger alert-dismissible fade show';
        errorAlert.innerHTML = `
            <div class="d-flex align-items-center">
                <i class="fas fa-exclamation-circle me-2"></i>
                <span id="passwordErrorMessage"></span>
            </div>
            <button type="button" class="btn-close" onclick="this.parentElement.classList.remove('show')"></button>
        `;
        
        const form = document.getElementById('changePasswordForm');
        if (form) {
            form.parentNode.insertBefore(errorAlert, form);
        }
    }
    
    document.getElementById('passwordErrorMessage').textContent = message;
    errorAlert.classList.add('show');
    
    // Auto-hide after 5 seconds
    setTimeout(() => {
        errorAlert.classList.remove('show');
    }, 5000);
}

// Show password success
function showPasswordSuccess(message) {
    // Create success alert if it doesn't exist
    let successAlert = document.getElementById('passwordSuccessAlert');
    
    if (!successAlert) {
        successAlert = document.createElement('div');
        successAlert.id = 'passwordSuccessAlert';
        successAlert.className = 'alert alert-success alert-dismissible fade show';
        successAlert.innerHTML = `
            <div class="d-flex align-items-center">
                <i class="fas fa-check-circle me-2"></i>
                <span id="passwordSuccessMessage"></span>
            </div>
            <button type="button" class="btn-close" onclick="this.parentElement.classList.remove('show')"></button>
        `;
        
        const form = document.getElementById('changePasswordForm');
        if (form) {
            form.parentNode.insertBefore(successAlert, form);
        }
    }
    
    document.getElementById('passwordSuccessMessage').textContent = message;
    successAlert.classList.add('show');
    
    // Auto-hide after 5 seconds
    setTimeout(() => {
        successAlert.classList.remove('show');
    }, 5000);
}

// Load settings from localStorage
function loadSettings() {
    // Load general settings
    const savedSettings = JSON.parse(localStorage.getItem('quickcut-settings')) || {};
    
    if (Object.keys(savedSettings).length > 0) {
        document.getElementById('shop-name').value = savedSettings.shopName || 'QuickCut Barber Shop';
        document.getElementById('shop-phone').value = savedSettings.shopPhone || '0912345678';
        document.getElementById('shop-address').value = savedSettings.shopAddress || '123 Main Street, Downtown';
        document.getElementById('opening-time').value = savedSettings.openingTime || '09:00';
        document.getElementById('closing-time').value = savedSettings.closingTime || '20:00';
        document.getElementById('slot-duration').value = savedSettings.slotDuration || 30;
        document.getElementById('max-appointments').value = savedSettings.maxAppointments || 3;
        document.getElementById('shop-description').value = savedSettings.shopDescription || 'Skip the wait. Get the cut. QuickCut makes hair appointments fast, easy, and convenient.';
    }
    
    // Load notification settings
    const notificationSettings = JSON.parse(localStorage.getItem('quickcut-notifications')) || {};
    
    document.getElementById('email-notifications').checked = notificationSettings.email !== false;
    document.getElementById('sms-notifications').checked = notificationSettings.sms !== false;
    document.getElementById('appointment-reminders').checked = notificationSettings.reminders !== false;
}

// Setup settings event listeners
function setupSettingsEventListeners() {
    // General settings form
    const settingsForm = document.getElementById('settings-form');
    if (settingsForm) {
        settingsForm.addEventListener('submit', saveGeneralSettings);
    }
    
    // Notification settings button
    const saveNotificationsBtn = document.getElementById('save-notifications');
    if (saveNotificationsBtn) {
        saveNotificationsBtn.addEventListener('click', saveNotificationSettings);
    }
    
    // System status check button
    const checkStatusBtn = document.getElementById('check-status');
    if (checkStatusBtn) {
        checkStatusBtn.addEventListener('click', checkSystemStatus);
    }
}

// Save general settings
function saveGeneralSettings(e) {
    e.preventDefault();
    
    const settings = {
        shopName: document.getElementById('shop-name').value,
        shopPhone: document.getElementById('shop-phone').value,
        shopAddress: document.getElementById('shop-address').value,
        openingTime: document.getElementById('opening-time').value,
        closingTime: document.getElementById('closing-time').value,
        slotDuration: parseInt(document.getElementById('slot-duration').value),
        maxAppointments: parseInt(document.getElementById('max-appointments').value),
        shopDescription: document.getElementById('shop-description').value
    };
    
    // Save to localStorage
    localStorage.setItem('quickcut-settings', JSON.stringify(settings));
    
    showNotification('Settings saved successfully!', 'success');
}

// Save notification settings
function saveNotificationSettings() {
    const notificationSettings = {
        email: document.getElementById('email-notifications').checked,
        sms: document.getElementById('sms-notifications').checked,
        reminders: document.getElementById('appointment-reminders').checked
    };
    
    // Save to localStorage
    localStorage.setItem('quickcut-notifications', JSON.stringify(notificationSettings));
    
    showNotification('Notification settings saved!', 'success');
}

// Check system status
function checkSystemStatus() {
    // Simulate system check with animation
    const statusIndicators = document.querySelectorAll('.status-indicator');
    
    statusIndicators.forEach(indicator => {
        indicator.classList.remove('active');
        indicator.style.animation = 'none';
    });
    
    setTimeout(() => {
        statusIndicators.forEach((indicator, index) => {
            setTimeout(() => {
                indicator.classList.add('active');
                indicator.style.animation = 'pulse 2s infinite';
            }, index * 300);
        });
    }, 100);
    
    showNotification('System status checked - All systems operational', 'success');
}
// settings.js - Settings specific JavaScript
document.addEventListener('DOMContentLoaded', function() {
    initSettings();
});

// Initialize settings
function initSettings() {
    loadSettings();
    setupSettingsEventListeners();
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
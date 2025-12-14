// common.js - Common JavaScript functions for all admin pages
document.addEventListener('DOMContentLoaded', function() {
    initCommonFeatures();
});

// Global data storage
let appointments = JSON.parse(localStorage.getItem('quickcut-appointments')) || [];
let barbers = JSON.parse(localStorage.getItem('quickcut-barbers')) || [];
let services = JSON.parse(localStorage.getItem('quickcut-services')) || [];
let customers = JSON.parse(localStorage.getItem('quickcut-customers')) || [];
let notifications = JSON.parse(localStorage.getItem('quickcut-notifications')) || [];
let currentPage = window.location.pathname.split('/').pop().replace('.html', '');

// Initialize common features
function initCommonFeatures() {
    // Load sample data if empty
    if (appointments.length === 0) loadSampleData();
    
    // Setup event listeners
    setupCommonEventListeners();
    
    // Update date and time
    updateDateTime();
    setInterval(updateDateTime, 1000);
    
    // Mark active nav link
    markActiveNavLink();
}

// Load sample data
function loadSampleData() {
    // Sample appointments
    appointments = [
        { id: 1, customer: 'John Smith', phone: '0912345678', service: 'Haircut', barber: 'John Master', date: new Date().toISOString().split('T')[0], time: '10:30 AM', amount: 250, status: 'scheduled', duration: 30, notes: 'Regular haircut' },
        { id: 2, customer: 'Mike Johnson', phone: '0923456789', service: 'Beard Trim', barber: 'Mike Style', date: new Date().toISOString().split('T')[0], time: '11:15 AM', amount: 150, status: 'confirmed', duration: 20, notes: 'Precision beard shaping' },
        { id: 3, customer: 'Robert Davis', phone: '0934567890', service: 'Premium Package', barber: 'Alex Cut', date: new Date().toISOString().split('T')[0], time: '12:00 PM', amount: 350, status: 'in-progress', duration: 60, notes: 'Complete grooming' }
    ];

    // Sample barbers
    barbers = [
        { id: 1, firstName: 'John', lastName: 'Master', email: 'john@quickcut.com', phone: '0911111111', specialty: 'Haircut Specialist', rate: 300, status: 'active', appointments: 24, earnings: 6000, rating: 4.9 },
        { id: 2, firstName: 'Mike', lastName: 'Style', email: 'mike@quickcut.com', phone: '0922222222', specialty: 'Beard Specialist', rate: 200, status: 'active', appointments: 18, earnings: 3600, rating: 4.7 }
    ];

    // Sample services
    services = [
        { id: 1, name: 'Classic Haircut', description: 'Professional men\'s haircut with styling', duration: 30, price: 250, category: 'haircut', status: 'active' },
        { id: 2, name: 'Beard Trim', description: 'Precision beard shaping and trim', duration: 20, price: 150, category: 'beard', status: 'active' }
    ];

    // Sample customers
    customers = [
        { id: 1001, firstName: 'John', lastName: 'Smith', email: 'john.smith@email.com', phone: '0912345678', address: '123 Main St, Addis Ababa', appointments: 12, totalSpent: 3000, status: 'active', notes: 'Regular customer' },
        { id: 1002, firstName: 'Mike', lastName: 'Johnson', email: 'mike.j@email.com', phone: '0923456789', address: '456 Center Ave, Addis Ababa', appointments: 8, totalSpent: 1200, status: 'active', notes: 'Beard specialist preferred' }
    ];

    // Save to localStorage
    saveAllData();
}

// Save all data to localStorage
function saveAllData() {
    localStorage.setItem('quickcut-appointments', JSON.stringify(appointments));
    localStorage.setItem('quickcut-barbers', JSON.stringify(barbers));
    localStorage.setItem('quickcut-services', JSON.stringify(services));
    localStorage.setItem('quickcut-customers', JSON.stringify(customers));
}

// Setup common event listeners
function setupCommonEventListeners() {
    // Sidebar toggle for mobile
    const sidebarToggle = document.querySelector('.sidebar-toggle');
    if (sidebarToggle) {
        sidebarToggle.addEventListener('click', function() {
            document.querySelector('.sidebar').classList.toggle('active');
        });
    }

    // Fullscreen toggle
    const fullscreenBtn = document.querySelector('.fullscreen-btn');
    if (fullscreenBtn) {
        fullscreenBtn.addEventListener('click', toggleFullscreen);
    }

    // Global search
    const globalSearch = document.getElementById('global-search');
    if (globalSearch) {
        globalSearch.addEventListener('input', function(e) {
            performGlobalSearch(e.target.value);
        });
    }

    // Notification button
    const notificationBtn = document.querySelector('.notification-btn');
    if (notificationBtn) {
        notificationBtn.addEventListener('click', showNotificationsModal);
    }
}

// Mark active navigation link
function markActiveNavLink() {
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (href === `${currentPage}.html` || 
            (currentPage === 'dashboard' && href === 'dashboard.html') ||
            (currentPage === '' && href === 'dashboard.html')) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
}

// Update date and time
function updateDateTime() {
    const now = new Date();
    const dateOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const timeOptions = { hour: '2-digit', minute: '2-digit', second: '2-digit' };
    
    const currentDate = document.getElementById('current-date');
    const currentTime = document.getElementById('current-time');
    
    if (currentDate) {
        currentDate.textContent = now.toLocaleDateString('en-US', dateOptions);
    }
    if (currentTime) {
        currentTime.textContent = now.toLocaleTimeString('en-US', timeOptions);
    }
}

// Toggle fullscreen
function toggleFullscreen() {
    const fullscreenBtn = document.querySelector('.fullscreen-btn');
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen();
        fullscreenBtn.innerHTML = '<i class="fas fa-compress"></i>';
    } else {
        document.exitFullscreen();
        fullscreenBtn.innerHTML = '<i class="fas fa-expand"></i>';
    }
}

// Show notification
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'warning' ? 'exclamation-triangle' : type === 'danger' ? 'times-circle' : 'info-circle'}"></i>
            <span>${message}</span>
        </div>
        <button class="notification-close">
            <i class="fas fa-times"></i>
        </button>
    `;

    document.body.appendChild(notification);

    // Close button
    notification.querySelector('.notification-close').addEventListener('click', function() {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    });

    // Auto-remove after 5 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }
    }, 5000);
}

// Perform global search
function performGlobalSearch(query) {
    if (query.length < 2) return;
    
    const results = [];
    
    // Search appointments
    appointments.forEach(app => {
        if (app.customer.toLowerCase().includes(query.toLowerCase()) || 
            app.phone.includes(query) ||
            app.service.toLowerCase().includes(query.toLowerCase())) {
            results.push({ type: 'appointment', data: app });
        }
    });
    
    // Search customers
    customers.forEach(customer => {
        if (customer.firstName.toLowerCase().includes(query.toLowerCase()) ||
            customer.lastName.toLowerCase().includes(query.toLowerCase()) ||
            customer.phone.includes(query) ||
            customer.email.toLowerCase().includes(query.toLowerCase())) {
            results.push({ type: 'customer', data: customer });
        }
    });
    
    // Search barbers
    barbers.forEach(barber => {
        if (barber.firstName.toLowerCase().includes(query.toLowerCase()) ||
            barber.lastName.toLowerCase().includes(query.toLowerCase()) ||
            barber.phone.includes(query) ||
            barber.specialty.toLowerCase().includes(query.toLowerCase())) {
            results.push({ type: 'barber', data: barber });
        }
    });
    
    if (results.length > 0) {
        showNotification(`Found ${results.length} results for "${query}"`, 'info');
    } else {
        showNotification(`No results found for "${query}"`, 'warning');
    }
}

// Show notifications modal
function showNotificationsModal() {
    alert(`You have ${notifications.length} notifications`);
    
    // Clear notifications
    document.getElementById('notification-count').textContent = '0';
}

// Update appointment status
function updateAppointmentStatus(appointmentId, newStatus) {
    const appointment = appointments.find(a => a.id === appointmentId);
    if (appointment) {
        const oldStatus = appointment.status;
        appointment.status = newStatus;
        saveAllData();
        showNotification(`Appointment #${appointmentId} status changed to ${newStatus}`, 'success');
    }
}

// Get appointments for today
function getTodayAppointments() {
    const today = new Date().toISOString().split('T')[0];
    return appointments.filter(a => a.date === today).sort((a, b) => a.time.localeCompare(b.time));
}

// Format currency
function formatCurrency(amount) {
    return `ETB ${amount.toLocaleString()}`;
}

// Export to CSV
function exportToCSV(data, filename) {
    if (data.length === 0) {
        showNotification('No data to export', 'warning');
        return;
    }
    
    const headers = Object.keys(data[0]);
    const csvRows = [
        headers.join(','),
        ...data.map(row => headers.map(header => JSON.stringify(row[header])).join(','))
    ];
    
    const csvString = csvRows.join('\n');
    const blob = new Blob([csvString], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    
    showNotification(`${filename} exported successfully!`, 'success');
}

// Make functions available globally
window.showNotification = showNotification;
window.updateAppointmentStatus = updateAppointmentStatus;
window.formatCurrency = formatCurrency;
window.exportToCSV = exportToCSV;
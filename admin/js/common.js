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
    // Skip authentication check for login page
    if (window.location.pathname.includes('login.html')) {
        return;
    }
    
    // Check if user is logged in
    const isLoggedIn = localStorage.getItem('quickcut-admin-loggedin') === 'true';
    if (!isLoggedIn) {
        window.location.href = 'login.html';
        return;
    }
    
    // Check session timeout
    checkSessionTimeout();
    updateLastActivity();
    
    // Setup activity tracker
    document.addEventListener('click', updateLastActivity);
    document.addEventListener('keypress', updateLastActivity);
    document.addEventListener('scroll', updateLastActivity);
    
    // Load sample data if empty
    if (appointments.length === 0) loadSampleData();
    
    // Setup event listeners
    setupCommonEventListeners();
    
    // Update date and time
    updateDateTime();
    setInterval(updateDateTime, 1000);
    
    // Mark active nav link
    markActiveNavLink();
    
    // Show welcome notification (only once per session)
    showWelcomeNotification();
}

// Load sample data
function loadSampleData() {
    // Sample appointments
    appointments = [
        { 
            id: 1, 
            customer: 'John Smith', 
            phone: '0912345678', 
            service: 'Classic Haircut', 
            barber: 'John Master', 
            date: new Date().toISOString().split('T')[0], 
            time: '10:30 AM', 
            amount: 250, 
            status: 'scheduled', 
            duration: 30, 
            notes: 'Regular haircut' 
        },
        { 
            id: 2, 
            customer: 'Mike Johnson', 
            phone: '0923456789', 
            service: 'Beard Trim', 
            barber: 'Mike Style', 
            date: new Date().toISOString().split('T')[0], 
            time: '11:15 AM', 
            amount: 150, 
            status: 'confirmed', 
            duration: 20, 
            notes: 'Precision beard shaping' 
        },
        { 
            id: 3, 
            customer: 'Robert Davis', 
            phone: '0934567890', 
            service: 'Premium Package', 
            barber: 'Alex Cut', 
            date: new Date().toISOString().split('T')[0], 
            time: '12:00 PM', 
            amount: 350, 
            status: 'in-progress', 
            duration: 60, 
            notes: 'Complete grooming' 
        },
        { 
            id: 4, 
            customer: 'James Wilson', 
            phone: '0945678901', 
            service: 'Classic Haircut', 
            barber: 'John Master', 
            date: new Date().toISOString().split('T')[0], 
            time: '1:30 PM', 
            amount: 250, 
            status: 'scheduled', 
            duration: 30, 
            notes: '' 
        },
        { 
            id: 5, 
            customer: 'David Brown', 
            phone: '0956789012', 
            service: 'Beard Trim', 
            barber: 'Mike Style', 
            date: new Date().toISOString().split('T')[0], 
            time: '2:45 PM', 
            amount: 150, 
            status: 'scheduled', 
            duration: 20, 
            notes: '' 
        }
    ];

    // Sample barbers
    barbers = [
        { 
            id: 1, 
            firstName: 'John', 
            lastName: 'Master', 
            email: 'john@quickcut.com', 
            phone: '0911111111', 
            specialty: 'Haircut Specialist', 
            rate: 300, 
            status: 'active', 
            appointments: 24, 
            earnings: 6000, 
            rating: 4.9 
        },
        { 
            id: 2, 
            firstName: 'Mike', 
            lastName: 'Style', 
            email: 'mike@quickcut.com', 
            phone: '0922222222', 
            specialty: 'Beard Specialist', 
            rate: 200, 
            status: 'active', 
            appointments: 18, 
            earnings: 3600, 
            rating: 4.7 
        },
        { 
            id: 3, 
            firstName: 'Alex', 
            lastName: 'Cut', 
            email: 'alex@quickcut.com', 
            phone: '0933333333', 
            specialty: 'Modern Styles', 
            rate: 350, 
            status: 'active', 
            appointments: 30, 
            earnings: 10500, 
            rating: 5.0 
        },
        { 
            id: 4, 
            firstName: 'David', 
            lastName: 'Trim', 
            email: 'david@quickcut.com', 
            phone: '0944444444', 
            specialty: 'Classic Cuts', 
            rate: 250, 
            status: 'inactive', 
            appointments: 0, 
            earnings: 0, 
            rating: 4.8 
        }
    ];

    // Sample services
    services = [
        { 
            id: 1, 
            name: 'Classic Haircut', 
            description: 'Professional men\'s haircut with styling', 
            duration: 30, 
            price: 250, 
            category: 'haircut', 
            status: 'active' 
        },
        { 
            id: 2, 
            name: 'Beard Trim', 
            description: 'Precision beard shaping and trim', 
            duration: 20, 
            price: 150, 
            category: 'beard', 
            status: 'active' 
        },
        { 
            id: 3, 
            name: 'Premium Package', 
            description: 'Haircut + Beard trim + Facial', 
            duration: 60, 
            price: 350, 
            category: 'package', 
            status: 'active' 
        },
        { 
            id: 4, 
            name: 'Kids Haircut', 
            description: 'Special haircut for children', 
            duration: 25, 
            price: 200, 
            category: 'haircut', 
            status: 'active' 
        },
        { 
            id: 5, 
            name: 'Hair Wash', 
            description: 'Shampoo and conditioning', 
            duration: 15, 
            price: 100, 
            category: 'other', 
            status: 'inactive' 
        }
    ];

    // Sample customers
    customers = [
        { 
            id: 1001, 
            firstName: 'John', 
            lastName: 'Smith', 
            email: 'john.smith@email.com', 
            phone: '0912345678', 
            address: '123 Main St, Addis Ababa', 
            appointments: 12, 
            totalSpent: 3000, 
            status: 'active', 
            notes: 'Regular customer, prefers John Master' 
        },
        { 
            id: 1002, 
            firstName: 'Mike', 
            lastName: 'Johnson', 
            email: 'mike.j@email.com', 
            phone: '0923456789', 
            address: '456 Center Ave, Addis Ababa', 
            appointments: 8, 
            totalSpent: 1200, 
            status: 'active', 
            notes: 'Beard specialist preferred' 
        },
        { 
            id: 1003, 
            firstName: 'Robert', 
            lastName: 'Davis', 
            email: 'robert.d@email.com', 
            phone: '0934567890', 
            address: '789 North Rd, Addis Ababa', 
            appointments: 5, 
            totalSpent: 1750, 
            status: 'active', 
            notes: 'Premium package monthly' 
        },
        { 
            id: 1004, 
            firstName: 'James', 
            lastName: 'Wilson', 
            email: 'james.w@email.com', 
            phone: '0945678901', 
            address: '321 South St, Addis Ababa', 
            appointments: 3, 
            totalSpent: 750, 
            status: 'new', 
            notes: 'New customer' 
        },
        { 
            id: 1005, 
            firstName: 'David', 
            lastName: 'Brown', 
            email: 'david.b@email.com', 
            phone: '0956789012', 
            address: '654 West Ave, Addis Ababa', 
            appointments: 15, 
            totalSpent: 3750, 
            status: 'vip', 
            notes: 'VIP customer, 20% discount' 
        }
    ];

    // Sample notifications
    notifications = [
        { id: 1, message: 'New appointment scheduled for 2:00 PM', type: 'info', time: '10:30 AM', read: false },
        { id: 2, message: 'Appointment #3 is now in progress', type: 'warning', time: '11:15 AM', read: false },
        { id: 3, message: 'Payment received for appointment #2', type: 'success', time: '11:30 AM', read: false },
        { id: 4, message: 'Barber John Master is running 15 minutes late', type: 'danger', time: '11:45 AM', read: false },
        { id: 5, message: 'New customer registration completed', type: 'info', time: '12:00 PM', read: false }
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
    localStorage.setItem('quickcut-notifications', JSON.stringify(notifications));
}

// Setup common event listeners
function setupCommonEventListeners() {
    // Sidebar toggle for mobile
    const sidebarToggle = document.querySelector('.sidebar-toggle');
    if (sidebarToggle) {
        sidebarToggle.addEventListener('click', function() {
            document.querySelector('.sidebar').classList.toggle('active');
            // Close sidebar when clicking outside on mobile
            if (window.innerWidth <= 992) {
                document.addEventListener('click', closeSidebarOnClickOutside);
            }
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

    // Setup logout button
    setupLogoutButton();
}

// Setup logout button with confirmation
function setupLogoutButton() {
    const logoutBtn = document.querySelector('.logout-btn');
    if (logoutBtn) {
        // Remove href to prevent navigation
        logoutBtn.removeAttribute('href');
        
        // Add click event listener
        logoutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            confirmLogout();
        });
    }
}

// Mark active navigation link
function markActiveNavLink() {
    const navLinks = document.querySelectorAll('.nav-link');
    const currentPage = window.location.pathname.split('/').pop();
    
    navLinks.forEach(link => {
        const href = link.getAttribute('href');
        link.classList.remove('active');
        
        // Check if this link matches current page
        if (href === currentPage) {
            link.classList.add('active');
        }
        
        // Special case for dashboard
        if (currentPage === '' || currentPage === 'admin' || currentPage === 'admin/') {
            if (href === 'dashboard.html') {
                link.classList.add('active');
            }
        }
    });
}

// Update date and time
function updateDateTime() {
    const now = new Date();
    const dateOptions = { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    };
    const timeOptions = { 
        hour: '2-digit', 
        minute: '2-digit', 
        second: '2-digit',
        hour12: true 
    };
    
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
        fullscreenBtn.setAttribute('title', 'Exit Fullscreen');
    } else {
        document.exitFullscreen();
        fullscreenBtn.innerHTML = '<i class="fas fa-expand"></i>';
        fullscreenBtn.setAttribute('title', 'Enter Fullscreen');
    }
}

// Show notification
function showNotification(message, type = 'info', duration = 5000) {
    // Remove any existing notifications first
    document.querySelectorAll('.notification').forEach(n => n.remove());
    
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas fa-${getNotificationIcon(type)}"></i>
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

    // Auto-remove after duration
    setTimeout(() => {
        if (notification.parentNode) {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }
    }, duration);
}

// Get notification icon based on type
function getNotificationIcon(type) {
    switch(type) {
        case 'success': return 'check-circle';
        case 'warning': return 'exclamation-triangle';
        case 'danger': return 'times-circle';
        default: return 'info-circle';
    }
}

// Perform global search
function performGlobalSearch(query) {
    if (query.length < 2) {
        // Clear previous search results
        const searchResults = document.getElementById('search-results');
        if (searchResults) searchResults.remove();
        return;
    }
    
    const results = [];
    const searchTerm = query.toLowerCase();
    
    // Search appointments
    appointments.forEach(app => {
        if (app.customer.toLowerCase().includes(searchTerm) || 
            app.phone.includes(query) ||
            app.service.toLowerCase().includes(searchTerm) ||
            app.barber.toLowerCase().includes(searchTerm)) {
            results.push({ 
                type: 'appointment', 
                data: app,
                icon: 'calendar-alt',
                color: 'primary'
            });
        }
    });
    
    // Search customers
    customers.forEach(customer => {
        if (customer.firstName.toLowerCase().includes(searchTerm) ||
            customer.lastName.toLowerCase().includes(searchTerm) ||
            customer.phone.includes(query) ||
            customer.email.toLowerCase().includes(searchTerm)) {
            results.push({ 
                type: 'customer', 
                data: customer,
                icon: 'user',
                color: 'success'
            });
        }
    });
    
    // Search barbers
    barbers.forEach(barber => {
        if (barber.firstName.toLowerCase().includes(searchTerm) ||
            barber.lastName.toLowerCase().includes(searchTerm) ||
            barber.phone.includes(query) ||
            barber.specialty.toLowerCase().includes(searchTerm)) {
            results.push({ 
                type: 'barber', 
                data: barber,
                icon: 'user-tie',
                color: 'warning'
            });
        }
    });
    
    // Search services
    services.forEach(service => {
        if (service.name.toLowerCase().includes(searchTerm) ||
            service.description.toLowerCase().includes(searchTerm)) {
            results.push({ 
                type: 'service', 
                data: service,
                icon: 'cut',
                color: 'info'
            });
        }
    });
    
    // Display search results
    displaySearchResults(results, query);
}

// Display search results
function displaySearchResults(results, query) {
    // Remove previous results
    const oldResults = document.getElementById('search-results');
    if (oldResults) oldResults.remove();
    
    if (results.length === 0) {
        showNotification(`No results found for "${query}"`, 'warning', 3000);
        return;
    }
    
    // Create results container
    const resultsContainer = document.createElement('div');
    resultsContainer.id = 'search-results';
    resultsContainer.className = 'search-results-card';
    resultsContainer.innerHTML = `
        <div class="search-results-header">
            <h6><i class="fas fa-search me-2"></i>Search Results (${results.length})</h6>
            <button class="btn-close" id="close-search-results"></button>
        </div>
        <div class="search-results-body">
            ${results.slice(0, 10).map(result => `
                <div class="search-result-item" data-type="${result.type}" data-id="${result.data.id}">
                    <div class="result-icon bg-${result.color}">
                        <i class="fas fa-${result.icon}"></i>
                    </div>
                    <div class="result-content">
                        <h6>${getResultTitle(result)}</h6>
                        <p class="text-muted">${getResultDescription(result)}</p>
                    </div>
                    <button class="btn btn-sm btn-outline-${result.color}" onclick="viewSearchResult('${result.type}', ${result.data.id})">
                        View
                    </button>
                </div>
            `).join('')}
        </div>
        ${results.length > 10 ? `
            <div class="search-results-footer">
                <small class="text-muted">Showing 10 of ${results.length} results</small>
            </div>
        ` : ''}
    `;
    
    // Add styles
    const style = document.createElement('style');
    style.textContent = `
        .search-results-card {
            position: absolute;
            top: 70px;
            left: 50%;
            transform: translateX(-50%);
            width: 90%;
            max-width: 600px;
            background: white;
            border-radius: 12px;
            box-shadow: 0 10px 40px rgba(0,0,0,0.15);
            z-index: 1000;
            border: 1px solid rgba(0,0,0,0.1);
            max-height: 500px;
            overflow-y: auto;
        }
        
        .search-results-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 1rem 1.25rem;
            border-bottom: 1px solid #dee2e6;
            background: #f8f9fa;
            border-radius: 12px 12px 0 0;
            position: sticky;
            top: 0;
            z-index: 1;
        }
        
        .search-results-header h6 {
            margin: 0;
            color: var(--secondary-color);
            font-weight: 600;
        }
        
        .search-results-body {
            padding: 0.5rem;
        }
        
        .search-result-item {
            display: flex;
            align-items: center;
            padding: 0.75rem;
            border-radius: 8px;
            margin-bottom: 0.5rem;
            transition: all 0.3s ease;
            border: 1px solid transparent;
        }
        
        .search-result-item:hover {
            background: #f8f9fa;
            border-color: #dee2e6;
            transform: translateY(-1px);
        }
        
        .result-icon {
            width: 36px;
            height: 36px;
            border-radius: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            margin-right: 1rem;
            flex-shrink: 0;
        }
        
        .result-content {
            flex: 1;
            min-width: 0;
        }
        
        .result-content h6 {
            margin: 0 0 0.25rem 0;
            font-size: 0.95rem;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }
        
        .result-content p {
            margin: 0;
            font-size: 0.85rem;
        }
        
        .search-results-footer {
            padding: 0.75rem 1.25rem;
            border-top: 1px solid #dee2e6;
            text-align: center;
            background: #f8f9fa;
            border-radius: 0 0 12px 12px;
        }
        
        @media (max-width: 576px) {
            .search-results-card {
                width: 95%;
            }
        }
    `;
    
    document.head.appendChild(style);
    document.body.appendChild(resultsContainer);
    
    // Close button
    document.getElementById('close-search-results').addEventListener('click', function() {
        resultsContainer.remove();
        style.remove();
    });
    
    // Close when clicking outside
    setTimeout(() => {
        document.addEventListener('click', function closeOnClickOutside(e) {
            if (!resultsContainer.contains(e.target) && !e.target.closest('.search-box')) {
                resultsContainer.remove();
                style.remove();
                document.removeEventListener('click', closeOnClickOutside);
            }
        });
    }, 100);
}

// Get result title
function getResultTitle(result) {
    switch(result.type) {
        case 'appointment':
            return `${result.data.customer} - ${result.data.service}`;
        case 'customer':
            return `${result.data.firstName} ${result.data.lastName}`;
        case 'barber':
            return `${result.data.firstName} ${result.data.lastName}`;
        case 'service':
            return result.data.name;
        default:
            return 'Result';
    }
}

// Get result description
function getResultDescription(result) {
    switch(result.type) {
        case 'appointment':
            return `Appointment with ${result.data.barber} on ${result.data.date} at ${result.data.time}`;
        case 'customer':
            return `Phone: ${result.data.phone} | Appointments: ${result.data.appointments}`;
        case 'barber':
            return `${result.data.specialty} | Rate: ETB ${result.data.rate}/hr`;
        case 'service':
            return `${result.data.description} | ETB ${result.data.price}`;
        default:
            return '';
    }
}

// View search result
function viewSearchResult(type, id) {
    switch(type) {
        case 'appointment':
            window.location.href = `appointments.html?view=${id}`;
            break;
        case 'customer':
            window.location.href = `customers.html?view=${id}`;
            break;
        case 'barber':
            window.location.href = `barbers.html?view=${id}`;
            break;
        case 'service':
            window.location.href = `services.html?view=${id}`;
            break;
    }
}

// Show notifications modal
function showNotificationsModal() {
    // Update notification count
    const unreadCount = notifications.filter(n => !n.read).length;
    if (unreadCount === 0) {
        showNotification('No new notifications', 'info');
        return;
    }
    
    // Mark all as read
    notifications.forEach(n => n.read = true);
    saveAllData();
    
    // Update badge
    const badge = document.getElementById('notification-count');
    if (badge) badge.textContent = '0';
    
    // Show notifications in modal
    const modalHTML = `
        <div class="modal fade" id="notificationsModal" tabindex="-1">
            <div class="modal-dialog modal-dialog-centered">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">
                            <i class="fas fa-bell me-2"></i>
                            Notifications (${unreadCount})
                        </h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <div class="notifications-list">
                            ${notifications.slice(0, 10).map(notification => `
                                <div class="notification-item ${notification.type}">
                                    <div class="notification-icon">
                                        <i class="fas fa-${getNotificationIcon(notification.type)}"></i>
                                    </div>
                                    <div class="notification-content">
                                        <p class="mb-1">${notification.message}</p>
                                        <small class="text-muted">${notification.time}</small>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
                            Close
                        </button>
                        <button type="button" class="btn btn-primary" onclick="clearAllNotifications()">
                            Clear All
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    const modal = new bootstrap.Modal(document.getElementById('notificationsModal'));
    modal.show();
    
    // Remove modal from DOM when hidden
    document.getElementById('notificationsModal').addEventListener('hidden.bs.modal', function() {
        this.remove();
    });
}

// Clear all notifications
function clearAllNotifications() {
    notifications = [];
    saveAllData();
    
    const badge = document.getElementById('notification-count');
    if (badge) badge.textContent = '0';
    
    showNotification('All notifications cleared', 'success');
    
    // Close modal
    const modal = bootstrap.Modal.getInstance(document.getElementById('notificationsModal'));
    if (modal) modal.hide();
}

// Update appointment status
function updateAppointmentStatus(appointmentId, newStatus) {
    const appointment = appointments.find(a => a.id === appointmentId);
    if (appointment) {
        const oldStatus = appointment.status;
        appointment.status = newStatus;
        saveAllData();
        
        // Update UI
        const dropdowns = document.querySelectorAll(`.status-dropdown[data-id="${appointmentId}"]`);
        dropdowns.forEach(dropdown => {
            dropdown.className = `status-dropdown ${newStatus}`;
            dropdown.value = newStatus;
        });
        
        showNotification(`Appointment #${appointmentId} status changed from ${oldStatus} to ${newStatus}`, 'success');
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
    
    try {
        const headers = Object.keys(data[0]);
        const csvRows = [
            headers.join(','),
            ...data.map(row => headers.map(header => {
                const value = row[header];
                // Handle special characters and commas
                if (typeof value === 'string' && (value.includes(',') || value.includes('"') || value.includes('\n'))) {
                    return `"${value.replace(/"/g, '""')}"`;
                }
                return value;
            }).join(','))
        ];
        
        const csvString = csvRows.join('\n');
        const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${filename}-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        
        showNotification(`${filename} exported successfully!`, 'success');
    } catch (error) {
        console.error('Export error:', error);
        showNotification('Failed to export data', 'danger');
    }
}

// Check session timeout
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

// Confirm logout with modal
function confirmLogout() {
    const modalHTML = `
        <div class="modal fade" id="logoutConfirmModal" tabindex="-1">
            <div class="modal-dialog modal-dialog-centered">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">
                            <i class="fas fa-sign-out-alt text-warning me-2"></i>
                            Confirm Logout
                        </h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body text-center">
                        <div class="mb-3">
                            <i class="fas fa-question-circle fa-3x text-warning"></i>
                        </div>
                        <h5>Are you sure you want to logout?</h5>
                        <p class="text-muted">You will need to login again to access the admin panel.</p>
                    </div>
                    <div class="modal-footer justify-content-center">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
                            <i class="fas fa-times me-2"></i>Cancel
                        </button>
                        <button type="button" class="btn btn-danger" id="confirmLogoutBtn">
                            <i class="fas fa-sign-out-alt me-2"></i>Yes, Logout
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    const modal = new bootstrap.Modal(document.getElementById('logoutConfirmModal'));
    modal.show();
    
    // Setup confirm button
    document.getElementById('confirmLogoutBtn').addEventListener('click', function() {
        modal.hide();
        setTimeout(() => {
            logout();
        }, 300);
    });
    
    // Remove modal from DOM when hidden
    document.getElementById('logoutConfirmModal').addEventListener('hidden.bs.modal', function() {
        this.remove();
    });
}

// Logout function
function logout() {
    // Clear authentication data
    localStorage.removeItem('quickcut-admin-loggedin');
    localStorage.removeItem('quickcut-admin-username');
    localStorage.removeItem('quickcut-admin-lastactivity');
    localStorage.removeItem('quickcut-admin-logintime');
    
    // Show logout notification
    showNotification('You have been logged out successfully. Redirecting to login...', 'info', 2000);
    
    // Redirect to login page after delay
    setTimeout(() => {
        window.location.href = 'login.html';
    }, 1500);
}

// Close sidebar when clicking outside on mobile
function closeSidebarOnClickOutside(e) {
    const sidebar = document.querySelector('.sidebar');
    const toggleBtn = document.querySelector('.sidebar-toggle');
    
    if (!sidebar.contains(e.target) && !toggleBtn.contains(e.target) && sidebar.classList.contains('active')) {
        sidebar.classList.remove('active');
        document.removeEventListener('click', closeSidebarOnClickOutside);
    }
}

// Show welcome notification
function showWelcomeNotification() {
    const lastWelcome = localStorage.getItem('quickcut-last-welcome');
    const today = new Date().toISOString().split('T')[0];
    
    if (lastWelcome !== today) {
        const username = localStorage.getItem('quickcut-admin-username') || 'Admin';
        const welcomeMessages = [
            `Welcome back, ${username}!`,
            `Good to see you again, ${username}!`,
            `${username}, ready to manage your barber shop?`,
            `Hello ${username}! Let's make today productive.`
        ];
        
        const randomMessage = welcomeMessages[Math.floor(Math.random() * welcomeMessages.length)];
        showNotification(randomMessage, 'success', 4000);
        
        localStorage.setItem('quickcut-last-welcome', today);
    }
}

// Generate unique ID
function generateId() {
    return '_' + Math.random().toString(36).substr(2, 9);
}

// Format date
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

// Format time
function formatTime(timeString) {
    if (!timeString) return '';
    
    // If time is already in AM/PM format
    if (timeString.includes('AM') || timeString.includes('PM')) {
        return timeString;
    }
    
    // Convert 24h to 12h format
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    
    return `${hour12}:${minutes} ${ampm}`;
}

// Calculate total revenue
function calculateTotalRevenue() {
    return appointments.reduce((total, appointment) => total + appointment.amount, 0);
}

// Get active barbers count
function getActiveBarbersCount() {
    return barbers.filter(barber => barber.status === 'active').length;
}

// Get active customers count
function getActiveCustomersCount() {
    return customers.filter(customer => customer.status === 'active' || customer.status === 'vip').length;
}

// Get today's revenue
function getTodayRevenue() {
    const today = new Date().toISOString().split('T')[0];
    return appointments
        .filter(appointment => appointment.date === today)
        .reduce((total, appointment) => total + appointment.amount, 0);
}

// Make all functions available globally
window.showNotification = showNotification;
window.updateAppointmentStatus = updateAppointmentStatus;
window.formatCurrency = formatCurrency;
window.exportToCSV = exportToCSV;
window.logout = logout;
window.confirmLogout = confirmLogout;
window.updateLastActivity = updateLastActivity;
window.checkSessionTimeout = checkSessionTimeout;
window.viewSearchResult = viewSearchResult;
window.clearAllNotifications = clearAllNotifications;
window.formatDate = formatDate;
window.formatTime = formatTime;
window.calculateTotalRevenue = calculateTotalRevenue;
window.getActiveBarbersCount = getActiveBarbersCount;
window.getActiveCustomersCount = getActiveCustomersCount;
window.getTodayRevenue = getTodayRevenue;
window.generateId = generateId;

// Export data for other modules
window.appointmentsData = { get: () => appointments, set: (data) => { appointments = data; saveAllData(); } };
window.barbersData = { get: () => barbers, set: (data) => { barbers = data; saveAllData(); } };
window.servicesData = { get: () => services, set: (data) => { services = data; saveAllData(); } };
window.customersData = { get: () => customers, set: (data) => { customers = data; saveAllData(); } };
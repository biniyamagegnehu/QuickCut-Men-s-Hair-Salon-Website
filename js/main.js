// QuickCut - Main JavaScript File
// Professional Barber Booking System

document.addEventListener('DOMContentLoaded', function() {
    // ========== GLOBAL VARIABLES ==========
    const primaryColor = '#ff6b35';
    const primaryDark = '#e55a2b';
    
    // ========== NAVBAR SCROLL EFFECT ==========
    const navbar = document.querySelector('.navbar');
    
    if (navbar) {
        window.addEventListener('scroll', function() {
            if (window.scrollY > 50) {
                navbar.classList.add('scrolled');
                navbar.style.padding = '0.5rem 0';
            } else {
                navbar.classList.remove('scrolled');
                navbar.style.padding = '1rem 0';
            }
        });
        
        // Trigger scroll event on load
        window.dispatchEvent(new Event('scroll'));
    }

    // ========== SMOOTH SCROLLING ==========
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                window.scrollTo({
                    top: targetElement.offsetTop - 80,
                    behavior: 'smooth'
                });
                
                // Update active nav link
                document.querySelectorAll('.nav-link').forEach(link => {
                    link.classList.remove('active');
                });
                this.classList.add('active');
            }
        });
    });

    // ========== FORM VALIDATION ==========
    const forms = document.querySelectorAll('form');
    
    forms.forEach(form => {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            
            let isValid = true;
            const requiredInputs = this.querySelectorAll('input[required], select[required]');
            
            requiredInputs.forEach(input => {
                if (!input.value.trim()) {
                    showValidationError(input, 'This field is required');
                    isValid = false;
                } else {
                    clearValidationError(input);
                }
                
                // Email validation
                if (input.type === 'email' && input.value.trim()) {
                    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                    if (!emailRegex.test(input.value)) {
                        showValidationError(input, 'Please enter a valid email address');
                        isValid = false;
                    }
                }
                
                // Password validation for create account
                if (input.id === 'password' && input.value.trim()) {
                    const password = input.value;
                    const hasUpperCase = /[A-Z]/.test(password);
                    const hasLowerCase = /[a-z]/.test(password);
                    const hasNumbers = /\d/.test(password);
                    const isLongEnough = password.length >= 8;
                    
                    if (!(hasUpperCase && hasLowerCase && hasNumbers && isLongEnough)) {
                        showValidationError(input, 'Password must be at least 8 characters with uppercase, lowercase, and a number');
                        isValid = false;
                    }
                }
                
                // Confirm password validation
                if (input.id === 'confirmPassword' && input.value.trim()) {
                    const password = document.getElementById('password');
                    if (password && input.value !== password.value) {
                        showValidationError(input, 'Passwords do not match');
                        isValid = false;
                    }
                }
            });
            
            if (isValid) {
                // Show success message
                showToast('Success!', 'Form submitted successfully', 'success');
                
                // Simulate form submission delay
                setTimeout(() => {
                    if (form.hasAttribute('action')) {
                        window.location.href = form.getAttribute('action');
                    } else {
                        form.reset();
                    }
                }, 1500);
            }
        });
        
        // Real-time validation
        form.querySelectorAll('input, select, textarea').forEach(input => {
            input.addEventListener('blur', function() {
                if (this.hasAttribute('required') && !this.value.trim()) {
                    showValidationError(this, 'This field is required');
                } else {
                    clearValidationError(this);
                }
            });
            
            input.addEventListener('input', function() {
                clearValidationError(this);
            });
        });
    });

    // ========== BOOKING SYSTEM ==========
    const bookingForm = document.querySelector('.booking-form-card form');
    
    if (bookingForm) {
        // Service prices mapping
        const servicePrices = {
            'haircut': 25,
            'beard': 15,
            'premium': 35
        };
        
        // Barber info mapping
        const barberInfo = {
            'john': {
                name: 'John Master',
                specialty: 'Haircut Specialist',
                experience: '12+ years experience',
                rating: '4.9 (120 reviews)'
            },
            'mike': {
                name: 'Mike Style',
                specialty: 'Beard Specialist',
                experience: '8+ years experience',
                rating: '4.7 (95 reviews)'
            },
            'alex': {
                name: 'Alex Cut',
                specialty: 'Modern Styles',
                experience: '10+ years experience',
                rating: '5.0 (150 reviews)'
            }
        };
        
        // Update booking summary in real-time
        const updateSummary = () => {
            const service = document.querySelector('input[name="service"]:checked');
            const barber = document.querySelector('input[name="barber"]:checked');
            const date = document.querySelector('input[name="date"]:checked');
            const time = document.querySelector('input[name="time"]:checked');
            
            // Update service
            if (service) {
                const serviceLabel = service.nextElementSibling.querySelector('h4').textContent;
                document.getElementById('summary-service').textContent = serviceLabel;
                
                // Update price
                const price = servicePrices[service.value] || 0;
                document.getElementById('summary-price').textContent = `$${price}.00`;
            }
            
            // Update barber
            if (barber && barber.value !== 'alex') {
                const barberLabel = barber.nextElementSibling.querySelector('h5').textContent;
                document.getElementById('summary-barber').textContent = barberLabel;
                
                // Show selected barber info
                const infoCard = document.getElementById('selected-barber-info');
                const barberData = barberInfo[barber.value];
                
                if (barberData && infoCard) {
                    document.getElementById('selected-barber-name').textContent = barberData.name;
                    document.getElementById('selected-barber-specialty').textContent = barberData.specialty;
                    document.getElementById('selected-barber-exp').textContent = barberData.experience;
                    infoCard.style.display = 'block';
                }
            }
            
            // Update date
            if (date) {
                const dateLabel = date.nextElementSibling.querySelector('.date-day').textContent;
                document.getElementById('summary-date').textContent = dateLabel;
            }
            
            // Update time
            if (time) {
                document.getElementById('summary-time').textContent = time.value;
            }
            
            // Update progress steps
            const steps = document.querySelectorAll('.progress-step');
            const checkedCount = [service, barber, date, time].filter(Boolean).length;
            
            steps.forEach((step, index) => {
                if (index < checkedCount) {
                    step.classList.add('active');
                } else {
                    step.classList.remove('active');
                }
            });
        };
        
        // Add event listeners for all booking inputs
        const bookingInputs = bookingForm.querySelectorAll('input[type="radio"]');
        bookingInputs.forEach(input => {
            input.addEventListener('change', updateSummary);
            
            // Disable busy barber selection
            if (input.value === 'alex') {
                input.disabled = true;
                input.nextElementSibling.style.cursor = 'not-allowed';
                input.nextElementSibling.style.opacity = '0.7';
            }
        });
        
        // Initialize summary
        updateSummary();
        
        // Special handling for time slots
        const timeOptions = document.querySelectorAll('.time-option:not(.booked) input[type="radio"]');
        timeOptions.forEach(option => {
            option.addEventListener('click', function() {
                document.querySelectorAll('.time-option').forEach(opt => {
                    opt.classList.remove('selected');
                });
                this.parentElement.classList.add('selected');
            });
        });
        
        // Handle service selection animation
        const serviceOptions = document.querySelectorAll('.service-option input[type="radio"]');
        serviceOptions.forEach(option => {
            option.addEventListener('change', function() {
                document.querySelectorAll('.service-option').forEach(opt => {
                    opt.classList.remove('selected');
                });
                this.parentElement.classList.add('selected');
            });
        });
        
        // Handle date selection animation
        const dateOptions = document.querySelectorAll('.date-option input[type="radio"]');
        dateOptions.forEach(option => {
            option.addEventListener('change', function() {
                document.querySelectorAll('.date-option').forEach(opt => {
                    opt.classList.remove('selected');
                });
                this.parentElement.classList.add('selected');
            });
        });
        
        // Handle barber selection animation
        const barberOptions = document.querySelectorAll('.barber-option input[type="radio"]:not([value="alex"])');
        barberOptions.forEach(option => {
            option.addEventListener('change', function() {
                document.querySelectorAll('.barber-option').forEach(opt => {
                    opt.classList.remove('selected');
                });
                this.parentElement.classList.add('selected');
            });
        });
    }

    // ========== QUEUE SIMULATION ==========
    const queueCard = document.querySelector('.queue-card');
    
    if (queueCard) {
        let queuePosition = 4;
        let waitingPeople = 3;
        let nextSlot = '3:15 PM';
        
        // Update queue display
        const updateQueueDisplay = () => {
            document.getElementById('waiting-count').textContent = waitingPeople;
            document.getElementById('next-slot-time').textContent = nextSlot;
            
            // Update queue dots
            const queueDots = document.querySelectorAll('.queue-dot');
            queueDots.forEach((dot, index) => {
                if (index < waitingPeople) {
                    dot.classList.add('active');
                } else {
                    dot.classList.remove('active');
                }
            });
        };
        
        // Simulate queue updates
        setInterval(() => {
            // Randomly update queue position
            if (Math.random() > 0.7 && waitingPeople > 0) {
                waitingPeople--;
                
                // Update next slot time randomly
                if (Math.random() > 0.5) {
                    const hours = Math.floor(Math.random() * 3) + 1;
                    const minutes = Math.floor(Math.random() * 60);
                    const period = Math.random() > 0.5 ? 'PM' : 'AM';
                    nextSlot = `${hours}:${minutes.toString().padStart(2, '0')} ${period}`;
                }
                
                updateQueueDisplay();
                
                // Show notification when position changes
                if (waitingPeople <= 2) {
                    showToast('Queue Update', `Only ${waitingPeople} people ahead of you! Get ready.`, 'info');
                }
            }
        }, 10000); // Update every 10 seconds
        
        // Refresh queue button
        const refreshBtn = document.getElementById('refresh-queue');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', function(e) {
                e.preventDefault();
                this.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Refreshing...';
                
                setTimeout(() => {
                    this.innerHTML = '<i class="fas fa-sync-alt me-2"></i>Refresh Queue Status';
                    showToast('Queue Updated', 'Queue status has been refreshed', 'success');
                }, 1000);
            });
        }
    }

    // ========== PASSWORD VISIBILITY TOGGLE ==========
    const togglePasswordBtn = document.getElementById('togglePassword');
    if (togglePasswordBtn) {
        togglePasswordBtn.addEventListener('click', function() {
            const passwordInput = document.getElementById('password');
            const icon = this.querySelector('i');
            
            if (passwordInput.type === 'password') {
                passwordInput.type = 'text';
                icon.classList.remove('fa-eye');
                icon.classList.add('fa-eye-slash');
            } else {
                passwordInput.type = 'password';
                icon.classList.remove('fa-eye-slash');
                icon.classList.add('fa-eye');
            }
        });
    }

    // ========== SCROLL INDICATOR ==========
    const scrollIndicator = document.querySelector('.scroll-indicator');
    if (scrollIndicator) {
        window.addEventListener('scroll', function() {
            if (window.scrollY > 100) {
                scrollIndicator.style.opacity = '0';
                scrollIndicator.style.visibility = 'hidden';
            } else {
                scrollIndicator.style.opacity = '1';
                scrollIndicator.style.visibility = 'visible';
            }
        });
    }

    // ========== BACK TO TOP BUTTON ==========
    const scrollToTopBtn = document.querySelector('.scroll-to-top');
    if (scrollToTopBtn) {
        window.addEventListener('scroll', function() {
            if (window.scrollY > 300) {
                scrollToTopBtn.style.display = 'flex';
            } else {
                scrollToTopBtn.style.display = 'none';
            }
        });
        
        scrollToTopBtn.addEventListener('click', function() {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }

    // ========== SERVICE CARD INTERACTIVITY ==========
    const serviceCards = document.querySelectorAll('.service-card');
    serviceCards.forEach(card => {
        card.addEventListener('click', function() {
            // Remove selected class from all cards
            serviceCards.forEach(c => c.classList.remove('selected'));
            // Add selected class to clicked card
            this.classList.add('selected');
            
            const serviceType = this.getAttribute('data-service');
            showToast('Service Selected', `${this.querySelector('h4').textContent} has been selected`, 'info');
        });
    });

    // ========== ANIMATION KEYFRAMES ==========
    const styleSheet = document.createElement('style');
    styleSheet.textContent = `
        @keyframes shake {
            0%, 100% { transform: translateX(0); }
            10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
            20%, 40%, 60%, 80% { transform: translateX(5px); }
        }
        
        @keyframes slideInRight {
            from {
                transform: translateX(100%);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
        
        @keyframes slideOutRight {
            from {
                transform: translateX(0);
                opacity: 1;
            }
            to {
                transform: translateX(100%);
                opacity: 0;
            }
        }
        
        @keyframes pulse {
            0% { transform: scale(1); }
            50% { transform: scale(1.05); }
            100% { transform: scale(1); }
        }
        
        @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }
        
        .validation-error {
            color: #dc3545;
            font-size: 0.8rem;
            margin-top: 0.25rem;
            animation: fadeIn 0.3s ease;
        }
        
        .toast-container {
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 9999;
            min-width: 300px;
            max-width: 400px;
        }
        
        .custom-toast {
            animation: slideInRight 0.3s ease;
            margin-bottom: 10px;
            border-radius: 10px;
            box-shadow: 0 5px 15px rgba(0,0,0,0.1);
        }
        
        .selected {
            border: 2px solid ${primaryColor} !important;
            box-shadow: 0 10px 25px rgba(255, 107, 53, 0.2) !important;
        }
    `;
    document.head.appendChild(styleSheet);

    // ========== HELPER FUNCTIONS ==========
    function showValidationError(input, message) {
        clearValidationError(input);
        
        const errorDiv = document.createElement('div');
        errorDiv.className = 'validation-error';
        errorDiv.textContent = message;
        
        input.parentNode.appendChild(errorDiv);
        input.style.borderColor = '#dc3545';
        
        // Add shake animation
        input.classList.add('shake');
        setTimeout(() => {
            input.classList.remove('shake');
        }, 500);
    }
    
    function clearValidationError(input) {
        const errorDiv = input.parentNode.querySelector('.validation-error');
        if (errorDiv) {
            errorDiv.remove();
        }
        input.style.borderColor = '';
    }
    
    function showToast(title, message, type = 'info') {
        // Remove existing toasts
        const existingToast = document.querySelector('.custom-toast');
        if (existingToast) {
            existingToast.remove();
        }
        
        // Create toast container if it doesn't exist
        let toastContainer = document.querySelector('.toast-container');
        if (!toastContainer) {
            toastContainer = document.createElement('div');
            toastContainer.className = 'toast-container';
            document.body.appendChild(toastContainer);
        }
        
        // Create toast
        const toast = document.createElement('div');
        toast.className = `custom-toast alert alert-${type === 'success' ? 'success' : type === 'error' ? 'danger' : 'info'} alert-dismissible fade show`;
        
        // Toast content
        toast.innerHTML = `
            <div class="d-flex align-items-center">
                <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'} me-3"></i>
                <div style="flex: 1;">
                    <strong class="me-auto">${title}</strong>
                    <div class="small">${message}</div>
                </div>
                <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
            </div>
        `;
        
        toastContainer.appendChild(toast);
        
        // Auto remove after 5 seconds
        setTimeout(() => {
            if (toast.parentNode) {
                toast.style.animation = 'slideOutRight 0.3s ease';
                setTimeout(() => {
                    if (toast.parentNode) {
                        toast.remove();
                    }
                }, 300);
            }
        }, 5000);
        
        // Close button functionality
        const closeBtn = toast.querySelector('.btn-close');
        closeBtn.addEventListener('click', () => {
            toast.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.remove();
                }
            }, 300);
        });
    }

    // ========== INITIALIZATION COMPLETE ==========
    console.log('QuickCut JavaScript initialized successfully!');
    
    // Show welcome message on home page
    if (window.location.pathname.includes('welcome.html') || window.location.pathname === '/') {
        setTimeout(() => {
            showToast('Welcome to QuickCut!', 'Skip the wait. Get the perfect cut.', 'success');
        }, 1000);
    }
});
// ========== NOTIFICATION SYSTEM ==========
const notificationBtn = document.getElementById('enable-notifications-btn');
const toastContainer = document.createElement('div');
toastContainer.className = 'toast-container position-fixed top-0 end-0 p-3';
document.body.appendChild(toastContainer);

// Check if browser supports notifications
const hasNotificationSupport = 'Notification' in window;

if (notificationBtn) {
    // Update button text based on permission state
    const updateNotificationButton = () => {
        if (!hasNotificationSupport) {
            notificationBtn.innerHTML = '<i class="fas fa-bell-slash me-2"></i>Notifications Unsupported';
            notificationBtn.classList.add('disabled');
            return;
        }
        
        switch(Notification.permission) {
            case 'granted':
                notificationBtn.innerHTML = '<i class="fas fa-bell me-2"></i>Notifications Enabled ✓';
                notificationBtn.classList.remove('btn-outline-primary');
                notificationBtn.classList.add('btn-success');
                notificationBtn.href = '#';
                break;
            case 'denied':
                notificationBtn.innerHTML = '<i class="fas fa-bell-slash me-2"></i>Notifications Blocked';
                notificationBtn.classList.remove('btn-outline-primary');
                notificationBtn.classList.add('btn-secondary', 'disabled');
                notificationBtn.href = '#';
                break;
            default: // 'default' or not requested yet
                notificationBtn.innerHTML = '<i class="fas fa-bell me-2"></i>Enable Notifications';
                notificationBtn.classList.add('btn-outline-primary');
                notificationBtn.classList.remove('btn-success', 'btn-secondary', 'disabled');
                notificationBtn.href = '#';
        }
    };

    // Initialize button state
    updateNotificationButton();

    // Handle notification request
    notificationBtn.addEventListener('click', async function(e) {
        e.preventDefault();
        
        if (!hasNotificationSupport) {
            showToast('Unsupported', 'Your browser does not support notifications', 'error');
            return;
        }
        
        if (Notification.permission === 'granted') {
            showToast('Already Enabled', 'Notifications are already enabled!', 'info');
            
            // Test notification
            if (queueCard) {
                const testNotification = new Notification('QuickCut - Test Notification', {
                    body: 'Your queue status will be updated shortly.',
                    icon: 'https://cdn-icons-png.flaticon.com/512/1995/1995515.png'
                });
                
                // Close notification after 5 seconds
                setTimeout(() => {
                    testNotification.close();
                }, 5000);
            }
            return;
        }
        
        if (Notification.permission === 'denied') {
            showToast('Blocked', 'Notifications are blocked. Please enable them in browser settings.', 'error');
            return;
        }
        
        // Request permission
        const permission = await Notification.requestPermission();
        
        if (permission === 'granted') {
            showToast('Success!', 'Notifications enabled successfully', 'success');
            updateNotificationButton();
            
            // Send welcome notification
            if (queueCard) {
                const welcomeNotification = new Notification('QuickCut - Welcome!', {
                    body: 'You will now receive queue updates and notifications.',
                    icon: 'https://cdn-icons-png.flaticon.com/512/1995/1995515.png'
                });
                
                setTimeout(() => {
                    welcomeNotification.close();
                }, 5000);
            }
        } else {
            showToast('Permission Denied', 'You can enable notifications later in browser settings', 'warning');
            updateNotificationButton();
        }
    });
}

// Function to send queue notifications
function sendQueueNotification(title, message, position = null) {
    if (!hasNotificationSupport || Notification.permission !== 'granted') {
        return;
    }
    
    const notification = new Notification(`QuickCut - ${title}`, {
        body: position ? `${message} You're now #${position} in line.` : message,
        icon: 'https://cdn-icons-png.flaticon.com/512/1995/1995515.png',
        tag: 'queue-update'
    });
    
    // Close notification after 10 seconds
    setTimeout(() => {
        notification.close();
    }, 10000);
    
    return notification;
}

// Integrate with queue simulation
if (queueCard) {
    let previousWaitingCount = waitingPeople;
    
    // Modify the queue simulation to include notifications
    setInterval(() => {
        // Existing queue update logic...
        if (Math.random() > 0.7 && waitingPeople > 0) {
            waitingPeople--;
            
            // Check if user's position improved
            if (waitingPeople < previousWaitingCount) {
                // Send notification for position improvement
                if (hasNotificationSupport && Notification.permission === 'granted') {
                    sendQueueNotification('Queue Update', 'Your position has improved!', waitingPeople + 1);
                }
            }
            
            previousWaitingCount = waitingPeople;
            
            // Update next slot time randomly
            if (Math.random() > 0.5) {
                const hours = Math.floor(Math.random() * 3) + 1;
                const minutes = Math.floor(Math.random() * 60);
                const period = Math.random() > 0.5 ? 'PM' : 'AM';
                nextSlot = `${hours}:${minutes.toString().padStart(2, '0')} ${period}`;
            }
            
            updateQueueDisplay();
            
            // Show toast notification
            if (waitingPeople <= 2) {
                showToast('Queue Update', `Only ${waitingPeople} people ahead of you! Get ready.`, 'info');
                
                // Also send browser notification
                if (waitingPeople === 2 && hasNotificationSupport && Notification.permission === 'granted') {
                    sendQueueNotification('Almost Your Turn!', 'Only 2 people ahead of you. Please prepare to arrive soon.', 3);
                }
                
                if (waitingPeople === 1 && hasNotificationSupport && Notification.permission === 'granted') {
                    sendQueueNotification('You\'re Next!', 'Only 1 person ahead of you. Please arrive at the salon.', 2);
                }
                
                if (waitingPeople === 0 && hasNotificationSupport && Notification.permission === 'granted') {
                    sendQueueNotification('It\'s Your Turn!', 'Please proceed to the barber station.', 1);
                }
            }
        }
    }, 10000);
}

// Function to show notification settings modal
function showNotificationSettings() {
    // Create modal if it doesn't exist
    let modal = document.getElementById('notification-settings-modal');
    
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'notification-settings-modal';
        modal.className = 'modal fade';
        modal.innerHTML = `
            <div class="modal-dialog modal-dialog-centered">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Notification Settings</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <div class="notification-status mb-4">
                            <h6>Current Status:</h6>
                            <div class="alert ${Notification.permission === 'granted' ? 'alert-success' : 'alert-warning'}">
                                <i class="fas fa-${Notification.permission === 'granted' ? 'check-circle' : 'exclamation-triangle'} me-2"></i>
                                ${hasNotificationSupport ? 
                                    `Notifications are ${Notification.permission === 'granted' ? 'enabled' : Notification.permission === 'denied' ? 'blocked' : 'not enabled'}` :
                                    'Browser does not support notifications'
                                }
                            </div>
                        </div>
                        
                        <div class="notification-types">
                            <h6 class="mb-3">Notification Types:</h6>
                            <div class="form-check mb-2">
                                <input class="form-check-input" type="checkbox" id="queue-updates" checked>
                                <label class="form-check-label" for="queue-updates">
                                    Queue position updates
                                </label>
                            </div>
                            <div class="form-check mb-2">
                                <input class="form-check-input" type="checkbox" id="reminders" checked>
                                <label class="form-check-label" for="reminders">
                                    Appointment reminders
                                </label>
                            </div>
                            <div class="form-check">
                                <input class="form-check-input" type="checkbox" id="promotions" checked>
                                <label class="form-check-label" for="promotions">
                                    Special offers and promotions
                                </label>
                            </div>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                        <button type="button" class="btn btn-primary" id="save-notification-settings">Save Settings</button>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }
    
    // Initialize Bootstrap modal
    const bsModal = new bootstrap.Modal(modal);
    bsModal.show();
}

// Add notification settings to notification button context
if (notificationBtn && hasNotificationSupport && Notification.permission === 'granted') {
    // Add settings option via right-click/long-press
    notificationBtn.addEventListener('contextmenu', function(e) {
        e.preventDefault();
        showNotificationSettings();
    });
    
    // Add long press for mobile
    let pressTimer;
    notificationBtn.addEventListener('touchstart', function(e) {
        pressTimer = setTimeout(() => {
            showNotificationSettings();
        }, 1000);
    });
    
    notificationBtn.addEventListener('touchend', function() {
        clearTimeout(pressTimer);
    });
}
// QuickCut - Queue Status JavaScript
// Enhanced with REAL-TIME updates and day-to-day persistence
// Improved with realistic wait time calculations

document.addEventListener('DOMContentLoaded', function() {
    console.log('Queue Status page initialized - Real-Time Enhanced Version');

    // ========== REAL-TIME CONFIGURATION ==========
    const REAL_TIME_CONFIG = {
        UPDATE_INTERVAL: 10000, // 10 seconds for real-time updates
        POSITION_CHECK_INTERVAL: 30000, // 30 seconds for position checks
        DAILY_RESET_TIME: '04:00', // 4 AM daily reset
        BUSINESS_HOURS: {
            start: '09:00', // 9 AM
            end: '21:00',   // 9 PM
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
        },
        MAX_QUEUE_SIZE: 25,
        AVERAGE_SERVICE_TIME: 20, // Updated to more realistic 20 minutes
        SERVICE_TIME_VARIANCE: 0.2, // 20% variance for realism
        PEAK_HOUR_MULTIPLIER: 1.5, // 50% longer during peak hours
        OFF_PEAK_MULTIPLIER: 0.8,  // 20% shorter during off-peak
        MIN_WAIT_TIME: 5 // Minimum wait time in minutes
    };

    // ========== NAVBAR SCROLL EFFECT ==========
    const navbar = document.querySelector('#queue-nav');
    
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

    // ========== REAL-TIME NOTIFICATION SYSTEM ==========
    class RealTimeNotificationManager {
        constructor(parent = null) {
            // parent is expected to be an instance of RealTimeQueueSystem (optional)
            this.parent = parent;
            this.notificationEnabled = false;
            this.notificationTypes = {
                queueUpdates: true,
                appointmentReminders: true,
                promotions: true,
                emergencyUpdates: true
            };
            this.lastNotificationTime = null;
            this.notificationCooldown = 60000; // 1 minute cooldown

            // Bind methods to ensure correct `this` when used as callbacks
            const methodNames = [
                'initialize','setupEventListeners','checkNotificationPermission','updateNotificationButton',
                'setupNotificationToggle','setupNotificationSettings','showSettingsPanel','hideSettingsPanel',
                'toggleNotifications','sendWelcomeNotification','sendTestNotification','sendQueueNotification',
                'scheduleDailyNotifications','cancelDailyNotifications','sendDailySummaryNotification','sendAppointmentReminder',
                'showStatusMessage','showBrowserAlert','saveNotificationPreferences','loadNotificationPreferences','showToast'
            ];

            for (const name of methodNames) {
                if (this[name] && typeof this[name] === 'function') {
                    this[name] = this[name].bind(this);
                }
            }

            this.initialize();
        }

        initialize() {
            this.checkNotificationPermission();
            this.setupNotificationToggle();
            this.loadNotificationPreferences();
            this.setupNotificationSettings();
            this.setupEventListeners();
        }

        setupEventListeners() {
            // Close settings button
            const closeBtn = document.getElementById('close-settings-btn');
            if (closeBtn) {
                closeBtn.addEventListener('click', () => {
                    this.hideSettingsPanel();
                });
            }

            // Test notification button
            const testBtn = document.getElementById('test-notification-btn');
            if (testBtn) {
                testBtn.addEventListener('click', () => {
                    this.sendTestNotification();
                });
            }
        }

        checkNotificationPermission() {
            if (!('Notification' in window)) {
                console.log('This browser does not support notifications');
                this.updateNotificationButton(false);
                this.showBrowserAlert('Your browser does not support desktop notifications. Consider updating your browser for the best experience.');
                return;
            }

            if (Notification.permission === 'granted') {
                this.notificationEnabled = true;
                this.updateNotificationButton(true);
                this.scheduleDailyNotifications();
                
                // Show settings panel if notifications are granted
                setTimeout(() => this.showSettingsPanel(), 500);
            } else if (Notification.permission === 'denied') {
                this.updateNotificationButton(false);
                console.log('Notification permission denied');
                this.showBrowserAlert('Notifications are disabled. Enable them in browser settings for real-time updates.');
            } else {
                this.updateNotificationButton(false);
            }
        }

        updateNotificationButton(isEnabled) {
            const notificationBtn = document.getElementById('enable-notifications-btn');
            if (!notificationBtn) {
                console.error('Notification button not found!');
                return;
            }

            if (isEnabled) {
                notificationBtn.innerHTML = '<i class="fas fa-bell-slash me-2"></i>Disable Notifications';
                notificationBtn.classList.remove('btn-outline-primary');
                notificationBtn.classList.add('btn-success');
                
                // Add bell animation
                const bellIcon = notificationBtn.querySelector('i');
                if (bellIcon) {
                    bellIcon.classList.add('notification-bell');
                }
                
                this.showStatusMessage('Real-time notifications enabled', 'success');
            } else {
                notificationBtn.innerHTML = '<i class="fas fa-bell me-2"></i>Enable Notifications';
                notificationBtn.classList.remove('btn-success');
                notificationBtn.classList.add('btn-outline-primary');
                
                // Remove bell animation
                const bellIcon = notificationBtn.querySelector('i');
                if (bellIcon) {
                    bellIcon.classList.remove('notification-bell');
                }
            }
        }

        setupNotificationToggle() {
            const notificationBtn = document.getElementById('enable-notifications-btn');
            if (!notificationBtn) {
                console.error('Enable notifications button not found!');
                return;
            }

            notificationBtn.addEventListener('click', (e) => {
                e.preventDefault();

                // If browser doesn't support notifications, inform user
                if (!('Notification' in window)) {
                    this.showBrowserAlert('Your browser does not support notifications.');
                    return;
                }

                // If permission already granted, toggle settings inline
                if (Notification.permission === 'granted') {
                    this.notificationEnabled = !this.notificationEnabled;
                    if (this.notificationEnabled) {
                        this.updateNotificationButton(true);
                        this.sendWelcomeNotification();
                        this.scheduleDailyNotifications();
                        this.showSettingsPanel();
                    } else {
                        this.updateNotificationButton(false);
                        this.cancelDailyNotifications();
                        this.hideSettingsPanel();
                    }
                    this.saveNotificationPreferences();
                    return;
                }

                // If permission denied, show instructions
                if (Notification.permission === 'denied') {
                    this.showBrowserAlert('Notifications are blocked. Please enable them in your browser settings.');
                    return;
                }

                // Permission default/undetermined: redirect to dedicated page to request permission
                try {
                    window.location.href = 'notificationenabled.html';
                } catch (err) {
                    // Fallback to in-place request if redirect fails
                    this.toggleNotifications();
                }
            });
        }

        setupNotificationSettings() {
            // Don't overwrite existing HTML - just add event listeners to existing elements
            const settingsPanel = document.getElementById('notification-settings');
            if (!settingsPanel) {
                console.error('Notification settings panel not found!');
                return;
            }

            // Add event listeners for existing toggles
            const queueToggle = document.getElementById('queue-updates-toggle');
            const appointmentToggle = document.getElementById('appointment-reminders-toggle');
            const emergencyToggle = document.getElementById('emergency-updates-toggle');
            const promotionsToggle = document.getElementById('promotions-toggle');

            if (queueToggle) {
                queueToggle.checked = this.notificationTypes.queueUpdates;
                queueToggle.addEventListener('change', (e) => {
                    this.notificationTypes.queueUpdates = e.target.checked;
                    this.saveNotificationPreferences();
                    this.showStatusMessage(
                        `Queue updates ${e.target.checked ? 'enabled' : 'disabled'}`,
                        e.target.checked ? 'success' : 'info'
                    );
                });
            }

            if (appointmentToggle) {
                appointmentToggle.checked = this.notificationTypes.appointmentReminders;
                appointmentToggle.addEventListener('change', (e) => {
                    this.notificationTypes.appointmentReminders = e.target.checked;
                    this.saveNotificationPreferences();
                    this.showStatusMessage(
                        `Appointment reminders ${e.target.checked ? 'enabled' : 'disabled'}`,
                        e.target.checked ? 'success' : 'info'
                    );
                });
            }

            if (emergencyToggle) {
                emergencyToggle.checked = this.notificationTypes.emergencyUpdates;
                emergencyToggle.addEventListener('change', (e) => {
                    this.notificationTypes.emergencyUpdates = e.target.checked;
                    this.saveNotificationPreferences();
                    this.showStatusMessage(
                        `Emergency updates ${e.target.checked ? 'enabled' : 'disabled'}`,
                        e.target.checked ? 'success' : 'info'
                    );
                });
            }

            if (promotionsToggle) {
                promotionsToggle.checked = this.notificationTypes.promotions;
                promotionsToggle.addEventListener('change', (e) => {
                    this.notificationTypes.promotions = e.target.checked;
                    this.saveNotificationPreferences();
                    this.showStatusMessage(
                        `Promotions ${e.target.checked ? 'enabled' : 'disabled'}`,
                        e.target.checked ? 'success' : 'info'
                    );
                });
            }
        }

        showSettingsPanel() {
            const settingsPanel = document.getElementById('notification-settings');
            if (settingsPanel) {
                settingsPanel.classList.remove('hidden');
                // Trigger animation
                settingsPanel.style.animation = 'none';
                setTimeout(() => {
                    settingsPanel.style.animation = 'slideDown 0.3s ease-out';
                }, 10);
            }
        }

        hideSettingsPanel() {
            const settingsPanel = document.getElementById('notification-settings');
            if (settingsPanel) {
                settingsPanel.classList.add('hidden');
            }
        }

        async toggleNotifications() {
            if (!('Notification' in window)) {
                this.showStatusMessage('Your browser does not support notifications', 'error');
                return;
            }

            if (Notification.permission === 'granted') {
                // Toggle between enabled/disabled
                this.notificationEnabled = !this.notificationEnabled;
                
                if (this.notificationEnabled) {
                    this.updateNotificationButton(true);
                    this.showStatusMessage('Real-time notifications enabled!', 'success');
                    this.sendWelcomeNotification();
                    this.scheduleDailyNotifications();
                } else {
                    this.updateNotificationButton(false);
                    this.showStatusMessage('Real-time notifications disabled', 'info');
                    this.cancelDailyNotifications();
                }
                
                this.saveNotificationPreferences();
            } else if (Notification.permission === 'denied') {
                this.showStatusMessage('Notifications are blocked. Please enable them in browser settings.', 'error');
                this.showBrowserAlert('To enable notifications:\n1. Click the lock icon in your browser address bar\n2. Select "Site settings"\n3. Change notifications to "Allow"');
            } else {
                // Request permission
                const permission = await Notification.requestPermission();
                
                if (permission === 'granted') {
                    this.notificationEnabled = true;
                    this.updateNotificationButton(true);
                    this.sendWelcomeNotification();
                    this.saveNotificationPreferences();
                    this.scheduleDailyNotifications();
                    this.showStatusMessage('Real-time notifications enabled! You\'ll receive updates every 30 seconds.', 'success');
                } else {
                    this.showStatusMessage('Notification permission denied', 'warning');
                }
            }
        }

        sendWelcomeNotification() {
            if (!this.notificationEnabled || Notification.permission !== 'granted') return;

            const now = new Date();
            const notification = new Notification('QuickCut - Real-time Queue Enabled!', {
                body: `You will now receive real-time queue updates. Current time: ${now.toLocaleTimeString()}`,
                icon: 'https://cdn-icons-png.flaticon.com/512/1995/1995515.png',
                tag: 'welcome',
                requireInteraction: false,
                silent: false
            });

            setTimeout(() => notification.close(), 5000);
        }

        sendTestNotification() {
            if (!this.notificationEnabled || Notification.permission !== 'granted') {
                this.showStatusMessage('Please enable notifications first', 'warning');
                return;
            }

            const notification = new Notification('QuickCut - Test Notification', {
                body: 'This is a test notification. Your notification system is working correctly!',
                icon: 'https://cdn-icons-png.flaticon.com/512/1995/1995515.png',
                tag: 'test',
                requireInteraction: true
            });

            setTimeout(() => notification.close(), 10000);
            this.showStatusMessage('Test notification sent!', 'success');
        }

        sendQueueNotification(title, message, position = null, priority = 'normal') {
            if (!this.notificationEnabled || Notification.permission !== 'granted' || !this.notificationTypes.queueUpdates) return;

            // Check cooldown
            const now = Date.now();
            if (this.lastNotificationTime && (now - this.lastNotificationTime) < this.notificationCooldown) {
                return null;
            }

            this.lastNotificationTime = now;

            const options = {
                body: position ? `${message} You're now #${position} in line.` : message,
                icon: 'https://cdn-icons-png.flaticon.com/512/1995/1995515.png',
                tag: 'queue-update',
                timestamp: Date.now(),
                renotify: true,
                silent: priority === 'low'
            };

            const notification = new Notification(`QuickCut - ${title}`, options);

            setTimeout(() => notification.close(), 10000);
            return notification;
        }

        scheduleDailyNotifications() {
            if (!this.notificationEnabled || Notification.permission !== 'granted') return;

            // Clear existing notifications
            this.cancelDailyNotifications();

            // Schedule morning check-in notification
            const now = new Date();
            const morningTime = new Date(now);
            morningTime.setHours(9, 0, 0, 0); // 9 AM
            
            if (now < morningTime) {
                setTimeout(() => {
                    if (this.notificationEnabled && this.notificationTypes.appointmentReminders) {
                        this.sendAppointmentReminder('QuickCut opens in 30 minutes! Get ready for your appointment.');
                    }
                }, morningTime - now - 1800000); // 30 minutes before opening
            }

            // Schedule daily summary notification
            const eveningTime = new Date(now);
            eveningTime.setHours(20, 30, 0, 0); // 8:30 PM
            
            if (now < eveningTime) {
                setTimeout(() => {
                    if (this.notificationEnabled) {
                        this.sendDailySummaryNotification();
                    }
                }, eveningTime - now);
            }
        }

        cancelDailyNotifications() {
            // Clear any scheduled notifications
            if (this.dailyNotificationTimeout) {
                clearTimeout(this.dailyNotificationTimeout);
            }
        }

        sendDailySummaryNotification() {
            const notification = new Notification('QuickCut - Daily Summary', {
                body: 'Thank you for using QuickCut today! Check your queue history for tomorrow.',
                icon: 'https://cdn-icons-png.flaticon.com/512/1995/1995515.png',
                tag: 'daily-summary'
            });

            setTimeout(() => notification.close(), 10000);
        }

        sendAppointmentReminder(message) {
            if (!this.notificationEnabled || Notification.permission !== 'granted' || !this.notificationTypes.appointmentReminders) return;

            const notification = new Notification('QuickCut - Appointment Reminder', {
                body: message,
                icon: 'https://cdn-icons-png.flaticon.com/512/1995/1995515.png',
                tag: 'appointment-reminder',
                requireInteraction: true
            });

            setTimeout(() => notification.close(), 15000);
        }

        showStatusMessage(message, type = 'info') {
            this.showToast('Notification Status', message, type);
        }

        // Provide showToast on the notification manager so calls like this.showToast(...) work.
        // Prefer delegating to the parent `RealTimeQueueSystem.showToast` if available, otherwise
        // create a simple bootstrap alert as a fallback.
        showToast(title, message, type = 'info') {
            try {
                if (this.parent && typeof this.parent.showToast === 'function') {
                    return this.parent.showToast(title, message, type);
                }

                // Fallback: simple alert inserted into page
                const container = document.querySelector('.container') || document.body;
                const div = document.createElement('div');
                div.className = `alert alert-${type} alert-dismissible fade show`;
                div.role = 'alert';
                div.innerHTML = `
                    <strong>${title}</strong>
                    <div class="small mt-1">${message}</div>
                    <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
                `;
                container.insertBefore(div, container.firstChild);
                setTimeout(() => {
                    try { const bsAlert = bootstrap.Alert.getOrCreateInstance(div); bsAlert.close(); } catch (e) {}
                }, 4000);
                return null;
            } catch (e) {
                console.error('showToast fallback failed', e);
            }
        }

        showBrowserAlert(message) {
            const alertDiv = document.createElement('div');
            alertDiv.className = 'alert alert-warning alert-dismissible fade show';
            alertDiv.innerHTML = `
                <strong><i class="fas fa-exclamation-triangle me-2"></i>Browser Alert</strong>
                <div class="small mt-1">${message}</div>
                <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
            `;
            
            const container = document.querySelector('.container');
            if (container) {
                container.insertBefore(alertDiv, container.firstChild);
                
                // Auto-dismiss after 10 seconds
                setTimeout(() => {
                    if (alertDiv.parentNode) {
                        const bsAlert = new bootstrap.Alert(alertDiv);
                        bsAlert.close();
                    }
                }, 10000);
            }
        }

        saveNotificationPreferences() {
            const preferences = {
                enabled: this.notificationEnabled,
                types: this.notificationTypes,
                lastUpdated: new Date().toISOString(),
                cooldown: this.notificationCooldown
            };
            localStorage.setItem('quickcutNotificationPrefs', JSON.stringify(preferences));
        }

        loadNotificationPreferences() {
            try {
                const saved = localStorage.getItem('quickcutNotificationPrefs');
                if (saved) {
                    const prefs = JSON.parse(saved);
                    this.notificationEnabled = prefs.enabled;
                    this.notificationTypes = prefs.types || this.notificationTypes;
                    
                    // Update toggle switches in UI
                    const queueToggle = document.getElementById('queue-updates-toggle');
                    const appointmentToggle = document.getElementById('appointment-reminders-toggle');
                    const emergencyToggle = document.getElementById('emergency-updates-toggle');
                    const promotionsToggle = document.getElementById('promotions-toggle');
                    
                    if (queueToggle) queueToggle.checked = this.notificationTypes.queueUpdates;
                    if (appointmentToggle) appointmentToggle.checked = this.notificationTypes.appointmentReminders;
                    if (emergencyToggle) emergencyToggle.checked = this.notificationTypes.emergencyUpdates;
                    if (promotionsToggle) promotionsToggle.checked = this.notificationTypes.promotions;
                    
                    if (this.notificationEnabled && Notification.permission === 'granted') {
                        this.updateNotificationButton(true);
                        this.scheduleDailyNotifications();
                        
                        // Show settings panel if notifications are enabled
                        setTimeout(() => this.showSettingsPanel(), 1000);
                    }
                }
            } catch (e) {
                console.log('No notification preferences found');
            }
        }
    }

    // ========== REAL-TIME QUEUE SYSTEM WITH IMPROVED WAIT TIME CALCULATION ==========
    class RealTimeQueueSystem {
        constructor() {
            this.queueId = this.generateQueueId();
            this.currentPosition = 4;
            this.peopleAhead = 3;
            this.totalQueue = 6;
            this.estimatedWait = 60;
            this.queueHistory = [];
            this.dailyStats = this.loadDailyStats();
            this.realTimeInterval = null;
            this.positionCheckInterval = null;
            this.isRefreshing = false;
            this.notificationManager = null;
            this.lastUpdateTime = null;
            this.businessStatus = this.checkBusinessHours();
            this.realTimeUpdatesEnabled = true;
            
            // New properties for realistic wait time calculation
            this.historicalWaitTimes = this.loadHistoricalWaitTimes();
            this.serviceCompletionTimes = [];
            this.lastQueueCheckTime = Date.now();
            this.lastQueueLength = this.totalQueue;
            this.averageServiceRate = REAL_TIME_CONFIG.AVERAGE_SERVICE_TIME;
            this.serviceTimeHistory = [];
            this.realTimeMultipliers = this.calculateRealTimeMultipliers();
            
            this.initialize();
        }

        // Simple toast helper for page-level messages
        showToast(title, message, type = 'info') {
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
            const bsToast = new bootstrap.Toast(toast, { delay: 5000 });
            bsToast.show();

            toast.addEventListener('hidden.bs.toast', function() {
                toast.remove();
            });
        }

        
        
        initialize() {
            this.loadSavedData();
            this.setupRealTimeConnection();
            
            // Initialize notification manager (pass parent reference so it can delegate UI helpers)
            this.notificationManager = new RealTimeNotificationManager(this);
            
            this.updateDisplay();
            this.startRealTimeUpdates();
            this.setupEventListeners();
            this.checkForBookingData();
            this.initQueueHistory();
            this.updateBusinessStatusDisplay();
            
            // Check for daily reset
            this.checkDailyReset();
            
            console.log(`Queue System initialized with ID: ${this.queueId}`);
            console.log('Notification Manager initialized:', this.notificationManager);
        }
        
        generateQueueId() {
            const date = new Date().toISOString().split('T')[0].replace(/-/g, '');
            const random = Math.random().toString(36).substr(2, 6).toUpperCase();
            return `QC-${date}-${random}`;
        }
        
        setupRealTimeConnection() {
            // Simulate WebSocket connection for real-time updates
            this.simulateWebSocketConnection();
            
            // Listen for visibility changes to resume/pause updates
            document.addEventListener('visibilitychange', () => {
                if (document.hidden) {
                    this.pauseRealTimeUpdates();
                } else {
                    this.resumeRealTimeUpdates();
                    this.refreshQueue();
                }
            });
            
            // Listen for online/offline status
            window.addEventListener('online', () => {
                this.showToast('Reconnected', 'Real-time updates resumed', 'success');
                this.resumeRealTimeUpdates();
            });
            
            window.addEventListener('offline', () => {
                this.showToast('Connection Lost', 'Real-time updates paused', 'warning');
                this.pauseRealTimeUpdates();
            });
        }
        
        simulateWebSocketConnection() {
            // Simulate receiving real-time updates from server
            setInterval(() => {
                // Re-evaluate business hours periodically in case the page or time changed
                try {
                    this.businessStatus = this.checkBusinessHours();
                } catch (e) {
                    // ignore parsing errors and fall back to previous status
                }

                if (this.realTimeUpdatesEnabled && this.businessStatus.isOpen) {
                    this.receiveRealTimeUpdate();
                }
            }, 5000); // Simulate updates every 5 seconds
        }
        
        receiveRealTimeUpdate() {
            const updates = [
                { type: 'position_change', value: -1 },
                { type: 'queue_length', value: 1 },
                { type: 'service_completed', value: null },
                { type: 'new_customer', value: null },
                { type: 'emergency_update', value: 'Barber running late' }
            ];
            
            const randomUpdate = updates[Math.floor(Math.random() * updates.length)];
            
            switch (randomUpdate.type) {
                case 'position_change':
                    if (this.peopleAhead > 0) {
                        this.peopleAhead--;
                        this.currentPosition--;
                        this.logQueueEvent('POSITION_IMPROVED', {
                            newPosition: this.currentPosition,
                            peopleAhead: this.peopleAhead
                        });
                    }
                    break;
                    
                case 'queue_length':
                    if (this.totalQueue < REAL_TIME_CONFIG.MAX_QUEUE_SIZE) {
                        this.totalQueue++;
                        this.logQueueEvent('QUEUE_LENGTH_CHANGE', {
                            newLength: this.totalQueue,
                            direction: 'increase'
                        });
                    }
                    break;
                    
                case 'emergency_update':
                    this.showEmergencyUpdate(randomUpdate.value);
                    break;
            }
            
            this.calculateEstimatedWait();
            this.updateDisplay();
            this.saveCurrentState();
            
            // Send notification for position changes
            if (this.notificationManager && this.peopleAhead < 3) {
                this.notificationManager.sendQueueNotification(
                    'Position Updated',
                    `You're now #${this.currentPosition} in line. Estimated wait: ${this.estimatedWait} minutes`,
                    this.currentPosition
                );
            }
        }
        
        loadSavedData() {
            try {
                // Load from localStorage with day-specific key
                const today = new Date().toDateString();
                const savedData = localStorage.getItem(`quickcutQueue_${today}`);
                
                if (savedData) {
                    const data = JSON.parse(savedData);
                    this.currentPosition = data.currentPosition || 4;
                    this.peopleAhead = data.peopleAhead || 3;
                    this.totalQueue = data.totalQueue || 6;
                    this.estimatedWait = data.estimatedWait || 60;
                    this.queueId = data.queueId || this.queueId;
                    this.queueHistory = data.queueHistory || [];
                    this.lastUpdateTime = data.lastUpdateTime;
                    this.serviceTimeHistory = data.serviceTimeHistory || [];
                    
                    console.log('Loaded saved queue data for today');
                } else {
                    // Check for booking data
                    const bookingData = JSON.parse(localStorage.getItem('quickcutLastBooking'));
                    if (bookingData && bookingData.queuePosition) {
                        this.currentPosition = bookingData.queuePosition;
                        this.peopleAhead = this.currentPosition - 1;
                        this.calculateEstimatedWait();
                        this.logQueueEvent('BOOKING_CREATED', bookingData);
                    }
                }
            } catch (e) {
                console.log('No saved queue data found, using defaults');
            }
        }
        
        loadDailyStats() {
            const today = new Date().toDateString();
            const stats = localStorage.getItem(`quickcutDailyStats_${today}`);
            
            if (stats) {
                return JSON.parse(stats);
            }
            
            return {
                date: today,
                totalQueueChanges: 0,
                positionImprovements: 0,
                notificationsSent: 0,
                averageWaitTime: 0,
                peakQueueLength: 0,
                totalWaitTimeCalculated: 0,
                waitTimeCalculations: 0
            };
        }
        
        loadHistoricalWaitTimes() {
            // Load historical wait time data for more accurate predictions
            try {
                const historicalData = localStorage.getItem('quickcutHistoricalWaitTimes');
                if (historicalData) {
                    return JSON.parse(historicalData);
                }
            } catch (e) {
                console.log('No historical wait time data found');
            }
            
            // Default historical data structure
            return {
                byQueueLength: {}, // { "3": [25, 28, 30], "4": [35, 40, 38] }
                byTimeOfDay: {},   // { "10": [20, 22, 25], "14": [15, 18, 16] }
                byDayOfWeek: {},   // { "0": [30, 35], "5": [25, 28] } // 0=Sunday, 5=Friday
                lastUpdated: new Date().toISOString()
            };
        }
        
        saveHistoricalWaitTimes() {
            localStorage.setItem('quickcutHistoricalWaitTimes', JSON.stringify(this.historicalWaitTimes));
        }
        
        saveDailyStats() {
            const today = new Date().toDateString();
            localStorage.setItem(`quickcutDailyStats_${today}`, JSON.stringify(this.dailyStats));
        }
        
        checkForBookingData() {
            const bookingData = JSON.parse(sessionStorage.getItem('currentBooking'));
            if (bookingData) {
                sessionStorage.removeItem('currentBooking');
                this.showToast('Booking Confirmed!', `You are #${this.currentPosition} in the queue`, 'success');
                this.logQueueEvent('BOOKING_CONFIRMED', bookingData);
                
                // Send notification if enabled
                if (this.notificationManager) {
                    this.notificationManager.sendQueueNotification(
                        'Booking Confirmed',
                        `Your booking is confirmed. You are #${this.currentPosition} in line.`,
                        this.currentPosition
                    );
                }
            }
        }
        
        updateDisplay() {
            // Update position
            document.getElementById('position-number').textContent = `#${this.currentPosition}`;
            document.getElementById('position-text').textContent = `You're #${this.currentPosition} in line`;
            document.getElementById('position-ahead').textContent = `${this.peopleAhead} people ahead of you`;
            
            // Update stats with more detailed information
            document.getElementById('estimated-wait').textContent = `~${this.estimatedWait} minutes`;
            document.getElementById('current-queue').textContent = `${this.totalQueue} people waiting`;
            
            // Update timeline with realistic times
            this.updateTimeline();
            
            // Update progress animation
            this.updateProgressAnimation();
            
            // Update last updated time
            this.updateLastUpdatedTime();
            
            // Update daily stats display
            this.updateDailyStatsDisplay();
            
            // Update wait time details if element exists
            this.updateWaitTimeDetails();
        }
        
        updateTimeline() {
            for (let i = 1; i <= 5; i++) {
                const element = document.getElementById(`timeline-${i === 3 ? 'you' : i}`);
                if (element) {
                    const timeElement = element.querySelector('.timeline-time');
                    if (timeElement) {
                        if (i === 1) {
                            timeElement.textContent = 'Now';
                            element.classList.add('current-serving');
                        } else {
                            // Calculate realistic timeline based on actual wait time
                            const minutes = Math.round((i - 1) * (this.estimatedWait / 4));
                            timeElement.textContent = minutes <= 0 ? 'Now' : `~${minutes} min`;
                            
                            if (i === 4) {
                                element.classList.add('current-you');
                            }
                        }
                    }
                }
            }
        }
        
        updateProgressAnimation() {
            const youElement = document.getElementById('timeline-you');
            if (youElement) {
                const existingProgress = youElement.querySelector('.progress-bar');
                if (existingProgress) {
                    existingProgress.remove();
                }
                
                const progressPercentage = Math.max(5, (1 - (this.peopleAhead / Math.max(this.totalQueue, 1))) * 100);
                
                const progressBar = document.createElement('div');
                progressBar.className = 'progress mt-2';
                progressBar.style.height = '6px';
                progressBar.innerHTML = `
                    <div class="progress-bar progress-bar-striped progress-bar-animated bg-primary" 
                         style="width: ${progressPercentage}%"
                         role="progressbar"
                         aria-valuenow="${progressPercentage}"
                         aria-valuemin="0"
                         aria-valuemax="100">
                    </div>
                `;
                
                youElement.appendChild(progressBar);
            }
        }
        
        updateLastUpdatedTime() {
            const now = new Date();
            this.lastUpdateTime = now;
            
            const timeElement = document.getElementById('last-updated-time');
            if (timeElement) {
                timeElement.textContent = `Last updated: ${now.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`;
                timeElement.title = now.toLocaleString();
            }
        }
        
        updateDailyStatsDisplay() {
            const statsElement = document.getElementById('daily-stats');
            if (statsElement) {
                statsElement.innerHTML = `
                    <div class="row small text-muted">
                        <div class="col-6">Today's Moves: ${this.dailyStats.positionImprovements}</div>
                        <div class="col-6">Queue Changes: ${this.dailyStats.totalQueueChanges}</div>
                        <div class="col-12 mt-1">
                            Avg. Service Time: ${Math.round(this.averageServiceRate)} min
                        </div>
                    </div>
                `;
            }
        }
        
        updateWaitTimeDetails() {
            const detailsElement = document.getElementById('wait-time-details');
            if (detailsElement) {
                const timeOfDay = this.getTimeOfDayMultiplier();
                const dayOfWeek = this.getDayOfWeekMultiplier();
                
                let detailsText = '';
                if (timeOfDay > 1.2) {
                    detailsText = '⏱️ Peak hours: Expect longer wait times';
                } else if (timeOfDay < 0.9) {
                    detailsText = '👍 Off-peak: Shorter wait times expected';
                } else {
                    detailsText = '📊 Based on historical queue data';
                }
                
                detailsElement.innerHTML = `
                    <div class="small text-muted">
                        <i class="fas fa-info-circle me-1"></i> ${detailsText}
                    </div>
                `;
            }
        }
        
        // ========== IMPROVED WAIT TIME CALCULATION METHODS ==========
        
        calculateRealTimeMultipliers() {
            const now = new Date();
            const hour = now.getHours();
            const day = now.getDay(); // 0 = Sunday, 6 = Saturday
            
            return {
                timeOfDay: this.getTimeOfDayMultiplier(),
                dayOfWeek: this.getDayOfWeekMultiplier(),
                queueLength: this.getQueueLengthMultiplier(),
                isPeakHour: hour >= 17 && hour <= 19, // 5-7 PM peak
                isWeekend: day === 0 || day === 6
            };
        }
        
        getTimeOfDayMultiplier() {
            const hour = new Date().getHours();
            
            // Peak hours (lunch time and after work)
            if ((hour >= 11 && hour <= 13) || (hour >= 17 && hour <= 19)) {
                return REAL_TIME_CONFIG.PEAK_HOUR_MULTIPLIER; // 1.5x during peak
            }
            // Off-peak hours (early morning, mid-afternoon)
            else if ((hour >= 9 && hour <= 10) || (hour >= 14 && hour <= 16)) {
                return REAL_TIME_CONFIG.OFF_PEAK_MULTIPLIER; // 0.8x during off-peak
            }
            // Near closing (rushed)
            else if (hour >= 20 && hour <= 21) {
                return 1.3; // 1.3x near closing
            }
            
            return 1.0; // Normal multiplier
        }
        
        getDayOfWeekMultiplier() {
            const day = new Date().getDay(); // 0 = Sunday, 6 = Saturday
            
            // Weekend multiplier
            if (day === 0 || day === 6) {
                return 1.4; // 40% longer on weekends
            }
            // Friday multiplier
            else if (day === 5) {
                return 1.2; // 20% longer on Friday
            }
            
            return 1.0; // Normal weekdays
        }
        
        getQueueLengthMultiplier() {
            // Longer queues might have slightly different service rates
            if (this.totalQueue > 15) {
                return 1.2; // 20% longer for very long queues
            } else if (this.totalQueue > 10) {
                return 1.1; // 10% longer for long queues
            } else if (this.totalQueue < 3) {
                return 0.9; // 10% shorter for very short queues
            }
            
            return 1.0; // Normal multiplier
        }
        
        calculateEstimatedWait() {
            // Update real-time multipliers
            this.realTimeMultipliers = this.calculateRealTimeMultipliers();
            
            // Method 1: Use historical data if available
            const historicalEstimate = this.getHistoricalWaitEstimate();
            
            // Method 2: Use real-time service rate calculation
            const realTimeEstimate = this.calculateRealTimeServiceRate();
            
            // Method 3: Base calculation with multipliers
            const baseEstimate = this.calculateBaseWaitWithMultipliers();
            
            // Combine estimates with weighting
            let finalEstimate;
            
            if (historicalEstimate !== null && this.historicalWaitTimes.byQueueLength[this.peopleAhead]?.length >= 3) {
                // Weight historical data more if we have enough data
                finalEstimate = Math.round(
                    (historicalEstimate * 0.5) + 
                    (realTimeEstimate * 0.3) + 
                    (baseEstimate * 0.2)
                );
            } else {
                // Weight real-time data more if historical data is limited
                finalEstimate = Math.round(
                    (realTimeEstimate * 0.6) + 
                    (baseEstimate * 0.4)
                );
            }
            
            // Apply minimum wait time
            this.estimatedWait = Math.max(REAL_TIME_CONFIG.MIN_WAIT_TIME, finalEstimate);
            
            // Record this wait time for historical data
            this.recordWaitTimeForHistory();
            
            // Update daily stats
            this.dailyStats.totalWaitTimeCalculated += this.estimatedWait;
            this.dailyStats.waitTimeCalculations++;
            this.dailyStats.averageWaitTime = 
                this.dailyStats.totalWaitTimeCalculated / this.dailyStats.waitTimeCalculations;
            
            if (this.totalQueue > this.dailyStats.peakQueueLength) {
                this.dailyStats.peakQueueLength = this.totalQueue;
            }
            
            // Update average service rate
            if (this.peopleAhead > 0) {
                const currentServiceRate = this.estimatedWait / this.peopleAhead;
                this.serviceTimeHistory.push(currentServiceRate);
                
                // Keep only last 20 service rates
                if (this.serviceTimeHistory.length > 20) {
                    this.serviceTimeHistory.shift();
                }
                
                // Calculate new average
                const sum = this.serviceTimeHistory.reduce((a, b) => a + b, 0);
                this.averageServiceRate = sum / this.serviceTimeHistory.length;
            }
            
            return this.estimatedWait;
        }
        
        getHistoricalWaitEstimate() {
            const queueLengthKey = this.peopleAhead.toString();
            const hourKey = new Date().getHours().toString();
            const dayKey = new Date().getDay().toString();
            
            let historicalDataPoints = [];
            
            // Collect data from all historical sources
            if (this.historicalWaitTimes.byQueueLength[queueLengthKey]) {
                historicalDataPoints = historicalDataPoints.concat(
                    this.historicalWaitTimes.byQueueLength[queueLengthKey]
                );
            }
            
            if (this.historicalWaitTimes.byTimeOfDay[hourKey]) {
                historicalDataPoints = historicalDataPoints.concat(
                    this.historicalWaitTimes.byTimeOfDay[hourKey]
                );
            }
            
            if (this.historicalWaitTimes.byDayOfWeek[dayKey]) {
                historicalDataPoints = historicalDataPoints.concat(
                    this.historicalWaitTimes.byDayOfWeek[dayKey]
                );
            }
            
            // If we have enough historical data, calculate average
            if (historicalDataPoints.length >= 3) {
                const sum = historicalDataPoints.reduce((a, b) => a + b, 0);
                return Math.round(sum / historicalDataPoints.length);
            }
            
            return null;
        }
        
        calculateRealTimeServiceRate() {
            const currentTime = Date.now();
            const timeElapsed = (currentTime - this.lastQueueCheckTime) / 60000; // Convert to minutes
            
            // Only calculate if enough time has passed and queue has changed
            if (timeElapsed >= 2 && this.lastQueueLength !== this.totalQueue) {
                const customersServed = this.lastQueueLength - this.totalQueue;
                
                if (customersServed > 0) {
                    const serviceRate = timeElapsed / customersServed;
                    this.serviceCompletionTimes.push(serviceRate);
                    
                    // Keep only last 10 service rates
                    if (this.serviceCompletionTimes.length > 10) {
                        this.serviceCompletionTimes.shift();
                    }
                }
                
                this.lastQueueCheckTime = currentTime;
                this.lastQueueLength = this.totalQueue;
            }
            
            // Calculate current service rate
            let currentServiceRate = REAL_TIME_CONFIG.AVERAGE_SERVICE_TIME;
            
            if (this.serviceCompletionTimes.length >= 3) {
                const sum = this.serviceCompletionTimes.reduce((a, b) => a + b, 0);
                currentServiceRate = sum / this.serviceCompletionTimes.length;
            }
            
            // Apply multipliers
            const baseWait = this.peopleAhead * currentServiceRate;
            const multipliedWait = baseWait * 
                this.realTimeMultipliers.timeOfDay * 
                this.realTimeMultipliers.dayOfWeek * 
                this.realTimeMultipliers.queueLength;
            
            return Math.round(multipliedWait);
        }
        
        calculateBaseWaitWithMultipliers() {
            const baseWait = this.peopleAhead * REAL_TIME_CONFIG.AVERAGE_SERVICE_TIME;
            
            // Apply variance (more realistic than simple random)
            const varianceRange = baseWait * REAL_TIME_CONFIG.SERVICE_TIME_VARIANCE;
            const variance = (Math.random() * varianceRange * 2) - varianceRange;
            
            // Apply all multipliers
            const multipliedWait = (baseWait + variance) * 
                this.realTimeMultipliers.timeOfDay * 
                this.realTimeMultipliers.dayOfWeek * 
                this.realTimeMultipliers.queueLength;
            
            return Math.round(multipliedWait);
        }
        
        recordWaitTimeForHistory() {
            const queueLengthKey = this.peopleAhead.toString();
            const hourKey = new Date().getHours().toString();
            const dayKey = new Date().getDay().toString();
            
            // Initialize arrays if they don't exist
            if (!this.historicalWaitTimes.byQueueLength[queueLengthKey]) {
                this.historicalWaitTimes.byQueueLength[queueLengthKey] = [];
            }
            if (!this.historicalWaitTimes.byTimeOfDay[hourKey]) {
                this.historicalWaitTimes.byTimeOfDay[hourKey] = [];
            }
            if (!this.historicalWaitTimes.byDayOfWeek[dayKey]) {
                this.historicalWaitTimes.byDayOfWeek[dayKey] = [];
            }
            
            // Add current wait time to historical data
            this.historicalWaitTimes.byQueueLength[queueLengthKey].push(this.estimatedWait);
            this.historicalWaitTimes.byTimeOfDay[hourKey].push(this.estimatedWait);
            this.historicalWaitTimes.byDayOfWeek[dayKey].push(this.estimatedWait);
            
            // Keep only last 50 entries per category
            const maxEntries = 50;
            if (this.historicalWaitTimes.byQueueLength[queueLengthKey].length > maxEntries) {
                this.historicalWaitTimes.byQueueLength[queueLengthKey].shift();
            }
            if (this.historicalWaitTimes.byTimeOfDay[hourKey].length > maxEntries) {
                this.historicalWaitTimes.byTimeOfDay[hourKey].shift();
            }
            if (this.historicalWaitTimes.byDayOfWeek[dayKey].length > maxEntries) {
                this.historicalWaitTimes.byDayOfWeek[dayKey].shift();
            }
            
            // Update last updated timestamp
            this.historicalWaitTimes.lastUpdated = new Date().toISOString();
            
            // Save to localStorage periodically (not on every update to avoid performance issues)
            if (Math.random() < 0.1) { // 10% chance to save
                this.saveHistoricalWaitTimes();
            }
        }
        
        // ========== REST OF THE CLASS METHODS ==========
        
        startRealTimeUpdates() {
            // Clear any existing intervals
            this.stopRealTimeUpdates();
            
            // Start position check interval
            this.positionCheckInterval = setInterval(() => {
                if (this.businessStatus.isOpen) {
                    this.checkPositionImprovement();
                }
            }, REAL_TIME_CONFIG.POSITION_CHECK_INTERVAL);
            
            // Start real-time update interval
            this.realTimeInterval = setInterval(() => {
                if (this.businessStatus.isOpen && this.realTimeUpdatesEnabled) {
                    this.simulateQueueMovement();
                }
            }, REAL_TIME_CONFIG.UPDATE_INTERVAL);
            
            console.log('Real-time updates started');
        }
        
        stopRealTimeUpdates() {
            if (this.positionCheckInterval) {
                clearInterval(this.positionCheckInterval);
            }
            if (this.realTimeInterval) {
                clearInterval(this.realTimeInterval);
            }
        }
        
        pauseRealTimeUpdates() {
            this.realTimeUpdatesEnabled = false;
            this.showToast('Updates Paused', 'Real-time updates paused while tab is inactive', 'info');
        }
        
        resumeRealTimeUpdates() {
            this.realTimeUpdatesEnabled = true;
            this.showToast('Updates Resumed', 'Real-time updates resumed', 'success');
        }
        
        simulateQueueMovement() {
            if (Math.random() > 0.7 && this.peopleAhead > 0) {
                this.peopleAhead--;
                this.currentPosition--;
                this.totalQueue = Math.max(2, this.totalQueue - 1);
                
                this.dailyStats.positionImprovements++;
                this.dailyStats.totalQueueChanges++;
                
                this.calculateEstimatedWait();
                this.updateDisplay();
                this.saveCurrentState();
                this.saveDailyStats();
                
                this.logQueueEvent('POSITION_CHANGE', {
                    newPosition: this.currentPosition,
                    oldPosition: this.currentPosition + 1,
                    timestamp: new Date().toISOString()
                });
                
                // Send notification for significant position changes
                if (this.notificationManager && (this.peopleAhead === 2 || this.peopleAhead === 1 || this.peopleAhead === 0)) {
                    this.notificationManager.sendQueueNotification(
                        'Position Improved',
                        `You moved from #${this.currentPosition + 1} to #${this.currentPosition}. New wait time: ~${this.estimatedWait} minutes`,
                        this.currentPosition
                    );
                    this.dailyStats.notificationsSent++;
                }
            }
            
            if (Math.random() > 0.9 && this.totalQueue < REAL_TIME_CONFIG.MAX_QUEUE_SIZE) {
                this.totalQueue++;
                this.dailyStats.totalQueueChanges++;
                this.calculateEstimatedWait();
                this.updateDisplay();
                this.saveCurrentState();
                this.saveDailyStats();
            }
        }
        
        checkPositionImprovement() {
            if (this.peopleAhead === 2) {
                this.showToast('Almost There!', `Only 2 people ahead of you. Estimated wait: ${this.estimatedWait} minutes`, 'info');
            } else if (this.peopleAhead === 1) {
                this.showToast('You\'re Next!', `Only 1 person ahead. Estimated wait: ${this.estimatedWait} minutes`, 'warning');
            } else if (this.peopleAhead === 0) {
                this.showToast('Your Turn!', 'Please proceed to the barber station.', 'success');
                this.logQueueEvent('TURN_ARRIVED', { 
                    timestamp: new Date().toISOString(),
                    totalWaitTime: this.estimatedWait 
                });
            }
        }
        
        refreshQueue() {
            if (this.isRefreshing) return;
            
            this.isRefreshing = true;
            const refreshBtn = document.getElementById('refresh-queue-btn');
            const originalText = refreshBtn.innerHTML;
            
            refreshBtn.innerHTML = '<i class="fas fa-sync-alt fa-spin me-2"></i>Refreshing...';
            refreshBtn.disabled = true;
            
            // Simulate API call delay
            setTimeout(() => {
                if (Math.random() > 0.5 && this.peopleAhead > 0) {
                    this.peopleAhead--;
                    this.currentPosition--;
                    this.dailyStats.positionImprovements++;
                }
                
                this.calculateEstimatedWait();
                this.updateDisplay();
                this.saveCurrentState();
                this.saveDailyStats();
                
                refreshBtn.innerHTML = '<i class="fas fa-check me-2"></i>Refreshed!';
                
                setTimeout(() => {
                    refreshBtn.innerHTML = originalText;
                    refreshBtn.disabled = false;
                    this.isRefreshing = false;
                }, 1000);
                
                this.showToast('Queue Refreshed', `Real-time status updated. New wait time: ~${this.estimatedWait} minutes`, 'success');
            }, 800);
        }
        
        checkDailyReset() {
            const now = new Date();
            const resetTime = new Date();
            const [resetHour, resetMinute] = REAL_TIME_CONFIG.DAILY_RESET_TIME.split(':');
            
            resetTime.setHours(parseInt(resetHour), parseInt(resetMinute), 0, 0);
            
            // If past reset time today, schedule for tomorrow
            if (now > resetTime) {
                resetTime.setDate(resetTime.getDate() + 1);
            }
            
            const timeUntilReset = resetTime - now;
            
            // Schedule daily reset
            setTimeout(() => {
                this.performDailyReset();
                // Schedule next reset
                this.checkDailyReset();
            }, timeUntilReset);
            
            console.log(`Daily reset scheduled for: ${resetTime.toLocaleString()}`);
        }
        
        performDailyReset() {
            console.log('Performing daily reset...');
            
            // Save final stats for the day
            const today = new Date().toDateString();
            const yesterday = new Date(Date.now() - 86400000).toDateString();
            
            // Archive yesterday's stats
            localStorage.setItem(`quickcutStatsArchive_${yesterday}`, JSON.stringify(this.dailyStats));
            
            // Reset queue for new day
            this.currentPosition = 4;
            this.peopleAhead = 3;
            this.totalQueue = 6;
            this.estimatedWait = 60;
            this.queueHistory = [];
            this.dailyStats = {
                date: today,
                totalQueueChanges: 0,
                positionImprovements: 0,
                notificationsSent: 0,
                averageWaitTime: 0,
                peakQueueLength: 0,
                totalWaitTimeCalculated: 0,
                waitTimeCalculations: 0
            };
            this.serviceTimeHistory = [];
            this.averageServiceRate = REAL_TIME_CONFIG.AVERAGE_SERVICE_TIME;
            
            // Clear localStorage for today
            localStorage.removeItem(`quickcutQueue_${today}`);
            
            // Update display
            this.updateDisplay();
            this.saveDailyStats();
            
            // Show reset notification
            this.showToast('Daily Reset', 'Queue has been reset for the new day', 'info');
            
            if (this.notificationManager) {
                this.notificationManager.sendQueueNotification(
                    'New Day Started',
                    'Your queue position has been reset. Book your appointment for today!'
                );
            }
        }
        
        checkBusinessHours() {
            const now = new Date();
            const currentHour = now.getHours();
            const currentMinute = now.getMinutes();
            
            const [startHour, startMinute] = REAL_TIME_CONFIG.BUSINESS_HOURS.start.split(':').map(Number);
            const [endHour, endMinute] = REAL_TIME_CONFIG.BUSINESS_HOURS.end.split(':').map(Number);
            
            const currentTime = currentHour * 60 + currentMinute;
            const startTime = startHour * 60 + startMinute;
            const endTime = endHour * 60 + endMinute;
            
            const isOpen = currentTime >= startTime && currentTime <= endTime;
            
            return {
                isOpen,
                opensAt: `${startHour.toString().padStart(2, '0')}:${startMinute.toString().padStart(2, '0')}`,
                closesAt: `${endHour.toString().padStart(2, '0')}:${endMinute.toString().padStart(2, '0')}`,
                timezone: REAL_TIME_CONFIG.BUSINESS_HOURS.timezone
            };
        }
        
        updateBusinessStatusDisplay() {
            const statusElement = document.getElementById('business-status');
            if (statusElement) {
                if (this.businessStatus.isOpen) {
                    const now = new Date();
                    const currentHour = now.getHours();
                    let statusText = '';
                    
                    if (currentHour >= 17 && currentHour <= 19) {
                        statusText = ' (Peak Hours)';
                    } else if (currentHour >= 11 && currentHour <= 13) {
                        statusText = ' (Lunch Rush)';
                    }
                    
                    statusElement.innerHTML = `
                        <span class="badge bg-success">
                            <i class="fas fa-store me-1"></i> Open${statusText}
                        </span>
                        <small class="text-muted ms-2">Closes at ${this.businessStatus.closesAt}</small>
                    `;
                } else {
                    statusElement.innerHTML = `
                        <span class="badge bg-danger">
                            <i class="fas fa-store-slash me-1"></i> Closed
                        </span>
                        <small class="text-muted ms-2">Opens at ${this.businessStatus.opensAt}</small>
                    `;
                }
            }
        }
        
        showEmergencyUpdate(message) {
            const emergencyElement = document.getElementById('emergency-updates');
            if (emergencyElement) {
                emergencyElement.innerHTML = `
                    <div class="alert alert-warning alert-dismissible fade show" role="alert">
                        <i class="fas fa-exclamation-triangle me-2"></i>
                        <strong>Update:</strong> ${message}
                        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
                    </div>
                `;
                
                // Auto-remove after 30 minutes
                setTimeout(() => {
                    emergencyElement.innerHTML = '';
                }, 30 * 60 * 1000);
                
                // Send notification if enabled
                if (this.notificationManager) {
                    this.notificationManager.sendQueueNotification(
                        'Important Update',
                        message,
                        null,
                        'high'
                    );
                }
            }
        }
        
        initQueueHistory() {
            const historyElement = document.getElementById('queue-history');
            if (historyElement) {
                // Load history from localStorage
                const today = new Date().toDateString();
                const history = JSON.parse(localStorage.getItem(`quickcutQueueHistory_${today}`)) || [];
                
                if (history.length > 0) {
                    let historyHTML = '<h6 class="mb-3"><i class="fas fa-history me-2"></i>Today\'s Queue History</h6>';
                    history.forEach(event => {
                        const time = new Date(event.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
                        let waitTimeInfo = '';
                        
                        if (event.data?.totalWaitTime) {
                            waitTimeInfo = ` (${event.data.totalWaitTime} min wait)`;
                        }
                        
                        historyHTML += `
                            <div class="small mb-2">
                                <span class="text-muted">${time}</span>: ${event.message}${waitTimeInfo}
                            </div>
                        `;
                    });
                    historyElement.innerHTML = historyHTML;
                }
            }
        }
        
        logQueueEvent(type, data) {
            const event = {
                type,
                data,
                timestamp: new Date().toISOString(),
                queueId: this.queueId,
                position: this.currentPosition,
                peopleAhead: this.peopleAhead,
                estimatedWait: this.estimatedWait
            };
            
            this.queueHistory.push(event);
            
            // Keep only last 50 events
            if (this.queueHistory.length > 50) {
                this.queueHistory.shift();
            }
            
            // Save to localStorage
            const today = new Date().toDateString();
            localStorage.setItem(`quickcutQueueHistory_${today}`, JSON.stringify(this.queueHistory));
            
            // Update history display
            this.updateQueueHistoryDisplay(event);
        }
        
        updateQueueHistoryDisplay(event) {
            const historyElement = document.getElementById('queue-history');
            if (historyElement) {
                const time = new Date(event.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
                let message = '';
                let waitInfo = '';
                
                switch (event.type) {
                    case 'POSITION_CHANGE':
                        message = `Moved from #${event.data.oldPosition} to #${event.data.newPosition}`;
                        waitInfo = ` (Wait: ~${event.estimatedWait} min)`;
                        break;
                    case 'BOOKING_CONFIRMED':
                        message = 'Booking confirmed';
                        waitInfo = ` (Initial wait: ~${event.estimatedWait} min)`;
                        break;
                    case 'QUEUE_LENGTH_CHANGE':
                        message = `Queue ${event.data.direction === 'increase' ? 'increased' : 'decreased'} to ${event.data.newLength} people`;
                        waitInfo = ` (New wait: ~${event.estimatedWait} min)`;
                        break;
                    case 'TURN_ARRIVED':
                        message = 'Your turn has arrived';
                        if (event.data?.totalWaitTime) {
                            waitInfo = ` (Total wait: ${event.data.totalWaitTime} min)`;
                        }
                        break;
                    default:
                        message = 'Queue updated';
                        waitInfo = ` (Wait: ~${event.estimatedWait} min)`;
                }
                
                const historyItem = document.createElement('div');
                historyItem.className = 'small mb-2';
                historyItem.innerHTML = `
                    <span class="text-muted">${time}</span>: ${message}${waitInfo}
                `;
                
                historyElement.insertBefore(historyItem, historyElement.firstChild);
                
                // Keep only last 10 items visible
                const items = historyElement.querySelectorAll('div');
                if (items.length > 10) {
                    items[items.length - 1].remove();
                }
            }
        }
        
        saveCurrentState() {
            const today = new Date().toDateString();
            const state = {
                currentPosition: this.currentPosition,
                peopleAhead: this.peopleAhead,
                totalQueue: this.totalQueue,
                estimatedWait: this.estimatedWait,
                queueId: this.queueId,
                queueHistory: this.queueHistory,
                lastUpdateTime: this.lastUpdateTime,
                dailyStats: this.dailyStats,
                serviceTimeHistory: this.serviceTimeHistory,
                averageServiceRate: this.averageServiceRate,
                savedAt: new Date().toISOString()
            };
            
            localStorage.setItem(`quickcutQueue_${today}`, JSON.stringify(state));
        }
        
        setupEventListeners() {
            const refreshBtn = document.getElementById('refresh-queue-btn');
            if (refreshBtn) {
                refreshBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.refreshQueue();
                });
            }
            
            // Add real-time toggle
            const realTimeToggle = document.createElement('button');
            realTimeToggle.id = 'realtime-toggle-btn';
            realTimeToggle.className = 'btn btn-sm btn-outline-info ms-2';
            realTimeToggle.innerHTML = '<i class="fas fa-bolt me-1"></i>Real-time: ON';
            realTimeToggle.addEventListener('click', (e) => {
                e.preventDefault();
                this.toggleRealTimeUpdates();
            });
            
            const buttonGroup = document.querySelector('.btn-group');
            if (buttonGroup) {
                buttonGroup.appendChild(realTimeToggle);
            }
            
            // Export queue data button
            const exportBtn = document.createElement('button');
            exportBtn.id = 'export-queue-btn';
            exportBtn.className = 'btn btn-sm btn-outline-secondary ms-2';
            exportBtn.innerHTML = '<i class="fas fa-download me-1"></i>Export Data';
            exportBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.exportQueueData();
            });
            
            if (buttonGroup) {
                buttonGroup.appendChild(exportBtn);
            }
            
            // Add wait time explanation button
            const waitTimeInfoBtn = document.createElement('button');
            waitTimeInfoBtn.id = 'wait-time-info-btn';
            waitTimeInfoBtn.className = 'btn btn-sm btn-outline-info ms-2';
            waitTimeInfoBtn.innerHTML = '<i class="fas fa-question-circle me-1"></i>Wait Time Info';
            waitTimeInfoBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.showWaitTimeExplanation();
            });
            
            if (buttonGroup) {
                buttonGroup.appendChild(waitTimeInfoBtn);
            }
        }
        
        showWaitTimeExplanation() {
            const explanation = `
                <div class="alert alert-info">
                    <h6><i class="fas fa-calculator me-2"></i>How Wait Time is Calculated</h6>
                    <p class="mb-2">Your estimated wait time is calculated using:</p>
                    <ul class="mb-0 small">
                        <li><strong>Historical Data:</strong> Average wait times for similar queue lengths</li>
                        <li><strong>Real-time Service Rate:</strong> Actual service completion times</li>
                        <li><strong>Time of Day:</strong> ${this.realTimeMultipliers.timeOfDay.toFixed(1)}x multiplier (${this.realTimeMultipliers.timeOfDay > 1 ? 'peak hours' : 'off-peak'})</li>
                        <li><strong>Day of Week:</strong> ${this.realTimeMultipliers.dayOfWeek.toFixed(1)}x multiplier</li>
                        <li><strong>Queue Length:</strong> ${this.realTimeMultipliers.queueLength.toFixed(1)}x multiplier</li>
                    </ul>
                    <hr class="my-2">
                    <p class="mb-0 small"><strong>Current Average Service Time:</strong> ${Math.round(this.averageServiceRate)} minutes per customer</p>
                </div>
            `;
            
            this.showToast('Wait Time Calculation', explanation.replace(/<[^>]*>/g, ''), 'info');
            
            // Also show in a modal if available
            const modalElement = document.getElementById('waitTimeModal');
            if (modalElement) {
                const modalBody = modalElement.querySelector('.modal-body');
                if (modalBody) {
                    modalBody.innerHTML = explanation;
                    const modal = new bootstrap.Modal(modalElement);
                    modal.show();
                }
            }
        }
        
        toggleRealTimeUpdates() {
            this.realTimeUpdatesEnabled = !this.realTimeUpdatesEnabled;
            const toggleBtn = document.getElementById('realtime-toggle-btn');
            
            if (this.realTimeUpdatesEnabled) {
                toggleBtn.innerHTML = '<i class="fas fa-bolt me-1"></i>Real-time: ON';
                toggleBtn.classList.remove('btn-outline-secondary');
                toggleBtn.classList.add('btn-outline-info');
                this.showToast('Real-time Enabled', 'Live updates resumed', 'success');
                this.startRealTimeUpdates();
            } else {
                toggleBtn.innerHTML = '<i class="fas fa-bolt-slash me-1"></i>Real-time: OFF';
                toggleBtn.classList.remove('btn-outline-info');
                toggleBtn.classList.add('btn-outline-secondary');
                this.showToast('Real-time Disabled', 'Live updates paused', 'info');
                this.stopRealTimeUpdates();
            }
        }
        
        exportQueueData() {
            const exportData = {
                queueId: this.queueId,
                currentPosition: this.currentPosition,
                peopleAhead: this.peopleAhead,
                totalQueue: this.totalQueue,
                estimatedWait: this.estimatedWait,
                dailyStats: this.dailyStats,
                queueHistory: this.queueHistory,
                businessHours: REAL_TIME_CONFIG.BUSINESS_HOURS,
                historicalWaitTimes: this.historicalWaitTimes,
                averageServiceRate: this.averageServiceRate,
                realTimeMultipliers: this.realTimeMultipliers,
                lastUpdated: new Date().toISOString(),
                exportDate: new Date().toLocaleString()
            };
            
            const dataStr = JSON.stringify(exportData, null, 2);
            const dataBlob = new Blob([dataStr], {type: 'application/json'});
            const url = URL.createObjectURL(dataBlob);
            
            const a = document.createElement('a');
            a.href = url;
            a.download = `quickcut-queue-${this.queueId}-${Date.now()}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            this.showToast('Data Exported', 'Queue data downloaded as JSON', 'success');
        }
        
        showToast(title, message, type = 'info') {
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
            toast.setAttribute('aria-live', 'assertive');
            toast.setAttribute('aria-atomic', 'true');
            
            // Check if message contains HTML
            const isHtml = /<[^>]*>/.test(message);
            
            toast.innerHTML = `
                <div class="d-flex">
                    <div class="toast-body">
                        <strong>${title}</strong><br>
                        ${isHtml ? `<div class="small mt-1">${message}</div>` : `<small>${message}</small>`}
                    </div>
                    <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
                </div>
            `;
            
            toastContainer.appendChild(toast);
            
            const bsToast = new bootstrap.Toast(toast, { delay: isHtml ? 10000 : 5000 });
            bsToast.show();
            
            toast.addEventListener('hidden.bs.toast', function () {
                toast.remove();
            });
        }
    }

    // ========== BACK TO TOP BUTTON ==========
    const backToTopBtn = document.getElementById('back-to-top');
    
    if (backToTopBtn) {
        window.addEventListener('scroll', function() {
            if (window.scrollY > 300) {
                backToTopBtn.style.display = 'flex';
                backToTopBtn.style.animation = 'fadeIn 0.3s ease';
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
        
        backToTopBtn.style.position = 'fixed';
        backToTopBtn.style.bottom = '20px';
        backToTopBtn.style.right = '20px';
        backToTopBtn.style.zIndex = '1000';
        backToTopBtn.style.width = '50px';
        backToTopBtn.style.height = '50px';
        backToTopBtn.style.borderRadius = '50%';
        backToTopBtn.style.display = 'none';
        backToTopBtn.style.alignItems = 'center';
        backToTopBtn.style.justifyContent = 'center';
        backToTopBtn.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
    }

    // ========== REAL-TIME STATUS INDICATOR ==========
    const createRealTimeIndicator = () => {
        const indicator = document.createElement('div');
        indicator.id = 'realtime-indicator';
        indicator.className = 'position-fixed bottom-0 start-0 m-3 p-2 rounded bg-dark text-white small';
        indicator.style.zIndex = '9999';
        indicator.innerHTML = `
            <div class="d-flex align-items-center">
                <div class="realtime-pulse me-2"></div>
                <span>Real-time Queue</span>
                <small class="ms-2 text-success">LIVE</small>
                <small class="ms-2 text-info" id="realtime-service-rate"></small>
            </div>
        `;
        document.body.appendChild(indicator);
        
        // Update service rate in real-time indicator
        const updateServiceRateDisplay = () => {
            const serviceRateElement = document.getElementById('realtime-service-rate');
            if (serviceRateElement && window.queueSystem) {
                serviceRateElement.textContent = `~${Math.round(window.queueSystem.averageServiceRate)}min/customer`;
            }
        };
        
        // Add pulse animation styles
        const style = document.createElement('style');
        style.textContent = `
            .realtime-pulse {
                width: 10px;
                height: 10px;
                background-color: #28a745;
                border-radius: 50%;
                animation: pulse 1.5s infinite;
            }
            
            @keyframes pulse {
                0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(40, 167, 69, 0.7); }
                70% { transform: scale(1); box-shadow: 0 0 0 10px rgba(40, 167, 69, 0); }
                100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(40, 167, 69, 0); }
            }
        `;
        document.head.appendChild(style);
        
        // Update service rate every 30 seconds
        setInterval(updateServiceRateDisplay, 30000);
        setTimeout(updateServiceRateDisplay, 5000);
    };

    // ========== SOCIAL LINKS ANIMATION ==========
    const socialLinks = document.querySelectorAll('#social-links .social-icon, #footer-social a');
    
    socialLinks.forEach(link => {
        link.addEventListener('mouseenter', function() {
            const icon = this.querySelector('i');
            if (icon) {
                icon.style.transform = 'translateY(-3px) scale(1.2)';
                icon.style.transition = 'transform 0.3s ease';
            }
        });
        
        link.addEventListener('mouseleave', function() {
            const icon = this.querySelector('i');
            if (icon) {
                icon.style.transform = 'translateY(0) scale(1)';
            }
        });
    });

    // ========== FEATURE ITEMS ANIMATION ==========
    const featureItems = document.querySelectorAll('.feature-item');
    
    featureItems.forEach(item => {
        item.addEventListener('mouseenter', function() {
            this.style.transform = 'translateX(5px)';
            this.style.transition = 'transform 0.3s ease';
            
            const icon = this.querySelector('.feature-icon-small i');
            if (icon) {
                icon.style.transform = 'scale(1.2)';
                icon.style.transition = 'transform 0.3s ease';
            }
        });
        
        item.addEventListener('mouseleave', function() {
            this.style.transform = 'translateX(0)';
            const icon = this.querySelector('.feature-icon-small i');
            if (icon) {
                icon.style.transform = 'scale(1)';
            }
        });
    });

    // ========== STATS CARDS ANIMATION ==========
    const statsCards = document.querySelectorAll('.stats-card');
    
    statsCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-5px)';
            this.style.boxShadow = '0 10px 25px rgba(0,0,0,0.15)';
            this.style.transition = 'all 0.3s ease';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
            this.style.boxShadow = '';
        });
    });

    // ========== CUSTOM STYLES ==========
    const customStyles = document.createElement('style');
    customStyles.textContent = `
        @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }
        
        @keyframes pulse {
            0% { transform: scale(1); }
            50% { transform: scale(1.05); }
            100% { transform: scale(1); }
        }
        
        @keyframes slideInRight {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        
        @keyframes progressPulse {
            0% { opacity: 1; }
            50% { opacity: 0.7; }
            100% { opacity: 1; }
        }
        
        .position-card {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border-radius: 15px;
            padding: 25px;
            animation: pulse 3s infinite;
        }
        
        .position-number {
            font-size: 3rem;
            font-weight: bold;
            background: white;
            color: #667eea;
            width: 80px;
            height: 80px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            animation: pulse 2s infinite;
        }
        
        .stats-card {
            background: white;
            border-radius: 10px;
            border: 2px solid #e9ecef;
            transition: all 0.3s ease;
        }
        
        .stats-card:hover {
            border-color: #0d6efd;
        }
        
        .stats-label {
            color: #6c757d;
            font-size: 0.9rem;
        }
        
        .stats-value {
            font-size: 1.5rem;
            font-weight: bold;
            color: #212529;
        }
        
        .wait-time-value {
            font-size: 1.8rem;
            font-weight: bold;
            color: #198754;
            animation: progressPulse 2s infinite;
        }
        
        .timeline-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 15px;
            margin-bottom: 10px;
            background: #f8f9fa;
            border-radius: 8px;
            transition: all 0.3s ease;
        }
        
        .timeline-item.current-serving {
            background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
            color: white;
        }
        
        .timeline-item.current-you {
            background: rgba(13, 110, 253, 0.1);
            border: 2px solid #0d6efd;
            animation: pulse 2s infinite;
        }
        
        .timeline-time {
            font-weight: bold;
            color: #6c757d;
        }
        
        .social-icon {
            width: 40px;
            height: 40px;
            border-radius: 50%;
            background: #f8f9fa;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #6c757d;
            text-decoration: none;
            transition: all 0.3s ease;
        }
        
        .feature-icon-small {
            width: 40px;
            height: 40px;
            background: rgba(13, 110, 253, 0.1);
            border-radius: 10px;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        
        .btn:disabled {
            opacity: 0.7;
            cursor: not-allowed;
        }
        
        .toast-container {
            z-index: 9999;
        }
        
        .realtime-indicator {
            animation: slideInRight 0.5s ease;
        }
        
        .queue-history-container {
            max-height: 200px;
            overflow-y: auto;
            border: 1px solid #e9ecef;
            border-radius: 8px;
            padding: 10px;
            background: #f8f9fa;
        }
        
        .daily-reset-badge {
            animation: pulse 1s infinite;
        }
        
        .peak-hour-badge {
            background: #ffc107;
            color: #000;
            animation: pulse 1.5s infinite;
        }
        
        .off-peak-badge {
            background: #17a2b8;
            color: white;
        }
        
        .wait-time-details {
            font-size: 0.85rem;
            color: #6c757d;
            border-left: 3px solid #0d6efd;
            padding-left: 10px;
            margin-top: 5px;
        }
        
        @media (max-width: 768px) {
            .position-number {
                width: 60px;
                height: 60px;
                font-size: 2rem;
            }
            
            .wait-time-value {
                font-size: 1.5rem;
            }
            
            #realtime-indicator {
                display: none;
            }
            
            .stats-value {
                font-size: 1.3rem;
            }
        }
        
        @media (max-width: 480px) {
            .position-card {
                padding: 15px;
            }
            
            .timeline-item {
                padding: 10px;
                font-size: 0.9rem;
            }
        }
    `;
    document.head.appendChild(customStyles);

    // ========== INITIALIZE REAL-TIME QUEUE SYSTEM ==========
    const queueSystem = new RealTimeQueueSystem();
    window.queueSystem = queueSystem; // Make accessible for debugging
    createRealTimeIndicator();

    // ========== PAGE LOAD ANIMATION ==========
    document.body.style.opacity = '0';
    document.body.style.transition = 'opacity 0.5s ease';
    
    setTimeout(() => {
        document.body.style.opacity = '1';
        
        setTimeout(() => {
            queueSystem.showToast('Real-time Queue Active', 'Your position is being tracked with realistic wait time calculations', 'info');

            // If user just completed a booking, show confirmation toast
            try {
                const justBooked = sessionStorage.getItem('justBooked');
                if (justBooked) {
                    sessionStorage.removeItem('justBooked');
                    const booking = JSON.parse(sessionStorage.getItem('currentBooking') || '{}');
                    const msg = booking && booking.bookingId ? `Booking ${booking.bookingId} confirmed — ${booking.date} at ${booking.time}.` : 'Your booking has been confirmed.';
                    queueSystem.showToast('Booking Confirmed', msg, 'success');
                }
            } catch (e) {
                console.warn('Error showing booking confirmation', e);
            }

            // Show welcome modal for first-time visitors
            if (!localStorage.getItem('quickcutFirstVisit')) {
                setTimeout(() => {
                    const welcomeMessage = `
                        <div class="alert alert-info">
                            <h6>Welcome to QuickCut Queue!</h6>
                            <p class="mb-2">Your wait time is calculated using:</p>
                            <ul class="mb-0 small">
                                <li>Historical queue data</li>
                                <li>Real-time service rates</li>
                                <li>Time of day factors</li>
                                <li>Day of week adjustments</li>
                            </ul>
                            <hr class="my-2">
                            <p class="mb-0 small">Click "Wait Time Info" for details about calculations.</p>
                        </div>
                    `;
                    queueSystem.showToast('Welcome!', welcomeMessage.replace(/<[^>]*>/g, ''), 'info');
                    localStorage.setItem('quickcutFirstVisit', 'true');
                }, 2000);
            }
        }, 1000);
    }, 100);

    // ========== BROWSER VISIBILITY HANDLING ==========
    document.addEventListener('visibilitychange', function() {
        if (document.visibilityState === 'visible') {
            queueSystem.refreshQueue();
        }
    });

    window.addEventListener('beforeunload', function() {
        queueSystem.stopRealTimeUpdates();
        queueSystem.saveCurrentState();
        queueSystem.saveDailyStats();
        queueSystem.saveHistoricalWaitTimes();
    });

    // ========== SERVICE WORKER REGISTRATION (Optional) ==========
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('/service-worker.js').then(registration => {
                console.log('ServiceWorker registration successful with scope: ', registration.scope);
            }).catch(err => {
                console.log('ServiceWorker registration failed: ', err);
            });
        });
    }

    console.log('Enhanced Real-time Queue System initialized successfully');
});
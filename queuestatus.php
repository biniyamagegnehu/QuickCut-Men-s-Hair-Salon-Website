<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>QuickCut - Queue Status</title>
    <!-- Bootstrap 5 CSS -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <!-- Font Awesome Icons -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
    <!-- Custom CSS -->
    <link rel="stylesheet" href="css/queuestatus.css">
    <!-- Custom Styles for Notifications -->
    <style>
        .notification-settings-panel.hidden {
            display: none;
        }
        
        .notification-settings-panel {
            animation: slideDown 0.3s ease-out;
        }
        
        @keyframes slideDown {
            from {
                opacity: 0;
                transform: translateY(-20px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
        
        .notification-bell {
            animation: bellRing 2s infinite;
        }
        
        @keyframes bellRing {
            0%, 100% { transform: rotate(0); }
            5%, 15% { transform: rotate(20deg); }
            10%, 20% { transform: rotate(-20deg); }
            25% { transform: rotate(0); }
        }
        
        #enable-notifications-btn.btn-success {
            background-color: #28a745;
            border-color: #28a745;
            color: white;
        }
        
        #enable-notifications-btn.btn-success:hover {
            background-color: #218838;
            border-color: #1e7e34;
            transform: translateY(-2px);
            box-shadow: 0 4px 8px rgba(40, 167, 69, 0.3);
        }
    </style>
</head>
<body id="queue-status-body">
    <!-- Navigation -->
    <nav class="navbar navbar-expand-lg navbar-dark fixed-top" id="queue-nav">
        <div class="container">
            <a class="navbar-brand logo" href="welcome.html" id="queue-logo">
                <i class="fas fa-cut me-2"></i>QuickCut
            </a>
            <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" id="queue-menu-toggle">
                <span class="navbar-toggler-icon"></span>
            </button>
            <div class="collapse navbar-collapse" id="navbarNav">
                <ul class="navbar-nav ms-auto" id="queue-nav-menu">
                    <li class="nav-item">
                        <a class="nav-link" href="bookappointment.html" id="nav-book"><i class="fas fa-calendar-alt me-1"></i>Book Appointment</a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link active" href="queuestatus.html" id="nav-queue"><i class="fas fa-list-ol me-1"></i>Queue Status</a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link" href="aboutus.html" id="nav-about"><i class="fas fa-info-circle me-1"></i>About</a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link" href="welcome.html" id="nav-logout"><i class="fas fa-sign-out-alt me-1"></i>Logout</a>
                    </li>
                </ul>
                <a href="bookappointment.html" class="btn btn-primary ms-lg-3 mt-2 mt-lg-0 book-now-btn" id="queue-book-now">
                    <i class="fas fa-scissors me-1"></i>Book Now
                </a>
            </div>
        </div>
    </nav>

    <!-- Main Content -->
    <main class="container mt-5 pt-5" id="queue-main">
        <div class="row align-items-start min-vh-75">
            <!-- Left Column - Queue Status -->
            <div class="col-lg-8 mb-5 mb-lg-0" id="queue-left-column">
                <div class="card login-card shadow-lg" id="queue-status-card">
                    <div class="card-body p-4 p-md-5">
                        <div class="text-center mb-4">
                            <h2 class="fw-bold text-primary" id="queue-title">Queue Status</h2>
                            <p class="text-muted" id="queue-subtitle">Track your position in real-time</p>
                        </div>
                        
                        <!-- Current Position -->
                        <div class="position-card mb-4" id="position-card">
                            <div class="row align-items-center">
                                <div class="col-auto">
                                    <div class="position-number" id="position-number">#4</div>
                                </div>
                                <div class="col">
                                    <h3 class="fw-bold mb-1" id="position-text">You're #4 in line</h3>
                                    <p class="text-muted mb-0" id="position-ahead">3 people ahead of you</p>
                                </div>
                            </div>
                        </div>
                        
                        <!-- Stats Cards -->
                        <div class="row g-4 mb-4" id="queue-stats">
                            <div class="col-md-6">
                                <div class="stats-card p-4 text-center">
                                    <div class="stats-label mb-2">Estimated Wait</div>
                                    <div class="stats-value" id="estimated-wait">~60 minutes</div>
                                </div>
                            </div>
                            <div class="col-md-6">
                                <div class="stats-card p-4 text-center">
                                    <div class="stats-label mb-2">Current Queue</div>
                                    <div class="stats-value" id="current-queue">6 people waiting</div>
                                </div>
                            </div>
                        </div>
                        
                        <!-- Action Buttons -->
                        <div class="row g-3 mb-4" id="action-buttons">
                            <div class="col-md-6">
                                <button class="btn btn-primary btn-lg w-100" id="refresh-queue-btn">
                                    <i class="fas fa-sync-alt me-2"></i>Refresh Queue
                                </button>
                            </div>
                            <div class="col-md-6">
                                <button class="btn btn-outline-primary btn-lg w-100" id="enable-notifications-btn">
                                    <i class="fas fa-bell me-2"></i>Enable Notifications
                                </button>
                            </div>
                        </div>
                        
                        <!-- Notification Settings Panel -->
                        <div class="notification-settings-panel mt-4 hidden" id="notification-settings">
                            <div class="card">
                                <div class="card-header bg-light d-flex justify-content-between align-items-center">
                                    <h6 class="mb-0"><i class="fas fa-cog me-2"></i>Notification Settings</h6>
                                    <button type="button" class="btn-close" id="close-settings-btn"></button>
                                </div>
                                <div class="card-body">
                                    <div class="form-check form-switch mb-3">
                                        <input class="form-check-input" type="checkbox" id="queue-updates-toggle" checked>
                                        <label class="form-check-label" for="queue-updates-toggle">
                                            <i class="fas fa-users me-1"></i> Queue Position Updates
                                        </label>
                                        <small class="text-muted d-block mt-1">Get notified when your position changes</small>
                                    </div>
                                    <div class="form-check form-switch mb-3">
                                        <input class="form-check-input" type="checkbox" id="appointment-reminders-toggle" checked>
                                        <label class="form-check-label" for="appointment-reminders-toggle">
                                            <i class="fas fa-calendar-alt me-1"></i> Appointment Reminders
                                        </label>
                                        <small class="text-muted d-block mt-1">Reminders before your appointment</small>
                                    </div>
                                    <div class="form-check form-switch mb-3">
                                        <input class="form-check-input" type="checkbox" id="promotions-toggle" checked>
                                        <label class="form-check-label" for="promotions-toggle">
                                            <i class="fas fa-tag me-1"></i> Promotions & Offers
                                        </label>
                                        <small class="text-muted d-block mt-1">Special offers and discounts</small>
                                    </div>
                                    <div class="form-check form-switch mb-4">
                                        <input class="form-check-input" type="checkbox" id="emergency-updates-toggle" checked>
                                        <label class="form-check-label" for="emergency-updates-toggle">
                                            <i class="fas fa-exclamation-triangle me-1"></i> Emergency Updates
                                        </label>
                                        <small class="text-muted d-block mt-1">Important service announcements</small>
                                    </div>
                                    
                                    <div class="border-top pt-3">
                                        <button class="btn btn-outline-primary btn-sm w-100" id="test-notification-btn">
                                            <i class="fas fa-bell me-1"></i> Test Notification
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <!-- Queue Timeline -->
                        <div class="timeline-section" id="timeline-section">
                            <h4 class="fw-bold mb-4" id="timeline-title">Queue Timeline</h4>
                            <div class="timeline" id="queue-timeline">
                                <div class="timeline-item current-serving" id="timeline-current">
                                    <div class="timeline-content">
                                        <h5 class="fw-bold mb-1">Being served</h5>
                                        <span class="badge bg-success">Now</span>
                                    </div>
                                    <div class="timeline-time" id="current-time">0 min</div>
                                </div>
                                <div class="timeline-item" id="timeline-1">
                                    <div class="timeline-content">
                                        <h5 class="fw-bold mb-1">Customer</h5>
                                    </div>
                                    <div class="timeline-time" id="time-1">~15 min</div>
                                </div>
                                <div class="timeline-item" id="timeline-2">
                                    <div class="timeline-content">
                                        <h5 class="fw-bold mb-1">Customer</h5>
                                    </div>
                                    <div class="timeline-time" id="time-2">~30 min</div>
                                </div>
                                <div class="timeline-item current-you" id="timeline-you">
                                    <div class="timeline-content">
                                        <h5 class="fw-bold mb-1 text-primary">You</h5>
                                    </div>
                                    <div class="timeline-time" id="your-time">~45 min</div>
                                </div>
                                <div class="timeline-item" id="timeline-3">
                                    <div class="timeline-content">
                                        <h5 class="fw-bold mb-1">Customer</h5>
                                    </div>
                                    <div class="timeline-time" id="time-3">~60 min</div>
                                </div>
                            </div>
                        </div>
                        
                        <!-- Additional Queue Info -->
                        <div class="row mt-4" id="additional-queue-info">
                            <div class="col-md-6">
                                <div class="small text-muted" id="last-updated-time">
                                    Last updated: <span id="update-time">--:--</span>
                                </div>
                            </div>
                            <div class="col-md-6 text-end">
                                <div class="small text-muted" id="business-status">
                                    <span id="status-badge" class="badge bg-success">Open</span>
                                </div>
                            </div>
                        </div>
                        
                        <!-- Real-time Status -->
                        <div class="mt-3" id="wait-time-details">
                            <div class="small text-muted">
                                <i class="fas fa-info-circle me-1"></i> <span id="wait-time-info">Based on historical queue data</span>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- What to Expect Section -->
                <div class="card login-card shadow-lg mt-4" id="expectations-card">
                    <div class="card-body p-4 p-md-5">
                        <h4 class="fw-bold mb-4" id="expectations-title">What to Expect</h4>
                        <ul class="expect-list" id="expectations-list">
                            <li class="mb-3" id="expect-1">
                                <i class="fas fa-info-circle text-primary me-2"></i>
                                Queue times are estimated and may vary based on service complexity
                            </li>
                            <li class="mb-3" id="expect-2">
                                <i class="fas fa-bell text-primary me-2"></i>
                                You'll receive a notification when you're next in line (if enabled)
                            </li>
                            <li class="mb-3" id="expect-3">
                                <i class="fas fa-user-check text-primary me-2"></i>
                                Please arrive at the salon when you're in the top 2 positions
                            </li>
                            <li id="expect-4">
                                <i class="fas fa-sync-alt text-primary me-2"></i>
                                Refresh the page to see real-time queue updates
                            </li>
                        </ul>
                    </div>
                </div>
                
                <!-- Queue History Section -->
                <div class="card login-card shadow-lg mt-4" id="history-card">
                    <div class="card-body p-4 p-md-5">
                        <h4 class="fw-bold mb-4" id="history-title">
                            <i class="fas fa-history me-2"></i>Queue History
                        </h4>
                        <div class="queue-history-container" id="queue-history">
                            <div class="text-muted small">No queue history yet</div>
                        </div>
                        <div class="mt-3" id="daily-stats"></div>
                    </div>
                </div>
            </div>
            
            <!-- Right Column - Info & Features -->
            <div class="col-lg-4" id="queue-right-column">
                <!-- Contact Info Card -->
                <div class="card login-card shadow-lg mb-4" id="contact-card">
                    <div class="card-body p-4">
                        <h5 class="fw-bold mb-3" id="contact-title">
                            <i class="fas fa-cut me-2 text-primary"></i>QuickCut
                        </h5>
                        <p class="text-muted small mb-4" id="contact-description">
                            Skip the wait. Get the cut. QuickCut makes hair appointments fast, easy, and convenient.
                        </p>
                        
                        <div class="contact-info mb-4" id="contact-info">
                            <h6 class="fw-bold mb-3">Contact Us</h6>
                            <ul class="list-unstyled">
                                <li class="mb-2" id="contact-phone">
                                    <i class="fas fa-phone me-2 text-primary"></i>
                                    <span id="phone-number">(+251) 921456765</span>
                                </li>
                                <li class="mb-2" id="contact-email">
                                    <i class="fas fa-envelope me-2 text-primary"></i>
                                    <span id="email-address">info@quickcut.com</span>
                                </li>
                                <li id="contact-address">
                                    <i class="fas fa-map-marker-alt me-2 text-primary"></i>
                                    <span id="address">123 Main Street, Downtown</span>
                                </li>
                            </ul>
                        </div>
                        
                        <div class="working-hours" id="working-hours">
                            <h6 class="fw-bold mb-3">Working Hours</h6>
                            <ul class="list-unstyled">
                                <li class="mb-2">Monday - Sunday: 6:00 AM - 6:00 PM</li>
                            </ul>
                        </div>
                    </div>
                </div>
                
                <!-- Features Card -->
                <div class="card login-card shadow-lg" id="features-card">
                    <div class="card-body p-4">
                        <h5 class="fw-bold mb-3" id="features-title">
                            Skip the wait. <span class="text-primary">Get the cut.</span>
                        </h5>
                        <p class="text-muted small mb-4" id="features-description">
                            Book your appointment online and avoid long queues. 
                            QuickCut connects you with the best barbers and stylists in your area.
                        </p>
                        
                        <div class="features" id="features-list">
                            <div class="feature-item mb-3" id="feature-1">
                                <div class="feature-icon-small me-3">
                                    <i class="fas fa-clock text-primary"></i>
                                </div>
                                <div>
                                    <h6 class="fw-bold mb-1">Quick Booking</h6>
                                    <p class="text-muted small mb-0">Book appointments in under 2 minutes</p>
                                </div>
                            </div>
                            <div class="feature-item mb-3" id="feature-2">
                                <div class="feature-icon-small me-3">
                                    <i class="fas fa-calendar-check text-primary"></i>
                                </div>
                                <div>
                                    <h6 class="fw-bold mb-1">Real-time Updates</h6>
                                    <p class="text-muted small mb-0">Live queue status and notifications</p>
                                </div>
                            </div>
                            <div class="feature-item mb-3" id="feature-3">
                                <div class="feature-icon-small me-3">
                                    <i class="fas fa-star text-primary"></i>
                                </div>
                                <div>
                                    <h6 class="fw-bold mb-1">Top Professionals</h6>
                                    <p class="text-muted small mb-0">Rated and reviewed barbers & stylists</p>
                                </div>
                            </div>
                            <div class="feature-item" id="feature-4">
                                <div class="feature-icon-small me-3">
                                    <i class="fas fa-credit-card text-primary"></i>
                                </div>
                                <div>
                                    <h6 class="fw-bold mb-1">Secure Payments</h6>
                                    <p class="text-muted small mb-0">Safe and easy online payments</p>
                                </div>
                            </div>
                        </div>
                        
                        <div class="social-links mt-4 pt-3 border-top" id="social-links">
                            <p class="small text-muted mb-2" id="follow-text">Follow Us</p>
                            <div class="d-flex" id="social-icons">
                                <a href="https://facebook.com" target="_blank" class="social-icon me-3" id="facebook-link">
                                    <i class="fab fa-facebook-f"></i>
                                </a>
                                <a href="https://twitter.com" target="_blank" class="social-icon me-3" id="twitter-link">
                                    <i class="fab fa-twitter"></i>
                                </a>
                                <a href="https://instagram.com" target="_blank" class="social-icon me-3" id="instagram-link">
                                    <i class="fab fa-instagram"></i>
                                </a>
                                <a href="https://tiktok.com" target="_blank" class="social-icon" id="tiktok-link">
                                    <i class="fab fa-tiktok"></i>
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- Emergency Updates Card -->
                <div class="card login-card shadow-lg mt-4" id="emergency-updates-card">
                    <div class="card-body p-4">
                        <h5 class="fw-bold mb-3" id="emergency-title">
                            <i class="fas fa-exclamation-triangle me-2 text-warning"></i>Emergency Updates
                        </h5>
                        <div id="emergency-updates">
                            <div class="text-muted small">No emergency updates at this time</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </main>

    <!-- Footer -->
    <footer class="footer-section" id="queue-footer">
        <div class="container py-5">
            <div class="row">
                <div class="col-lg-4 mb-4 mb-lg-0" id="footer-left">
                    <h5 class="fw-bold mb-3" id="footer-logo">
                        <i class="fas fa-cut me-2 text-primary"></i>QuickCut
                    </h5>
                    <p class="text-light small" id="footer-description">
                        Skip the wait. Get the cut. QuickCut makes hair appointments fast, easy, and convenient.
                    </p>
                    <div class="social-links mt-3" id="footer-social">
                        <a href="https://facebook.com" target="_blank" class="text-white me-3" id="footer-facebook">
                            <i class="fab fa-facebook fa-lg"></i>
                        </a>
                        <a href="https://twitter.com" target="_blank" class="text-white me-3" id="footer-twitter">
                            <i class="fab fa-twitter fa-lg"></i>
                        </a>
                        <a href="https://instagram.com" target="_blank" class="text-white me-3" id="footer-instagram">
                            <i class="fab fa-instagram fa-lg"></i>
                        </a>
                        <a href="https://tiktok.com" target="_blank" class="text-white" id="footer-tiktok">
                            <i class="fab fa-tiktok fa-lg"></i>
                        </a>
                    </div>
                </div>
                
                <div class="col-lg-4 mb-4 mb-lg-0" id="footer-middle">
                    <h5 class="fw-bold mb-3">Contact Us</h5>
                    <ul class="list-unstyled">
                        <li class="mb-2">
                            <i class="fas fa-phone me-2 text-primary"></i>
                            (+251) 921456765
                        </li>
                        <li class="mb-2">
                            <i class="fas fa-envelope me-2 text-primary"></i>
                            quickcut@gmail.com
                        </li>
                        <li>
                            <i class="fas fa-map-marker-alt me-2 text-primary"></i>
                            123 Main Street, Downtown
                        </li>
                    </ul>
                </div>
                
                <div class="col-lg-4" id="footer-right">
                    <h5 class="fw-bold mb-3">Working Hours</h5>
                    <ul class="list-unstyled">
                        <li class="mb-2">Monday - Sunday: 6:00 AM - 6:00 PM</li>
                    </ul>
                </div>
            </div>
            
            <hr class="bg-light my-4" id="footer-divider">
            
            <div class="text-center" id="footer-bottom">
                <p class="mb-0" id="copyright">
                    © 2025 QuickCut. All rights reserved. | 
                    <a href="#" class="text-decoration-none text-primary" id="privacy-policy">Privacy Policy</a> | 
                    <a href="#" class="text-decoration-none text-primary" id="terms-service">Terms of Service</a>
                </p>
            </div>
        </div>
    </footer>
    
    <!-- Back to Top Button -->
    <button class="btn btn-primary scroll-to-top" style="display: none;" id="back-to-top">
        <i class="fas fa-chevron-up"></i>
    </button>

    <!-- Bootstrap JS Bundle -->
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
    <!-- Auth (logout handling) -->
    <script src="js/auth.js"></script>
    <!-- Custom JavaScript -->
    <script src="js/queuestatus.js"></script>
</body>
</html>
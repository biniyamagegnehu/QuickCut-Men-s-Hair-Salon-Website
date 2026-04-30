<?php
// header.php - Main Website Header
require_once 'db.php';
require_once 'config.php';
$is_logged_in = isset($_SESSION['user_id']);
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>QuickCut - Professional Barber Services</title>
    <!-- Bootstrap 5 CSS -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <!-- Font Awesome Icons -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
    <!-- Google Fonts -->
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800&family=Playfair+Display:wght@400;500;600&display=swap" rel="stylesheet">
    <!-- Custom CSS -->
    <link rel="stylesheet" href="<?php echo BASE_URL; ?>assets/css/welcome.css">
    <link rel="stylesheet" href="<?php echo BASE_URL; ?>assets/css/notifications.css">
    <script>
        const BASE_URL = '<?php echo BASE_URL; ?>';
    </script>
</head>
<body id="main-body">
    <!-- Navigation -->
    <nav class="navbar navbar-expand-lg navbar-dark fixed-top" id="main-nav">
        <div class="container">
            <a class="navbar-brand logo" href="<?php echo BASE_URL; ?>welcome.php" id="logo">
                <i class="fas fa-cut me-2"></i>QuickCut
            </a>
            <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" id="menu-toggle">
                <span class="navbar-toggler-icon"></span>
            </button>
            <div class="collapse navbar-collapse" id="navbarNav">
                <ul class="navbar-nav ms-auto align-items-lg-center" id="nav-menu">
                    <li class="nav-item">
                        <a class="nav-link" href="<?php echo BASE_URL; ?>welcome.php"><i class="fas fa-home me-1"></i>Home</a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link" href="<?php echo $is_logged_in ? BASE_URL.'booking/bookappointment.php' : BASE_URL.'auth/login.php'; ?>"><i class="fas fa-calendar-alt me-1"></i>Book Appointment</a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link" href="<?php echo $is_logged_in ? BASE_URL.'queue/queuestatus.php' : BASE_URL.'auth/login.php'; ?>"><i class="fas fa-list-ol me-1"></i>Queue Status</a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link" href="<?php echo BASE_URL; ?>aboutus.php"><i class="fas fa-info-circle me-1"></i>About</a>
                    </li>
                    <?php if ($is_logged_in): ?>
                        <!-- Notification Bell -->
                        <li class="nav-item">
                            <div class="notification-bell-wrapper nav-link" id="notification-bell-wrapper">
                                <i class="fas fa-bell"></i>
                                <span class="notification-badge" id="notification-badge">0</span>
                                
                                <div class="notification-dropdown" id="notification-dropdown">
                                    <div class="notification-header">
                                        <h6>Notifications</h6>
                                        <a href="#" class="mark-all-read" id="mark-all-read-btn">Mark all as read</a>
                                    </div>
                                    <div class="unread-status p-2 px-3 small text-muted border-bottom">
                                        <span id="unread-count-text">0 New</span>
                                    </div>
                                    <div class="notification-list" id="notification-list">
                                        <!-- Notifications will be loaded here -->
                                        <div class="no-notifications">
                                            <i class="fas fa-bell-slash"></i>
                                            <p>Loading...</p>
                                        </div>
                                    </div>
                                    <div class="notification-footer">
                                        <a href="#">View All</a>
                                    </div>
                                </div>
                            </div>
                        </li>

                        <li class="nav-item">
                            <a class="nav-link" href="<?php echo BASE_URL; ?>auth/logout.php" id="nav-logout"><i class="fas fa-sign-out-alt me-1"></i>Logout</a>
                        </li>
                    <?php else: ?>
                        <li class="nav-item">
                            <a class="nav-link" href="<?php echo BASE_URL; ?>auth/login.php" id="nav-login"><i class="fas fa-sign-in-alt me-1"></i>Login</a>
                        </li>
                    <?php endif; ?>
                </ul>
                <a href="<?php echo $is_logged_in ? BASE_URL.'booking/bookappointment.php' : BASE_URL.'auth/login.php'; ?>" class="btn btn-primary ms-lg-3 mt-2 mt-lg-0 book-now-btn" id="book-now-btn">
                    <i class="fas fa-scissors me-1"></i>Book Now
                </a>
            </div>
        </div>
    </nav>

<?php
require_once '../admin_auth.php';
check_admin_page();
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>QuickCut - Admin Dashboard</title>
    
    <!-- Bootstrap 5 CSS -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <!-- Font Awesome Icons -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
    <!-- Chart.js -->
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    
    <!-- CSS Files -->
    <link rel="stylesheet" href="../css/common.css">
    <link rel="stylesheet" href="css/dashboard.css">
    <link rel="stylesheet" href="../../assets/css/notifications.css">
    <?php require_once '../../includes/config.php'; ?>
    <script>
        const BASE_URL = '<?php echo BASE_URL; ?>';
    </script>
</head>
<body>
    <!-- Sidebar -->
    <nav class="sidebar">
        <div class="sidebar-header">
            <a href="../dashboard/dashboard.php" class="sidebar-brand">
                <i class="fas fa-cut me-2"></i>QuickCut Admin
            </a>
        </div>
        
        <div class="sidebar-menu">
            <ul class="nav flex-column">
                <li class="nav-item">
                    <a class="nav-link active" href="../dashboard/dashboard.php">
                        <i class="fas fa-tachometer-alt"></i>
                        Dashboard
                    </a>
                </li>
                <li class="nav-item">
                    <a class="nav-link" href="../dashboard/appointments.php">
                        <i class="fas fa-calendar-alt"></i>
                        Appointments
                    </a>
                </li>
                <li class="nav-item">
                    <a class="nav-link" href="../dashboard/barbers.php">
                        <i class="fas fa-user-tie"></i>
                        Barbers
                    </a>
                </li>
                <li class="nav-item">
                    <a class="nav-link" href="../management/services.php">
                        <i class="fas fa-cut"></i>
                        Services
                    </a>
                </li>
                <li class="nav-item">
                    <a class="nav-link" href="../management/working_hours.php">
                        <i class="fas fa-clock"></i>
                        Working Hours
                    </a>
                </li>
                <li class="nav-item">
                    <a class="nav-link" href="../dashboard/customers.php">
                        <i class="fas fa-users"></i>
                        Customers
                    </a>
                </li>
                <li class="nav-item">
                    <a class="nav-link" href="../dashboard/reports.php">
                        <i class="fas fa-chart-bar"></i>
                        Reports
                    </a>
                </li>
                <li class="nav-item">
                    <a class="nav-link" href="../settings.php">
                        <i class="fas fa-cog"></i>
                        Settings
                    </a>
                </li>
            </ul>
        </div>
        
        <div class="sidebar-footer">
            <div class="admin-profile">
                <div class="admin-avatar">
                    <i class="fas fa-user"></i>
                </div>
                <div class="admin-info">
                    <h6 class="mb-0">Admin User</h6>
                    <small class="text-muted">Administrator</small>
                </div>
                <a href="../../auth/logout.php" class="logout-btn ms-auto" title="Logout" id="nav-logout">
                    <i class="fas fa-sign-out-alt"></i>
                </a>
            </div>
        </div>
    </nav>

    <!-- Main Content -->
    <main class="main-content">
        <!-- Top Navigation -->
        <nav class="top-nav">
            <button class="sidebar-toggle">
                <i class="fas fa-bars"></i>
            </button>
            <div class="search-box">
                <i class="fas fa-search"></i>
                <input type="text" placeholder="Search..." id="global-search">
            </div>
            <div class="top-nav-items">
                <div class="notification-bell-wrapper" id="notification-bell-wrapper">
                    <button class="notification-btn">
                        <i class="fas fa-bell"></i>
                        <span class="badge" id="notification-badge">0</span>
                    </button>
                    
                    <div class="notification-dropdown" id="notification-dropdown" style="top: 40px; right: 0;">
                        <div class="notification-header">
                            <h6 class="text-white">Admin Alerts</h6>
                            <a href="#" class="mark-all-read" id="mark-all-read-btn">Mark all as read</a>
                        </div>
                        <div class="unread-status p-2 px-3 small text-muted border-bottom">
                            <span id="unread-count-text">0 New</span>
                        </div>
                        <div class="notification-list" id="notification-list">
                            <div class="no-notifications">
                                <i class="fas fa-bell-slash"></i>
                                <p>Loading alerts...</p>
                            </div>
                        </div>
                        <div class="notification-footer">
                            <a href="../dashboard/reports.php">View Activity Log</a>
                        </div>
                    </div>
                </div>
                <button class="fullscreen-btn">
                    <i class="fas fa-expand"></i>
                </button>
                <div class="date-time">
                    <span id="current-date"></span>
                    <span id="current-time"></span>
                </div>
            </div>
        </nav>

        <!-- Content Wrapper -->
        <div class="content-wrapper">
            <div class="section-header">
                <h2><i class="fas fa-tachometer-alt me-2"></i>Dashboard</h2>
                <p class="text-muted">Quick overview of your barber shop performance</p>
            </div>
            
            <!-- Stats Cards -->
            <div class="row g-4 mb-4" id="stats-cards">
                <!-- Stats loaded by JS -->
            </div>
            
            <!-- Charts Row -->
            <div class="row g-4 mb-4">
                <div class="col-lg-8">
                    <div class="card">
                        <div class="card-header">
                            <h5 class="card-title mb-0">Weekly Revenue</h5>
                            <select class="form-select form-select-sm w-auto" id="chart-period">
                                <option value="week">This Week</option>
                                <option value="month">This Month</option>
                            </select>
                        </div>
                        <div class="card-body">
                            <canvas id="revenueChart" height="250"></canvas>
                        </div>
                    </div>
                </div>
                <div class="col-lg-4">
                    <div class="card">
                        <div class="card-header">
                            <h5 class="card-title mb-0">Service Distribution</h5>
                        </div>
                        <div class="card-body">
                            <canvas id="serviceChart" height="250"></canvas>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Recent Appointments -->
            <div class="row">
                <div class="col-12">
                    <div class="card">
                        <div class="card-header">
                            <h5 class="card-title mb-0">Today's Appointments</h5>
                            <a href="../dashboard/appointments.php" class="btn btn-sm btn-primary">View All</a>
                        </div>
                        <div class="card-body p-0">
                            <div class="table-responsive">
                                <table class="table table-hover mb-0">
                                    <thead>
                                        <tr>
                                            <th>Time</th>
                                            <th>Customer</th>
                                            <th>Phone</th>
                                            <th>Service</th>
                                            <th>Barber</th>
                                            <th>Status</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody id="today-appointments-list">
                                        <!-- Today's appointments loaded by JS -->
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </main>

    <!-- Bootstrap JS Bundle -->
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
    
    <!-- JavaScript Files -->
    <script src="../js/auth.js"></script>
    <script src="../js/common.js?v=1.0.1"></script>
    <script src="js/dashboard.js"></script>
    <script src="../../assets/js/notifications.js"></script>
</body>
</html>


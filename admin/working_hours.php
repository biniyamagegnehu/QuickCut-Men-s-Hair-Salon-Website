<?php
require_once '../admin_auth.php';
require_once '../../includes/db.php';
check_admin_page();

// Fetch current working hours
$stmt = $pdo->query("SELECT * FROM working_hours ORDER BY FIELD(day_of_week, 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday')");
$working_hours = $stmt->fetchAll();
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>QuickCut - Working Hours</title>
    
    <!-- Bootstrap 5 CSS -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <!-- Font Awesome Icons -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
    
    <!-- CSS Files -->
    <link rel="stylesheet" href="../css/common.css">
    <style>
        .hours-table input[type="time"] {
            border: 1px solid #ced4da;
            border-radius: 4px;
            padding: 4px 8px;
        }
        .day-row.closed {
            background-color: #f8f9fa;
            color: #6c757d;
        }
    </style>
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
                    <a class="nav-link" href="../dashboard/dashboard.php">
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
                    <a class="nav-link active" href="../management/working_hours.php">
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
                <button class="notification-btn">
                    <i class="fas fa-bell"></i>
                    <span class="badge" id="notification-count">0</span>
                </button>
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
                <h2><i class="fas fa-clock me-2"></i>Working Hours Management</h2>
                <p class="text-muted">Configure your salon's weekly schedule</p>
            </div>
            
            <div class="card">
                <div class="card-header">
                    <h5 class="card-title mb-0">Weekly Schedule</h5>
                </div>
                <div class="card-body">
                    <form id="working-hours-form">
                        <div class="table-responsive">
                            <table class="table hours-table">
                                <thead>
                                    <tr>
                                        <th>Day of Week</th>
                                        <th>Open Time</th>
                                        <th>Close Time</th>
                                        <th>Is Closed?</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <?php foreach ($working_hours as $row): ?>
                                    <tr class="day-row <?php echo $row['is_closed'] ? 'closed' : ''; ?>" data-day="<?php echo $row['day_of_week']; ?>">
                                        <td><strong><?php echo $row['day_of_week']; ?></strong></td>
                                        <td>
                                            <input type="time" name="open_<?php echo $row['day_of_week']; ?>" value="<?php echo $row['open_time']; ?>" class="form-control" <?php echo $row['is_closed'] ? 'disabled' : ''; ?>>
                                        </td>
                                        <td>
                                            <input type="time" name="close_<?php echo $row['day_of_week']; ?>" value="<?php echo $row['close_time']; ?>" class="form-control" <?php echo $row['is_closed'] ? 'disabled' : ''; ?>>
                                        </td>
                                        <td>
                                            <div class="form-check form-switch">
                                                <input class="form-check-input closed-switch" type="checkbox" name="closed_<?php echo $row['day_of_week']; ?>" <?php echo $row['is_closed'] ? 'checked' : ''; ?>>
                                            </div>
                                        </td>
                                    </tr>
                                    <?php endforeach; ?>
                                </tbody>
                            </table>
                        </div>
                        <div class="mt-4">
                            <button type="submit" class="btn btn-primary">
                                <i class="fas fa-save me-2"></i>Save Changes
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    </main>

    <!-- Bootstrap JS Bundle -->
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
    
    <!-- JavaScript Files -->
    <script src="../js/auth.js"></script>
    <script src="../js/common.js"></script>
    <script src="js/working_hours.js"></script>
</body>
</html>


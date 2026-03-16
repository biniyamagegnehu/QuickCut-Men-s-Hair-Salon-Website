<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>QuickCut - Reports</title>
    
    <!-- Bootstrap 5 CSS -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <!-- Font Awesome Icons -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
    <!-- Chart.js -->
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    
    <!-- CSS Files -->
    <link rel="stylesheet" href="css/common.css">
    <link rel="stylesheet" href="css/reports.css">
</head>
<body>
    <!-- Sidebar -->
    <nav class="sidebar">
        <div class="sidebar-header">
            <a href="dashboard.html" class="sidebar-brand">
                <i class="fas fa-cut me-2"></i>QuickCut Admin
            </a>
        </div>
        
        <div class="sidebar-menu">
            <ul class="nav flex-column">
                <li class="nav-item">
                    <a class="nav-link" href="dashboard.html">
                        <i class="fas fa-tachometer-alt"></i>
                        Dashboard
                    </a>
                </li>
                <li class="nav-item">
                    <a class="nav-link" href="appointments.html">
                        <i class="fas fa-calendar-alt"></i>
                        Appointments
                    </a>
                </li>
                <li class="nav-item">
                    <a class="nav-link" href="barbers.html">
                        <i class="fas fa-user-tie"></i>
                        Barbers
                    </a>
                </li>
                <li class="nav-item">
                    <a class="nav-link" href="services.html">
                        <i class="fas fa-cut"></i>
                        Services
                    </a>
                </li>
                <li class="nav-item">
                    <a class="nav-link" href="customers.html">
                        <i class="fas fa-users"></i>
                        Customers
                    </a>
                </li>
                <li class="nav-item">
                    <a class="nav-link active" href="reports.html">
                        <i class="fas fa-chart-bar"></i>
                        Reports
                    </a>
                </li>
                <li class="nav-item">
                    <a class="nav-link" href="settings.html">
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
                <a href="welcome.html" class="logout-btn ms-auto" title="Logout">
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
                    <span class="badge" id="notification-count">3</span>
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
                <h2><i class="fas fa-chart-bar me-2"></i>Reports & Analytics</h2>
                <p class="text-muted">View detailed reports and analytics</p>
            </div>
            
            <!-- Report Filters -->
            <div class="card mb-4">
                <div class="card-body">
                    <div class="row g-3">
                        <div class="col-md-3">
                            <label class="form-label">Report Type</label>
                            <select class="form-select" id="report-type">
                                <option value="revenue">Revenue Report</option>
                                <option value="appointments">Appointments Report</option>
                                <option value="services">Services Report</option>
                                <option value="barbers">Barbers Performance</option>
                            </select>
                        </div>
                        <div class="col-md-3">
                            <label class="form-label">Period</label>
                            <select class="form-select" id="report-period">
                                <option value="week">This Week</option>
                                <option value="month">This Month</option>
                                <option value="quarter">This Quarter</option>
                                <option value="year">This Year</option>
                            </select>
                        </div>
                        <div class="col-md-3">
                            <label class="form-label">Start Date</label>
                            <input type="date" class="form-control" id="report-start">
                        </div>
                        <div class="col-md-3">
                            <label class="form-label">End Date</label>
                            <input type="date" class="form-control" id="report-end">
                        </div>
                    </div>
                    <div class="mt-3">
                        <button class="btn btn-primary" id="generate-report">
                            <i class="fas fa-chart-bar me-2"></i>Generate Report
                        </button>
                        <button class="btn btn-outline-secondary ms-2" id="export-report">
                            <i class="fas fa-download me-2"></i>Export Report
                        </button>
                    </div>
                </div>
            </div>
            
            <!-- Report Content -->
            <div class="row g-4">
                <div class="col-lg-8">
                    <div class="card">
                        <div class="card-header">
                            <h5 class="card-title mb-0" id="report-title">Revenue Report</h5>
                        </div>
                        <div class="card-body">
                            <canvas id="detailedRevenueChart" height="300"></canvas>
                        </div>
                    </div>
                </div>
                <div class="col-lg-4">
                    <div class="card">
                        <div class="card-header">
                            <h5 class="card-title mb-0">Summary</h5>
                        </div>
                        <div class="card-body">
                            <div class="report-summary" id="report-summary">
                                <!-- Summary loaded by JS -->
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
    <script src="js/common.js"></script>
    <script src="js/reports.js"></script>
</body>
</html>
<?php
require_once '../admin_auth.php';
check_admin_page();
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>QuickCut - Barbers</title>
    
    <!-- Bootstrap 5 CSS -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <!-- Font Awesome Icons -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
    
    <!-- CSS Files -->
    <link rel="stylesheet" href="../css/common.css?v=<?php echo time(); ?>">
    <link rel="stylesheet" href="css/barbers.css?v=<?php echo time(); ?>">
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
                    <a class="nav-link active" href="../dashboard/barbers.php">
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
                <a href="../../auth/logout.php" class="logout-btn ms-auto" title="Logout">
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
                <div class="d-flex justify-content-between align-items-center mb-2">
                    <div>
                        <h2 class="mb-0"><i class="fas fa-user-tie me-2"></i>Barbers Management</h2>
                        <p class="text-muted">Manage your expert team and track their performance</p>
                    </div>
                    <button class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#addBarberModal">
                        <i class="fas fa-plus-circle me-2"></i>Add New Barber
                    </button>
                </div>
            </div>

            <!-- Stats Overview -->
            <div class="row g-4 mb-5" id="barber-stats-row">
                <div class="col-6 col-lg-3">
                    <div class="stat-card">
                        <div class="stat-icon bg-primary-soft text-primary">
                            <i class="fas fa-users"></i>
                        </div>
                        <div class="stat-details">
                            <h3 id="total-barbers">0</h3>
                            <p>Total Barbers</p>
                        </div>
                    </div>
                </div>
                <div class="col-6 col-lg-3">
                    <div class="stat-card">
                        <div class="stat-icon bg-success-soft text-success">
                            <i class="fas fa-check-circle"></i>
                        </div>
                        <div class="stat-details">
                            <h3 id="active-barbers">0</h3>
                            <p>Active Now</p>
                        </div>
                    </div>
                </div>
                <div class="col-6 col-lg-3">
                    <div class="stat-card">
                        <div class="stat-icon bg-warning-soft text-warning">
                            <i class="fas fa-star"></i>
                        </div>
                        <div class="stat-details">
                            <h3 id="avg-rating">0.0</h3>
                            <p>Avg Rating</p>
                        </div>
                    </div>
                </div>
                <div class="col-6 col-lg-3">
                    <div class="stat-card">
                        <div class="stat-icon bg-info-soft text-info">
                            <i class="fas fa-wallet"></i>
                        </div>
                        <div class="stat-details">
                            <h3 id="total-earnings">0 ETB</h3>
                            <p>Total Revenue</p>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Search & Filters -->
            <div class="filter-section mb-4">
                <div class="row g-3 align-items-center">
                    <div class="col-md-4">
                        <div class="input-group">
                            <span class="input-group-text bg-white border-end-0"><i class="fas fa-search text-muted"></i></span>
                            <input type="text" class="form-control border-start-0 ps-0" placeholder="Search barbers by name or specialty..." id="barber-search">
                        </div>
                    </div>
                    <div class="col-md-3">
                        <select class="form-select" id="status-filter">
                            <option value="all">All Statuses</option>
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                            <option value="vacation">On Vacation</option>
                        </select>
                    </div>
                    <div class="col-md-3">
                        <select class="form-select" id="specialty-filter">
                            <option value="all">All Specialties</option>
                            <!-- Dynamically populated -->
                        </select>
                    </div>
                    <div class="col-md-2 text-end">
                        <button class="btn btn-outline-secondary w-100" id="reset-filters">
                            <i class="fas fa-sync-alt me-1"></i> Reset
                        </button>
                    </div>
                </div>
            </div>
            
            <!-- Barbers Grid -->
            <div class="row g-4 mb-4" id="barbers-grid">
                <!-- Barbers loaded by JS -->
            </div>
            
        </div>
    </main>

    <!-- Add Barber Modal -->
    <div class="modal fade custom-modal" id="addBarberModal" tabindex="-1">
        <div class="modal-dialog modal-lg">
            <div class="modal-content border-0 shadow-lg">
                <div class="modal-header bg-primary text-white py-4">
                    <div class="modal-title-wrapper">
                        <h5 class="modal-title mb-0" id="modalTitle">Add New Barber</h5>
                        <p class="small mb-0 opacity-75">Fill in the details to add a new expert to your team</p>
                    </div>
                    <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                </div>
                <form id="addBarberForm">
                    <div class="modal-body">
                        <div class="row g-3">
                            <div class="col-md-6">
                                <label class="form-label">First Name *</label>
                                <input type="text" class="form-control" id="barber-first-name" required>
                            </div>
                            <div class="col-md-6">
                                <label class="form-label">Last Name *</label>
                                <input type="text" class="form-control" id="barber-last-name" required>
                            </div>
                            <div class="col-12">
                                <label class="form-label">Email *</label>
                                <input type="email" class="form-control" id="barber-email" required>
                            </div>
                            <div class="col-12">
                                <label class="form-label">Phone *</label>
                                <input type="tel" class="form-control" id="barber-phone" required>
                            </div>
                            <div class="col-12">
                                <label class="form-label">Specialty *</label>
                                <input type="text" class="form-control" id="barber-specialty" required>
                            </div>
                            <div class="col-12">
                                <label class="form-label">Hourly Rate (ETB) *</label>
                                <input type="number" class="form-control" id="barber-rate" step="1" required>
                            </div>
                            <div class="col-12">
                                <label class="form-label">Status</label>
                                <select class="form-select" id="barber-status">
                                    <option value="active">Active</option>
                                    <option value="inactive">Inactive</option>
                                    <option value="vacation">On Vacation</option>
                                </select>
                            </div>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                        <button type="submit" class="btn btn-primary">Save Barber</button>
                    </div>
                </form>
            </div>
        </div>
    </div>

    <!-- Bootstrap JS Bundle -->
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
    
    <!-- JavaScript Files -->
    <script src="../js/common.js?v=<?php echo time(); ?>"></script>
    <script src="js/barbers.js?v=<?php echo time(); ?>"></script>
</body>
</html>



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
    <link rel="stylesheet" href="css/common.css">
    <link rel="stylesheet" href="css/barbers.css">
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
                    <a class="nav-link active" href="barbers.html">
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
                    <a class="nav-link" href="reports.html">
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
                <h2><i class="fas fa-user-tie me-2"></i>Barbers Management</h2>
                <p class="text-muted">Manage your barbers and their schedules</p>
            </div>
            
            <!-- Barbers Grid -->
            <div class="row mb-4" id="barbers-grid">
                <!-- Barbers loaded by JS -->
            </div>
            
            <!-- Add Barber Button -->
            <div class="text-center">
                <button class="btn btn-primary btn-lg" data-bs-toggle="modal" data-bs-target="#addBarberModal">
                    <i class="fas fa-user-plus me-2"></i>Add New Barber
                </button>
            </div>
        </div>
    </main>

    <!-- Add Barber Modal -->
    <div class="modal fade" id="addBarberModal" tabindex="-1">
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">Add New Barber</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
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
    <script src="js/common.js"></script>
    <script src="js/barbers.js"></script>
</body>
</html>
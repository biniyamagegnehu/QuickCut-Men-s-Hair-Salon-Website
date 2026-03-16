<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>QuickCut - Admin Login</title>
    
    <!-- Bootstrap 5 CSS -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <!-- Font Awesome Icons -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
    
    <!-- Login CSS -->
    <link rel="stylesheet" href="css/login.css">
</head>
<body>
    <div class="login-container">
        <div class="login-wrapper">
            <!-- Left Side - Branding -->
            <div class="login-branding">
                <div class="brand-logo">
                    <i class="fas fa-cut"></i>
                </div>
                <h1 class="brand-title">QuickCut</h1>
                <p class="brand-subtitle">Admin Panel</p>
                <div class="brand-features">
                    <div class="feature-item">
                        <i class="fas fa-check-circle"></i>
                        <span>Manage Appointments</span>
                    </div>
                    <div class="feature-item">
                        <i class="fas fa-check-circle"></i>
                        <span>Track Barbers</span>
                    </div>
                    <div class="feature-item">
                        <i class="fas fa-check-circle"></i>
                        <span>Generate Reports</span>
                    </div>
                </div>
            </div>
            
            <!-- Right Side - Login Form -->
            <div class="login-form-container">
                <div class="login-form-wrapper">
                    <h2 class="login-title">Welcome Back</h2>
                    <p class="login-subtitle">Sign in to your admin account</p>
                    
                    <form id="loginForm">
                        <div class="mb-3">
                            <label for="username" class="form-label">Username</label>
                            <div class="input-group">
                                <span class="input-group-text">
                                    <i class="fas fa-user"></i>
                                </span>
                                <input type="text" class="form-control" id="username" placeholder="Enter your username" required>
                            </div>
                        </div>
                        
                        <div class="mb-3">
                            <label for="password" class="form-label">Password</label>
                            <div class="input-group">
                                <span class="input-group-text">
                                    <i class="fas fa-lock"></i>
                                </span>
                                <input type="password" class="form-control" id="password" placeholder="Enter your password" required>
                                <button class="btn btn-outline-secondary" type="button" id="togglePassword">
                                    <i class="fas fa-eye"></i>
                                </button>
                            </div>
                            <div class="form-text">
                                <a href="#" id="forgotPassword">Forgot password?</a>
                            </div>
                        </div>
                        
                        <div class="mb-3 form-check">
                            <input type="checkbox" class="form-check-input" id="rememberMe">
                            <label class="form-check-label" for="rememberMe">Remember me</label>
                        </div>
                        
                        <div class="d-grid gap-2">
                            <button type="submit" class="btn btn-primary btn-login">
                                <i class="fas fa-sign-in-alt me-2"></i>Sign In
                            </button>
                        </div>
                    </form>
                    
                    <div class="login-footer">
                        <p class="text-center mb-0">
                            <i class="fas fa-shield-alt me-2"></i>
                            Secure admin access only
                        </p>
                    </div>
                </div>
            </div>
        </div>
        
        <!-- Error Alert -->
        <div class="alert alert-danger alert-dismissible fade" role="alert" id="errorAlert">
            <div class="d-flex align-items-center">
                <i class="fas fa-exclamation-circle me-2"></i>
                <span id="errorMessage">Invalid username or password</span>
            </div>
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        </div>
    </div>

    <!-- Bootstrap JS Bundle -->
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
    
    <!-- Login JavaScript -->
    <script src="js/login.js"></script>
</body>
</html>
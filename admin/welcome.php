<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>QuickCut - Welcome</title>
    
    <!-- Bootstrap 5 CSS -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <!-- Font Awesome Icons -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
    
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
        }
        
        .welcome-container {
            background: white;
            border-radius: 20px;
            padding: 50px;
            text-align: center;
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
            max-width: 600px;
            width: 100%;
        }
        
        .logo {
            width: 100px;
            height: 100px;
            background: linear-gradient(135deg, #ff6b35, #e55a2b);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto 30px;
            color: white;
            font-size: 3rem;
        }
        
        h1 {
            color: #333;
            margin-bottom: 20px;
            font-weight: 700;
        }
        
        p {
            color: #666;
            margin-bottom: 30px;
            font-size: 1.1rem;
            line-height: 1.6;
        }
        
        .btn-admin {
            background: linear-gradient(135deg, #ff6b35, #e55a2b);
            border: none;
            padding: 12px 30px;
            font-size: 1.1rem;
            font-weight: 600;
            border-radius: 8px;
            color: white;
            text-decoration: none;
            display: inline-flex;
            align-items: center;
            gap: 10px;
            transition: all 0.3s ease;
        }
        
        .btn-admin:hover {
            transform: translateY(-2px);
            box-shadow: 0 5px 15px rgba(255, 107, 53, 0.3);
            color: white;
        }
        
        .demo-credentials {
            margin-top: 30px;
            padding: 20px;
            background: #f8f9fa;
            border-radius: 10px;
            text-align: left;
        }
        
        .demo-credentials h5 {
            color: #333;
            margin-bottom: 10px;
        }
        
        .demo-credentials p {
            margin-bottom: 5px;
            font-size: 0.9rem;
        }
        
        @media (max-width: 576px) {
            .welcome-container {
                padding: 30px 20px;
            }
            
            .logo {
                width: 80px;
                height: 80px;
                font-size: 2.5rem;
            }
            
            h1 {
                font-size: 1.8rem;
            }
        }
    </style>
</head>
<body>
    <div class="welcome-container">
        <div class="logo">
            <i class="fas fa-cut"></i>
        </div>
        
        <h1>Welcome to QuickCut</h1>
        
        <p>
            QuickCut is your all-in-one barber shop management system. 
            Manage appointments, track barbers, handle customers, and generate reports 
            all from one powerful admin panel.
        </p>
        
        <a href="login.html" class="btn-admin">
            <i class="fas fa-sign-in-alt"></i>
            Go to Admin Panel
        </a>
        
        <div class="demo-credentials">
            <h5>Demo Credentials:</h5>
            <p><strong>Username:</strong> admin</p>
            <p><strong>Password:</strong> admin123</p>
            <p class="text-muted">You can change the password in the admin settings.</p>
        </div>
    </div>
</body>
</html>
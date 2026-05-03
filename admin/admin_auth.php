<?php
session_start();

function check_admin() {
    if (!isset($_SESSION['user_id']) || $_SESSION['role'] !== 'admin') {
        header('Content-Type: application/json');
        echo json_encode(['success' => false, 'message' => 'Unauthorized: Admin access required']);
        exit;
    }
}

function check_admin_page() {
    if (!isset($_SESSION['user_id']) || $_SESSION['role'] !== 'admin') {
        // Use absolute path so redirect works from any subfolder depth
        $base = rtrim(dirname($_SERVER['SCRIPT_NAME']), '/');
        // Walk up to find /auth/login.php relative to /QuickCut/
        $parts = explode('/', trim($base, '/'));
        // Find the QuickCut root (remove admin/* segments)
        $adminIdx = array_search('admin', $parts);
        $root = '/' . implode('/', array_slice($parts, 0, $adminIdx));
        header("Location: $root/auth/login.php");
        exit;
    }
}
?>

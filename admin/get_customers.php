<?php
require_once '../admin_auth.php';
require_once '../../includes/db.php';
check_admin();

header('Content-Type: application/json');

try {
    $stmt = $pdo->prepare("SELECT id, name, email, phone, created_at FROM users WHERE role = 'customer' ORDER BY created_at DESC");
    $stmt->execute();
    $customers = $stmt->fetchAll();
    
    echo json_encode(['success' => true, 'customers' => $customers]);
} catch (PDOException $e) {
    echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
}
?>


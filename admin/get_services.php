<?php
require_once '../admin_auth.php';
require_once '../../includes/db.php';
check_admin();

header('Content-Type: application/json');

try {
    $stmt = $pdo->prepare("SELECT id, name, duration, price, created_at FROM services ORDER BY name ASC");
    $stmt->execute();
    $services = $stmt->fetchAll();
    
    echo json_encode(['success' => true, 'services' => $services]);
} catch (PDOException $e) {
    echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
}
?>


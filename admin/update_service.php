<?php
require_once '../admin_auth.php';
require_once '../../includes/db.php';
check_admin();

header('Content-Type: application/json');
$data = json_decode(file_get_contents('php://input'), true);

$id = $data['id'] ?? null;
$name = trim($data['name'] ?? '');
$duration = intval($data['duration'] ?? 0);
$price = floatval($data['price'] ?? 0);

if (!$id || empty($name) || $duration <= 0 || $price < 0) {
    echo json_encode(['success' => false, 'message' => 'Invalid input data']);
    exit;
}

try {
    $stmt = $pdo->prepare("UPDATE services SET name = ?, duration = ?, price = ? WHERE id = ?");
    $stmt->execute([$name, $duration, $price, $id]);
    
    echo json_encode(['success' => true, 'message' => 'Service updated successfully']);
} catch (PDOException $e) {
    echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
}
?>


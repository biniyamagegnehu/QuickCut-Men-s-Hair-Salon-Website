<?php
require_once '../admin_auth.php';
require_once '../../includes/db.php';
check_admin();

header('Content-Type: application/json');
$data = json_decode(file_get_contents('php://input'), true);

$name = trim($data['name'] ?? '');
$duration = intval($data['duration'] ?? 0);
$price = floatval($data['price'] ?? 0);

if (empty($name) || $duration <= 0 || $price < 0) {
    echo json_encode(['success' => false, 'message' => 'Invalid input data']);
    exit;
}

try {
    $stmt = $pdo->prepare("INSERT INTO services (name, duration, price) VALUES (?, ?, ?)");
    $stmt->execute([$name, $duration, $price]);
    
    echo json_encode(['success' => true, 'message' => 'Service added successfully', 'service_id' => $pdo->lastInsertId()]);
} catch (PDOException $e) {
    echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
}
?>


<?php
require_once '../admin_auth.php';
require_once '../../includes/db.php';
check_admin();

header('Content-Type: application/json');

$data = json_decode(file_get_contents('php://input'), true);

if (!$data || !isset($data['id'])) {
    echo json_encode(['success' => false, 'message' => 'No ID provided']);
    exit;
}

$id = $data['id'];

try {
    $stmt = $pdo->prepare("DELETE FROM barbers WHERE id = ?");
    $stmt->execute([$id]);
    echo json_encode(['success' => true, 'message' => 'Barber deleted successfully']);
} catch (PDOException $e) {
    echo json_encode(['success' => false, 'message' => 'Error: ' . $e->getMessage()]);
}
?>


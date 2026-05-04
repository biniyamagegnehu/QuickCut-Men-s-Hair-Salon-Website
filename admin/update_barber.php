<?php
require_once '../admin_auth.php';
require_once '../../includes/db.php';
check_admin();

header('Content-Type: application/json');

$data = json_decode(file_get_contents('php://input'), true);

if (!$data || !isset($data['id'])) {
    echo json_encode(['success' => false, 'message' => 'No data or ID provided']);
    exit;
}

$id = $data['id'];
$first_name = $data['firstName'] ?? '';
$last_name = $data['lastName'] ?? '';
$email = $data['email'] ?? '';
$phone = $data['phone'] ?? '';
$specialty = $data['specialty'] ?? '';
$rate = $data['rate'] ?? 0;
$status = $data['status'] ?? 'active';

if (empty($first_name) || empty($last_name) || empty($email) || empty($phone) || empty($specialty)) {
    echo json_encode(['success' => false, 'message' => 'Please fill in all required fields']);
    exit;
}

try {
    $stmt = $pdo->prepare("UPDATE barbers SET first_name = ?, last_name = ?, email = ?, phone = ?, specialty = ?, rate = ?, status = ? WHERE id = ?");
    $stmt->execute([$first_name, $last_name, $email, $phone, $specialty, $rate, $status, $id]);
    echo json_encode(['success' => true, 'message' => 'Barber updated successfully']);
} catch (PDOException $e) {
    echo json_encode(['success' => false, 'message' => 'Error: ' . $e->getMessage()]);
}
?>


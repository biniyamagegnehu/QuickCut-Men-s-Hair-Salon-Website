<?php
require_once '../admin_auth.php';
require_once '../../includes/db.php';
check_admin();

header('Content-Type: application/json');

$data = json_decode(file_get_contents('php://input'), true);

if (!isset($data['hours']) || !is_array($data['hours'])) {
    echo json_encode(['success' => false, 'message' => 'Invalid data format']);
    exit;
}

try {
    $pdo->beginTransaction();
    
    $stmt = $pdo->prepare("UPDATE working_hours SET open_time = ?, close_time = ?, is_closed = ? WHERE day_of_week = ?");
    
    foreach ($data['hours'] as $row) {
        $day = $row['day_of_week'];
        $open = $row['open_time'];
        $close = $row['close_time'];
        $closed = isset($row['is_closed']) ? (int)$row['is_closed'] : 0;
        
        $stmt->execute([$open, $close, $closed, $day]);
    }
    
    $pdo->commit();
    echo json_encode(['success' => true, 'message' => 'Working hours updated successfully']);
} catch (PDOException $e) {
    $pdo->rollBack();
    echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
}
?>


<?php
require_once '../admin_auth.php';
require_once '../../includes/db.php';
check_admin();

header('Content-Type: application/json');

$date_today = date('Y-m-d');

try {
    $stmt = $pdo->prepare("SELECT COUNT(*) FROM appointments WHERE appointment_date = ?");
    $stmt->execute([$date_today]);
    $total_today = $stmt->fetchColumn();

    $stmt = $pdo->prepare("SELECT COUNT(*) FROM appointments WHERE appointment_date = ? AND status = 'waiting'");
    $stmt->execute([$date_today]);
    $waiting = $stmt->fetchColumn();

    $stmt = $pdo->prepare("SELECT COUNT(*) FROM appointments WHERE appointment_date = ? AND status = 'completed'");
    $stmt->execute([$date_today]);
    $completed = $stmt->fetchColumn();

    $stmt = $pdo->prepare("
        SELECT u.name, a.id 
        FROM appointments a 
        JOIN users u ON a.user_id = u.id 
        WHERE a.appointment_date = ? AND a.status = 'in_progress' 
        LIMIT 1
    ");
    $stmt->execute([$date_today]);
    $active = $stmt->fetch();
    $active_customer = $active ? $active['name'] : null;

    echo json_encode([
        'success' => true,
        'stats' => [
            'total_appointments' => $total_today,
            'waiting_customers' => $waiting,
            'completed_appointments' => $completed,
            'active_customer' => $active_customer
        ]
    ]);
} catch (PDOException $e) {
    echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
}
?>


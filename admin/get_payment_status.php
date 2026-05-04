<?php
/**
 * QuickCut Admin – Get Payment Status for an Appointment
 * Returns payment info for a single appointment by ID.
 */
require_once '../admin_auth.php';
require_once '../../includes/db.php';
check_admin();

header('Content-Type: application/json');

$appt_id = (int)($_GET['appointment_id'] ?? 0);
if (!$appt_id) {
    echo json_encode(['success' => false, 'message' => 'Missing appointment_id']);
    exit;
}

try {
    $stmt = $pdo->prepare(
        "SELECT p.id, p.amount, p.status, p.transaction_ref, p.created_at,
                s.price AS service_price,
                (s.price - p.amount) AS remaining_balance
         FROM payments p
         JOIN appointments a ON p.appointment_id = a.id
         JOIN services s ON a.service_id = s.id
         WHERE p.appointment_id = ?
         ORDER BY p.created_at DESC
         LIMIT 1"
    );
    $stmt->execute([$appt_id]);
    $payment = $stmt->fetch();

    if ($payment) {
        echo json_encode(['success' => true, 'payment' => $payment]);
    } else {
        echo json_encode(['success' => false, 'message' => 'No payment found for this appointment']);
    }
} catch (PDOException $e) {
    echo json_encode(['success' => false, 'message' => 'DB error: ' . $e->getMessage()]);
}
?>


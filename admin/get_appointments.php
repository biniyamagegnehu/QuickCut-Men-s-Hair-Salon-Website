<?php
require_once '../admin_auth.php';
require_once '../../includes/db.php';
check_admin();

header('Content-Type: application/json');

$date_filter   = $_GET['date']   ?? null;
$status_filter = $_GET['status'] ?? null;

try {
    $sql = "SELECT 
                a.id,
                u.name  AS customer_name,
                u.phone AS customer_phone,
                s.name  AS service_name,
                s.price AS service_price,
                CONCAT(b.first_name, ' ', b.last_name) AS barber_name,
                a.appointment_date,
                a.appointment_time,
                a.status,
                a.created_at,
                p.amount          AS paid_amount,
                p.status          AS payment_status,
                p.transaction_ref AS tx_ref,
                (s.price - COALESCE(p.amount, 0)) AS remaining_balance
            FROM appointments a
            JOIN users u    ON a.user_id    = u.id
            JOIN services s ON a.service_id = s.id
            LEFT JOIN barbers  b ON a.barber_id  = b.id
            LEFT JOIN payments p ON a.id        = p.appointment_id
                                 AND p.id = (
                                     SELECT MAX(p2.id) FROM payments p2 WHERE p2.appointment_id = a.id
                                 )
            WHERE 1=1";

    $params = [];

    if (!empty($date_filter)) {
        $sql .= " AND a.appointment_date = ?";
        $params[] = $date_filter;
    }

    if (!empty($status_filter)) {
        $sql .= " AND a.status = ?";
        $params[] = $status_filter;
    }

    $sql .= " ORDER BY a.appointment_date DESC, a.appointment_time ASC, a.created_at ASC";

    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    $appointments = $stmt->fetchAll();

    echo json_encode(['success' => true, 'appointments' => $appointments]);

} catch (PDOException $e) {
    echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
}
?>


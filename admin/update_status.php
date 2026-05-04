<?php
require_once '../admin_auth.php';
require_once '../../includes/db.php';
require_once '../notifications/notification_helper.php';
check_admin();

header('Content-Type: application/json');

$data = json_decode(file_get_contents('php://input'), true);
$appointment_id = $data['appointment_id'] ?? null;
$new_status = $data['status'] ?? '';

$valid_statuses = ['waiting', 'in_progress', 'completed', 'cancelled'];

if (!$appointment_id || !in_array($new_status, $valid_statuses)) {
    echo json_encode(['success' => false, 'message' => 'Invalid input']);
    exit;
}

try {
    // Get user_id and current status before update
    $stmt = $pdo->prepare("SELECT user_id, status FROM appointments WHERE id = ?");
    $stmt->execute([$appointment_id]);
    $appointment = $stmt->fetch();

    if (!$appointment) {
        echo json_encode(['success' => false, 'message' => 'Appointment not found']);
        exit;
    }

    $old_status = $appointment['status'];
    $user_id = $appointment['user_id'];

    $stmt = $pdo->prepare("UPDATE appointments SET status = ? WHERE id = ?");
    $stmt->execute([$new_status, $appointment_id]);
    
    if ($stmt->rowCount() > 0) {
        // Trigger notifications based on status change
        if ($new_status === 'in_progress') {
            create_notification($pdo, $user_id, "✂️ It's your turn now! Please proceed to your barber.", 'status_change', $appointment_id);
            check_and_notify_queue_positions($pdo);
        } elseif ($new_status === 'completed') {
            create_notification($pdo, $user_id, "✨ Your service is completed. We hope to see you again soon!", 'status_change', $appointment_id);
            check_and_notify_queue_positions($pdo);

            // Check if queue is now empty
            $count_stmt = $pdo->query("SELECT COUNT(*) FROM appointments WHERE status IN ('waiting', 'in_progress')");
            if ((int)$count_stmt->fetchColumn() === 0) {
                create_notification($pdo, 0, "📭 The queue is now empty. No more active customers.", 'admin_queue_empty', null, 'admin');
            }
        } elseif ($new_status === 'cancelled') {
            create_notification($pdo, $user_id, "🚫 Your appointment has been cancelled by the admin.", 'status_change', $appointment_id);
            check_and_notify_queue_positions($pdo);
        }

        echo json_encode(['success' => true, 'message' => 'Status updated successfully']);
    } else {
        echo json_encode(['success' => false, 'message' => 'Status already set or no change made.']);
    }
} catch (PDOException $e) {
    echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
}
?>


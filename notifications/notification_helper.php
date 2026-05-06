<?php
require_once __DIR__ . '/create_notification.php';

/**
 * Check and notify users in the queue about their position.
 * This should be called whenever an appointment status changes (e.g., to in_progress or completed).
 * 
 * @param PDO $pdo Database connection
 */
function check_and_notify_queue_positions($pdo) {
    try {
        // Get all 'waiting' appointments ordered by date and time
        // Adjust this query based on how your queue is actually ordered
        $stmt = $pdo->prepare("SELECT id, user_id FROM appointments 
                               WHERE status = 'waiting' 
                               ORDER BY appointment_date ASC, appointment_time ASC");
        $stmt->execute();
        $queue = $stmt->fetchAll(PDO::FETCH_ASSOC);

        foreach ($queue as $index => $item) {
            $position = $index + 1;
            $user_id = $item['user_id'];
            $appointment_id = $item['id'];

            if ($position === 1) {
                create_notification($pdo, $user_id, "👉 You are next! Please be ready.", 'queue_alert_1', $appointment_id);
            } elseif ($position === 2) {
                create_notification($pdo, $user_id, "📢 You are at position 2 in the queue. Your turn is coming up soon.", 'queue_alert_2', $appointment_id);
            }
        }
    } catch (PDOException $e) {
        error_log("Queue Notification Error: " . $e->getMessage());
    }
}
?>

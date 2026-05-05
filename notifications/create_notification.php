<?php
/**
 * Create a notification for a user.
 * 
 * @param PDO $pdo Database connection
 * @param int $user_id ID of the user to notify
 * @param string $message The notification message
 * @param string $type The type of notification (e.g., 'booking_confirmed', 'payment_success')
 * @param int|null $related_id Optional ID of a related entity (e.g., appointment_id)
 * @param string $role The role of the user ('customer' or 'admin')
 * @return bool Success or failure
 */
function create_notification($pdo, $user_id, $message, $type, $related_id = null, $role = 'customer') {
    try {
        // Prevent duplicate notifications for the same event type and related entity within a short time (e.g., 1 hour)
        $stmt = $pdo->prepare("SELECT id FROM Notifications 
                               WHERE user_id = ? AND type = ? AND related_id = ? 
                               AND created_at > DATE_SUB(NOW(), INTERVAL 1 HOUR)");
        $stmt->execute([$user_id, $type, $related_id]);
        if ($stmt->fetch()) {
            return true; // Already notified
        }

        $stmt = $pdo->prepare("INSERT INTO Notifications (user_id, message, type, related_id, role) VALUES (?, ?, ?, ?, ?)");
        return $stmt->execute([$user_id, $message, $type, $related_id, $role]);
    } catch (PDOException $e) {
        error_log("Notification Error: " . $e->getMessage());
        return false;
    }
}
?>

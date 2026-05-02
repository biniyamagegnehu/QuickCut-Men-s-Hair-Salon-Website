<?php
session_start();
require_once '../includes/db.php';
require_once 'create_notification.php';

header('Content-Type: application/json');

// Ensure user is authenticated (ideally an admin)
if (!isset($_SESSION['user_id'])) {
    echo json_encode(['success' => false, 'message' => 'Unauthorized']);
    exit;
}

$data = json_decode(file_get_contents('php://input'), true);
$appointment_id = $data['appointment_id'] ?? null;
$new_status = $data['status'] ?? '';

$valid_statuses = ['waiting', 'in_progress', 'completed', 'cancelled'];

if (!$appointment_id || !in_array($new_status, $valid_statuses)) {
    echo json_encode(['success' => false, 'message' => 'Invalid input']);
    exit;
}

try {
    $stmt = $pdo->prepare("UPDATE appointments SET status = ? WHERE id = ?");
    $stmt->execute([$new_status, $appointment_id]);
    
    if ($stmt->rowCount() > 0) {
        // Fetch user_id to send notification
        $user_stmt = $pdo->prepare("SELECT user_id FROM appointments WHERE id = ?");
        $user_stmt->execute([$appointment_id]);
        $appt = $user_stmt->fetch();
        if ($appt) {
            $status_messages = [
                'in_progress' => 'Your appointment has started.',
                'completed' => 'Your appointment has been completed.',
                'cancelled' => 'Your appointment has been cancelled.',
                'waiting' => 'Your appointment is now in the waiting queue.'
            ];
            $msg = isset($status_messages[$new_status]) ? $status_messages[$new_status] : "Your appointment status was updated to $new_status.";
            create_notification($pdo, $appt['user_id'], $msg, "status");
        }

        echo json_encode(['success' => true, 'message' => 'Queue status updated successfully']);
    } else {
        echo json_encode(['success' => false, 'message' => 'Appointment not found or status already set.']);
    }
} catch (PDOException $e) {
    echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
}
?>

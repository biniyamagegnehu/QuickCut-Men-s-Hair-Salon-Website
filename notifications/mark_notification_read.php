<?php
session_start();
require_once '../includes/db.php';

header('Content-Type: application/json');

if (!isset($_SESSION['user_id'])) {
    echo json_encode(["success" => false, "message" => "Unauthorized"]);
    exit;
}

$user_id = $_SESSION['user_id'];

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $input = json_decode(file_get_contents('php://input'), true);
    $notification_id = $input['notification_id'] ?? ($_POST['notification_id'] ?? null);
    $mark_all = $input['mark_all'] ?? ($_POST['mark_all'] ?? false);

    try {
        $role = $_SESSION['role'] ?? 'customer';

        if ($mark_all) {
            $query = "UPDATE Notifications SET is_read = 1 WHERE user_id = ?";
            $params = [$user_id];
            if ($role === 'admin') {
                $query .= " OR role = 'admin'";
            }
            $stmt = $pdo->prepare($query);
            $stmt->execute($params);
            echo json_encode(["success" => true, "message" => "All notifications marked as read"]);
        } elseif ($notification_id) {
            // Ensure the notification belongs to the user OR is an admin notification if user is admin
            $query = "UPDATE Notifications SET is_read = 1 WHERE id = ? AND (user_id = ?";
            $params = [$notification_id, $user_id];
            if ($role === 'admin') {
                $query .= " OR role = 'admin'";
            }
            $query .= ")";
            $stmt = $pdo->prepare($query);
            $stmt->execute($params);
            echo json_encode(["success" => true, "message" => "Notification marked as read"]);
        } else {
            echo json_encode(["success" => false, "message" => "Missing parameters"]);
        }
    } catch (PDOException $e) {
        error_log("Mark Read Error: " . $e->getMessage());
        echo json_encode(["success" => false, "message" => "Database error"]);
    }
} else {
    echo json_encode(["success" => false, "message" => "Invalid request method"]);
}
?>

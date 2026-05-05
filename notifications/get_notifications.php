<?php
session_start();
require_once '../includes/db.php';

header('Content-Type: application/json');

if (!isset($_SESSION['user_id'])) {
    echo json_encode(["success" => false, "message" => "Unauthorized"]);
    exit;
}

$user_id = $_SESSION['user_id'];
$role = isset($_SESSION['role']) ? $_SESSION['role'] : 'customer';

try {
    // If admin, we might want to fetch notifications targeted at 'admin' role
    // or specifically for this admin user. For now, let's fetch based on user_id
    // but filter by role if needed.
    
    $query = "SELECT * FROM Notifications WHERE user_id = ? ";
    $params = [$user_id];

    if ($role === 'admin') {
        // Admin also gets general admin notifications
        $query .= " OR role = 'admin' ";
    }
    
    $query .= " ORDER BY created_at DESC LIMIT 50";
    
    $stmt = $pdo->prepare($query);
    $stmt->execute($params);
    $notifications = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Get unread count
    $unread_query = "SELECT COUNT(*) FROM Notifications WHERE (user_id = ? ";
    if ($role === 'admin') {
        $unread_query .= " OR role = 'admin' ";
    }
    $unread_query .= ") AND is_read = 0";
    
    $unread_stmt = $pdo->prepare($unread_query);
    $unread_stmt->execute([$user_id]);
    $unread_count = $unread_stmt->fetchColumn();
    
    echo json_encode([
        "success" => true, 
        "notifications" => $notifications,
        "unread_count" => (int)$unread_count
    ]);
} catch (PDOException $e) {
    error_log("Fetch Notifications Error: " . $e->getMessage());
    echo json_encode(["success" => false, "message" => "Database error"]);
}
?>

<?php
session_start();
require_once '../includes/db.php';
//commit     
header('Content-Type: application/json');

// Get date from query parameter or default to today
$target_date = $_GET['date'] ?? date('Y-m-d');
$current_user_id = $_SESSION['user_id'] ?? null;

try {
    $stmt = $pdo->prepare("
        SELECT a.id, a.user_id, u.name as user_name, s.name as service_name, a.status, s.duration, 
               b.first_name as barber_fname, b.last_name as barber_lname, a.appointment_time,
               a.appointment_date
        FROM appointments a 
        JOIN users u ON a.user_id = u.id 
        JOIN services s ON a.service_id = s.id 
        LEFT JOIN barbers b ON a.barber_id = b.id
        WHERE a.appointment_date = ? AND a.status IN ('waiting', 'in_progress', 'pending', 'confirmed') 
        ORDER BY a.appointment_time ASC, a.created_at ASC
    ");
    $stmt->execute([$target_date]);
    $queue = $stmt->fetchAll();
    
    $queue_with_flags = [];
    foreach ($queue as $row) {
        $row['is_user'] = ($row['user_id'] == $current_user_id);
        $queue_with_flags[] = $row;
    }
    
    echo json_encode([
        'success' => true,
        'date' => $target_date,
        'queue' => $queue_with_flags
    ]);
} catch (PDOException $e) {
    echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
}
?>

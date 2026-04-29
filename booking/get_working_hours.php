<?php
require_once '../includes/db.php';

header('Content-Type: application/json');

try {
    $stmt = $pdo->query("SELECT * FROM working_hours ORDER BY FIELD(day_of_week, 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday')");
    $hours = $stmt->fetchAll();
    
    echo json_encode(['success' => true, 'working_hours' => $hours]);
} catch (PDOException $e) {
    echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
}
?>

<?php
require_once '../includes/db.php';

header('Content-Type: application/json');

$date = $_GET['date'] ?? '';

if (empty($date)) {
    echo json_encode(['success' => false, 'message' => 'Date is required']);
    exit;
}

try {
    // Fetch booked slots for the given date
    // Include waiting so freshly created bookings are immediately blocked in the picker
    $stmt = $pdo->prepare("SELECT appointment_time FROM appointments WHERE appointment_date = ? AND status IN ('waiting', 'scheduled', 'confirmed', 'in_progress')");
    $stmt->execute([$date]);
    $booked_slots = $stmt->fetchAll(PDO::FETCH_COLUMN);

    echo json_encode(['success' => true, 'booked_slots' => $booked_slots]);
} catch (PDOException $e) {
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
?>

<?php
session_start();
require_once '../includes/db.php';

header('Content-Type: application/json');

if (!isset($_SESSION['user_id'])) {
    echo json_encode(['success' => false, 'message' => 'Unauthorized']);
    exit;
}

$user_id = $_SESSION['user_id'];
$date_today = date('Y-m-d');

try {
    // 1. Check for TODAY'S active queue position
    $stmt = $pdo->prepare("
        SELECT a.id, a.user_id, s.duration, a.status, a.appointment_date, a.appointment_time, 
               b.first_name as barber_fname, s.name as service_name
        FROM appointments a 
        JOIN services s ON a.service_id = s.id 
        LEFT JOIN barbers b ON a.barber_id = b.id
        WHERE a.appointment_date = ? AND a.status IN ('waiting', 'in_progress') 
        ORDER BY a.appointment_time ASC, a.created_at ASC
    ");
    $stmt->execute([$date_today]);
    $queue = $stmt->fetchAll();
    
    $position = 0;
    $people_ahead = 0;
    $wait_time = 0;
    $found_today = false;
    $user_status = '';
    $barber_name = '';
    $service_name = '';
    
    foreach ($queue as $index => $app) {
        if ($app['user_id'] == $user_id) {
            $position = $index + 1;
            $people_ahead = $index;
            $found_today = true;
            $user_status = $app['status'];
            $barber_name = $app['barber_fname'] ?? 'Any available';
            $service_name = $app['service_name'];
            break;
        }
        $wait_time += $app['duration'];
    }
    
    if ($found_today) {
        echo json_encode([
            'success' => true,
            'type' => 'active',
            'position' => $position,
            'people_ahead' => $people_ahead,
            'estimated_wait_time_minutes' => $wait_time,
            'status' => $user_status,
            'barber_name' => $barber_name,
            'service_name' => $service_name
        ]);
    } else {
        // 2. Next upcoming booking
        $next_stmt = $pdo->prepare("
            SELECT a.appointment_date, a.appointment_time, s.name as service_name, b.first_name as barber_fname
            FROM appointments a
            JOIN services s ON a.service_id = s.id
            LEFT JOIN barbers b ON a.barber_id = b.id
            WHERE a.user_id = ? AND (a.appointment_date > ? OR (a.appointment_date = ? AND a.status = 'waiting'))
            AND a.status IN ('waiting', 'pending')
            ORDER BY a.appointment_date ASC, a.appointment_time ASC
            LIMIT 1
        ");
        $next_stmt->execute([$user_id, $date_today, $date_today]);
        $next_app = $next_stmt->fetch(PDO::FETCH_ASSOC);

        if ($next_app) {
            echo json_encode([
                'success' => true,
                'type' => 'upcoming',
                'appointment_date' => $next_app['appointment_date'],
                'appointment_time' => $next_app['appointment_time'],
                'service_name' => $next_app['service_name'],
                'barber_name' => $next_app['barber_fname'] ?? 'Any available'
            ]);
        } else {
            echo json_encode([
                'success' => false,
                'message' => 'No active or upcoming bookings found.'
            ]);
        }
    }

} catch (PDOException $e) {
    echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
}
?>

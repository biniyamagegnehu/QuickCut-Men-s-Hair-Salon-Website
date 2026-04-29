<?php
/**
 * QuickCut – book_appointment.php
 *
 * This endpoint is now a THIN WRAPPER.
 * All actual logic (appointment creation + payment initiation) has moved to initiate_payment.php.
 * This file simply proxies to initiate_payment.php to preserve backward compatibility
 * in case anything still calls this URL.
 */
session_start();
header('Content-Type: application/json');

if (!isset($_SESSION['user_id'])) {
    echo json_encode(['success' => false, 'message' => 'User not logged in.']);
    exit;
}

// Re-route to the payment initiation endpoint
require_once 'initiate_payment.php';
?>

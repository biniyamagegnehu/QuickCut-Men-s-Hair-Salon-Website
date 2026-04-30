<?php
/**
 * QuickCut – Chapa Payment Initiation
 * 
 * Steps performed by this endpoint:
 * 1. Validate user input
 * 2. Verify the slot is still free
 * 3. Look up service price → compute 50% deposit
 * 4. INSERT appointment (status = 'pending')
 * 5. INSERT payment record (status = 'pending')
 * 6. Call Chapa /transaction/initialize
 * 7. Return checkout_url to the frontend
 */

session_start();
require_once '../includes/db.php';
require_once '../config/chapa.php';

header('Content-Type: application/json');

// ── Auth guard ────────────────────────────────────────────────
if (!isset($_SESSION['user_id'])) {
    echo json_encode(['success' => false, 'message' => 'User not logged in.']);
    exit;
}

$user_id = (int) $_SESSION['user_id'];
$data    = json_decode(file_get_contents('php://input'), true);

// ── Input extraction ──────────────────────────────────────────
$service_name = trim($data['service'] ?? '');
$date_raw     = trim($data['date']    ?? '');
$time_raw     = trim($data['time']    ?? '');
$phone        = trim($data['phone']   ?? '');
$email        = trim($data['email']   ?? '');
$full_name    = trim($data['fullName'] ?? '');
$barber_name  = trim($data['barber']  ?? '');

if (empty($service_name) || empty($date_raw) || empty($time_raw)) {
    echo json_encode(['success' => false, 'message' => 'Missing required fields.']);
    exit;
}

// ── Normalise date / time ─────────────────────────────────────
$time_24  = date('H:i', strtotime($time_raw));
$date_sql = date('Y-m-d', strtotime($date_raw));

if ($time_24 === '00:00' && $time_raw !== '00:00') {
    echo json_encode(['success' => false, 'message' => 'Invalid time format.']);
    exit;
}

// ── Working-hours validation ──────────────────────────────────
$day_of_week = date('l', strtotime($date_sql));

$stmt = $pdo->prepare("SELECT * FROM working_hours WHERE day_of_week = ?");
$stmt->execute([$day_of_week]);
$working_hours = $stmt->fetch();

if (!$working_hours) {
    echo json_encode(['success' => false, 'message' => 'Working hours not configured for this day.']);
    exit;
}
if ($working_hours['is_closed']) {
    echo json_encode(['success' => false, 'message' => "The salon is closed on $day_of_week."]);
    exit;
}
if ($time_24 < $working_hours['open_time'] || $time_24 >= $working_hours['close_time']) {
    echo json_encode(['success' => false, 'message' => 'Selected time is outside working hours.']);
    exit;
}

// ── Duplicate-slot guard ──────────────────────────────────────
$stmt = $pdo->prepare(
    "SELECT COUNT(*) FROM appointments 
     WHERE appointment_date = ? AND appointment_time = ? 
       AND status IN ('waiting','scheduled','confirmed','in_progress')"
);
$stmt->execute([$date_sql, $time_24]);
if ((int) $stmt->fetchColumn() > 0) {
    echo json_encode(['success' => false, 'message' => 'That time slot is already booked. Please choose another time.']);
    exit;
}

// ── Fetch service + price ─────────────────────────────────────
$stmt = $pdo->prepare("SELECT id, price FROM services WHERE LOWER(name) = LOWER(?)");
$stmt->execute([$service_name]);
$service = $stmt->fetch();

if (!$service) {
    echo json_encode(['success' => false, 'message' => 'Invalid service selected.']);
    exit;
}

$service_id     = (int) $service['id'];
$service_price  = (float) $service['price'];
$deposit_amount = round($service_price * DEPOSIT_PERCENT, 2);

// ── Fetch barber id (optional, non-blocking) ──────────────────
$barber_id = null;
if (!empty($barber_name)) {
    $parts = explode(' ', $barber_name, 2);
    $first = $parts[0] ?? '';
    $last  = $parts[1] ?? '';
    $stmt  = $pdo->prepare("SELECT id FROM barbers WHERE first_name = ? AND last_name = ? AND status = 'active'");
    $stmt->execute([$first, $last]);
    $barber_row = $stmt->fetch();
    if ($barber_row) $barber_id = (int) $barber_row['id'];
}

// ── Update user phone if missing ──────────────────────────────
if (!empty($phone)) {
    $stmt = $pdo->prepare("UPDATE users SET phone = ? WHERE id = ? AND (phone IS NULL OR phone = '')");
    $stmt->execute([$phone, $user_id]);
}

// ── Generate unique tx_ref ────────────────────────────────────
$tx_ref = 'QC-' . $user_id . '-' . time() . '-' . bin2hex(random_bytes(4));

// ── Wrap in transaction ───────────────────────────────────────
try {
    $pdo->beginTransaction();

    // 1. Insert appointment (status = 'pending' until payment confirmed)
    $stmt = $pdo->prepare(
        "INSERT INTO appointments (user_id, service_id, barber_id, appointment_date, appointment_time, status) 
         VALUES (?, ?, ?, ?, ?, 'pending')"
    );
    $stmt->execute([$user_id, $service_id, $barber_id, $date_sql, $time_24]);
    $appointment_id = (int) $pdo->lastInsertId();

    // 2. Insert payment record
    $stmt = $pdo->prepare(
        "INSERT INTO payments (user_id, appointment_id, amount, status, transaction_ref) 
         VALUES (?, ?, ?, 'pending', ?)"
    );
    $stmt->execute([$user_id, $appointment_id, $deposit_amount, $tx_ref]);

    $pdo->commit();

    // Notify customer about initiated booking
    require_once '../notifications/create_notification.php';
    create_notification($pdo, $user_id, "📅 You've initiated a booking for $service_name on $date_sql at $time_raw. Please complete the payment to confirm.", 'booking_initiated', $appointment_id);

} catch (PDOException $e) {
    $pdo->rollBack();
    echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
    exit;
}

// ── Call Chapa Initialize API ─────────────────────────────────
$name_parts  = explode(' ', $full_name, 2);
$first_name  = $name_parts[0] ?? 'Customer';
$last_name   = $name_parts[1] ?? '';

$chapa_payload = [
    'amount'        => $deposit_amount,
    'currency'      => CHAPA_CURRENCY,
    'email'         => $email,
    'first_name'    => !empty($first_name) ? $first_name : 'Customer',
    'last_name'     => !empty($last_name) ? $last_name : '-', // Chapa requires last_name
    'phone_number'  => $phone,
    'tx_ref'        => $tx_ref,
    'callback_url'  => CHAPA_CALLBACK_URL,
    'return_url'    => CHAPA_CALLBACK_URL . '?tx_ref=' . $tx_ref, 
    'customization' => [
        'title'       => 'QuickCut', // Max 16 characters
        'description' => 'Deposit for ' . substr($service_name, 0, 15) . ' on ' . $date_sql, // Max 50 characters
    ],
];

$ch = curl_init(CHAPA_BASE_URL . '/transaction/initialize');
curl_setopt_array($ch, [
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_POST           => true,
    CURLOPT_POSTFIELDS     => json_encode($chapa_payload),
    CURLOPT_HTTPHEADER     => [
        'Authorization: Bearer ' . CHAPA_SECRET_KEY,
        'Content-Type: application/json',
    ],
    CURLOPT_SSL_VERIFYPEER => false, 
    CURLOPT_SSL_VERIFYHOST => false,
    CURLOPT_TIMEOUT        => 30,
]);

$chapa_raw      = curl_exec($ch);
$curl_error     = curl_error($ch);
$http_code      = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

// --- LOGGING FOR DEBUGGING ---
// Check this file in the root directory if booking fails
file_put_contents('chapa_debug.log', "--- " . date('Y-m-d H:i:s') . " ---\n" . "Payload: " . json_encode($chapa_payload) . "\n" . "HTTP Code: " . $http_code . "\n" . "Response: " . $chapa_raw . "\n\n", FILE_APPEND);

if ($curl_error || $chapa_raw === false) {
    // Mark payment as failed
    $pdo->prepare("UPDATE payments SET status='failed' WHERE transaction_ref=?")->execute([$tx_ref]);
    $pdo->prepare("UPDATE appointments SET status='cancelled' WHERE id=?")->execute([$appointment_id]);
    echo json_encode(['success' => false, 'message' => 'Payment gateway connection failed: ' . $curl_error]);
    exit;
}

$chapa_resp = json_decode($chapa_raw, true);

if ($http_code !== 200 || ($chapa_resp['status'] ?? '') !== 'success') {
    $pdo->prepare("UPDATE payments SET status='failed', chapa_response=? WHERE transaction_ref=?")->execute([
        $chapa_raw, $tx_ref
    ]);
    $pdo->prepare("UPDATE appointments SET status='cancelled' WHERE id=?")->execute([$appointment_id]);
    
    $err_msg = $chapa_resp['message'] ?? 'Payment initiation failed.';
    // If it's a validation error, provide more detail
    if (isset($chapa_resp['errors'])) {
        $err_msg .= ' Details: ' . json_encode($chapa_resp['errors']);
    }
    
    echo json_encode(['success' => false, 'message' => $err_msg]);
    exit;
}

// Store checkout_url temporarily; update chapa_response
$checkout_url = $chapa_resp['data']['checkout_url'] ?? '';
$pdo->prepare("UPDATE payments SET chapa_response=? WHERE transaction_ref=?")->execute([
    $chapa_raw, $tx_ref
]);

echo json_encode([
    'success'      => true,
    'checkout_url' => $checkout_url,
    'tx_ref'       => $tx_ref,
    'amount'       => $deposit_amount,
    'appointment_id' => $appointment_id,
]);
?>

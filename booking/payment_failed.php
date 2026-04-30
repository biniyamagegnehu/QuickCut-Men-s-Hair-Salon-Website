<?php
session_start();
require_once '../includes/db.php';

$tx_ref  = trim($_GET['tx_ref']  ?? '');
$appt_id = (int)($_GET['appt_id'] ?? 0);
$reason  = trim($_GET['reason']  ?? '');

$payment = null;
if (!empty($tx_ref) && preg_match('/^[A-Za-z0-9\-]+$/', $tx_ref) && isset($_SESSION['user_id'])) {
    $stmt = $pdo->prepare(
        "SELECT p.*, s.name AS service_name, a.appointment_date, a.appointment_time
         FROM payments p
         JOIN appointments a ON p.appointment_id = a.id
         JOIN services s ON a.service_id = s.id
         WHERE p.transaction_ref = ? AND p.user_id = ?
         LIMIT 1"
    );
    $stmt->execute([$tx_ref, $_SESSION['user_id']]);
    $payment = $stmt->fetch();
}

$reason_messages = [
    'missing_ref'   => 'No transaction reference provided.',
    'invalid_ref'   => 'Invalid transaction reference.',
    'not_found'     => 'Transaction not found in our system.',
    'gateway_error' => 'Could not reach the payment gateway. Please try again.',
    'db_error'      => 'A database error occurred. Please contact support.',
];
$reason_msg = $reason_messages[$reason] ?? '';
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Payment Failed – QuickCut</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
    <style>
        :root { --red: #e74c3c; --dark: #0d0d0d; }

        * { box-sizing: border-box; margin: 0; padding: 0; }

        body {
            min-height: 100vh;
            background: radial-gradient(ellipse at 50% 0%, #3c0f0f 0%, #0d0d0d 70%);
            display: flex;
            align-items: center;
            justify-content: center;
            font-family: 'Segoe UI', system-ui, sans-serif;
            padding: 2rem 1rem;
        }

        .card-wrap {
            background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
            border: 1px solid rgba(231,76,60,0.3);
            border-radius: 24px;
            padding: 3rem 2.5rem;
            max-width: 540px;
            width: 100%;
            text-align: center;
            box-shadow: 0 30px 80px rgba(0,0,0,0.6);
            animation: slideUp .6s cubic-bezier(.22,1,.36,1);
        }

        @keyframes slideUp {
            from { opacity: 0; transform: translateY(40px); }
            to   { opacity: 1; transform: translateY(0); }
        }

        .fail-icon {
            width: 90px;
            height: 90px;
            background: linear-gradient(135deg, #e74c3c, #c0392b);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto 1.5rem;
            font-size: 2.5rem;
            color: #fff;
            box-shadow: 0 0 40px rgba(231,76,60,0.4);
        }

        h1 { color: #fff; font-size: 1.9rem; font-weight: 700; margin-bottom: .5rem; }
        .subtitle { color: rgba(255,255,255,.6); margin-bottom: 2rem; }

        .alert-box {
            background: rgba(231,76,60,0.12);
            border: 1px solid rgba(231,76,60,0.35);
            border-radius: 12px;
            padding: 1rem 1.25rem;
            margin-bottom: 1.5rem;
            color: #ff9b9b;
            font-size: .9rem;
            text-align: left;
        }

        .details-box {
            background: rgba(255,255,255,0.05);
            border: 1px solid rgba(255,255,255,0.1);
            border-radius: 14px;
            padding: 1.5rem;
            text-align: left;
            margin-bottom: 2rem;
        }
        .detail-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: .55rem 0;
            border-bottom: 1px solid rgba(255,255,255,0.07);
            color: rgba(255,255,255,.85);
            font-size: .9rem;
        }
        .detail-row:last-child { border-bottom: none; }
        .detail-row .label { color: rgba(255,255,255,.5); }
        .detail-row .value { font-weight: 600; }
        .badge-failed {
            background: linear-gradient(90deg, #e74c3c, #c0392b);
            color: #fff;
            padding: .25rem .75rem;
            border-radius: 20px;
            font-size: .78rem;
            font-weight: 700;
        }

        .btn-retry {
            background: linear-gradient(135deg, #e74c3c 0%, #c0392b 100%);
            color: #fff;
            border: none;
            border-radius: 12px;
            padding: .85rem 2rem;
            font-weight: 700;
            font-size: 1rem;
            width: 100%;
            cursor: pointer;
            transition: transform .2s, box-shadow .2s;
            text-decoration: none;
            display: block;
            margin-bottom: .75rem;
        }
        .btn-retry:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 25px rgba(231,76,60,.4);
            color: #fff;
        }

        .btn-home {
            color: rgba(255,255,255,.5);
            font-size: .85rem;
            text-decoration: none;
            transition: color .2s;
            display: block;
        }
        .btn-home:hover { color: #fff; }

        .info-note {
            background: rgba(255,255,255,0.04);
            border-left: 3px solid rgba(255,255,255,0.15);
            border-radius: 0 8px 8px 0;
            padding: .8rem 1rem;
            margin-bottom: 1.5rem;
            color: rgba(255,255,255,.5);
            font-size: .82rem;
            text-align: left;
        }

        .tx-ref-small {
            color: rgba(255,255,255,.2);
            font-size: .72rem;
            font-family: monospace;
            margin-top: 1.5rem;
            word-break: break-all;
        }
    </style>
</head>
<body>
    <div class="card-wrap">
        <div class="fail-icon">
            <i class="fas fa-times"></i>
        </div>

        <h1>Payment Failed</h1>
        <p class="subtitle">Your booking could not be confirmed because the payment was not completed.</p>

        <?php if ($reason_msg): ?>
        <div class="alert-box">
            <i class="fas fa-exclamation-circle me-2"></i><?= htmlspecialchars($reason_msg) ?>
        </div>
        <?php endif; ?>

        <?php if ($payment): ?>
        <div class="details-box">
            <div class="detail-row">
                <span class="label">Service</span>
                <span class="value"><?= htmlspecialchars($payment['service_name']) ?></span>
            </div>
            <div class="detail-row">
                <span class="label">Date</span>
                <span class="value"><?= htmlspecialchars(date('D, M j, Y', strtotime($payment['appointment_date']))) ?></span>
            </div>
            <div class="detail-row">
                <span class="label">Time</span>
                <span class="value"><?= htmlspecialchars(date('g:i A', strtotime($payment['appointment_time']))) ?></span>
            </div>
            <div class="detail-row">
                <span class="label">Amount</span>
                <span class="value"><?= number_format($payment['amount'], 2) ?> ETB</span>
            </div>
            <div class="detail-row">
                <span class="label">Status</span>
                <span class="badge-failed">Failed / Cancelled</span>
            </div>
        </div>
        <?php endif; ?>

        <div class="info-note">
            <i class="fas fa-info-circle me-1"></i>
            The time slot has been released. You can book again by selecting a new appointment below. No charges were made.
        </div>

        <a href="bookappointment.php" class="btn-retry">
            <i class="fas fa-redo me-2"></i>Try Again – Book New Appointment
        </a>
        <a href="../welcome.php" class="btn-home">
            <i class="fas fa-home me-1"></i>Back to Home
        </a>

        <?php if (!empty($tx_ref)): ?>
        <p class="tx-ref-small">Ref: <?= htmlspecialchars($tx_ref) ?></p>
        <?php endif; ?>
    </div>

    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
</body>
</html>

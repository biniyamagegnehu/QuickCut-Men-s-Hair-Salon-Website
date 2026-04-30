<?php
session_start();
require_once '../includes/db.php';

if (!isset($_SESSION['user_id'])) {
    header('Location: ../auth/login.php');
    exit;
}

$tx_ref  = trim($_GET['tx_ref'] ?? '');
$payment = null;
$appt    = null;

if (!empty($tx_ref) && preg_match('/^[A-Za-z0-9\-]+$/', $tx_ref)) {
    $stmt = $pdo->prepare(
        "SELECT p.*, a.appointment_date, a.appointment_time, a.status AS appt_status,
                s.name AS service_name, s.price AS service_price
         FROM payments p
         JOIN appointments a ON p.appointment_id = a.id
         JOIN services s ON a.service_id = s.id
         WHERE p.transaction_ref = ? AND p.user_id = ?
         LIMIT 1"
    );
    $stmt->execute([$tx_ref, $_SESSION['user_id']]);
    $payment = $stmt->fetch();
    $appt = $payment;
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Payment Successful – QuickCut</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
    <style>
        :root {
            --gold: #f5a623;
            --dark: #0d0d0d;
            --card-bg: #1a1a2e;
        }

        * { box-sizing: border-box; margin: 0; padding: 0; }

        body {
            min-height: 100vh;
            background: radial-gradient(ellipse at 50% 0%, #0f3460 0%, #0d0d0d 70%);
            display: flex;
            align-items: center;
            justify-content: center;
            font-family: 'Segoe UI', system-ui, sans-serif;
            padding: 2rem 1rem;
        }

        .card-wrap {
            background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
            border: 1px solid rgba(245,166,35,0.3);
            border-radius: 24px;
            padding: 3rem 2.5rem;
            max-width: 540px;
            width: 100%;
            text-align: center;
            box-shadow: 0 30px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(245,166,35,0.1);
            animation: slideUp .6s cubic-bezier(.22,1,.36,1);
        }

        @keyframes slideUp {
            from { opacity: 0; transform: translateY(40px); }
            to   { opacity: 1; transform: translateY(0); }
        }

        .success-icon {
            width: 90px;
            height: 90px;
            background: linear-gradient(135deg, #00c851, #007e33);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto 1.5rem;
            font-size: 2.5rem;
            color: #fff;
            box-shadow: 0 0 40px rgba(0,200,81,0.4);
            animation: pulse 2s infinite;
        }

        @keyframes pulse {
            0%,100% { box-shadow: 0 0 40px rgba(0,200,81,0.4); }
            50%      { box-shadow: 0 0 60px rgba(0,200,81,0.7); }
        }

        h1 { color: #fff; font-size: 1.9rem; font-weight: 700; margin-bottom: .5rem; }
        .subtitle { color: rgba(255,255,255,.6); margin-bottom: 2rem; }

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
            padding: .6rem 0;
            border-bottom: 1px solid rgba(255,255,255,0.07);
            color: rgba(255,255,255,.85);
            font-size: .9rem;
        }
        .detail-row:last-child { border-bottom: none; }
        .detail-row .label { color: rgba(255,255,255,.5); }
        .detail-row .value { font-weight: 600; }
        .badge-paid {
            background: linear-gradient(90deg, #00c851, #007e33);
            color: #fff;
            padding: .25rem .75rem;
            border-radius: 20px;
            font-size: .78rem;
            font-weight: 700;
        }
        .amount-highlight {
            color: var(--gold);
            font-size: 1.15rem;
        }

        .btn-go {
            background: linear-gradient(135deg, var(--gold) 0%, #e08b00 100%);
            color: #000;
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
        }
        .btn-go:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 25px rgba(245,166,35,.4);
            color: #000;
        }

        .btn-secondary-link {
            color: rgba(255,255,255,.5);
            font-size: .85rem;
            text-decoration: none;
            margin-top: 1rem;
            display: block;
            transition: color .2s;
        }
        .btn-secondary-link:hover { color: #fff; }

        .tx-ref-small {
            color: rgba(255,255,255,.3);
            font-size: .72rem;
            font-family: monospace;
            margin-top: 1.5rem;
            word-break: break-all;
        }
    </style>
</head>
<body>
    <div class="card-wrap">
        <div class="success-icon">
            <i class="fas fa-check"></i>
        </div>

        <h1>Payment Successful!</h1>
        <p class="subtitle">Your 50% deposit has been received and your appointment is confirmed.</p>

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
                <span class="label">Deposit Paid</span>
                <span class="value amount-highlight"><?= number_format($payment['amount'], 2) ?> ETB</span>
            </div>
            <div class="detail-row">
                <span class="label">Remaining at salon</span>
                <span class="value"><?= number_format($payment['service_price'] - $payment['amount'], 2) ?> ETB</span>
            </div>
            <div class="detail-row">
                <span class="label">Status</span>
                <span class="badge-paid">Confirmed</span>
            </div>
        </div>
        <?php else: ?>
        <div class="details-box">
            <div class="detail-row">
                <span class="label">Status</span>
                <span class="badge-paid">Payment Confirmed</span>
            </div>
        </div>
        <?php endif; ?>

        <a href="../queue/queuestatus.php" class="btn-go">
            <i class="fas fa-list-ol me-2"></i>View Queue Status
        </a>
        <a href="../welcome.php" class="btn-secondary-link">
            <i class="fas fa-home me-1"></i>Back to Home
        </a>

        <?php if (!empty($tx_ref)): ?>
        <p class="tx-ref-small">Ref: <?= htmlspecialchars($tx_ref) ?></p>
        <?php endif; ?>
    </div>

    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
</body>
</html>

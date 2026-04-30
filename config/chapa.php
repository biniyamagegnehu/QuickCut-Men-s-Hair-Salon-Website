<?php
// ============================================================
// QuickCut – Chapa Payment Configuration
// SECURITY: This file is server-side only. Never expose CUSK key to frontend.
// ============================================================

// --- Chapa API Key ---
// Replace with your actual Chapa Secret Key from https://dashboard.chapa.co
define('CHAPA_SECRET_KEY', 'CHASECK_TEST-NCjhNvt83XMnU5q8CqNxMz3X69up0ytG');

// --- Chapa API Base URL ---
define('CHAPA_BASE_URL', 'https://api.chapa.co/v1');

// --- Deposit rule: 50% of service price ---
define('DEPOSIT_PERCENT', 0.5);

// --- Callback URL (where Chapa redirects after payment) ---
// Change to your real domain in production (must be HTTPS for live)
define('CHAPA_CALLBACK_URL', 'http://localhost/QuickCut/booking/verify_payment.php');

// --- Currency ---
define('CHAPA_CURRENCY', 'ETB');
?>

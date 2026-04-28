<?php
// config.php - Global configuration and paths
if (!defined('BASE_URL')) {
    // Detect base URL automatically
    $protocol = isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on' ? "https" : "http";
    $host = $_SERVER['HTTP_HOST'];
    $path = "/QuickCut-2/"; // Adjusted for local XAMPP environment
    define('BASE_URL', $protocol . "://" . $host . $path);
}

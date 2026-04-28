<?php
session_start();
require_once '../includes/db.php';

header('Content-Type: application/json');

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    // Support both JSON and Form Data
    $input = json_decode(file_get_contents('php://input'), true);
    if ($input) {
        $firstName = isset($input['firstName']) ? trim($input['firstName']) : '';
        $lastName = isset($input['lastName']) ? trim($input['lastName']) : '';
        $email = isset($input['email']) ? trim($input['email']) : '';
        $phone = isset($input['phone']) ? trim($input['phone']) : '';
        $password = isset($input['password']) ? $input['password'] : '';
        $confirm_password = isset($input['confirmPassword']) ? $input['confirmPassword'] : '';
    } else {
        $firstName = isset($_POST['firstName']) ? trim($_POST['firstName']) : '';
        $lastName = isset($_POST['lastName']) ? trim($_POST['lastName']) : '';
        $email = isset($_POST['email']) ? trim($_POST['email']) : '';
        $phone = isset($_POST['phone']) ? trim($_POST['phone']) : '';
        $password = isset($_POST['password']) ? $_POST['password'] : '';
        $confirm_password = isset($_POST['confirmPassword']) ? $_POST['confirmPassword'] : '';
    }

    $fullName = trim($firstName . ' ' . $lastName);

    if (empty($firstName) || empty($lastName) || empty($email) || empty($phone) || empty($password)) {
        echo json_encode(["success" => false, "message" => "All fields are required."]);
        exit;
    }

    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        echo json_encode(["success" => false, "message" => "Invalid email format."]);
        exit;
    }

    // Check for duplicate email
    try {
        $stmt = $pdo->prepare("SELECT id FROM users WHERE email = ?");
        $stmt->execute([$email]);
        if ($stmt->rowCount() > 0) {
            echo json_encode(["success" => false, "message" => "Email is already registered."]);
            exit;
        }

        // Hash password
        $hashed_password = password_hash($password, PASSWORD_DEFAULT);

        // Insert user
        $stmt = $pdo->prepare("INSERT INTO users (name, email, phone, password, role) VALUES (?, ?, ?, ?, 'customer')");
        if ($stmt->execute([$fullName, $email, $phone, $hashed_password])) {
            echo json_encode(["success" => true, "message" => "Registration successful."]);
        } else {
            echo json_encode(["success" => false, "message" => "Registration failed. Try again later."]);
        }
    } catch (PDOException $e) {
        // Log the error in a real app. Here we might just want to check if table doesn't exist
        echo json_encode(["success" => false, "message" => "Database error: " . $e->getMessage()]);
    }
} else {
    echo json_encode(["success" => false, "message" => "Invalid request method."]);
}
?>

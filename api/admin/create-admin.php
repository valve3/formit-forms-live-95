<?php
require_once '../config/cors.php';
require_once '../config/database.php';

// This script creates an admin user for testing
// Only run this once to set up the initial admin

$database = new Database();
$db = $database->getConnection();

try {
    // Check if admin already exists
    $check_query = "SELECT id FROM profiles WHERE email = :email";
    $check_stmt = $db->prepare($check_query);
    $admin_email = 'admin@formit.com';
    $check_stmt->bindParam(":email", $admin_email);
    $check_stmt->execute();
    
    if ($check_stmt->rowCount() > 0) {
        echo json_encode(array(
            "message" => "Admin user already exists",
            "email" => $admin_email
        ));
        exit();
    }
    
    // Create admin user
    $admin_id = 'admin_' . uniqid();
    $admin_password = 'admin123'; // Change this to a secure password
    $password_hash = password_hash($admin_password, PASSWORD_DEFAULT);
    
    $query = "INSERT INTO profiles (id, email, full_name, password_hash, role) VALUES (:id, :email, :full_name, :password_hash, :role)";
    $stmt = $db->prepare($query);
    
    $stmt->bindParam(":id", $admin_id);
    $stmt->bindParam(":email", $admin_email);
    $stmt->bindParam(":full_name", "Admin User");
    $stmt->bindParam(":password_hash", $password_hash);
    $stmt->bindParam(":role", "admin");
    
    $stmt->execute();
    
    echo json_encode(array(
        "message" => "Admin user created successfully",
        "email" => $admin_email,
        "password" => $admin_password,
        "note" => "Please change the password after first login"
    ));
    
} catch(PDOException $exception) {
    http_response_code(500);
    echo json_encode(array("error" => array("message" => "Database error: " . $exception->getMessage())));
}
?>
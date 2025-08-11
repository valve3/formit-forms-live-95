<?php
require_once '../config/cors.php';
require_once '../config/database.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(array("message" => "Method not allowed"));
    exit();
}

$input = json_decode(file_get_contents("php://input"), true);

if (!isset($input['email']) || !isset($input['password']) || !isset($input['fullName'])) {
    http_response_code(400);
    echo json_encode(array("error" => array("message" => "Email, password, and full name are required")));
    exit();
}

$database = new Database();
$db = $database->getConnection();

try {
    // Check if user already exists
    $check_query = "SELECT id FROM profiles WHERE email = :email";
    $check_stmt = $db->prepare($check_query);
    $check_stmt->bindParam(":email", $input['email']);
    $check_stmt->execute();
    
    if ($check_stmt->rowCount() > 0) {
        http_response_code(400);
        echo json_encode(array("error" => array("message" => "User already exists with this email")));
        exit();
    }
    
    // Create new user
    $id = bin2hex(random_bytes(16));
    $password_hash = password_hash($input['password'], PASSWORD_DEFAULT);
    
    $query = "INSERT INTO profiles (id, email, full_name, password_hash, role, created_at) VALUES (:id, :email, :full_name, :password_hash, 'user', NOW())";
    $stmt = $db->prepare($query);
    $stmt->bindParam(":id", $id);
    $stmt->bindParam(":email", $input['email']);
    $stmt->bindParam(":full_name", $input['fullName']);
    $stmt->bindParam(":password_hash", $password_hash);
    
    if ($stmt->execute()) {
        echo json_encode(array("message" => "User created successfully"));
    } else {
        http_response_code(500);
        echo json_encode(array("error" => array("message" => "Failed to create user")));
    }
} catch(PDOException $exception) {
    http_response_code(500);
    echo json_encode(array("error" => array("message" => "Database error: " . $exception->getMessage())));
}
?>
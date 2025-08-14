<?php
require_once '../config/cors.php';
require_once '../config/database.php';

// Check authentication
$headers = getallheaders();
if (!isset($headers['Authorization'])) {
    http_response_code(401);
    echo json_encode(array("error" => array("message" => "Authorization required")));
    exit();
}

$token = str_replace('Bearer ', '', $headers['Authorization']);

$database = new Database();
$db = $database->getConnection();

try {
    // Verify token and get user
    $token_query = "SELECT p.* FROM profiles p 
                    JOIN user_sessions s ON p.id = s.user_id 
                    WHERE s.token = :token AND s.expires_at > NOW()";
    $token_stmt = $db->prepare($token_query);
    $token_stmt->bindParam(":token", $token);
    $token_stmt->execute();
    
    if ($token_stmt->rowCount() == 0) {
        http_response_code(401);
        echo json_encode(array("error" => array("message" => "Invalid or expired token")));
        exit();
    }
    
    $user = $token_stmt->fetch(PDO::FETCH_ASSOC);
    
    // Check if user is admin
    if ($user['role'] !== 'admin') {
        http_response_code(403);
        echo json_encode(array("error" => array("message" => "Admin access required")));
        exit();
    }
    
    if ($_SERVER['REQUEST_METHOD'] === 'GET') {
        // Get all users
        $query = "SELECT id, email, full_name, role, created_at FROM profiles ORDER BY created_at DESC";
        $stmt = $db->prepare($query);
        $stmt->execute();
        
        $users = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        echo json_encode($users);
        
    } else {
        http_response_code(405);
        echo json_encode(array("error" => array("message" => "Method not allowed")));
    }
    
} catch(PDOException $exception) {
    http_response_code(500);
    echo json_encode(array("error" => array("message" => "Database error: " . $exception->getMessage())));
}
?>
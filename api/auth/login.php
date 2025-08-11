<?php
require_once '../config/cors.php';
require_once '../config/database.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(array("message" => "Method not allowed"));
    exit();
}

$input = json_decode(file_get_contents("php://input"), true);

if (!isset($input['email']) || !isset($input['password'])) {
    http_response_code(400);
    echo json_encode(array("error" => array("message" => "Email and password are required")));
    exit();
}

$database = new Database();
$db = $database->getConnection();

try {
    $query = "SELECT id, email, full_name, password_hash, role, created_at FROM profiles WHERE email = :email";
    $stmt = $db->prepare($query);
    $stmt->bindParam(":email", $input['email']);
    $stmt->execute();
    
    if ($stmt->rowCount() == 1) {
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if (password_verify($input['password'], $row['password_hash'])) {
            // Generate session token
            $token = bin2hex(random_bytes(32));
            
            // Store session in database
            $session_query = "INSERT INTO user_sessions (user_id, token, expires_at) VALUES (:user_id, :token, DATE_ADD(NOW(), INTERVAL 7 DAY))";
            $session_stmt = $db->prepare($session_query);
            $session_stmt->bindParam(":user_id", $row['id']);
            $session_stmt->bindParam(":token", $token);
            $session_stmt->execute();
            
            unset($row['password_hash']); // Don't send password hash
            
            echo json_encode(array(
                "user" => $row,
                "token" => $token,
                "message" => "Login successful"
            ));
        } else {
            http_response_code(400);
            echo json_encode(array("error" => array("message" => "Invalid login credentials")));
        }
    } else {
        http_response_code(400);
        echo json_encode(array("error" => array("message" => "Invalid login credentials")));
    }
} catch(PDOException $exception) {
    http_response_code(500);
    echo json_encode(array("error" => array("message" => "Database error: " . $exception->getMessage())));
}
?>
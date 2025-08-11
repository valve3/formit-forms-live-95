<?php
class Database {
    private $host = 'localhost';  // Update with your GoDaddy MySQL host
    private $db_name = 'formit_db';  // Update with your database name
    private $username = 'your_username';  // Update with your MySQL username
    private $password = 'your_password';  // Update with your MySQL password
    public $conn;

    public function getConnection() {
        $this->conn = null;
        
        try {
            $this->conn = new PDO(
                "mysql:host=" . $this->host . ";dbname=" . $this->db_name,
                $this->username,
                $this->password
            );
            $this->conn->exec("set names utf8");
            $this->conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        } catch(PDOException $exception) {
            echo "Connection error: " . $exception->getMessage();
        }
        
        return $this->conn;
    }
}
?>
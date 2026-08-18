<?php
$host = "localhost";
$db_name = "wallet_core"; 
$username = "root";        
$password = "";            
try {
    $conn = new PDO("mysql:host=" . $host . ";dbname=" . $db_name . ";charset=utf8mb4", $username, $password);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch(PDOException $exception) {
    echo json_encode(["status" => "error", "message" => "Error de conexión: " . $exception->getMessage()]);
    exit;
}
?>
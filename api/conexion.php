<?php
$host = "localhost";
$db_name = "benjayap_wallet_core"; 
$username = "benjayap_wallet";        
$password = "benjayap_wallet";            
try {
    $conn = new PDO("mysql:host=" . $host . ";dbname=" . $db_name . ";charset=utf8mb4", $username, $password);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch(PDOException $exception) {
    echo json_encode(["status" => "error", "message" => "Error de conexión: " . $exception->getMessage()]);
    exit;
}
?>
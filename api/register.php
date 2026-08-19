<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
include_once 'conexion.php';
$data = json_decode(file_get_contents("php://input"));
if(!empty($data->username) && !empty($data->email) && !empty($data->pass)) {
    try {
        $hash = password_hash($data->pass, PASSWORD_DEFAULT);
        $query = "INSERT INTO tbl_usuarios (username, email, password_hash) VALUES (:u, :e, :p)";
        $stmt = $conn->prepare($query);
        $stmt->bindParam(":u", $data->username);
        $stmt->bindParam(":e", $data->email);
        $stmt->bindParam(":p", $hash);
        if($stmt->execute()) { echo json_encode(["status"=>"success"]); } 
        else { echo json_encode(["status"=>"error", "message"=>"Error al registrar usuario."]); }
    } catch(PDOException $e) { echo json_encode(["status"=>"error", "message"=>"El correo ya existe o hubo un error."]); }
} else { echo json_encode(["status"=>"error", "message"=>"Faltan datos."]); }
?>
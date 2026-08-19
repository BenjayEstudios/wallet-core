<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
include_once 'conexion.php';
$data = json_decode(file_get_contents("php://input"));
if(!empty($data->identificador) && !empty($data->pass)) {
    try {
        $query = "SELECT id, password_hash FROM tbl_usuarios WHERE email = :id OR username = :id LIMIT 1";
        $stmt = $conn->prepare($query);
        $stmt->bindParam(":id", $data->identificador);
        $stmt->execute();
        if($stmt->rowCount() > 0) {
            $row = $stmt->fetch(PDO::FETCH_ASSOC);
            if(password_verify($data->pass, $row['password_hash'])) {
                echo json_encode(["status"=>"success", "usuario_id"=>$row['id']]);
            } else { echo json_encode(["status"=>"error", "message"=>"Contraseña incorrecta."]); }
        } else { echo json_encode(["status"=>"error", "message"=>"Usuario no encontrado."]); }
    } catch(PDOException $e) { echo json_encode(["status"=>"error", "message"=>"Error de servidor."]); }
} else { echo json_encode(["status"=>"error", "message"=>"Faltan datos."]); }
?>
<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST");
include_once 'conexion.php';
$data = json_decode(file_get_contents("php://input"));
if (!empty($data->nombre_categoria) && !empty($data->tipo_flujo) && !empty($data->icono)) {
    try {
        $query = "INSERT INTO tbl_categorias (id_usuario, nombre_categoria, tipo_flujo, icono) 
                  VALUES (:id_usuario, :nombre, :tipo, :icono)";
        $stmt = $conn->prepare($query);
        $id_usuario = (int)$data->usuario_id;
        $nombre = htmlspecialchars(strip_tags($data->nombre_categoria));
        $tipo = htmlspecialchars(strip_tags($data->tipo_flujo));
        $icono = trim($data->icono);
        $stmt->bindParam(":id_usuario", $id_usuario, PDO::PARAM_INT);
        $stmt->bindParam(":nombre", $nombre);
        $stmt->bindParam(":tipo", $tipo);
        $stmt->bindParam(":icono", $icono);
        if ($stmt->execute()) echo json_encode(["status" => "success"]);
        else echo json_encode(["status" => "error", "message" => "No se pudo insertar en la BD"]);
    } catch(PDOException $e) { echo json_encode(["status" => "error", "message" => $e->getMessage()]); }
} else { echo json_encode(["status" => "error", "message" => "Datos incompletos."]); }
?>
<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST");
include_once 'conexion.php';
$data = json_decode(file_get_contents("php://input"));
if (!empty($data->id) && !empty($data->nombre_categoria) && !empty($data->tipo_flujo) && !empty($data->icono)) {
    try {
        $color = !empty($data->color_hex) ? htmlspecialchars(strip_tags($data->color_hex)) : '#4A5568';
        $query = "UPDATE tbl_categorias SET nombre_categoria=:n, tipo_flujo=:t, icono=:i, color_hex=:c WHERE id=:id AND id_usuario=:uid";
        $stmt = $conn->prepare($query);
        $stmt->bindParam(":n", $data->nombre_categoria);
        $stmt->bindParam(":t", $data->tipo_flujo);
        $stmt->bindParam(":i", $data->icono);
        $stmt->bindParam(":c", $color);
        $stmt->bindParam(":id", $data->id);
        $stmt->bindParam(":uid", $data->usuario_id);
        if ($stmt->execute()) echo json_encode(["status" => "success"]);
        else echo json_encode(["status" => "error"]);
    } catch(PDOException $e) { echo json_encode(["status" => "error", "message" => $e->getMessage()]); }
} else { echo json_encode(["status" => "error"]); }
?>
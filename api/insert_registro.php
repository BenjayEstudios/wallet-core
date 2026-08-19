<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST");
include_once 'conexion.php';
$data = json_decode(file_get_contents("php://input"));
if (!empty($data->monto) && !empty($data->descripcion) && !empty($data->id_categoria) && !empty($data->estado)) {
    try {
        $query = "INSERT INTO tbl_transacciones 
          (id_usuario, id_categoria, tipo_flujo, titulo, descripcion, monto, fecha_transaccion, estado_pago) 
          VALUES (:id_usuario, :id_categoria, :tipo_flujo, :titulo, :descripcion, :monto, :fecha_transaccion, :estado_pago)";
        $stmt = $conn->prepare($query);
        $id_usuario = (int) $data->usuario_id;
        $id_categoria = (int) $data->id_categoria;
        $tipo_flujo = htmlspecialchars(strip_tags($data->tipo)); 
        $estado_pago = htmlspecialchars(strip_tags($data->estado)); 
        $monto = (int) $data->monto;
        $descripcion = htmlspecialchars(strip_tags($data->descripcion));
        $titulo = substr($descripcion, 0, 100); 
        $fecha_transaccion = htmlspecialchars(strip_tags($data->fecha_transaccion));
        $stmt->bindParam(":id_usuario", $id_usuario, PDO::PARAM_INT);
        $stmt->bindParam(":id_categoria", $id_categoria, PDO::PARAM_INT);
        $stmt->bindParam(":tipo_flujo", $tipo_flujo);
        $stmt->bindParam(":titulo", $titulo);
        $stmt->bindParam(":descripcion", $descripcion);
        $stmt->bindParam(":monto", $monto, PDO::PARAM_INT);
        $stmt->bindParam(":estado_pago", $estado_pago);
        $stmt->bindParam(":fecha_transaccion", $fecha_transaccion);
        if ($stmt->execute()) { echo json_encode(["status" => "success"]); } 
        else { echo json_encode(["status" => "error"]); }
    } catch(PDOException $e) { echo json_encode(["status" => "error", "message" => $e->getMessage()]); }
} else { echo json_encode(["status" => "error", "message" => "Datos incompletos."]); }
?>
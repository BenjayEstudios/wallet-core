<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
include_once 'conexion.php';
$usuario_id = isset($_GET['usuario_id']) ? (int)$_GET['usuario_id'] : 1;
try {
    $query = "SELECT id, id_usuario, nombre_categoria, icono, tipo_flujo, color_hex FROM tbl_categorias 
              WHERE id_usuario = :uid OR id_usuario IS NULL 
              ORDER BY nombre_categoria ASC";
    $stmt = $conn->prepare($query);
    $stmt->bindParam(":uid", $usuario_id, PDO::PARAM_INT);
    $stmt->execute();
    echo json_encode(["status" => "success", "data" => $stmt->fetchAll(PDO::FETCH_ASSOC)]);
} catch(Exception $e) { echo json_encode(["status" => "error", "message" => $e->getMessage()]); }
?>
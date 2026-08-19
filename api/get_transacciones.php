<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
include_once 'conexion.php';
$usuario_id = isset($_GET['usuario_id']) ? (int)$_GET['usuario_id'] : 1;
try {
    $query = "SELECT t.id, t.titulo, t.descripcion, t.monto, t.fecha_transaccion, t.estado_pago, t.tipo_flujo, t.id_categoria, c.icono, c.nombre_categoria, c.color_hex
              FROM tbl_transacciones t
              LEFT JOIN tbl_categorias c ON t.id_categoria = c.id
              WHERE t.id_usuario = :id_usuario OR t.id_usuario IS NULL
              ORDER BY t.fecha_transaccion DESC";
    $stmt = $conn->prepare($query);
    $stmt->bindParam(":id_usuario", $usuario_id, PDO::PARAM_INT);
    $stmt->execute();
    echo json_encode(["status" => "success", "data" => $stmt->fetchAll(PDO::FETCH_ASSOC)]);
} catch(Exception $e) { echo json_encode(["status" => "error", "message" => $e->getMessage()]); }
?>
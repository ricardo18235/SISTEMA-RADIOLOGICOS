<?php
require 'cors.php';
require 'db.php';

try {
    // Seleccionamos solo usuarios que sean 'doctor'
    // Asumiendo que tu tabla users tiene columna 'role' y 'name'
    $stmt = $pdo->query("SELECT id, name, email FROM users WHERE role = 'doctor' ORDER BY name ASC");
    $doctors = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode($doctors);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["error" => $e->getMessage()]);
}
?>
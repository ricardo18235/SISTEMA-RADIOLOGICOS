<?php
require 'cors.php';
require 'db.php';

$input = json_decode(file_get_contents("php://input"));

// Solo admin puede editar
if (($input->requester_role ?? '') !== 'admin') {
    http_response_code(403);
    echo json_encode(['error' => 'No autorizado']);
    exit;
}

try {
    // Actualizar nombre y email
    $sql = "UPDATE users SET name = ?, email = ? WHERE id = ? AND role = 'doctor'";
    $params = [$input->name, $input->email, $input->id];

    // Si envía password, actualizarla también (haseada)
    if (!empty($input->password)) {
        $sql = "UPDATE users SET name = ?, email = ?, password = ? WHERE id = ? AND role = 'doctor'";
        $params = [$input->name, $input->email, password_hash($input->password, PASSWORD_BCRYPT), $input->id];
    }

    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);

    echo json_encode(['message' => 'Doctor actualizado correctamente']);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}
?>
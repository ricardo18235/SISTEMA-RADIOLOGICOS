<?php
require 'cors.php';
require 'db.php';

$input = json_decode(file_get_contents("php://input"));

if (($input->requester_role ?? '') !== 'admin') {
    http_response_code(403);
    echo json_encode(['error' => 'No autorizado']);
    exit;
}

try {
    $stmt = $pdo->prepare("DELETE FROM patients WHERE id = ?");
    $stmt->execute([$input->id]);
    echo json_encode(['message' => 'Paciente eliminado correctamente']);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}
?>
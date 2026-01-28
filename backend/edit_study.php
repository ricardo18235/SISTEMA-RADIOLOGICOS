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
    $pdo->beginTransaction();

    // 1. Actualizar Datos del Estudio
    $stmt = $pdo->prepare("UPDATE studies SET study_name = ?, study_date = ? WHERE id = ?");
    $stmt->execute([$input->study_name, $input->study_date, $input->study_id]);

    // 2. Actualizar Datos del Paciente (vinculado a este estudio)
    // Se espera recibir patient_id para confirmar identidad
    if (!empty($input->patient_id)) {
        // Se ignoran campos vacíos si se desea, pero aquí asumimos actualización completa de lo enviado
        $stmt = $pdo->prepare("UPDATE patients SET name = ?, dni = ?, email = ?, phone = ? WHERE id = ?");
        $stmt->execute([
            $input->patient_name,
            $input->patient_dni,
            $input->patient_email,
            $input->patient_phone,
            $input->patient_id
        ]);
    }

    $pdo->commit();
    echo json_encode(['message' => 'Estudio y datos de paciente actualizados']);
} catch (Exception $e) {
    $pdo->rollBack();
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}
?>
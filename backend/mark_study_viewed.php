<?php
require 'cors.php';
require 'db.php';

$data = json_decode(file_get_contents('php://input'), true);
$study_id = $data['study_id'] ?? null;
$user_id = $data['user_id'] ?? null;
$user_role = $data['user_role'] ?? null;

if (!$study_id || !$user_id || $user_role !== 'doctor') {
    http_response_code(400);
    echo json_encode(['error' => 'Datos inválidos o permisos insuficientes']);
    exit;
}

try {
    // Marcar el estudio como visto
    $stmt = $pdo->prepare("UPDATE studies SET viewed_by_doctor = 1, viewed_at = NOW() WHERE id = ?");
    $stmt->execute([$study_id]);

    // Obtener nombre del doctor
    $stmt = $pdo->prepare("SELECT name FROM users WHERE id = ?");
    $stmt->execute([$user_id]);
    $doctor = $stmt->fetch(PDO::FETCH_ASSOC);
    $doctorName = $doctor ? $doctor['name'] : 'Un Doctor';

    // Obtener información del estudio para crear notificación
    $stmt = $pdo->prepare("SELECT s.*, p.name as patient_name, p.doctor_id 
                           FROM studies s 
                           JOIN patients p ON s.patient_id = p.id 
                           WHERE s.id = ?");
    $stmt->execute([$study_id]);
    $study = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($study) {
        // Crear notificación para administradores
        $stmt = $pdo->prepare("SELECT id FROM users WHERE role = 'admin'");
        $stmt->execute();
        $admins = $stmt->fetchAll(PDO::FETCH_ASSOC);

        $message = "El Dr. " . strtoupper($doctorName) . " ha visualizado el estudio de {$study['patient_name']} ({$study['study_name']})";

        foreach ($admins as $admin) {
            $stmt = $pdo->prepare("INSERT INTO notifications (user_id, type, message, study_id) VALUES (?, 'study_viewed', ?, ?)");
            $stmt->execute([$admin['id'], $message, $study_id]);
        }
    }

    echo json_encode(['success' => true, 'message' => 'Estudio marcado como visto']);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}
?>
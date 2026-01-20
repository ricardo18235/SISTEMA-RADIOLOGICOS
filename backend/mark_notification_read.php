<?php
// backend/mark_notification_read.php
// Marcar una notificación como leída

require 'cors.php';
require 'db.php';

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Método no permitido']);
    exit;
}

try {
    $input = json_decode(file_get_contents("php://input"));

    $notificationId = $input->notification_id ?? null;
    $doctorId = $input->doctor_id ?? null;

    if (!$notificationId || !$doctorId) {
        http_response_code(400);
        echo json_encode(['error' => 'notification_id y doctor_id requeridos']);
        exit;
    }

    // Verificar que el doctor es propietario de la notificación
    $stmt = $pdo->prepare("SELECT doctor_id FROM notifications WHERE id = ?");
    $stmt->execute([$notificationId]);
    $notification = $stmt->fetch();

    if (!$notification || $notification['doctor_id'] != $doctorId) {
        http_response_code(403);
        echo json_encode(['error' => 'No autorizado']);
        exit;
    }

    // Marcar como leída
    $stmt = $pdo->prepare(
        "UPDATE notifications SET is_read = TRUE, read_at = NOW() WHERE id = ?"
    );
    $stmt->execute([$notificationId]);

    echo json_encode(['message' => 'Notificación marcada como leída']);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}
?>

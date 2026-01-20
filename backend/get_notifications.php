<?php
// backend/get_notifications.php
// Obtener notificaciones para un doctor específico

require 'cors.php';
require 'db.php';

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(['error' => 'Método no permitido']);
    exit;
}

try {
    // Obtener doctor_id del query parameter
    $doctorId = $_GET['doctor_id'] ?? null;
    $limit = $_GET['limit'] ?? 20;
    $offset = $_GET['offset'] ?? 0;

    if (!$doctorId) {
        http_response_code(400);
        echo json_encode(['error' => 'doctor_id requerido']);
        exit;
    }

    // Validar que doctor_id es un número
    if (!is_numeric($doctorId)) {
        http_response_code(400);
        echo json_encode(['error' => 'doctor_id inválido']);
        exit;
    }

    // Obtener notificaciones del doctor (ordenadas por más recientes primero)
    $stmt = $pdo->prepare("
        SELECT 
            n.id,
            n.doctor_id,
            n.patient_id,
            n.study_id,
            n.message,
            n.is_read,
            n.created_at,
            n.read_at,
            p.name as patient_name,
            p.dni as patient_dni,
            s.study_name,
            s.study_date,
            s.file_url
        FROM notifications n
        JOIN patients p ON n.patient_id = p.id
        JOIN studies s ON n.study_id = s.id
        WHERE n.doctor_id = ?
        ORDER BY n.created_at DESC
        LIMIT ? OFFSET ?
    ");
    
    $stmt->execute([$doctorId, intval($limit), intval($offset)]);
    $notifications = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Obtener total de notificaciones no leídas
    $stmt = $pdo->prepare(
        "SELECT COUNT(*) as unread_count FROM notifications WHERE doctor_id = ? AND is_read = FALSE"
    );
    $stmt->execute([$doctorId]);
    $unreadCount = $stmt->fetch(PDO::FETCH_ASSOC)['unread_count'];

    echo json_encode([
        'notifications' => $notifications,
        'unread_count' => $unreadCount,
        'total' => count($notifications)
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}
?>

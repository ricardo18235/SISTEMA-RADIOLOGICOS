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
    // Soportar tanto doctor_id (legacy) como user_id (nuevo sistema)
    $userId = $_GET['user_id'] ?? $_GET['doctor_id'] ?? null;
    $limit = $_GET['limit'] ?? 20;
    $offset = $_GET['offset'] ?? 0;

    if (!$userId) {
        http_response_code(400);
        echo json_encode(['error' => 'user_id o doctor_id requerido']);
        exit;
    }

    // Validar que es un número
    if (!is_numeric($userId)) {
        http_response_code(400);
        echo json_encode(['error' => 'ID inválido']);
        exit;
    }

    // Obtener notificaciones (ordenadas por más recientes primero)
    $limitInt = intval($limit);
    $offsetInt = intval($offset);

    $stmt = $pdo->prepare("
        SELECT 
            n.id,
            n.user_id,
            n.type,
            n.message,
            n.study_id,
            n.is_read,
            n.created_at,
            s.study_name,
            s.study_date,
            s.viewed_by_doctor,
            p.name as patient_name,
            p.dni as patient_dni
        FROM notifications n
        LEFT JOIN studies s ON n.study_id = s.id
        LEFT JOIN patients p ON s.patient_id = p.id
        WHERE n.user_id = ?
        ORDER BY n.created_at DESC
        LIMIT $limitInt OFFSET $offsetInt
    ");

    $stmt->execute([$userId]);
    $notifications = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Obtener total de notificaciones no leídas
    $stmt = $pdo->prepare(
        "SELECT COUNT(*) as unread_count FROM notifications WHERE user_id = ? AND is_read = 0"
    );
    $stmt->execute([$userId]);
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
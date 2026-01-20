<?php
// backend/test_notifications.php
// Test para verificar si las notificaciones se están creando

require 'cors.php';
require 'db.php';

header('Content-Type: application/json');

try {
    // Obtener todas las notificaciones de la BD
    $stmt = $pdo->prepare("
        SELECT 
            n.*,
            p.name as patient_name,
            p.dni as patient_dni,
            d.name as doctor_name,
            s.study_name
        FROM notifications n
        LEFT JOIN patients p ON n.patient_id = p.id
        LEFT JOIN users d ON n.doctor_id = d.id
        LEFT JOIN studies s ON n.study_id = s.id
        ORDER BY n.created_at DESC
        LIMIT 20
    ");
    $stmt->execute();
    $notifications = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Contar notificaciones por doctor
    $stmt = $pdo->prepare("
        SELECT doctor_id, COUNT(*) as count FROM notifications GROUP BY doctor_id
    ");
    $stmt->execute();
    $byDoctor = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode([
        'success' => true,
        'total_notifications' => count($notifications),
        'by_doctor' => $byDoctor,
        'notifications' => $notifications
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}
?>

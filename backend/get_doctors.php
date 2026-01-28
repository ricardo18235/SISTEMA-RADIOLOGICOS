<?php
require 'cors.php';
require 'db.php';

try {
    // Obtenemos doctores y contamos sus pacientes asignados
    $sql = "SELECT u.id, u.name, u.email, u.created_at, COUNT(p.id) as patient_count 
            FROM users u 
            LEFT JOIN patients p ON u.id = p.doctor_id 
            WHERE u.role = 'doctor' 
            GROUP BY u.id 
            ORDER BY u.name ASC";

    $stmt = $pdo->query($sql);
    $doctors = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode($doctors);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}
?>
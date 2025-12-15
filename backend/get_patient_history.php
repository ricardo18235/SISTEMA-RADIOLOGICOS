<?php
require 'cors.php';
require 'db.php';

$dni = $_GET['dni'] ?? null;
$userId = $_GET['user_id'] ?? null;
$role = $_GET['role'] ?? 'admin';

if (!$dni) {
    http_response_code(400);
    echo json_encode(["error" => "DNI requerido"]);
    exit;
}

try {
    $sql = "";
    $params = [];

    // LÓGICA CLAVE:
    // Unimos 'studies' con 'patients' para buscar por DNI.
    // Unimos con 'users' para saber qué doctor ordenó el estudio.

    if ($role === 'admin') {
        // ADMIN: Ve TODO lo que tenga ese DNI, sin importar el doctor.
        $sql = "SELECT s.*, u.name as doctor_name, p.name as patient_name 
                FROM studies s 
                JOIN patients p ON s.patient_id = p.id 
                JOIN users u ON s.doctor_id = u.id 
                WHERE p.dni = ? 
                ORDER BY s.study_date DESC";
        $params = [$dni];
    } else {
        // DOCTOR: Ve solo los estudios de ese DNI que ÉL haya ordenado (doctor_id match)
        $sql = "SELECT s.*, u.name as doctor_name, p.name as patient_name 
                FROM studies s 
                JOIN patients p ON s.patient_id = p.id 
                JOIN users u ON s.doctor_id = u.id 
                WHERE p.dni = ? AND s.doctor_id = ? 
                ORDER BY s.study_date DESC";
        $params = [$dni, $userId];
    }

    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    $history = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode($history);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["error" => $e->getMessage()]);
}
?>
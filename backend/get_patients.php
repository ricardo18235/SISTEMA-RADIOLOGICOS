<?php
require 'cors.php';
require 'db.php';

try {
    $sql = "SELECT p.*, 
            COUNT(s.id) as studies_count, 
            MAX(s.study_date) as last_study_date,
            u.name as doctor_name
            FROM patients p
            LEFT JOIN studies s ON p.id = s.patient_id
            LEFT JOIN users u ON p.doctor_id = u.id
            GROUP BY p.id
            ORDER BY p.name ASC";
    $stmt = $pdo->query($sql);
    $patients = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo json_encode($patients);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}
?>
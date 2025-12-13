<?php
require 'cors.php';
require 'db.php';

try {
    // 1. Contadores Totales
    $totalPatients = $pdo->query("SELECT COUNT(*) FROM patients")->fetchColumn();
    $totalStudies = $pdo->query("SELECT COUNT(*) FROM studies")->fetchColumn();
    $totalDoctors = $pdo->query("SELECT COUNT(*) FROM users WHERE role = 'doctor'")->fetchColumn();

    // 2. Simular espacio usado (Promedio 50MB por estudio para el ejemplo)
    $usedSpaceGB = number_format(($totalStudies * 50) / 1024, 2); 

    // 3. Gráfica: Cantidad por Tipo de Estudio
    $stmt = $pdo->query("SELECT file_type, COUNT(*) as count FROM studies GROUP BY file_type");
    $studiesByType = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // 4. Gráfica: Estudios del mes actual
    $stmt = $pdo->query("SELECT COUNT(*) FROM studies WHERE MONTH(study_date) = MONTH(CURRENT_DATE()) AND YEAR(study_date) = YEAR(CURRENT_DATE())");
    $studiesThisMonth = $stmt->fetchColumn();

    // 5. Últimos 5 Pacientes agregados (Uniendo con su último estudio)
    $sqlRecent = "SELECT p.name, p.dni, MAX(s.study_date) as last_date 
                  FROM patients p 
                  JOIN studies s ON p.id = s.patient_id 
                  GROUP BY p.id 
                  ORDER BY last_date DESC LIMIT 5";
    $recentPatients = $pdo->query($sqlRecent)->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode([
        "counts" => [
            "patients" => $totalPatients,
            "studies" => $totalStudies,
            "doctors" => $totalDoctors,
            "space_gb" => $usedSpaceGB,
            "month_studies" => $studiesThisMonth
        ],
        "by_type" => $studiesByType,
        "recent_patients" => $recentPatients
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["error" => $e->getMessage()]);
}
?>
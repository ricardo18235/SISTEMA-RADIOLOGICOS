<?php
require 'cors.php';
require 'db.php';

$userId = $_GET['user_id'] ?? null;
$role = $_GET['role'] ?? 'admin';

try {
    // Inicializar estructura que espera tu Frontend
    $response = [
        'counts' => [
            'patients' => 0,
            'studies' => 0,
            'space_gb' => 0,
            'month_studies' => 0
        ],
        'by_type' => [], // Para la gráfica de Donut
        'recent_patients' => [] // Para la tabla inferior
    ];

    // --- FILTROS SEGÚN ROL ---
    $whereDoctor = "";
    $params = [];
    
    if ($role === 'doctor' && $userId) {
        $whereDoctor = " WHERE doctor_id = ? ";
        $params[] = $userId;
    }

    // 1. CONTEOS GENERALES
    // Pacientes
    $sql = "SELECT COUNT(*) FROM patients" . ($role === 'doctor' ? " WHERE doctor_id = ?" : "");
    $stmt = $pdo->prepare($sql);
    $role === 'doctor' ? $stmt->execute([$userId]) : $stmt->execute();
    $response['counts']['patients'] = $stmt->fetchColumn();

    // Estudios
    $sql = "SELECT COUNT(*) FROM studies" . $whereDoctor;
    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    $response['counts']['studies'] = $stmt->fetchColumn();

    // Espacio (GB)
    $sql = "SELECT SUM(file_size) FROM studies" . $whereDoctor;
    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    $bytes = $stmt->fetchColumn();
    $gb = $bytes ? ($bytes / 1073741824) : 0;
    $response['counts']['space_gb'] = round($gb, 4);

    // Estudios del Mes
    $sql = "SELECT COUNT(*) FROM studies WHERE MONTH(study_date) = MONTH(CURRENT_DATE()) AND YEAR(study_date) = YEAR(CURRENT_DATE())" . ($role === 'doctor' ? " AND doctor_id = ?" : "");
    $stmt = $pdo->prepare($sql);
    $role === 'doctor' ? $stmt->execute([$userId]) : $stmt->execute();
    $response['counts']['month_studies'] = $stmt->fetchColumn();

    // 2. DATOS PARA GRÁFICA DONUT (Agrupado por tipo)
    $sql = "SELECT file_type, COUNT(*) as count FROM studies " . $whereDoctor . " GROUP BY file_type";
    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    $types = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Si no hay datos, enviamos un array vacío o datos dummy para que no se rompa
    if (empty($types)) {
        $response['by_type'] = [
            ['file_type' => 'Sin datos', 'count' => 1]
        ];
    } else {
        $response['by_type'] = $types;
    }

    // 3. PACIENTES RECIENTES (Para la tabla)
    // Hacemos un JOIN para saber la fecha del último estudio
    if ($role === 'admin') {
        $sql = "SELECT p.name, p.dni, MAX(s.study_date) as last_date 
                FROM patients p 
                LEFT JOIN studies s ON p.id = s.patient_id 
                GROUP BY p.id 
                ORDER BY last_date DESC LIMIT 5";
        $stmt = $pdo->prepare($sql);
        $stmt->execute();
    } else {
        $sql = "SELECT p.name, p.dni, MAX(s.study_date) as last_date 
                FROM patients p 
                LEFT JOIN studies s ON p.id = s.patient_id 
                WHERE p.doctor_id = ?
                GROUP BY p.id 
                ORDER BY last_date DESC LIMIT 5";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([$userId]);
    }
    
    $patients = $stmt->fetchAll(PDO::FETCH_ASSOC);
    // Formatear fecha bonita si es null
    foreach ($patients as &$p) {
        if (!$p['last_date']) $p['last_date'] = 'Sin estudios';
    }
    $response['recent_patients'] = $patients;

    echo json_encode($response);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["error" => $e->getMessage()]);
}
?>
<?php
require 'cors.php';
require 'db.php';

$userId = $_GET['user_id'] ?? null;
$role = $_GET['role'] ?? 'admin';

try {
    $response = [
        'counts' => [
            'patients' => 0,
            'studies' => 0,
            'space_gb' => 0,
            'month_studies' => 0
        ],
        'by_type' => [],
        'recent_patients' => [],
        'weekly_activity' => [] // <--- NUEVO CAMPO
    ];

    // --- FILTROS ---
    $whereDoctor = "";
    $params = [];

    if ($role === 'doctor' && $userId) {
        $whereDoctor = " WHERE doctor_id = ? ";
        $params[] = $userId;
    }

    // 1. CONTEOS (Lógica confirmada: Totales históricos y mes actual)

    // Pacientes
    $sql = "SELECT COUNT(*) FROM patients" . ($role === 'doctor' ? " WHERE doctor_id = ?" : "");
    $stmt = $pdo->prepare($sql);
    $role === 'doctor' ? $stmt->execute([$userId]) : $stmt->execute();
    $response['counts']['patients'] = $stmt->fetchColumn();

    // Estudios (Total Histórico)
    $sql = "SELECT COUNT(*) FROM studies" . $whereDoctor;
    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    $response['counts']['studies'] = $stmt->fetchColumn();

    // Espacio (Total Histórico)
    $sql = "SELECT SUM(file_size) FROM studies" . $whereDoctor;
    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    $bytes = $stmt->fetchColumn();
    $gb = $bytes ? ($bytes / 1073741824) : 0;
    $response['counts']['space_gb'] = round($gb, 4);

    // Estudios del Mes (Estricto mes actual)
    $sql = "SELECT COUNT(*) FROM studies 
            WHERE MONTH(study_date) = MONTH(CURRENT_DATE()) 
            AND YEAR(study_date) = YEAR(CURRENT_DATE())" .
        ($role === 'doctor' ? " AND doctor_id = ?" : "");
    $stmt = $pdo->prepare($sql);
    $role === 'doctor' ? $stmt->execute([$userId]) : $stmt->execute();
    $response['counts']['month_studies'] = $stmt->fetchColumn();

    // 2. TIPOS DE ESTUDIOS (Agrupado por CATEGORÍA MÉDICA)
    // Usamos SUBSTRING_INDEX para tomar solo la parte antes del guion " - "
    // Ej: De "Radiografía - Panorámica" extrae "Radiografía"
    $sql = "SELECT 
                SUBSTRING_INDEX(study_name, ' - ', 1) as category, 
                COUNT(*) as count 
            FROM studies " . $whereDoctor . " 
            GROUP BY category";

    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    $types = $stmt->fetchAll(PDO::FETCH_ASSOC);

    if (empty($types)) {
        // Placeholder si está vacío
        $response['by_type'] = [['category' => 'Sin datos', 'count' => 1]];
    } else {
        $response['by_type'] = $types;
    }

    // 3. PACIENTES RECIENTES (Ahora basado en los últimos ESTUDIOS subidos)
    // Esto nos permite mostrar Doctor y Categoría del estudio específico
    if ($role === 'admin') {
        $sql = "SELECT p.name, p.dni, s.study_date as last_date, 
                       u.name as doctor_name, 
                       SUBSTRING_INDEX(s.study_name, ' - ', 1) as study_category
                FROM studies s
                JOIN patients p ON s.patient_id = p.id
                LEFT JOIN users u ON s.doctor_id = u.id
                ORDER BY s.study_date DESC, s.id DESC LIMIT 5";
        $stmt = $pdo->prepare($sql);
        $stmt->execute();
    } else {
        $sql = "SELECT p.name, p.dni, s.study_date as last_date, 
                       u.name as doctor_name, 
                       SUBSTRING_INDEX(s.study_name, ' - ', 1) as study_category
                FROM studies s
                JOIN patients p ON s.patient_id = p.id
                LEFT JOIN users u ON s.doctor_id = u.id
                WHERE s.doctor_id = ?
                ORDER BY s.study_date DESC, s.id DESC LIMIT 5";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([$userId]);
    }
    $patients = $stmt->fetchAll(PDO::FETCH_ASSOC);
    $response['recent_patients'] = $patients;

    // 4. ACTIVIDAD SEMANAL (NUEVA LÓGICA REAL)
    // Inicializamos la semana en 0
    $weekData = [
        'Lun' => 0,
        'Mar' => 0,
        'Mie' => 0,
        'Jue' => 0,
        'Vie' => 0,
        'Sab' => 0,
        'Dom' => 0
    ];

    // Mapeo de índice MySQL (0=Lunes... 6=Domingo) a nuestras claves
    $dayMap = [0 => 'Lun', 1 => 'Mar', 2 => 'Mie', 3 => 'Jue', 4 => 'Vie', 5 => 'Sab', 6 => 'Dom'];

    // Query: Agrupar por día de la semana SOLO de la semana actual
    // WEEKDAY devuelve 0 para Lunes, 6 para Domingo
    // YEARWEEK(..., 1) asegura que la semana empiece en Lunes
    $sql = "SELECT WEEKDAY(study_date) as day_index, COUNT(*) as total 
            FROM studies 
            WHERE YEARWEEK(study_date, 1) = YEARWEEK(CURDATE(), 1) " .
        ($role === 'doctor' ? " AND doctor_id = ?" : "") .
        " GROUP BY day_index";

    $stmt = $pdo->prepare($sql);
    $role === 'doctor' ? $stmt->execute([$userId]) : $stmt->execute();
    $results = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Rellenamos los datos reales
    foreach ($results as $row) {
        $dayName = $dayMap[$row['day_index']];
        $weekData[$dayName] = (int) $row['total'];
    }

    // Convertimos al formato que quiere Recharts [{name: 'Lun', estudios: 0}, ...]
    $chartData = [];
    foreach ($weekData as $day => $count) {
        $chartData[] = ['name' => $day, 'estudios' => $count];
    }
    $response['weekly_activity'] = $chartData;

    echo json_encode($response);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["error" => $e->getMessage()]);
}
?>
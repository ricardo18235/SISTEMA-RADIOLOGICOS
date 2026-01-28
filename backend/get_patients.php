<?php
require 'cors.php';
require 'db.php';

$page = isset($_GET['page']) ? (int) $_GET['page'] : 1;
$limit = isset($_GET['limit']) ? (int) $_GET['limit'] : 10;
$search = isset($_GET['search']) ? trim($_GET['search']) : '';
$offset = ($page - 1) * $limit;

try {
    // 1. STATS GLOBALES (Count rápido)
    $stmtStats = $pdo->query("SELECT 
        (SELECT COUNT(*) FROM patients) as total_patients,
        (SELECT COUNT(*) FROM studies) as total_studies,
        (SELECT COUNT(*) FROM studies WHERE MONTH(study_date) = MONTH(CURRENT_DATE())) as current_month_studies
    ");
    $stats = $stmtStats->fetch(PDO::FETCH_ASSOC);

    // 2. CONSTRUIR QUERY DE DATOS CON FILTRO
    $whereClause = "";
    $params = [];

    if ($search) {
        // Buscamos por nombre, DNI o nombre del doctor
        $whereClause = " WHERE p.name LIKE ? OR p.dni LIKE ? OR u.name LIKE ? ";
        $term = "%$search%";
        $params = [$term, $term, $term];
    }

    // Calcular Total Filtrado (para paginación)
    $sqlCount = "SELECT COUNT(*) FROM patients p 
                 LEFT JOIN users u ON p.doctor_id = u.id 
                 $whereClause";
    $stmtCount = $pdo->prepare($sqlCount);
    $stmtCount->execute($params);
    $totalFiltered = $stmtCount->fetchColumn();

    // 3. OBTENER DATOS PAGINADOS
    $sql = "SELECT p.*, 
            COUNT(s.id) as studies_count, 
            MAX(s.study_date) as last_study_date,
            u.name as doctor_name
            FROM patients p
            LEFT JOIN studies s ON p.id = s.patient_id
            LEFT JOIN users u ON p.doctor_id = u.id
            $whereClause
            GROUP BY p.id
            ORDER BY p.name ASC
            LIMIT $limit OFFSET $offset";

    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    $patients = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode([
        'data' => $patients,
        'pagination' => [
            'total' => $totalFiltered,
            'page' => $page,
            'limit' => $limit,
            'pages' => ceil($totalFiltered / $limit)
        ],
        'stats' => $stats
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}
?>
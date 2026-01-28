<?php
require 'cors.php';
require 'db.php';

$page = isset($_GET['page']) ? (int) $_GET['page'] : 1;
$limit = isset($_GET['limit']) ? (int) $_GET['limit'] : 10;
$search = isset($_GET['search']) ? trim($_GET['search']) : '';
$offset = ($page - 1) * $limit;

$user_id = isset($_GET['user_id']) ? (int) $_GET['user_id'] : null;
$role = isset($_GET['role']) ? $_GET['role'] : 'admin';

try {
    // 1. STATS GLOBALES (Ajustadas por rol)
    if ($role === 'doctor') {
        $stmtStats = $pdo->prepare("SELECT 
            (SELECT COUNT(*) FROM patients WHERE doctor_id = ?) as total_patients,
            (SELECT COUNT(*) FROM studies WHERE doctor_id = ?) as total_studies,
            (SELECT COUNT(*) FROM studies WHERE doctor_id = ? AND MONTH(study_date) = MONTH(CURRENT_DATE())) as current_month_studies
        ");
        $stmtStats->execute([$user_id, $user_id, $user_id]);
    } else {
        $stmtStats = $pdo->query("SELECT 
            (SELECT COUNT(*) FROM patients) as total_patients,
            (SELECT COUNT(*) FROM studies) as total_studies,
            (SELECT COUNT(*) FROM studies WHERE MONTH(study_date) = MONTH(CURRENT_DATE())) as current_month_studies
        ");
    }
    $stats = $stmtStats->fetch(PDO::FETCH_ASSOC);

    // 2. CONSTRUIR QUERY DE DATOS CON FILTRO
    $whereClause = "";
    $params = [];

    if ($role === 'doctor') {
        $whereClause = " WHERE p.doctor_id = ? ";
        $params[] = $user_id;

        if ($search) {
            $whereClause .= " AND (p.name LIKE ? OR p.dni LIKE ?) ";
            $term = "%$search%";
            $params[] = $term;
            $params[] = $term;
        }
    } else if ($search) {
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
            u.name as doctor_name,
            SUM(CASE WHEN s.viewed_by_doctor = 0 THEN 1 ELSE 0 END) as unviewed_studies
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
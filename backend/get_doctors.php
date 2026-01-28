<?php
require 'cors.php';
require 'db.php';

// Detectar si se solicita paginación
$isPagination = isset($_GET['limit']);

$page = isset($_GET['page']) ? (int) $_GET['page'] : 1;
$limit = isset($_GET['limit']) ? (int) $_GET['limit'] : 10;
$search = isset($_GET['search']) ? trim($_GET['search']) : '';
$offset = ($page - 1) * $limit;

try {
    if ($isPagination) {
        // --- MODO PAGINACIÓN (Para Doctors.jsx) ---

        $whereClause = " WHERE u.role = 'doctor' ";
        $params = [];

        if ($search) {
            $whereClause .= " AND (u.name LIKE ? OR u.email LIKE ?) ";
            $term = "%$search%";
            $params[] = $term;
            $params[] = $term;
        }

        // 1. Contar total para paginación
        $stmtCount = $pdo->prepare("SELECT COUNT(*) FROM users u $whereClause");
        $stmtCount->execute($params);
        $totalFiltered = $stmtCount->fetchColumn();

        // 2. Obtener datos paginados
        $sql = "SELECT u.id, u.name, u.email, u.created_at, COUNT(p.id) as patient_count 
                FROM users u 
                LEFT JOIN patients p ON u.id = p.doctor_id 
                $whereClause
                GROUP BY u.id 
                ORDER BY u.name ASC
                LIMIT $limit OFFSET $offset";

        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);
        $doctors = $stmt->fetchAll(PDO::FETCH_ASSOC);

        echo json_encode([
            'data' => $doctors,
            'pagination' => [
                'total' => $totalFiltered,
                'page' => $page,
                'limit' => $limit,
                'pages' => ceil($totalFiltered / $limit)
            ]
        ]);

    } else {
        // --- MODO LISTA COMPLETA (Para UploadForm.jsx o selectores) ---
        // Mantiene la compatibilidad retornando un array directo

        $sql = "SELECT u.id, u.name, u.email, u.created_at, COUNT(p.id) as patient_count 
                FROM users u 
                LEFT JOIN patients p ON u.id = p.doctor_id 
                WHERE u.role = 'doctor' 
                GROUP BY u.id 
                ORDER BY u.name ASC";

        $stmt = $pdo->query($sql);
        $doctors = $stmt->fetchAll(PDO::FETCH_ASSOC);

        echo json_encode($doctors);
    }

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}
?>
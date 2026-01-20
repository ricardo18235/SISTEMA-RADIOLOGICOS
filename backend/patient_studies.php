<?php
// backend/patient_studies.php
// Obtener estudios del paciente autenticado
require 'cors.php';
require 'db.php';

header('Content-Type: application/json');

// Verificar autenticación
require 'vendor/autoload.php';

use Firebase\JWT\JWT;
use Firebase\JWT\Key;

$headers = getallheaders();
$authHeader = $headers['Authorization'] ?? '';

if (!preg_match('/Bearer\s+(.+)/', $authHeader, $matches)) {
    http_response_code(401);
    echo json_encode(['error' => 'Token no proporcionado']);
    exit;
}

$token = $matches[1];
$key = "your_secret_key_radiologia_2025";

try {
    // Decodificar JWT token de forma correcta con la clase Key
    /** @var stdClass $decoded */
    $decoded = JWT::decode($token, new Key($key, 'HS256'));

    if ($decoded->user_type !== 'patient') {
        http_response_code(403);
        echo json_encode(['error' => 'Solo pacientes pueden acceder']);
        exit;
    }

    $patientId = $decoded->user_id;

    // Obtener estudios del paciente
    $stmt = $pdo->prepare("
        SELECT 
            id,
            study_name,
            file_url,
            file_type,
            study_date,
            created_at
        FROM studies 
        WHERE patient_id = ? 
        ORDER BY study_date DESC
    ");
    $stmt->execute([$patientId]);
    $studies = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode([
        'success' => true,
        'patient_id' => $patientId,
        'studies_count' => count($studies),
        'studies' => $studies
    ]);

} catch (\Firebase\JWT\ExpiredException $e) {
    http_response_code(401);
    echo json_encode(['error' => 'Token expirado']);
} catch (Exception $e) {
    http_response_code(401);
    echo json_encode(['error' => 'Token inválido: ' . $e->getMessage()]);
}
?>

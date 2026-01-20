<?php
// backend/patient_login.php
// Login para pacientes usando DNI y contraseña
require 'cors.php';
require 'db.php';

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(400);
    echo json_encode(['error' => 'Método no permitido']);
    exit;
}

$input = json_decode(file_get_contents("php://input"));

if (!isset($input->dni) || !isset($input->password)) {
    http_response_code(400);
    echo json_encode(['error' => 'DNI y contraseña requeridos']);
    exit;
}

// Crear JWT Token - Requerir autoload ANTES del try
require 'vendor/autoload.php';

use Firebase\JWT\JWT;

try {
    $dni = trim($input->dni);
    $password = trim($input->password);

    // Buscar paciente por DNI
    $stmt = $pdo->prepare("SELECT id, doctor_id, name, email FROM patients WHERE dni = ? LIMIT 1");
    $stmt->execute([$dni]);
    $patient = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$patient) {
        http_response_code(401);
        echo json_encode(['error' => 'DNI o contraseña incorrectos']);
        exit;
    }

    // Verificar contraseña (la contraseña del paciente es su DNI por defecto)
    // O si quieres validación diferente, cambia aquí
    if ($password !== $dni) {
        http_response_code(401);
        echo json_encode(['error' => 'DNI o contraseña incorrectos']);
        exit;
    }

    $key = "your_secret_key_radiologia_2025";
    $payload = [
        'user_id' => $patient['id'],
        'user_type' => 'patient',
        'dni' => $dni,
        'name' => $patient['name'],
        'doctor_id' => $patient['doctor_id'],
        'email' => $patient['email'],
        'iat' => time(),
        'exp' => time() + (24 * 60 * 60) // 24 horas
    ];

    $jwt = JWT::encode($payload, $key, 'HS256');

    echo json_encode([
        'success' => true,
        'message' => 'Login exitoso',
        'token' => $jwt,
        'patient' => [
            'id' => $patient['id'],
            'name' => $patient['name'],
            'dni' => $dni,
            'email' => $patient['email']
        ]
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Error en servidor: ' . $e->getMessage()]);
}
?>

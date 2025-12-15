<?php
require 'cors.php';
require 'db.php';
require 'vendor/autoload.php';
use Firebase\JWT\JWT;
use Firebase\JWT\Key;

$key = "tu_clave_secreta_super_segura";

// Obtener Token del Header
$headers = getallheaders();
$jwt = str_replace("Bearer ", "", $headers["Authorization"] ?? "");

try {
    $decoded = JWT::decode($jwt, new Key($key, 'HS256'));
    $role = $decoded->role;

    if ($role === 'patient') {
        // Paciente ve sus estudios cruzando su DNI en todas las relaciones
        // Se une con users para ver el nombre del doctor
        $sql = "SELECT s.*, u.name as doctor_name 
                FROM studies s 
                JOIN patients p ON s.patient_id = p.id 
                JOIN users u ON s.doctor_id = u.id
                WHERE p.dni = ? 
                ORDER BY s.study_date DESC";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([$decoded->dni]);

    } elseif ($role === 'doctor') {
        // Doctor ve solo sus pacientes
        $sql = "SELECT s.*, p.name as patient_name, p.dni as patient_dni 
                FROM studies s 
                JOIN patients p ON s.patient_id = p.id 
                WHERE s.doctor_id = ? 
                ORDER BY p.name, s.study_date DESC";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([$decoded->id]);

    } elseif ($role === 'admin') {
        // Admin ve todo? O lista doctores. Aquí retornamos una lista general simplificada
        $sql = "SELECT s.*, p.name as patient_name, u.name as doctor_name 
                FROM studies s 
                JOIN patients p ON s.patient_id = p.id 
                JOIN users u ON s.doctor_id = u.id
                ORDER BY s.created_at DESC";
        $stmt = $pdo->query($sql);
    }

    echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));

} catch (Exception $e) {
    http_response_code(401);
    echo json_encode(["error" => "Acceso denegado"]);
}
?>
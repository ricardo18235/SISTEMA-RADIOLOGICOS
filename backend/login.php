<?php
require 'cors.php';
require 'db.php';
require 'vendor/autoload.php';
use Firebase\JWT\JWT;

$key = "tu_clave_secreta_super_segura"; // Cambia esto

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents("php://input"));
    $user = $data->username; 
    $pass = $data->password;

    // 1. Intentar buscar como Usuario (Doctor/Admin)
    $stmt = $pdo->prepare("SELECT * FROM users WHERE email = ?");
    $stmt->execute([$user]);
    $u = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($u && password_verify($pass, $u['password'])) {
        $payload = ["id" => $u['id'], "role" => $u['role'], "name" => $u['name']];
        echo json_encode(["token" => JWT::encode($payload, $key, 'HS256'), "role" => $u['role']]);
        exit;
    }

    // 2. Intentar buscar como Paciente (Usuario=DNI, Pass=DNI)
    // Buscamos si existe ALGÚN paciente con ese DNI (puede haber varios registros, uno por doctor)
    if ($user === $pass) { // Validación simple DNI = Pass
        $stmt = $pdo->prepare("SELECT DISTINCT dni, name FROM patients WHERE dni = ?");
        $stmt->execute([$user]);
        $p = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if ($p) {
            // El rol es 'patient', guardamos el DNI en el token
            $payload = ["dni" => $p['dni'], "role" => "patient", "name" => $p['name']];
            echo json_encode(["token" => JWT::encode($payload, $key, 'HS256'), "role" => "patient"]);
            exit;
        }
    }

    http_response_code(401);
    echo json_encode(["message" => "Credenciales incorrectas"]);
}
?>
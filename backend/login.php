<?php
require 'cors.php';
require 'db.php';
require 'vendor/autoload.php';
use Firebase\JWT\JWT;

$key = "tu_clave_secreta_super_segura"; // Asegúrate de que coincida con la que usas para validar

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents("php://input"));
    $email_input = $data->username; // En el front mandas 'username', que es el email o DNI
    $pass_input = $data->password;

    // 1. INTENTAR COMO USUARIO (ADMIN O DOCTOR)
    $stmt = $pdo->prepare("SELECT * FROM users WHERE email = ?");
    $stmt->execute([$email_input]);
    $u = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($u && password_verify($pass_input, $u['password'])) {
        // Payload del Token
        $payload = [
            "id" => $u['id'],
            "role" => $u['role'],
            "name" => $u['name'],
            "iat" => time(),
            "exp" => time() + (60 * 60 * 24) // Expira en 24 horas
        ];

        echo json_encode([
            "message" => "Login exitoso",
            "token" => JWT::encode($payload, $key, 'HS256'),
            // ESTA ES LA PARTE CLAVE QUE FALTABA:
            "user" => [
                "id" => $u['id'],
                "name" => $u['name'],
                "email" => $u['email'],
                "role" => $u['role'] // Esto activará el botón en React
            ]
        ]);
        exit;
    }

    // 2. INTENTAR COMO PACIENTE (Login simple: Usuario=DNI, Pass=DNI)
    if ($email_input === $pass_input) { 
        $stmt = $pdo->prepare("SELECT DISTINCT dni, name FROM patients WHERE dni = ? LIMIT 1");
        $stmt->execute([$email_input]);
        $p = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if ($p) {
            $payload = [
                "dni" => $p['dni'], 
                "role" => "patient", 
                "name" => $p['name'],
                "iat" => time(),
                "exp" => time() + (60 * 60 * 24)
            ];

            echo json_encode([
                "message" => "Login exitoso",
                "token" => JWT::encode($payload, $key, 'HS256'),
                // OBJETO USER PARA PACIENTE
                "user" => [
                    "id" => $p['dni'], // Usamos DNI como ID
                    "name" => $p['name'],
                    "role" => "patient"
                ]
            ]);
            exit;
        }
    }

    // Si falla todo
    http_response_code(401);
    echo json_encode(["message" => "Credenciales incorrectas"]);
}
?>
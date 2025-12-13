<?php
require 'cors.php';
require 'db.php';

// Validar que sea POST
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents("php://input"));

    if (empty($data->name) || empty($data->email) || empty($data->password)) {
        http_response_code(400);
        echo json_encode(["error" => "Datos incompletos"]);
        exit;
    }

    try {
        // Verificar si el email ya existe
        $stmt = $pdo->prepare("SELECT id FROM users WHERE email = ?");
        $stmt->execute([$data->email]);
        if ($stmt->fetch()) {
            http_response_code(409);
            echo json_encode(["error" => "El correo ya está registrado"]);
            exit;
        }

        // Crear Doctor
        $hashedPass = password_hash($data->password, PASSWORD_DEFAULT);
        $stmt = $pdo->prepare("INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, 'doctor')");
        $stmt->execute([$data->name, $data->email, $hashedPass]);

        echo json_encode(["message" => "Doctor creado con éxito"]);

    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(["error" => "Error al crear usuario"]);
    }
}
?>
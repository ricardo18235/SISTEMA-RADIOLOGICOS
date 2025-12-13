<?php
require 'cors.php';
require 'db.php';

// Contraseña para todos: 123456
$pass = password_hash("123456", PASSWORD_DEFAULT);

try {
    // 1. Crear Admin
    $sql = "INSERT INTO users (name, email, password, role) VALUES ('Admin', 'admin@test.com', '$pass', 'admin')";
    $pdo->exec($sql);
    echo "Usuario Admin creado (User: admin@test.com / Pass: 123456)<br>";

    // 2. Crear Doctor
    $sql = "INSERT INTO users (name, email, password, role) VALUES ('Doctor Test', 'doctor@test.com', '$pass', 'doctor')";
    $pdo->exec($sql);
    echo "Usuario Doctor creado (User: doctor@test.com / Pass: 123456)<br>";

} catch (PDOException $e) {
    echo "Error (quizás ya existen): " . $e->getMessage();
}
?>
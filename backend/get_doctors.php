<?php
require 'cors.php';
require 'db.php';
$stmt = $pdo->query("SELECT id, name FROM users WHERE role = 'doctor'");
echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
?>
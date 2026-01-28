<?php
require 'cors.php';
require 'db.php';

$dni = trim($_GET['dni'] ?? '');

if (!$dni) {
    echo json_encode(null);
    exit;
}

try {
    $stmt = $pdo->prepare("SELECT * FROM patients WHERE dni = ? LIMIT 1");
    $stmt->execute([$dni]);
    $patient = $stmt->fetch(PDO::FETCH_ASSOC);

    echo json_encode($patient ?: null);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}
?>
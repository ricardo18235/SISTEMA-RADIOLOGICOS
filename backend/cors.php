<?php
// Permitir acceso desde cualquier origen (o específicamente desde tu frontend)
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS, PUT, DELETE");

// Manejar la solicitud "OPTIONS" (Preflight)
// Cuando React pregunta "¿Puedo conectarme?", PHP debe decir "SÍ" y detenerse ahí.
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit;
}
?>
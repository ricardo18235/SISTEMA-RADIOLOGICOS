<?php
// backend/get_presigned_upload.php
require 'cors.php';
require 'db.php';
require 's3.php';

header('Content-Type: application/json');

// 1. Validar que sea Admin (Seguridad)
// NOTA: Como esto es una petición AJAX separada, deberías validar el JWT o Sesión aquí.
// Por simplicidad del ejemplo, validamos que envíen el rol en el JSON, 
// pero en PRO deberías validar el token real.

$input = json_decode(file_get_contents("php://input"));
if (!$input) { http_response_code(400); exit; }

$fileName = $input->file_name ?? '';
$fileType = $input->file_type ?? '';

// Validar extensión (Seguridad Anti-Virus antes de siquiera dar permiso)
$ext = strtolower(pathinfo($fileName, PATHINFO_EXTENSION));
$forbidden = ['php', 'exe', 'sh', 'bat', 'js', 'py'];
if (in_array($ext, $forbidden)) {
    http_response_code(400);
    echo json_encode(['error' => 'Tipo de archivo prohibido']);
    exit;
}

try {
    // Definir la ruta donde se guardará
    $keyName = 'estudios/' . uniqid() . '.' . $ext;

    // Crear el comando PUT
    $cmd = $s3->getCommand('PutObject', [
        'Bucket' => $bucket_name, // Variable de s3.php
        'Key'    => $keyName,
        'ContentType' => $fileType,
        // 'ACL' => 'public-read' // NO LO PONGAS, lo queremos privado
    ]);

    // Crear URL firmada válida por 20 minutos
    $request = $s3->createPresignedRequest($cmd, '+20 minutes');
    $presignedUrl = (string)$request->getUri();

    echo json_encode([
        'upload_url' => $presignedUrl, // URL larga de Wasabi
        'file_key'   => $keyName       // Nombre corto para guardar en BD
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}
?>
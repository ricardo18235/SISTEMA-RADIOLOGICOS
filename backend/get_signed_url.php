<?php
// backend/get_signed_url.php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

header('Content-Type: application/json');

try {
    if (!file_exists('db.php') || !file_exists('s3.php')) throw new Exception("Faltan archivos de configuración");
    include 'db.php';
    include 's3.php';

    // Usar la variable correcta de s3.php
    $bucketName = $bucket_name ?? 'radio-sistema-archivos-2025';

    // Leer datos
    $inputJSON = file_get_contents("php://input");
    $data = json_decode($inputJSON);

    if (!$data || !isset($data->file_key)) {
        throw new Exception("Falta file_key");
    }

    // Detectar acción (ver o descargar)
    $action = $data->action ?? 'view'; // 'view' por defecto

    // Limpieza de URL para obtener la Key limpia
    $fileUrl = $data->file_key;
    $fileKey = $fileUrl;
    
    if (strpos($fileUrl, 'http') === 0) {
        $parsed = parse_url($fileUrl);
        $path = ltrim($parsed['path'], '/'); 
        if (strpos($path, $bucketName) === 0) {
            $fileKey = substr($path, strlen($bucketName) + 1); 
        } else {
            $fileKey = $path;
        }
    }

    // Configurar parámetros para S3
    $params = [
        'Bucket' => $bucketName,
        'Key'    => $fileKey
    ];

    // TRUCO PARA DESCARGAR:
    // Si la acción es descargar, forzamos el header 'Content-Disposition'
    if ($action === 'download') {
        $fileName = basename($fileKey);
        $params['ResponseContentDisposition'] = 'attachment; filename="' . $fileName . '"';
    }

    $cmd = $s3->getCommand('GetObject', $params);
    
    // URL válida por 15 minutos
    $request = $s3->createPresignedRequest($cmd, '+15 minutes');
    $presignedUrl = (string)$request->getUri();

    echo json_encode(['url' => $presignedUrl]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}
?>
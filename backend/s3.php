<?php
// C:/xampp/htdocs/backend/s3.php

require 'vendor/autoload.php';

use Aws\S3\S3Client;
use Aws\Exception\AwsException;

// Configuración directa (sin función) para que upload.php pueda usar la variable $s3
$bucket_name = 'radio-sistema-archivos-2025'; // Nombre extraído de tu error

$s3 = new S3Client([
    'version' => 'latest',
    'region'  => 'us-east-1',
    'endpoint' => 'https://s3.us-east-1.wasabisys.com',
    'credentials' => [
        'key'    => 'VA0ALNUS7K862J5OKQZY',       // Tu Access Key
        'secret' => 'LdRs3DQBz5zAYcYl5dL7Oe43Cnm8r7rwYD5r4rlA', // Tu Secret Key
    ],
    'use_path_style_endpoint' => true,
    
    // --- SOLUCIÓN AL ERROR cURL 60 ---
    'http'    => [
        'verify' => false // Desactiva verificación SSL solo para entorno local/XAMPP
    ]
]);

?>
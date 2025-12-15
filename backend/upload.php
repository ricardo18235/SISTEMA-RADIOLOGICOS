<?php
// C:/xampp/htdocs/backend/upload.php

require 'cors.php'; 
require 'db.php';
require 's3.php'; // Aquí ya tenemos la variable $s3 lista

ini_set('display_errors', 1);
error_reporting(E_ALL);

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    
    // 1. SEGURIDAD DE ROL (Solo Admin puede subir)
    $uploaderRole = $_POST['uploader_role'] ?? 'unknown';
    if ($uploaderRole !== 'admin') {
        http_response_code(403);
        echo json_encode(["error" => "Permiso denegado. Solo administradores pueden subir archivos."]);
        exit;
    }

    // Recibir datos del formulario
    $doctorId = $_POST['doctor_id'] ?? null;
    $patientDni = $_POST['patient_dni'] ?? null;
    $patientName = $_POST['patient_name'] ?? null;
    $studyName = $_POST['study_name'] ?? null; // Ahora viene como "Categoría - Tipo"
    $studyDate = $_POST['study_date'] ?? null;

    if (!$doctorId || !$patientDni || !isset($_FILES['file'])) {
        http_response_code(400);
        echo json_encode(["error" => "Faltan datos obligatorios"]);
        exit;
    }

    try {
        // 2. LÓGICA DE PACIENTE (Buscar o Crear)
        $stmt = $pdo->prepare("SELECT id FROM patients WHERE dni = ? AND doctor_id = ?");
        $stmt->execute([$patientDni, $doctorId]);
        $patient = $stmt->fetch();

        if ($patient) {
            $patientId = $patient['id'];
        } else {
            $stmt = $pdo->prepare("INSERT INTO patients (doctor_id, dni, name) VALUES (?, ?, ?)");
            $stmt->execute([$doctorId, $patientDni, $patientName]);
            $patientId = $pdo->lastInsertId();
        }

        // 3. PROCESAMIENTO DEL ARCHIVO Y SEGURIDAD
        $file = $_FILES['file'];
        $fileNameOriginal = $file['name'];
        $extRaw = pathinfo($fileNameOriginal, PATHINFO_EXTENSION);
        $ext = strtolower($extRaw); // Extensión en minúsculas

        // --- FILTRO DE SEGURIDAD (ANTI-HACKEO) ---
        // Lista negra de extensiones peligrosas
        $forbiddenExts = ['php', 'php3', 'php4', 'phtml', 'exe', 'sh', 'bat', 'cmd', 'js', 'jar', 'vbs', 'py'];
        
        if (in_array($ext, $forbiddenExts)) {
            http_response_code(400);
            echo json_encode(["error" => "ALERTA DE SEGURIDAD: Tipo de archivo prohibido."]);
            exit;
        }
        // ----------------------------------------

        // Configuración para Wasabi
        $bucketName = 'radio-sistema-archivos-2025'; // Asegúrate que este sea tu bucket real
        $keyName = 'estudios/' . uniqid() . '.' . $ext;

        // 4. SUBIR A WASABI
        $result = $s3->putObject([
            'Bucket' => $bucketName,
            'Key'    => $keyName,
            'SourceFile' => $file['tmp_name'],
            'ACL'    => 'public-read',
            'ContentType' => $file['type'] // Detecta si es imagen, pdf, etc.
        ]);
        
        // URL final
        $fileUrl = "https://s3.us-east-1.wasabisys.com/" . $bucketName . "/" . $keyName;

        // 5. CLASIFICACIÓN PARA BASE DE DATOS
        // Esto sirve para que las gráficas de "Tipos de Estudios" se pinten bien
        $type = 'image'; // Por defecto
        if (in_array($ext, ['dcm', 'dicom'])) $type = 'dicom';
        if (in_array($ext, ['stl', 'ply'])) $type = '3d_scan';
        if ($ext === 'pdf') $type = 'pdf';
        if (in_array($ext, ['doc', 'docx'])) $type = 'document';
        // Si subieron una carpeta (normalmente el navegador la comprime o sube archivos sueltos, 
        // pero si subimos un zip o similar para tomografía):
        if (in_array($ext, ['zip', 'rar'])) $type = 'tomography';

        // Capturar tamaño
        $fileSize = $file['size']; 

        // 6. GUARDAR EN MYSQL
        $stmt = $pdo->prepare("INSERT INTO studies (patient_id, doctor_id, study_name, file_url, file_type, study_date, file_size) VALUES (?, ?, ?, ?, ?, ?, ?)");
        $stmt->execute([$patientId, $doctorId, $studyName, $fileUrl, $type, $studyDate, $fileSize]);

        echo json_encode([
            "message" => "Estudio subido exitosamente",
            "url" => $fileUrl
        ]);

    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(["error" => "Error del servidor: " . $e->getMessage()]);
    }
} else {
    http_response_code(405);
    echo json_encode(["error" => "Método no permitido"]);
}
?>
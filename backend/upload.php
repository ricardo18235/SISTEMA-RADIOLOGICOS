<?php
// C:/xampp/htdocs/backend/upload.php

require 'cors.php'; 
require 'db.php';
require 's3.php'; // Al incluir esto, la variable $s3 ya está lista para usarse

ini_set('display_errors', 1);
error_reporting(E_ALL);

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Recibir datos
    $doctorId = $_POST['doctor_id'] ?? null;
    $patientDni = $_POST['patient_dni'] ?? null;
    $patientName = $_POST['patient_name'] ?? null;
    $studyName = $_POST['study_name'] ?? null;
    $studyDate = $_POST['study_date'] ?? null;
    $uploaderRole = $_POST['uploader_role'] ?? 'unknown';

    if ($uploaderRole !== 'admin') {
        http_response_code(403);
        echo json_encode(["error" => "Permiso denegado. Solo administradores pueden subir archivos."]);
        exit;
    }

    if (!$doctorId || !$patientDni || !isset($_FILES['file'])) {
        http_response_code(400);
        echo json_encode(["error" => "Faltan datos obligatorios"]);
        exit;
    }

    try {
        // 1. LÓGICA DE PACIENTE (Buscar o Crear)
        // Mantenemos tu lógica, está perfecta.
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

        // 2. SUBIR A WASABI
        $file = $_FILES['file'];
        $ext = pathinfo($file['name'], PATHINFO_EXTENSION);
        
        // Nombre del bucket (Debe coincidir con s3.php y Wasabi)
        $bucketName = 'radio-sistema-archivos-2025'; 
        
        // Nombre único del archivo en la nube
        $keyName = 'estudios/' . uniqid() . '.' . $ext;

        // AQUÍ ESTABA EL ERROR: Usamos $s3 directamente (ya no getS3Client)
        $result = $s3->putObject([
            'Bucket' => $bucketName,
            'Key'    => $keyName,
            'SourceFile' => $file['tmp_name'],
            'ACL'    => 'public-read', // Hacer público
            'ContentType' => $file['type'] // Importante para que se vea como imagen
        ]);
        
        // Construimos la URL manualmente para asegurar que sea de Wasabi
        // (A veces el SDK devuelve s3.amazonaws.com por defecto)
                // ... (código anterior de subida a Wasabi) ...
        
        $fileUrl = "https://s3.us-east-1.wasabisys.com/" . $bucketName . "/" . $keyName;

        // 3. GUARDAR EN BASE DE DATOS
        $type = 'image';
        $extLower = strtolower($ext);
        if ($extLower == 'dcm') $type = 'dicom';
        if ($extLower == 'stl') $type = 'stl';
        if ($extLower == 'pdf') $type = 'pdf';

        // NUEVO: Capturar tamaño del archivo (en bytes)
        $fileSize = $_FILES['file']['size']; 

        // Modificamos el INSERT para incluir file_size
        $stmt = $pdo->prepare("INSERT INTO studies (patient_id, doctor_id, study_name, file_url, file_type, study_date, file_size) VALUES (?, ?, ?, ?, ?, ?, ?)");
        
        // Agregamos $fileSize al final del array
        $stmt->execute([$patientId, $doctorId, $studyName, $fileUrl, $type, $studyDate, $fileSize]);

        echo json_encode([
            "message" => "Estudio subido a Wasabi exitosamente",
            "url" => $fileUrl
        ]);

    } catch (Exception $e) {
        // ... (resto del código de error)
        http_response_code(500);
        echo json_encode(["error" => "Error del servidor: " . $e->getMessage()]);
    }
} else {
    // Si entran por GET u otro método
    http_response_code(405);
    echo json_encode(["error" => "Método no permitido"]);
}
?>
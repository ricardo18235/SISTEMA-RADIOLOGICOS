<?php
// backend/register_study.php
require 'cors.php';
require 'db.php';

header('Content-Type: application/json');

$input = json_decode(file_get_contents("php://input"));

if ($_SERVER['REQUEST_METHOD'] !== 'POST' || !$input) {
    http_response_code(400); exit;
}

// 1. Validación de Seguridad
if (($input->uploader_role ?? '') !== 'admin') {
    http_response_code(403);
    echo json_encode(['error' => 'No autorizado']);
    exit;
}

try {
    // Datos recibidos del Frontend
    $doctorId = $input->doctor_id;
    $patientDni = $input->patient_dni;
    $patientName = $input->patient_name;
    $studyName = $input->study_name;
    $studyDate = $input->study_date;
    $fileKey = $input->file_key;     // Ruta en Wasabi (estudios/xyz.jpg)
    $fileSize = $input->file_size;   // Tamaño en bytes
    $fileTypeRaw = $input->file_type_raw; // Mime type o extensión

    // Construir URL Base (Referencial)
    $bucketName = 'radio-sistema-archivos-2025'; // Pon tu bucket aquí manual o impórtalo
    $fileUrl = "https://s3.us-east-1.wasabisys.com/" . $bucketName . "/" . $fileKey;

    // 2. Buscar o Crear Paciente
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

    // 3. Determinar tipo de archivo para la BD
    $ext = strtolower(pathinfo($fileKey, PATHINFO_EXTENSION));
    $type = 'image';
    if (in_array($ext, ['dcm', 'dicom'])) $type = 'dicom';
    if (in_array($ext, ['stl', 'ply'])) $type = '3d_scan';
    if ($ext === 'pdf') $type = 'pdf';
    if (in_array($ext, ['zip', 'rar'])) $type = 'tomography';

    // 4. Insertar Estudio
    $stmt = $pdo->prepare("INSERT INTO studies (patient_id, doctor_id, study_name, file_url, file_type, study_date, file_size) VALUES (?, ?, ?, ?, ?, ?, ?)");
    $stmt->execute([$patientId, $doctorId, $studyName, $fileUrl, $type, $studyDate, $fileSize]);

    echo json_encode(['message' => 'Estudio registrado exitosamente']);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}
?>
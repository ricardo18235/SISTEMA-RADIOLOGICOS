<?php
// backend/register_study.php
require 'cors.php';
require 'db.php';

header('Content-Type: application/json');

$input = json_decode(file_get_contents("php://input"));

if ($_SERVER['REQUEST_METHOD'] !== 'POST' || !$input) {
    http_response_code(400);
    exit;
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
    $patientEmail = $input->patient_email ?? null; // Puede venir del frontend
    $patientPhone = $input->patient_phone ?? null; // Obtener teléfono
    $studyName = $input->study_name;
    $studyDate = $input->study_date;
    $fileKey = $input->file_key;     // Ruta en Wasabi (estudios/xyz.jpg)
    $fileSize = $input->file_size;   // Tamaño en bytes
    $fileTypeRaw = $input->file_type_raw; // Mime type o extensión

    // Construir URL Base (Referencial)
    $bucketName = 'radio-sistema-archivos-2026'; // Pon tu bucket aquí manual o impórtalo
    $fileUrl = "https://s3.us-east-1.wasabisys.com/" . $bucketName . "/" . $fileKey;

    // 2. Buscar o Crear Paciente
    // Nota: Se asume que la columna 'phone' ya existe en la BD o se ignorará si no está en el fetch
    $stmt = $pdo->prepare("SELECT id, email, phone FROM patients WHERE dni = ? AND doctor_id = ?"); // Added 'phone' to SELECT
    $stmt->execute([$patientDni, $doctorId]);
    $patient = $stmt->fetch();

    if ($patient) {
        $patientId = $patient['id'];

        // Actualizar email o teléfono si faltan
        $updates = [];
        $params = [];

        if ($patientEmail && (!$patient['email'] || $patient['email'] !== $patientEmail)) { // Check if email is different or missing
            $updates[] = "email = ?";
            $params[] = $patientEmail;
        } elseif ($patient['email']) {
            $patientEmail = $patient['email']; // Use existing email if not updated
        }

        // Si tuvieramos el teléfono en el SELECT podríamos validar si falta
        // Por ahora, intentaremos actualizar el teléfono si viene en el request
        if ($patientPhone && (!$patient['phone'] || $patient['phone'] !== $patientPhone)) { // Check if phone is different or missing
            $updates[] = "phone = ?";
            $params[] = $patientPhone;
        }

        if (!empty($updates)) {
            $params[] = $patientId;
            $sql = "UPDATE patients SET " . implode(", ", $updates) . " WHERE id = ?";
            $stmt = $pdo->prepare($sql);
            $stmt->execute($params);
        }

    } else {
        $stmt = $pdo->prepare("INSERT INTO patients (doctor_id, dni, name, email, phone) VALUES (?, ?, ?, ?, ?)");
        $stmt->execute([$doctorId, $patientDni, $patientName, $patientEmail, $patientPhone]);
        $patientId = $pdo->lastInsertId();
    }

    // 3. Determinar tipo de archivo para la BD
    $ext = strtolower(pathinfo($fileKey, PATHINFO_EXTENSION));
    $type = 'image';
    if (in_array($ext, ['dcm', 'dicom']))
        $type = 'dicom';
    if (in_array($ext, ['stl', 'ply']))
        $type = '3d_scan';
    if ($ext === 'pdf')
        $type = 'pdf';
    if (in_array($ext, ['zip', 'rar']))
        $type = 'tomography';

    // 4. Insertar Estudio
    $stmt = $pdo->prepare("INSERT INTO studies (patient_id, doctor_id, study_name, file_url, file_type, study_date, file_size) VALUES (?, ?, ?, ?, ?, ?, ?)");
    $stmt->execute([$patientId, $doctorId, $studyName, $fileUrl, $type, $studyDate, $fileSize]);
    $studyId = $pdo->lastInsertId();

    // 5. Obtener información del doctor
    $stmt = $pdo->prepare("SELECT id, name, email FROM users WHERE id = ? AND role = 'doctor'");
    $stmt->execute([$doctorId]);
    $doctor = $stmt->fetch(PDO::FETCH_ASSOC);

    // 6. Crear notificación para el doctor en la BD
    $notificationMessage = "Se ha cargado un nuevo estudio: $studyName para el paciente $patientName (DNI: $patientDni)";
    $stmt = $pdo->prepare(
        "INSERT INTO notifications (doctor_id, patient_id, study_id, message, is_read, created_at) 
         VALUES (?, ?, ?, ?, FALSE, NOW())"
    );
    $result = $stmt->execute([$doctorId, $patientId, $studyId, $notificationMessage]);

    if (!$result) {
        error_log("Error creando notificación: " . json_encode($stmt->errorInfo()));
    }

    // Emails deshabilitados temporalmente — solo notificación in-app

    // 9. Respuesta al cliente
    echo json_encode([
        'message' => 'Estudio registrado exitosamente',
        'study_id' => $studyId,
        'notifications' => [
            'in_app_notification_created' => true
        ]
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}
?>
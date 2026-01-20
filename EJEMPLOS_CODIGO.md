# 💻 EJEMPLOS DE CÓDIGO - SISTEMA DE NOTIFICACIONES

## 📧 Ejemplo 1: Configurar Correo (mail_config.php)

### Antes (Original)

```php
// Sin configuración de correo
```

### Después (Implementado)

```php
<?php
require 'vendor/autoload.php';
use PHPMailer\PHPMailer\PHPMailer;

$MAIL_CONFIG = [
    'host'       => 'smtp.gmail.com',
    'port'       => 587,
    'username'   => 'mi_email@gmail.com',
    'password'   => 'mi_contraseña_app',
    'from_email' => 'mi_email@gmail.com',
    'from_name'  => 'Sistema Radiológico'
];

// Función para enviar correo a paciente
function sendPatientNotificationEmail($email, $name, $study, $date, $doctor) {
    global $MAIL_CONFIG;

    $mail = new PHPMailer(true);

    try {
        $mail->isSMTP();
        $mail->Host = $MAIL_CONFIG['host'];
        $mail->SMTPAuth = true;
        $mail->Username = $MAIL_CONFIG['username'];
        $mail->Password = $MAIL_CONFIG['password'];
        $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
        $mail->Port = $MAIL_CONFIG['port'];
        $mail->CharSet = 'UTF-8';

        $mail->setFrom($MAIL_CONFIG['from_email'], $MAIL_CONFIG['from_name']);
        $mail->addAddress($email, $name);

        $mail->isHTML(true);
        $mail->Subject = '📋 Tu estudio radiológico está listo';
        $mail->Body = "
            <h1>¡Tu estudio está listo!</h1>
            <p>Hola $name,</p>
            <p>Tu estudio $study de fecha $date ya está disponible.</p>
            <p>Doctor: Dr. $doctor</p>
            <p><a href='http://localhost'>Ver estudio</a></p>
        ";

        $mail->send();
        return ['success' => true, 'message' => 'Correo enviado'];

    } catch (Exception $e) {
        return ['success' => false, 'message' => $e->getMessage()];
    }
}

?>
```

---

## 🔔 Ejemplo 2: Registrar Estudio con Notificaciones (register_study.php)

### Fragmento Clave

```php
<?php
require 'mail_config.php';
require 'db.php';

// Datos del estudio
$doctorId = $input->doctor_id;
$patientDni = $input->patient_dni;
$patientEmail = $input->patient_email;

// ... crear/buscar paciente ...

// 1. INSERTAR ESTUDIO EN BD
$stmt = $pdo->prepare(
    "INSERT INTO studies (...) VALUES (...)"
);
$stmt->execute([...]);
$studyId = $pdo->lastInsertId();

// 2. CREAR NOTIFICACIÓN PARA DOCTOR
$message = "Se ha cargado un nuevo estudio: $studyName para $patientName";
$stmt = $pdo->prepare(
    "INSERT INTO notifications (doctor_id, patient_id, study_id, message)
     VALUES (?, ?, ?, ?)"
);
$stmt->execute([$doctorId, $patientId, $studyId, $message]);

// 3. ENVIAR CORREO A PACIENTE
if ($patientEmail) {
    $result = sendPatientNotificationEmail(
        $patientEmail,
        $patientName,
        $studyName,
        $studyDate,
        $doctor['name']
    );

    // Registrar en log
    logEmailSend($pdo, $patientEmail, 'patient',
                 'Tu estudio está listo',
                 $result['success'] ? 'sent' : 'failed',
                 null, $studyId);
}

// 4. ENVIAR CORREO A DOCTOR
if ($doctor && $doctor['email']) {
    $result = sendDoctorNotificationEmail(
        $doctor['email'],
        $doctor['name'],
        $patientName,
        $patientDni,
        $studyName,
        $studyDate
    );

    logEmailSend($pdo, $doctor['email'], 'doctor',
                 'Nuevo Estudio: ' . $patientName,
                 $result['success'] ? 'sent' : 'failed',
                 null, $studyId);
}

// 5. RESPONDER AL CLIENTE
echo json_encode([
    'message' => 'Estudio registrado exitosamente',
    'study_id' => $studyId,
    'notifications' => [
        'patient_email_sent' => true,
        'doctor_email_sent' => true,
        'in_app_notification_created' => true
    ]
]);

?>
```

---

## 📲 Ejemplo 3: Obtener Notificaciones (get_notifications.php)

### Petición

```javascript
// Frontend
const response = await axios.get(
  "http://localhost/backend/get_notifications.php?doctor_id=7&limit=10"
);
```

### Respuesta

```json
{
  "notifications": [
    {
      "id": 1,
      "doctor_id": 7,
      "patient_id": 13,
      "study_id": 18,
      "message": "Se ha cargado un nuevo estudio: Radiografía - Panorámica para Juan García",
      "is_read": false,
      "created_at": "2025-01-14 14:30:45",
      "read_at": null,
      "patient_name": "Juan García",
      "patient_dni": "123456",
      "study_name": "Radiografía - Panorámica",
      "study_date": "2025-01-14",
      "file_url": "https://s3.us-east-1.wasabisys.com/radio-sistema-archivos-2025/estudios/123456.jpg"
    },
    {
      "id": 2,
      "doctor_id": 7,
      "patient_id": 14,
      "study_id": 19,
      "message": "Se ha cargado un nuevo estudio: Tomografía - Bimaxilar para María López",
      "is_read": false,
      "created_at": "2025-01-14 13:15:30",
      "read_at": null,
      "patient_name": "María López",
      "patient_dni": "654321",
      "study_name": "Tomografía - Bimaxilar",
      "study_date": "2025-01-14",
      "file_url": "https://s3.us-east-1.wasabisys.com/radio-sistema-archivos-2025/estudios/654321.dcm"
    }
  ],
  "unread_count": 2,
  "total": 2
}
```

---

## 🔔 Ejemplo 4: Componente NotificationBell (React)

### Código Completo

```jsx
import { useState, useEffect } from "react";
import axios from "axios";
import { Bell, X, CheckCircle, Clock } from "lucide-react";

export default function NotificationBell() {
  const [notifications, setNotifications] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const user = JSON.parse(localStorage.getItem("user") || "{}");

  // Obtener notificaciones
  const fetchNotifications = async () => {
    if (!user.id) return;

    setLoading(true);
    try {
      const response = await axios.get(
        `http://localhost/backend/get_notifications.php?doctor_id=${user.id}&limit=10`
      );
      setNotifications(response.data.notifications || []);
      setUnreadCount(response.data.unread_count || 0);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  // Cargar al montar y cada 30 segundos
  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  // Marcar como leída
  const markAsRead = async (notificationId) => {
    try {
      await axios.post("http://localhost/backend/mark_notification_read.php", {
        notification_id: notificationId,
        doctor_id: user.id,
      });
      fetchNotifications(); // Refetch
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return (
    <div className="relative">
      {/* CAMPANA */}
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="relative p-2 text-gray-600 hover:text-gray-900"
      >
        <Bell size={24} />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </button>

      {/* DROPDOWN */}
      {showDropdown && (
        <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-2xl z-50">
          <div className="bg-blue-600 text-white p-4 rounded-t-lg flex justify-between">
            <h3 className="font-bold">Notificaciones</h3>
            <button onClick={() => setShowDropdown(false)}>
              <X size={20} />
            </button>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {loading ? (
              <div className="p-8 text-center text-gray-500">Cargando...</div>
            ) : notifications.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                No hay notificaciones
              </div>
            ) : (
              notifications.map((notif) => (
                <div key={notif.id} className="p-4 border-b">
                  <p className="font-semibold">{notif.patient_name}</p>
                  <p className="text-gray-600 text-sm">{notif.study_name}</p>
                  <p className="text-gray-500 text-xs mt-2">
                    {new Date(notif.created_at).toLocaleString()}
                  </p>
                  {!notif.is_read && (
                    <button
                      onClick={() => markAsRead(notif.id)}
                      className="text-blue-600 text-sm mt-2"
                    >
                      Marcar como leído
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
```

---

## 🔌 Ejemplo 5: Uso en UploadForm (Integración)

### Frontend - Envío de Datos

```javascript
// En UploadForm.jsx - handleSubmit()

// PASO 3: Registrar en BD
const response = await axios.post(
  "http://localhost/backend/register_study.php",
  {
    uploader_role: user.role,
    doctor_id: formData.doctor_id,
    patient_dni: formData.patient_dni,
    patient_name: formData.patient_name,
    patient_email: formData.patient_email, // ← NUEVO
    study_name: `${selectedCategory} - ${selectedStudyType}`,
    study_date: formData.study_date,
    file_key: file_key,
    file_size: file.size,
    file_type_raw: file.type,
  }
);

// Respuesta incluye info de notificaciones
console.log(response.data.notifications);
// {
//   patient_email_sent: true,
//   doctor_email_sent: true,
//   in_app_notification_created: true
// }
```

---

## 🗄️ Ejemplo 6: SQL - Nuevas Tablas

### Tabla notifications

```sql
CREATE TABLE notifications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  doctor_id INT NOT NULL,
  patient_id INT NOT NULL,
  study_id INT NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  read_at TIMESTAMP NULL,

  KEY doctor_id (doctor_id),
  FOREIGN KEY (doctor_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
  FOREIGN KEY (study_id) REFERENCES studies(id) ON DELETE CASCADE
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4;
```

### Tabla email_logs

```sql
CREATE TABLE email_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  recipient_email VARCHAR(100) NOT NULL,
  recipient_type ENUM('patient', 'doctor') NOT NULL,
  subject VARCHAR(255) NOT NULL,
  sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  status ENUM('sent', 'failed') DEFAULT 'sent',
  error_message TEXT NULL,
  study_id INT NULL,

  FOREIGN KEY (study_id) REFERENCES studies(id) ON DELETE SET NULL
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4;
```

### ALTER patients

```sql
ALTER TABLE patients ADD COLUMN email VARCHAR(100) NULL UNIQUE;
```

---

## 🧪 Ejemplo 7: Pruebas con cURL

### Test 1: Enviar correo

```bash
curl -X POST http://localhost/backend/test_email.php \
  -H "Content-Type: application/json" \
  -d '{
    "type": "patient",
    "email": "mi_email@gmail.com"
  }'

# Respuesta:
# {"success":true,"message":"Correo enviado al paciente"}
```

### Test 2: Obtener notificaciones

```bash
curl "http://localhost/backend/get_notifications.php?doctor_id=7&limit=5"

# Respuesta: JSON con notificaciones
```

### Test 3: Marcar como leída

```bash
curl -X POST http://localhost/backend/mark_notification_read.php \
  -H "Content-Type: application/json" \
  -d '{
    "notification_id": 1,
    "doctor_id": 7
  }'

# Respuesta:
# {"message":"Notificación marcada como leída"}
```

---

## 📊 Ejemplo 8: Flujo Completo

### 1. Usuario sube estudio

```javascript
// UploadForm.jsx
const response = await axios.post("/backend/register_study.php", {
  doctor_id: 7,
  patient_dni: "123456",
  patient_name: "Juan García",
  patient_email: "juan@example.com", // ← Importante
  study_name: "Radiografía - Panorámica",
  study_date: "2025-01-14",
  file_key: "estudios/abc123.jpg",
  // ...
});
```

### 2. Backend procesa

```php
// register_study.php
1. Busca/crea paciente (con email)
2. Inserta estudio en BD
3. Crea notificación en tabla notifications
4. Envía correo a paciente via mail_config.php
5. Envía correo a doctor via mail_config.php
6. Registra logs en email_logs
7. Retorna confirmación
```

### 3. Doctor ve notificación

```javascript
// NotificationBell.jsx
1. useEffect → GET /get_notifications.php?doctor_id=7
2. Recibe array de notificaciones
3. Muestra campana con unread_count
4. Si doctor hace clic → muestra dropdown
5. Doctor puede marcar como leída → POST /mark_notification_read.php
6. Auto-refresh cada 30 segundos
```

### 4. Logs registrados

```sql
-- email_logs tendrá 2 registros:
INSERT INTO email_logs VALUES (
  1, 'juan@example.com', 'patient',
  'Tu estudio está listo', NOW(), 'sent', NULL, 19
);

INSERT INTO email_logs VALUES (
  2, 'doctor@example.com', 'doctor',
  'Nuevo Estudio Cargado - Juan García', NOW(), 'sent', NULL, 19
);
```

---

## 🎯 Comparativa: Antes vs Después

### ANTES

```
Admin sube estudio
    ↓
Archivo guardado en Wasabi
    ↓
Registro en BD
    ↓
FIN - Doctor no se entera
```

### DESPUÉS

```
Admin sube estudio
    ↓
Archivo guardado en Wasabi
    ↓
Registro en BD
    ↓
✅ Crea notificación en BD
    ↓
✅ Envía correo al paciente
    ↓
✅ Envía correo al doctor
    ↓
✅ Registra logs
    ↓
✅ Doctor ve campana con notificación
    ↓
✅ Doctor puede marcar como leída
    ↓
✅ Auditoría completa en BD
```

---

**¡Ejemplos listos para implementar!** 💻

# 📋 Sistema de Notificaciones - IMPLEMENTACIÓN COMPLETA

## 🎯 Resumen

He implementado un sistema completo de **notificaciones por correo y en-aplicación** para tu sistema radiológico. Cuando un estudio se sube:

✅ **El paciente recibe un correo** notificándole que su estudio está listo para revisar
✅ **El doctor recibe un correo** notificándole que se subió un nuevo estudio de uno de sus pacientes  
✅ **El doctor ve una notificación en-aplicación** con detalles del estudio
✅ **Se registra un log** de todos los envíos de correo

---

## 📦 ARCHIVOS CREADOS

### Backend

1. **`migrations.sql`** - Script SQL para crear las nuevas tablas

   - `notifications` - Almacena notificaciones para doctores
   - `email_logs` - Registra todos los envíos de correo
   - Agrega columna `email` a tabla `patients`

2. **`mail_config.php`** - Configuración de envío de correos

   - Funciones: `sendPatientNotificationEmail()`, `sendDoctorNotificationEmail()`, `logEmailSend()`
   - Correos HTML con diseño profesional
   - Maneja errores y excepciones

3. **`get_notifications.php`** - Endpoint para obtener notificaciones

   - GET `/backend/get_notifications.php?doctor_id={ID}&limit=10`
   - Retorna notificaciones ordenadas por fecha, con info del paciente y estudio

4. **`mark_notification_read.php`** - Endpoint para marcar como leída
   - POST `/backend/mark_notification_read.php`
   - Registra fecha/hora de lectura

### Frontend

1. **`NotificationBell.jsx`** - Componente de campana de notificaciones

   - Muestra contador de notificaciones sin leer
   - Dropdown con lista de notificaciones
   - Auto-actualiza cada 30 segundos
   - Permite marcar como leído

2. **`Sidebar.jsx`** (ACTUALIZADO) - Integración del componente
   - Muestra el NotificationBell para doctores y admins
   - Muestra info del usuario actual

### Modificados

1. **`register_study.php`** (ACTUALIZADO)

   - Ahora crea notificaciones en BD
   - Envía correos a paciente y doctor
   - Registra logs de envío
   - Retorna confirmación de notificaciones

2. **`composer.json`** (ACTUALIZADO)
   - Añadida dependencia: `phpmailer/phpmailer: ^6.9`

---

## 🚀 PASOS DE IMPLEMENTACIÓN

### PASO 1: Actualizar la Base de Datos

Ejecuta el script en `backend/migrations.sql` en phpMyAdmin o cliente SQL:

```bash
# En MySQL/phpMyAdmin, copia y ejecuta el contenido de migrations.sql
```

**Alternativa:** Ejecuta directamente con comando:

```bash
mysql -u root -p radiologia_db < backend/migrations.sql
```

---

### PASO 2: Instalar PHPMailer

En la carpeta `backend/`, ejecuta:

```bash
composer install
```

O si tienes composer instalado globalmente:

```bash
composer update
```

Esto descargará:

- `phpmailer/phpmailer: ^6.9`
- `aws/aws-sdk-php: ^3.337`
- `firebase/php-jwt: ^6.10`

---

### PASO 3: Configurar Credenciales de Correo

Abre `backend/mail_config.php` y edita esta sección (líneas 9-14):

```php
$MAIL_CONFIG = [
    'host'       => 'smtp.gmail.com',           // ← Cambiar si usas otro proveedor
    'port'       => 587,                        // ← Puerto SMTP
    'username'   => 'tu_email@gmail.com',       // ← TU EMAIL AQUÍ
    'password'   => 'tu_contraseña_aplicacion', // ← CONTRASEÑA/TOKEN AQUÍ
    'from_email' => 'tu_email@gmail.com',       // ← Email remitente
    'from_name'  => 'Sistema Radiológico'       // ← Nombre que aparecerá
];
```

#### 🔐 Instrucciones por proveedor:

**GMAIL:**

1. Habilita 2FA en tu cuenta Google
2. Genera una [contraseña de aplicación](https://myaccount.google.com/apppasswords)
3. Usa esa contraseña en `'password'`
4. `host: smtp.gmail.com`, `port: 587`

**OUTLOOK/HOTMAIL:**

1. `host: smtp.live.com`
2. `port: 587`
3. Usa tu email y contraseña

**SERVIDOR PERSONALIZADO:**

1. Reemplaza `host` y `port` con los datos de tu servidor SMTP
2. Usa credenciales del servidor

---

### PASO 4: Agregar Email en Formulario de Upload (OPCIONAL)

Si quieres que los usuarios agreguen email al subir un estudio:

En `frontend/src/components/UploadForm.jsx`, busca en `handleSubmit()` donde se llama a `register_study.php` y añade:

```jsx
await axios.post("http://localhost/backend/register_study.php", {
  uploader_role: user.role,
  doctor_id: formData.doctor_id,
  patient_dni: formData.patient_dni,
  patient_name: formData.patient_name,
  patient_email: formData.patient_email, // ← AGREGAR ESTO
  study_name: `${selectedCategory} - ${selectedStudyType}`,
  study_date: formData.study_date,
  file_key: file_key,
  file_size: file.size,
  file_type_raw: file.type,
});
```

Y en el formulario, añade un input para email del paciente.

---

## 🔄 FLUJO DE FUNCIONAMIENTO

```
1. Admin sube estudio en UploadForm
                ↓
2. Archivo sube a Wasabi
                ↓
3. register_study.php se ejecuta
                ↓
    ├─ Busca/crea paciente en BD
    ├─ Inserta estudio en BD
    ├─ Obtiene datos del doctor
    ├─ CREA NOTIFICACIÓN en tabla notifications
    ├─ ENVÍA CORREO a paciente (si tiene email)
    ├─ ENVÍA CORREO a doctor (si tiene email)
    └─ REGISTRA en email_logs
                ↓
4. Doctor ve notificación en campana
5. Doctor puede hacer clic y marcar como leída
```

---

## 📲 CARACTERÍSTICAS PRINCIPALES

### Para Doctores:

- 🔔 Icono de campana en sidebar con contador de notificaciones sin leer
- 📧 Notificaciones por correo cuando pacientes reciben estudios
- 👁️ Pueden ver lista de notificaciones con detalles
- ✅ Pueden marcar notificaciones como leídas
- ⏰ Auto-actualización cada 30 segundos

### Para Pacientes:

- 📧 Reciben correo HTML profesional cuando nuevo estudio está disponible
- 📋 Correo incluye: tipo de estudio, fecha, doctor responsable
- 🔗 Acceso directo al sistema

### Para Admins:

- 📊 Tabla `email_logs` para auditoría de envíos
- 🔍 Puede ver intentos fallidos y razones

---

## 🧪 PRUEBAS

### Prueba 1: Verificar configuración de correo

Crea un archivo `test_email.php` en `backend/`:

```php
<?php
require 'mail_config.php';

$result = sendPatientNotificationEmail(
    'tu_email@example.com',
    'Test Paciente',
    'Radiografía - Panorámica',
    '2025-01-14',
    'Dr. Test'
);

echo json_encode($result);
?>
```

Accede a: `http://localhost/backend/test_email.php`

### Prueba 2: Obtener notificaciones

```
GET http://localhost/backend/get_notifications.php?doctor_id=7
```

Deberías recibir JSON con notificaciones del doctor ID 7.

### Prueba 3: Marcar como leída

```
POST http://localhost/backend/mark_notification_read.php
Body: {
    "notification_id": 1,
    "doctor_id": 7
}
```

---

## 🐛 SOLUCIÓN DE PROBLEMAS

| Problema                               | Solución                                                               |
| -------------------------------------- | ---------------------------------------------------------------------- |
| Error "Class 'PHPMailer' not found"    | Ejecutar `composer install` en backend/                                |
| Correos no se envían                   | Verificar `mail_config.php` - cambiar credenciales                     |
| Error SSL/TLS                          | Cambiar port de 587 a 465 y `ENCRYPTION_STARTTLS` a `ENCRYPTION_SMTPS` |
| Tabla `notifications` no existe        | Ejecutar script en `migrations.sql`                                    |
| Notificaciones no aparecen en frontend | Verificar que `doctor_id` en localStorage sea correcto                 |

---

## 📝 ESTRUCTURA BD ACTUALIZADA

```
patients
├── id
├── doctor_id
├── dni
├── name
├── email (NUEVO)
└── created_at

notifications (NUEVA TABLA)
├── id
├── doctor_id (FK → users)
├── patient_id (FK → patients)
├── study_id (FK → studies)
├── message
├── is_read
├── created_at
└── read_at

email_logs (NUEVA TABLA)
├── id
├── recipient_email
├── recipient_type (enum: patient, doctor)
├── subject
├── sent_at
├── status (enum: sent, failed)
├── error_message
└── study_id (FK → studies)
```

---

## 🔐 SEGURIDAD

✅ Validaciones de doctor_id en endpoints
✅ Logs de todos los intentos de envío
✅ Manejo de excepciones
✅ Sanitización de datos
✅ Verificación de permisos

---

## 📞 PRÓXIMAS MEJORAS (OPCIONAL)

- [ ] Notificaciones push en tiempo real (Socket.io)
- [ ] Dashboard de estadísticas de notificaciones
- [ ] Plantillas de correo personalizables
- [ ] Notificaciones SMS
- [ ] Sistema de preferencias de notificación

---

## ✅ CHECKLIST FINAL

- [ ] Ejecuté `migrations.sql` en la BD
- [ ] Ejecuté `composer install` en backend/
- [ ] Actualicé credenciales en `mail_config.php`
- [ ] Probé envío de correo
- [ ] Verifiqué que NotificationBell aparece en sidebar
- [ ] Subí un estudio y verifiqué notificaciones
- [ ] Recibí correo en la bandeja de entrada

---

## 📧 FORMATO DE CORREOS

### Correo para Paciente:

```
Asunto: 📋 Tu estudio radiológico está listo para revisar

Hola {Nombre},

Te informamos que tu estudio radiológico ha sido cargado.

Detalles:
- Tipo: Radiografía - Panorámica
- Fecha: 2025-01-14
- Médico: Dr. Juan Pérez

Puedes acceder al sistema con tu DNI como usuario y contraseña.

[Botón: Ir al Sistema]
```

### Correo para Doctor:

```
Asunto: ✅ Nuevo Estudio Cargado - {Nombre Paciente}

Estimado Dr. {Nombre},

Se ha cargado un nuevo estudio para uno de tus pacientes.

Paciente: {Nombre} (DNI: {DNI})
Tipo: Radiografía - Panorámica
Fecha: 2025-01-14

Revisa el estudio en el sistema para proporcionar tu interpretación.

[Botón: Ver en el Sistema]
```

---

## 🎓 ESTRUCTURA DEL CÓDIGO

```
backend/
├── mail_config.php         ← Configuración y funciones de correo
├── register_study.php      ← ACTUALIZADO - Ahora envía notificaciones
├── get_notifications.php   ← Obtener notificaciones (GET)
├── mark_notification_read.php ← Marcar como leída (POST)
├── migrations.sql          ← Script crear tablas
└── composer.json           ← ACTUALIZADO - Con PHPMailer

frontend/src/components/
├── NotificationBell.jsx    ← Componente campana
├── Sidebar.jsx             ← ACTUALIZADO - Integra NotificationBell
└── UploadForm.jsx          ← Ya listo (opcional mejorar)
```

---

¡Sistema implementado y listo para usar! 🚀

# 🏗️ ANÁLISIS COMPLETO - SISTEMA RADIOLÓGICO

## 📊 ESTRUCTURA ACTUAL DEL PROYECTO

```
SISTEMA-RADIOLOGICOS/
│
├── 📄 Documentos
│   ├── keys wasabi.txt          (Credenciales AWS S3 Wasabi)
│   ├── politicas dentro de wasabi.txt
│   └── radiologia_db.sql        (Dump original de BD)
│
├── 🔧 backend/                  (PHP + Base de Datos)
│   ├── 📋 CRUD Usuarios
│   │   ├── crear_usuarios.php   (Crear usuarios admin/doctor)
│   │   ├── create_doctor.php    (Crear doctors específicamente)
│   │   ├── register_study.php   (ACTUALIZADO - Registro de estudios + Notificaciones)
│   │   └── login.php            (Autenticación con JWT)
│   │
│   ├── 📊 CRUD Datos
│   │   ├── get_doctors.php      (Obtener lista de doctores)
│   │   ├── get_patients.php     (Potencial endpoint)
│   │   ├── get_patient_history.php (Historia de paciente)
│   │   └── get_studies.php      (Obtener estudios)
│   │
│   ├── ☁️ Almacenamiento (Wasabi S3)
│   │   ├── s3.php               (Configuración de cliente S3)
│   │   ├── get_presigned_upload.php (URLs firmadas para upload)
│   │   ├── get_signed_url.php   (URLs firmadas para descarga)
│   │   └── upload_backup.php.php (Backup automático)
│   │
│   ├── 📧 NUEVO - Sistema de Notificaciones
│   │   ├── mail_config.php      (Config SMTP + funciones de correo)
│   │   ├── get_notifications.php (Obtener notificaciones del doctor)
│   │   ├── mark_notification_read.php (Marcar como leída)
│   │   └── test_email.php       (Probar configuración)
│   │
│   ├── 🔐 Seguridad
│   │   ├── cors.php             (CORS headers)
│   │   └── db.php               (Conexión PDO)
│   │
│   ├── 📦 Dependencias
│   │   ├── composer.json        (ACTUALIZADO - Con PHPMailer)
│   │   └── vendor/              (Librerías instaladas)
│   │
│   └── 📄 Otros
│       ├── dashboard_stats.php  (Estadísticas dashboard)
│       └── Nuevo Documento de texto.txt
│
├── 🎨 frontend/                 (React + Vite)
│   ├── 📄 Configuración
│   │   ├── index.html
│   │   ├── package.json
│   │   ├── vite.config.js
│   │   ├── eslint.config.js
│   │   └── README.md
│   │
│   ├── 📁 public/               (Activos estáticos)
│   │
│   └── src/
│       ├── 🎯 App.jsx           (Rutas principales)
│       ├── 🎨 index.css         (Estilos globales)
│       ├── 🚀 main.jsx          (Entry point)
│       │
│       ├── 📄 pages/            (Vistas principales)
│       │   ├── Login.jsx        (Autenticación)
│       │   ├── DashboardHome.jsx (Dashboard principal)
│       │   ├── Doctors.jsx      (Gestión de doctores)
│       │   └── Patients.jsx     (Gestión de pacientes)
│       │
│       └── 🧩 components/       (Componentes reutilizables)
│           ├── Sidebar.jsx                    (ACTUALIZADO - Con NotificationBell)
│           ├── NotificationBell.jsx           (NUEVO - Campana de notificaciones)
│           ├── UploadForm.jsx                 (Subida de estudios)
│           ├── DicomViewerModal.jsx           (Visor DICOM)
│           ├── PatientHistoryModal.jsx        (Historia del paciente)
│           └── StudyList.jsx                  (Lista de estudios)
│
└── 📚 DOCUMENTACIÓN
    ├── IMPLEMENTACION_NOTIFICACIONES.md      (NUEVO - Guía completa)
    └── ARQUITECTURA_SISTEMA.md               (Este archivo)
```

---

## 🗄️ ESQUEMA DE BASE DE DATOS

### Tablas Originales

```sql
-- Tabla de Usuarios (Doctores y Admins)
users (
  id INT PK,
  name VARCHAR(100),
  email VARCHAR(100) UNIQUE,
  password VARCHAR(255),
  role ENUM('admin', 'doctor'),
  created_at TIMESTAMP
)

-- Tabla de Pacientes
patients (
  id INT PK,
  doctor_id INT FK → users,
  dni VARCHAR(20),
  name VARCHAR(100),
  email VARCHAR(100) UNIQUE (NUEVO),
  created_at TIMESTAMP
)

-- Tabla de Estudios
studies (
  id INT PK,
  patient_id INT FK → patients,
  doctor_id INT FK → users,
  study_name VARCHAR(150),
  file_url TEXT,
  file_type ENUM('dicom', 'stl', 'image', 'pdf'),
  study_date DATE,
  created_at TIMESTAMP,
  file_size BIGINT
)
```

### Nuevas Tablas (IMPLEMENTADAS)

```sql
-- Notificaciones en-aplicación para doctores
notifications (
  id INT PK,
  doctor_id INT FK → users,
  patient_id INT FK → patients,
  study_id INT FK → studies,
  message TEXT,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP,
  read_at TIMESTAMP NULL
)

-- Log de envíos de correo (auditoría)
email_logs (
  id INT PK,
  recipient_email VARCHAR(100),
  recipient_type ENUM('patient', 'doctor'),
  subject VARCHAR(255),
  sent_at TIMESTAMP,
  status ENUM('sent', 'failed'),
  error_message TEXT NULL,
  study_id INT FK → studies
)
```

---

## 🔄 FLUJO DE DATOS - SUBIDA DE ESTUDIO

```
┌─────────────────────────────────────────────────────────────────┐
│                   FRONTEND (React)                              │
├─────────────────────────────────────────────────────────────────┤
│  UploadForm.jsx                                                 │
│  1. Admin selecciona:                                           │
│     - Tipo de estudio (Radiografía, Tomografía, etc)          │
│     - Doctor destino                                            │
│     - DNI del paciente                                          │
│     - Archivo a subir                                           │
│  2. Valida formato de archivo en cliente                       │
└─────────────────────┬───────────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────────┐
│         PASO 1: Obtener URL firmada de Wasabi                   │
├─────────────────────────────────────────────────────────────────┤
│  POST /backend/get_presigned_upload.php                         │
│  ├─ Datos: file_name, file_type, uploader_role                │
│  ├─ Backend valida rol (admin)                                 │
│  ├─ Genera nombre único: estudios/XXXXX.ext                    │
│  └─ Responde con: upload_url (Wasabi), file_key               │
└─────────────────────┬───────────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────────┐
│    PASO 2: Upload directo a Wasabi S3                           │
├─────────────────────────────────────────────────────────────────┤
│  PUT {upload_url} con archivo                                   │
│  ├─ Bypass del servidor (sube directamente a Wasabi)           │
│  ├─ Más rápido y seguro                                        │
│  └─ Frontend actualiza progress bar                            │
└─────────────────────┬───────────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────────┐
│    PASO 3: Registrar en BD + Enviar Notificaciones             │
├─────────────────────────────────────────────────────────────────┤
│  POST /backend/register_study.php                              │
│  ├─ Datos:                                                      │
│  │   └─ doctor_id, patient_dni, patient_name, study_name,     │
│  │      study_date, file_key, file_size                        │
│  │                                                              │
│  ├─ BD: Busca/Crea paciente                                   │
│  ├─ BD: Inserta estudio en tabla studies                      │
│  │                                                              │
│  ├─ 📧 Obtiene email del paciente                             │
│  ├─ 📧 Crea notificación en BD (notifications)                │
│  ├─ 📧 Envía correo a paciente vía SMTP                       │
│  ├─ 📧 Registra en email_logs                                 │
│  │                                                              │
│  ├─ 📧 Obtiene email del doctor                               │
│  ├─ 📧 Envía correo a doctor vía SMTP                         │
│  ├─ 📧 Registra en email_logs                                 │
│  │                                                              │
│  └─ Responde con confirmación de envíos                        │
└─────────────────────┬───────────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────────┐
│    PASO 4: Frontend muestra éxito                               │
├─────────────────────────────────────────────────────────────────┤
│  ✅ "Estudio subido exitosamente"                              │
│  Realiza reload para actualizar lista                          │
└─────────────────────────────────────────────────────────────────┘

```

---

## 🔔 FLUJO DE NOTIFICACIONES

### Para Doctores (En-aplicación)

```
┌────────────────────────────────────────┐
│  Doctor ingresa al dashboard           │
└─────────────┬──────────────────────────┘
              │
              ▼
┌────────────────────────────────────────┐
│  Sidebar renderiza NotificationBell    │
│  (Solo si rol = 'doctor' o 'admin')   │
└─────────────┬──────────────────────────┘
              │
              ▼
┌────────────────────────────────────────┐
│  useEffect → fetchNotifications()       │
│  GET /backend/get_notifications.php   │
│  ?doctor_id=7&limit=10                 │
└─────────────┬──────────────────────────┘
              │
              ▼
┌────────────────────────────────────────┐
│  Backend retorna:                      │
│  {                                     │
│    notifications: [...],               │
│    unread_count: 3                     │
│  }                                     │
└─────────────┬──────────────────────────┘
              │
              ▼
┌────────────────────────────────────────┐
│  Mostrar campana con badge (3)         │
│  Si doctor hace clic → dropdown        │
│  Lista últimas 10 notificaciones       │
└─────────────┬──────────────────────────┘
              │
              ▼
┌────────────────────────────────────────┐
│  Doctor ve y hace clic en notificación │
│  POST /mark_notification_read.php      │
│  {                                     │
│    notification_id: 1,                 │
│    doctor_id: 7                        │
│  }                                     │
└─────────────┬──────────────────────────┘
              │
              ▼
┌────────────────────────────────────────┐
│  BD actualiza is_read=TRUE, read_at=NOW│
│  Refetch notificaciones → unread=2     │
│  Badge actualiza a (2)                 │
└────────────────────────────────────────┘

Auto-refresh cada 30 segundos
```

---

## 🔐 AUTENTICACIÓN Y AUTORIZACIÓN

### Flujo de Login

```
Usuario ingresa email/contraseña
         ↓
POST /backend/login.php
         ↓
┌─ ¿Es usuario? (ADMIN/DOCTOR)
│  ├─ Sí: Verifica password con bcrypt
│  ├─ JWT: Crea token con id, role, name
│  └─ Responde con token + user data
│
└─ ¿Es paciente? (DNI = password)
   ├─ Sí: Busca paciente por DNI
   └─ Responde con token simple
```

### JWT Token Structure

```json
{
  "id": 7,
  "role": "doctor",
  "name": "Doctor 1",
  "iat": 1705270000,
  "exp": 1705356400 // Expira en 24h
}
```

---

## 📧 CONFIGURACIÓN DE CORREO

### Proveedores Soportados

```
Gmail SMTP:
  - Host: smtp.gmail.com
  - Port: 587 (TLS)
  - Auth: email + app password

Outlook/Hotmail:
  - Host: smtp.live.com
  - Port: 587 (TLS)
  - Auth: email + password

Servidor Personal:
  - Host: mail.tudominio.com
  - Port: 587 o 465
  - Auth: usuario@tudominio.com + password
```

### Variables de Correo

```php
$MAIL_CONFIG = [
    'host'       => 'smtp.gmail.com',
    'port'       => 587,
    'username'   => 'tu_email@gmail.com',      // ← CAMBIAR
    'password'   => 'tu_contraseña_aplicacion', // ← CAMBIAR
    'from_email' => 'tu_email@gmail.com',       // ← CAMBIAR
    'from_name'  => 'Sistema Radiológico'
];
```

---

## 🗂️ TIPOS DE ESTUDIOS SOPORTADOS

```javascript
const STUDY_CATEGORIES = {
  // Radiografías 2D
  Radiografía: [
    "Panorámica",
    "Perfil",
    "Periapical",
    "Antero Posterior",
    "Postero Anterior",
    "Cefalometría",
    "Coronales",
    "Carpograma",
    "ATM",
    "Senos Maxilares",
  ],

  // Paquetes Ortodoncia
  "Básico de Ortodoncia": ["Paquete Básico"],
  "Plus de Ortodoncia": ["Paquete Plus"],

  // Especialidades
  "Paquete Maxilofacial": ["Estudio Completo"],
  "Paquete de Ortopedia": ["Estudio Ortopédico"],
  "Paquete Diseño de Sonrisa": ["Diseño Digital"],

  // 3D
  Scanner: ["Escaneo Intraoral", "Escaneo Facial", "Modelo 3D"],

  // Tomografía (Volumen)
  Tomografía: [
    "Zona de diente",
    "Cuadrante",
    "Maxilar Superior",
    "Maxilar Inferior",
    "Bimaxilar",
    "Cara Completa",
    "Cráneo",
    "ATM",
    "Ramas Mandibulares",
    "Senos Paranasales",
    "Vías Aéreas",
    "Vértebras",
  ],
};
```

---

## 📋 ENDPOINTS API

### Autenticación

```
POST /backend/login.php
  Input: { username: email, password }
  Output: { token, user: {id, name, email, role} }
```

### Doctores

```
GET /backend/get_doctors.php
  Output: [{ id, name, email }, ...]
```

### Estudios

```
POST /backend/get_presigned_upload.php
  Input: { file_name, file_type }
  Output: { upload_url, file_key }

POST /backend/register_study.php
  Input: { doctor_id, patient_dni, study_name, file_key, ... }
  Output: { message, notifications: {...} }

GET /backend/get_studies.php
  Input: ?patient_id=X
  Output: [{ id, study_name, file_url, ... }, ...]

POST /backend/get_signed_url.php
  Input: { file_key }
  Output: { signed_url }
```

### Notificaciones (NUEVO)

```
GET /backend/get_notifications.php
  Input: ?doctor_id=7&limit=10
  Output: { notifications: [...], unread_count: N }

POST /backend/mark_notification_read.php
  Input: { notification_id, doctor_id }
  Output: { message }
```

### Pacientes

```
GET /backend/get_patient_history.php
  Input: ?patient_id=1
  Output: [{ study_name, date, file_url }, ...]
```

---

## 🔒 SEGURIDAD IMPLEMENTADA

✅ **Validación de entrada**

- Verificación de tipo de archivo
- Sanitización de datos
- Validación de rango de bytes

✅ **Autenticación**

- JWT tokens con expiración (24h)
- Contraseñas con bcrypt
- Login separado para pacientes y doctores

✅ **Autorización**

- Verificación de rol (admin, doctor)
- Validación de pertenencia de notificaciones

✅ **Almacenamiento**

- Archivos en Wasabi S3 (no en servidor)
- URLs firmadas con expiración
- Nombres de archivo aleatorios

✅ **Comunicación**

- HTTPS recomendado en producción
- CORS configurado
- Headers de seguridad

✅ **Auditoria**

- Logs de envíos de correo
- Registro de acciones en BD
- Timestamps en todas las operaciones

---

## 🚀 TECNOLOGÍAS UTILIZADAS

### Backend

- **PHP 8.3** - Lenguaje servidor
- **MySQL 8.4** - Base de datos
- **PDO** - Acceso a BD
- **Firebase JWT** - Tokens de autenticación
- **AWS SDK for PHP** - Cliente S3/Wasabi
- **PHPMailer** - Envío de correos (NUEVO)
- **Composer** - Gestor de dependencias

### Frontend

- **React 18** - Framework UI
- **Vite** - Build tool
- **Axios** - Cliente HTTP
- **Tailwind CSS** - Estilos
- **Lucide React** - Iconos
- **React Router** - Enrutamiento

### Infraestructura

- **XAMPP/Apache** - Servidor web local
- **Wasabi S3** - Almacenamiento de archivos
- **Gmail/SMTP** - Envío de correos (configurable)

---

## 🎯 CASOS DE USO PRINCIPALES

### 1. Subir Estudio

```
Admin → Selecciona doctor y paciente → Sube archivo
→ Sistema guarda en Wasabi → Registra en BD
→ Envía notificaciones → Paciente y doctor reciben correos
```

### 2. Doctor Revisa Notificaciones

```
Doctor abre dashboard → Ve campana con contador
→ Hace clic → Ve lista de estudios nuevos
→ Selecciona uno → Puede marcar como leído
```

### 3. Paciente Revisa Estudio

```
Paciente recibe correo → Hace clic en enlace
→ Ingresa con su DNI → Ve su estudio cargado
→ Puede descargar y revisar
```

---

## 📊 ESTADÍSTICAS DEL SISTEMA

- **Usuarios en BD**: 3 (1 admin, 2 doctores)
- **Pacientes**: 7 (en diferentes doctores)
- **Estudios**: 8 (radiografías, tomografías)
- **Tablas BD**: 5 (users, patients, studies, notifications*, email_logs*)
  \*Nuevas con esta implementación

---

## ✅ VENTAJAS DE LA IMPLEMENTACIÓN

1. **Notificaciones Duales**

   - Email para registro permanente
   - En-app para revisión rápida

2. **Escalable**

   - Nuevos proveedores SMTP fáciles de agregar
   - Templates de email personalizables

3. **Auditable**

   - Logs de todos los envíos
   - Historial de lecturas

4. **Seguro**

   - Validaciones en servidor
   - No expone credenciales en frontend

5. **Performante**
   - Auto-refresh cada 30s (no consumidor)
   - Datos paginados

---

¡Sistema completo y documentado! 📚✨

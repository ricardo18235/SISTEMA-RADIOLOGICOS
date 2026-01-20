# ✅ CHECKLIST DE IMPLEMENTACIÓN

## 🚀 ANTES DE EMPEZAR

```
☐ Backup de base de datos (IMPORTANTE!)
☐ Backup de archivos backend/
☐ Verificar XAMPP/Apache está corriendo
☐ Verificar phpMyAdmin es accesible
☐ Verificar que pueden ejecutar comandos PHP
```

---

## 📦 PASO 1: BASE DE DATOS (5 minutos)

### Opción A: phpMyAdmin (Recomendado)

```
☐ Abrir http://localhost/phpmyadmin
☐ Seleccionar BD: radiologia_db
☐ Click en pestaña "SQL"
☐ Copiar contenido de backend/migrations.sql
☐ Pegar en editor SQL
☐ Click "Ejecutar"
☐ Ver mensaje de éxito
```

### Opción B: Terminal

```bash
☐ Abrir CMD en: c:\Users\U s e r\Desktop\SISTEMA RADIOLOGICOS\SISTEMA-RADIOLOGICOS\backend\
☐ Ejecutar: mysql -u root -p radiologia_db < migrations.sql
☐ Ingresar contraseña (en XAMPP es vacía, presionar Enter)
☐ Ver confirmación de éxito
```

### Verificar que funcionó

```
☐ En phpMyAdmin → radiologia_db → Pestaña "Estructura"
☐ Buscar tabla: notifications (NUEVA)
☐ Buscar tabla: email_logs (NUEVA)
☐ Buscar en patients: columna email (NUEVA)
```

---

## 🔧 PASO 2: COMPOSER/PHP (3 minutos)

### Prerequisitos

```
☐ Tener Composer instalado
  └─ Si no: descargar de https://getcomposer.org/download/
☐ Tener acceso a terminal/CMD
```

### Instalación

```bash
☐ Abrir CMD
☐ Navegar: cd c:\Users\U s e r\Desktop\SISTEMA RADIOLOGICOS\SISTEMA-RADIOLOGICOS\backend
☐ Ejecutar: composer install
☐ Esperar a que termine (2-3 minutos)
☐ Ver: "Generating autoload files"
☐ Verificar: apareció carpeta vendor/ con subdirectorios
```

### Verificar que funcionó

```
☐ Ver carpeta: backend/vendor/
☐ Ver carpeta: backend/vendor/phpmailer/
☐ Ver archivo: backend/vendor/autoload.php
```

---

## 📧 PASO 3: CONFIGURAR CORREOS (5 minutos)

### Opción A: Gmail (RECOMENDADO)

#### 1. Generar contraseña de aplicación

```
☐ Ir a: https://myaccount.google.com/apppasswords
☐ Seleccionar:
   └─ App: Correo
   └─ Dispositivo: Windows/Mac/Linux
☐ Click en "Generar"
☐ Copiar contraseña de 16 caracteres (sin espacios)
☐ Guardar en un lugar seguro
```

#### 2. Editar mail_config.php

```
☐ Abrir: backend/mail_config.php
☐ Buscar línea ~9: 'host'       => 'smtp.gmail.com',
☐ Buscar línea ~11: 'username'   => 'TU_EMAIL@gmail.com',
   └─ Reemplazar TU_EMAIL con tu email Gmail
☐ Buscar línea ~12: 'password'   => 'TU_CONTRASEÑA_APP',
   └─ Reemplazar con contraseña de 16 caracteres
☐ Buscar línea ~13: 'from_email' => 'TU_EMAIL@gmail.com',
   └─ Poner el mismo email
☐ Guardar archivo (Ctrl+S)
```

**Ejemplo:**

```php
$MAIL_CONFIG = [
    'host'       => 'smtp.gmail.com',
    'port'       => 587,
    'username'   => 'mi_email@gmail.com',       // ← TU EMAIL
    'password'   => 'abcd efgh ijkl mnop',      // ← CONTRASEÑA APP (16 caracteres)
    'from_email' => 'mi_email@gmail.com',       // ← MISMO EMAIL
    'from_name'  => 'Sistema Radiológico'
];
```

### Opción B: Outlook

```
☐ Editar mail_config.php
☐ Cambiar:
   ├─ host:     'smtp.live.com'
   ├─ port:     587
   ├─ username: 'tu_email@outlook.com'
   └─ password: 'tu_contraseña_outlook'
☐ Guardar
```

### Opción C: Otro servidor

```
☐ Contactar a proveedor por datos SMTP
☐ Editar mail_config.php con datos proveedor
☐ Guardar
```

### Verificar que funcionó

```
☐ mail_config.php editado correctamente
☐ Datos guardados correctamente
☐ Archivo sin errores de sintaxis
```

---

## 🧪 PASO 4: PRUEBAS (5 minutos)

### Test 1: Envío de Correo

#### Con Postman (si tienes instalado)

```
☐ Abrir Postman
☐ Crear nueva petición POST
☐ URL: http://localhost/backend/test_email.php
☐ Body (raw JSON):
   {
     "type": "patient",
     "email": "tu_email@gmail.com"
   }
☐ Click "Send"
☐ Esperar respuesta (2-5 segundos)
☐ Ver respuesta:
   {
     "success": true,
     "message": "Correo enviado al paciente"
   }
☐ Revisar bandeja de Gmail/Outlook
☐ Ver correo recibido con asunto "Tu estudio está listo"
```

#### Con navegador (opción alternativa)

```
☐ Abrir: http://localhost/backend/test_email.php
☐ Abrir consola del navegador (F12)
☐ Ir a Network / XHR
☐ No debería haber errores
```

### Test 2: Obtener Notificaciones

```
☐ Abrir en navegador:
   http://localhost/backend/get_notifications.php?doctor_id=7&limit=10
☐ Deberías ver JSON vacío (aún no hay notificaciones):
   {
     "notifications": [],
     "unread_count": 0,
     "total": 0
   }
☐ Esto es correcto - significa que el endpoint funciona
```

### Test 3: Marcar como Leída

```
☐ Usar Postman para POST a:
   http://localhost/backend/mark_notification_read.php
☐ Body:
   {
     "notification_id": 1,
     "doctor_id": 7
   }
☐ Deberías recibir: {"message":"Notificación marcada como leída"}
   O error si no existe notificación (es normal si es test)
```

---

## 🎨 PASO 5: FRONTEND (2 minutos)

### Verificar archivos

```
☐ Archivo existe: frontend/src/components/NotificationBell.jsx
☐ Archivo actualizado: frontend/src/components/Sidebar.jsx
☐ Contiene: import NotificationBell from "./NotificationBell";
```

### Recargar página

```
☐ Abrir navegador: http://localhost:5173
   (o donde tengas el frontend running)
☐ Presionar: Ctrl+Shift+R (reload completo)
☐ Abrir consola: F12
☐ Verificar que no hay errores rojo en console
☐ Si eres doctor/admin, deberías ver campana 🔔 en Sidebar
```

---

## 🎯 PASO 6: TEST COMPLETO (10 minutos)

### Subir un estudio de prueba

```
☐ Loguarse como ADMIN en: http://localhost:5173
☐ Ir a: Dashboard → (buscar opción de subir)
☐ Completar formulario:
   ├─ Seleccionar doctor: cualquiera
   ├─ DNI paciente: 999999 (test)
   ├─ Nombre paciente: Test Usuario
   ├─ Tipo de estudio: Radiografía - Panorámica
   ├─ Archivo: cualquier imagen pequeña (JPG)
   └─ Fecha: hoy
☐ Hacer clic en "Subir"
☐ Esperar a que suba (progress bar)
☐ Ver mensaje: "✅ Estudio subido exitosamente"
```

### Verificar correo al paciente

```
☐ Abrir bandeja de correo (Gmail/Outlook)
☐ Esperar 30 segundos
☐ Buscar correo con asunto: "📋 Tu estudio está listo"
☐ Verificar contenido:
   ├─ Nombre del paciente (Test Usuario)
   ├─ Tipo de estudio (Radiografía - Panorámica)
   ├─ Fecha de estudio
   ├─ Nombre del doctor
   └─ Botón "Ir al Sistema"
```

### Verificar correo al doctor

```
☐ Verificar bandeja del email del doctor
☐ Buscar correo con asunto: "✅ Nuevo Estudio Cargado"
☐ Verificar contenido:
   ├─ Nombre del doctor
   ├─ Nombre del paciente
   ├─ DNI del paciente
   ├─ Tipo de estudio
   └─ Botón "Ver en el Sistema"
```

### Verificar notificación en-app

```
☐ Loguarse como DOCTOR (si no está logueado)
☐ Ir a Dashboard
☐ Mirar Sidebar izquierda
☐ Ver campana 🔔 con número (ej: 🔔 1)
☐ Hacer clic en campana
☐ Ver dropdown con notificación
☐ Verificar detalles:
   ├─ Nombre del paciente
   ├─ Tipo de estudio
   ├─ Fecha del estudio
   └─ Botón "Marcar" (si no leída)
☐ Hacer clic en "Marcar"
☐ Ver que contador disminuye (🔔 0)
☐ Notificación marca como leída
```

### Verificar logs en BD

```
☐ Abrir phpMyAdmin
☐ Ir a: radiologia_db → email_logs
☐ Deberías ver 2 registros:
   ├─ recipient_email: email_del_paciente | recipient_type: patient
   └─ recipient_email: email_del_doctor | recipient_type: doctor
☐ Verificar: status = 'sent'
```

---

## ✅ PASO 7: VALIDACIÓN FINAL

### Checklist de Completitud

```
BACKEND
☐ migrations.sql ejecutado
☐ composer install ejecutado
☐ vendor/ contiene phpmailer/
☐ mail_config.php configurado
☐ test_email.php funciona
☐ get_notifications.php funciona
☐ mark_notification_read.php funciona

FRONTEND
☐ NotificationBell.jsx existe
☐ Sidebar.jsx actualizado
☐ No hay errores en consola
☐ Campana aparece para doctores

BASE DE DATOS
☐ Tabla notifications creada
☐ Tabla email_logs creada
☐ Columna email en patients
☐ Sin errores en BD
☐ Datos guardados correctamente

CORREOS
☐ Test de correo funciona
☐ Correo llega a bandeja
☐ HTML se renderiza correctamente
☐ Datos correctos en correo

NOTIFICACIONES
☐ Se crean en BD al subir estudio
☐ Se muestra en campana del doctor
☐ Contador de sin leer es correcto
☐ Se pueden marcar como leídas
☐ Auto-refresh funciona (30 segundos)

AUDITORIA
☐ Logs en email_logs
☐ Status = 'sent'
☐ Timestamps correctos
☐ Recipient_type correcto
```

---

## 🆘 SI ALGO FALLA

### Error: "Class 'PHPMailer' not found"

```
☐ Ir a: backend/
☐ Ejecutar: composer install
☐ Asegurarse que vendor/ se creó
☐ Recargar página
```

### Error: Correos no se envían

```
☐ Revisar mail_config.php
☐ Verificar credenciales exactas
☐ Probar contraseña Gmail en navegador
☐ Verificar que 2FA está habilitado
☐ Regenerar contraseña de aplicación
☐ Ver email_logs en BD para errores
```

### Error: Tabla notifications no existe

```
☐ Ejecutar migrations.sql nuevamente
☐ Ir a phpMyAdmin
☐ Ir a BD radiologia_db
☐ Pestaña SQL
☐ Copiar y ejecutar script
```

### Error: Campana no aparece

```
☐ Recargar con Ctrl+Shift+R (clear cache)
☐ Verificar rol de usuario (debe ser doctor)
☐ Abrir consola (F12) ver errores
☐ Verificar que NotificationBell.jsx se importa
```

### Error: Notificaciones no aparecen

```
☐ Verificar doctor_id en localStorage (F12 → Application)
☐ Probar endpoint: get_notifications.php?doctor_id=7
☐ Revisar si hay notificaciones en BD
☐ Ver email_logs para ver si se crearon
```

---

## 📊 RESUMEN VISUAL

```
ESTADO INICIAL:
❌ Sin notificaciones
❌ Sin correos
❌ Sin campana
❌ Sin logs

PASO 1 (BD)
✅ Nuevas tablas creadas

PASO 2 (PHP)
✅ PHPMailer instalado

PASO 3 (Config)
✅ Credenciales configuradas

PASO 4 (Test)
✅ Correos funcionan

PASO 5 (Frontend)
✅ Campana visible

PASO 6 (Prueba)
✅ Todo integrado

RESULTADO FINAL:
✅ Sistema completo funcionando
✅ Pacientes reciben correos
✅ Doctores ven notificaciones
✅ Logs registrados
✅ 100% COMPLETADO
```

---

## 🎉 ¡LISTO!

Una vez verificado TODO ✅:

```
Tu sistema está:
✅ Activado
✅ Configurado
✅ Probado
✅ Listo para producción

Ahora puedes:
🚀 Usar el sistema normalmente
📧 Recibir notificaciones de correo
🔔 Ver notificaciones en-app
📊 Revisar auditoria en email_logs
```

---

## 📞 Referencia Rápida

| Paso      | Comando/Acción          | Tiempo      |
| --------- | ----------------------- | ----------- |
| 1         | Ejecutar migrations.sql | 1 min       |
| 2         | composer install        | 2 min       |
| 3         | Editar mail_config.php  | 1 min       |
| 4         | Probar test_email.php   | 2 min       |
| 5         | Recargar frontend       | 1 min       |
| 6         | Subir estudio prueba    | 5 min       |
| 7         | Verificar correos       | 2 min       |
| **TOTAL** |                         | **~15 min** |

---

¡**Checklist completo para implementación exitosa!** ✅

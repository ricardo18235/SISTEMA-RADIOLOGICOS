# ⚡ GUÍA RÁPIDA - ACTIVACIÓN EN 5 MINUTOS

## ✅ PASO 1: Actualizar Base de Datos (1 minuto)

Abre **phpMyAdmin** → `radiologia_db` → **SQL** y ejecuta:

```sql
-- Agregar email a pacientes
ALTER TABLE patients ADD COLUMN email VARCHAR(100) NULL UNIQUE;

-- Crear tabla notifications
CREATE TABLE IF NOT EXISTS notifications (
  id INT NOT NULL AUTO_INCREMENT,
  doctor_id INT NOT NULL,
  patient_id INT NOT NULL,
  study_id INT NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  read_at TIMESTAMP NULL,
  PRIMARY KEY (id),
  KEY doctor_id (doctor_id),
  FOREIGN KEY (doctor_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
  FOREIGN KEY (study_id) REFERENCES studies(id) ON DELETE CASCADE
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4;

-- Crear tabla email_logs
CREATE TABLE IF NOT EXISTS email_logs (
  id INT NOT NULL AUTO_INCREMENT,
  recipient_email VARCHAR(100) NOT NULL,
  recipient_type ENUM('patient', 'doctor') NOT NULL,
  subject VARCHAR(255) NOT NULL,
  sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  status ENUM('sent', 'failed') DEFAULT 'sent',
  error_message TEXT NULL,
  study_id INT NULL,
  PRIMARY KEY (id),
  FOREIGN KEY (study_id) REFERENCES studies(id) ON DELETE SET NULL
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4;
```

✅ **Presiona ENTER**

---

## ✅ PASO 2: Instalar Dependencias PHP (2 minutos)

Abre **CMD/Terminal** en la carpeta `backend/`:

```bash
composer install
```

Si no tienes composer, descárgalo desde: https://getcomposer.org/download/

---

## ✅ PASO 3: Configurar Correos (1 minuto)

### Opción A: Usar Gmail (RECOMENDADO)

1. Abre `backend/mail_config.php`
2. Busca línea 9-14 y reemplaza:

```php
$MAIL_CONFIG = [
    'host'       => 'smtp.gmail.com',
    'port'       => 587,
    'username'   => 'TU_EMAIL@gmail.com',       // ← CAMBIAR AQUÍ
    'password'   => 'TU_CONTRASEÑA_APLICACION', // ← CAMBIAR AQUÍ
    'from_email' => 'TU_EMAIL@gmail.com',       // ← CAMBIAR AQUÍ
    'from_name'  => 'Sistema Radiológico'
];
```

3. **Generar contraseña de aplicación Gmail:**
   - Entra a https://myaccount.google.com/apppasswords
   - Selecciona: App: Mail, Device: Windows/Mac/Linux
   - Copia la contraseña (sin espacios)
   - Pégala en `'password'`

✅ **Listo!**

### Opción B: Usar Outlook

```php
'host'       => 'smtp.live.com',
'port'       => 587,
'username'   => 'tu_email@outlook.com',
'password'   => 'tu_contraseña',
```

### Opción C: Usar otro servidor

```php
'host'       => 'mail.tuservidor.com',
'port'       => 587,  // O 465 si es SSL
'username'   => 'usuario@tuservidor.com',
'password'   => 'contraseña',
```

---

## ✅ PASO 4: Probar Funcionamiento (1 minuto)

### Test de Correo

Abre el navegador y accede a:

```
http://localhost/backend/test_email.php
```

Envía POST request (con Postman o cURL):

```json
{
  "type": "patient",
  "email": "TU_EMAIL@gmail.com"
}
```

**Esperado:** Deberías recibir un correo

### Test de Notificaciones

```
http://localhost/backend/get_notifications.php?doctor_id=7
```

**Esperado:** Retorna JSON con notificaciones

---

## ✅ ¡LISTO! 🎉

### Ahora sube un estudio y verás:

1. ✅ Correo al paciente (si tiene email)
2. ✅ Correo al doctor (si tiene email)
3. ✅ Notificación en campana del doctor
4. ✅ Logs en tabla `email_logs`

---

## 🔧 SOLUCIÓN RÁPIDA DE PROBLEMAS

| Error                         | Solución                                    |
| ----------------------------- | ------------------------------------------- |
| `Class 'PHPMailer' not found` | Ejecutar `composer install`                 |
| Correos no se envían          | Verificar credenciales en `mail_config.php` |
| Campana no aparece            | Recargar página (F5)                        |
| Correos en spam               | Agregar email a contactos                   |
| SSL Error                     | Cambiar port a 465                          |

---

## 📞 Contacto & Soporte

- 📚 **Guía completa:** `IMPLEMENTACION_NOTIFICACIONES.md`
- 🏗️ **Arquitectura:** `ARQUITECTURA_SISTEMA.md`
- 📖 **README:** `README_NOTIFICACIONES.md`

---

## 🎯 Próximos pasos opcionales

- [ ] Personalizar asunto de correos
- [ ] Cambiar colores HTML de correos
- [ ] Agregar logo de empresa en correos
- [ ] Agregar más campos a notificaciones
- [ ] Implementar notificaciones en tiempo real

---

¡**Activado en 5 minutos!** ⚡

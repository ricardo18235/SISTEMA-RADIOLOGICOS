-- =========================================
-- MIGRACIONES PARA SISTEMA DE NOTIFICACIONES
-- =========================================

-- 1. Agregar columna de email a la tabla patients
-- (Para poder enviar correos a los pacientes)
ALTER TABLE patients ADD COLUMN email VARCHAR(100) NULL UNIQUE;

-- 2. Crear tabla de notificaciones para doctores
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
  KEY patient_id (patient_id),
  KEY study_id (study_id),
  FOREIGN KEY (doctor_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
  FOREIGN KEY (study_id) REFERENCES studies(id) ON DELETE CASCADE
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 3. Crear tabla de auditoría (opcional, para registrar envíos de correos)
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
  KEY study_id (study_id),
  FOREIGN KEY (study_id) REFERENCES studies(id) ON DELETE SET NULL
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

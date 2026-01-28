-- ============================================
-- SISTEMA DE NOTIFICACIONES Y TRACKING
-- Ejecutar estos comandos en phpMyAdmin o tu cliente MySQL
-- ============================================

-- 1. Agregar columnas para tracking de visualización en la tabla studies
-- (Sin usar AFTER ya que la columna file_key puede no existir)
ALTER TABLE studies 
ADD COLUMN viewed_by_doctor TINYINT(1) DEFAULT 0,
ADD COLUMN viewed_at DATETIME NULL;

-- 2. Actualizar la tabla notifications para el nuevo sistema
-- Primero, verificar si la tabla existe
DROP TABLE IF EXISTS notifications;

-- Crear la tabla notifications con la nueva estructura
CREATE TABLE notifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    type VARCHAR(50) NOT NULL,
    message TEXT NOT NULL,
    study_id INT NULL,
    is_read TINYINT(1) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (study_id) REFERENCES studies(id) ON DELETE CASCADE,
    INDEX idx_user_read (user_id, is_read),
    INDEX idx_created (created_at)
);

-- 3. Verificar que todo esté correcto
DESCRIBE studies;
DESCRIBE notifications;

-- ============================================
-- INSTRUCCIONES DE USO:
-- ============================================
-- 1. Copia estos comandos
-- 2. Abre phpMyAdmin
-- 3. Selecciona la base de datos 'radiologia'
-- 4. Ve a la pestaña SQL
-- 5. Pega y ejecuta estos comandos
-- ============================================

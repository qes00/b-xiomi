-- Migración: Agregar columnas para limitar cambios de contraseña (2/día)
-- Ejecutar en el SQL Editor de Supabase

-- 1. Agregar columnas
ALTER TABLE user_profiles
ADD COLUMN IF NOT EXISTS last_password_update TIMESTAMPTZ DEFAULT NULL,
ADD COLUMN IF NOT EXISTS password_update_count INTEGER DEFAULT 0;

-- 2. Comentario explicativo (para documentación)
COMMENT ON COLUMN user_profiles.last_password_update IS 'Último cambio de contraseña (se resetea diariamente)';
COMMENT ON COLUMN user_profiles.password_update_count IS 'Conteo de cambios de contraseña hoy (máximo 2)';

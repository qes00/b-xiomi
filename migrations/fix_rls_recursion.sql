-- =========================================
-- FIX: Eliminar políticas recursivas y crear nuevas simples
-- =========================================

-- 1. ELIMINAR todas las políticas problemáticas de user_profiles
DROP POLICY IF EXISTS "Usuarios pueden ver su propio perfil" ON user_profiles;
DROP POLICY IF EXISTS "Usuarios pueden actualizar su propio perfil" ON user_profiles;
DROP POLICY IF EXISTS "Usuarios pueden crear su propio perfil" ON user_profiles;
DROP POLICY IF EXISTS "Admins pueden ver todos los perfiles" ON user_profiles;

-- 2. CREAR políticas simples SIN recursividad
-- Permitir que los usuarios vean su propio perfil
CREATE POLICY "user_profiles_select_own" ON user_profiles
  FOR SELECT
  USING (auth.uid() = id);

-- Permitir que los usuarios actualicen su propio perfil
CREATE POLICY "user_profiles_update_own" ON user_profiles
  FOR UPDATE
  USING (auth.uid() = id);

-- Permitir que los usuarios creen su propio perfil
CREATE POLICY "user_profiles_insert_own" ON user_profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- 3. VERIFICAR que la columna role existe
-- (Si ya la creaste antes, esto no hará nada)
ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS role VARCHAR(20) DEFAULT 'customer' 
CHECK (role IN ('customer', 'admin'));

-- 4. ASIGNAR rol admin a tu usuario
UPDATE user_profiles 
SET role = 'admin' 
WHERE id = '759b0579-5492-4c3f-b89a-33c46d9cc5e7';

-- 5. VERIFICAR el resultado
SELECT id, first_name, last_name, email, role 
FROM auth.users 
LEFT JOIN user_profiles ON auth.users.id = user_profiles.id
WHERE auth.users.email = 'andrewmanriquepuma69@gmail.com';

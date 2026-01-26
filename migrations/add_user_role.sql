-- =========================================
-- MIGRATION: Agregar columna role a user_profiles
-- =========================================

-- Agregar columna role si no existe
ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS role VARCHAR(20) DEFAULT 'customer' 
CHECK (role IN ('customer', 'admin'));

-- Crear índice para búsquedas por rol
CREATE INDEX IF NOT EXISTS idx_user_profiles_role ON user_profiles(role);

-- Política RLS para que admins puedan ver todos los perfiles
DROP POLICY IF EXISTS "Admins pueden ver todos los perfiles" ON user_profiles;
CREATE POLICY "Admins pueden ver todos los perfiles" ON user_profiles
  FOR SELECT USING (
    auth.uid() = id OR 
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Política RLS para productos: solo admins pueden modificar
DROP POLICY IF EXISTS "Solo admins pueden modificar productos" ON products;
CREATE POLICY "Solo admins pueden modificar productos" ON products
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Política RLS para órdenes: admins pueden ver todas
DROP POLICY IF EXISTS "Admins pueden ver todas las ordenes" ON orders;
CREATE POLICY "Admins pueden ver todas las ordenes" ON orders
  FOR SELECT USING (
    auth.uid() = user_id OR 
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Política RLS para cupones: admins pueden modificar
DROP POLICY IF EXISTS "Admins pueden gestionar cupones" ON coupons;
CREATE POLICY "Admins pueden gestionar cupones" ON coupons
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Política RLS para inventario: admins pueden modificar
DROP POLICY IF EXISTS "Admins pueden gestionar inventario" ON inventory;
CREATE POLICY "Admins pueden gestionar inventario" ON inventory
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- =========================================
-- OPCIONAL: Crear primer usuario admin
-- Reemplaza 'tu-user-id-aqui' con el UUID del usuario
-- =========================================
-- UPDATE user_profiles SET role = 'admin' WHERE id = 'tu-user-id-aqui';

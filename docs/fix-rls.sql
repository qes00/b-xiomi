-- =================================================================
-- SCRIPT DE CORRECCIÓN DE PERMISOS (Fix RLS)
-- Ejecuta este script en el SQL Editor de Supabase para permitir
-- crear productos y pedidos sin estar logueado (Modo Desarrollo).
-- =================================================================

-- 1. Permitir control total de productos a todos (Público/Anon)
DROP POLICY IF EXISTS "Solo admins pueden modificar productos" ON products;
CREATE POLICY "Control total de productos (DEV)" ON products
  FOR ALL USING (true);

-- 2. Permitir crear pedidos sin auth
DROP POLICY IF EXISTS "Usuarios pueden crear pedidos" ON orders;
CREATE POLICY "Cualquiera puede crear pedidos (DEV)" ON orders
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Usuarios pueden ver sus propios pedidos" ON orders;
CREATE POLICY "Ver pedidos publico (DEV)" ON orders
  FOR SELECT USING (true);

-- 3. Permitir crear items de pedido sin auth
DROP POLICY IF EXISTS "Usuarios pueden ver items de sus pedidos" ON order_items;
CREATE POLICY "Control total items (DEV)" ON order_items
  FOR ALL USING (true);

-- 4. Permitir actualizar inventario
CREATE POLICY "Actualizar inventario (DEV)" ON inventory
  FOR ALL USING (true);

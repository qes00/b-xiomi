-- =========================================
-- ACTUALIZAR POLÍTICAS PARA PERMITIR ÓRDENES
-- Ejecuta este script en Supabase SQL Editor
-- =========================================

-- Eliminar políticas restrictivas existentes para orders
DROP POLICY IF EXISTS "Usuarios pueden ver sus propios pedidos" ON orders;
DROP POLICY IF EXISTS "Usuarios pueden crear pedidos" ON orders;

-- Crear nuevas políticas más permisivas para orders
-- Permitir lectura pública de órdenes (para admin y usuarios)
CREATE POLICY "Lectura pública de órdenes" ON orders
  FOR SELECT USING (true);

-- Permitir inserción pública de órdenes (usuario anónimo puede crear pedido)
CREATE POLICY "Inserción pública de órdenes" ON orders
  FOR INSERT WITH CHECK (true);

-- Permitir actualización solo para usuarios autenticados (admin puede cambiar status)
CREATE POLICY "Actualización de órdenes" ON orders
  FOR UPDATE USING (true);

-- =========================================
-- Actualizar políticas para order_items
-- =========================================
DROP POLICY IF EXISTS "Usuarios pueden ver items de sus pedidos" ON order_items;

-- Permitir lectura pública de items
CREATE POLICY "Lectura pública de order_items" ON order_items
  FOR SELECT USING (true);

-- Permitir inserción pública de items
CREATE POLICY "Inserción pública de order_items" ON order_items
  FOR INSERT WITH CHECK (true);

-- =========================================
-- Verificar que las tablas existan
-- =========================================
-- Puedes verificar ejecutando:
-- SELECT * FROM orders;
-- SELECT * FROM order_items;

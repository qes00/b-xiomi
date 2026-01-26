# Guía de Pruebas - Crear Usuario y Testear Compras

## Paso 1: Actualizar Políticas de RLS en Supabase

1. Ve a [supabase.com](https://supabase.com) y entra a tu proyecto
2. Ve a **SQL Editor**
3. Copia y ejecuta el contenido de `docs/update-rls-policies.sql`:

```sql
-- Eliminar políticas restrictivas existentes para orders
DROP POLICY IF EXISTS "Usuarios pueden ver sus propios pedidos" ON orders;
DROP POLICY IF EXISTS "Usuarios pueden crear pedidos" ON orders;

-- Crear nuevas políticas más permisivas
CREATE POLICY "Lectura pública de órdenes" ON orders
  FOR SELECT USING (true);

CREATE POLICY "Inserción pública de órdenes" ON orders
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Actualización de órdenes" ON orders
  FOR UPDATE USING (true);

-- Actualizar políticas para order_items
DROP POLICY IF EXISTS "Usuarios pueden ver items de sus pedidos" ON order_items;

CREATE POLICY "Lectura pública de order_items" ON order_items
  FOR SELECT USING (true);

CREATE POLICY "Inserción pública de order_items" ON order_items
  FOR INSERT WITH CHECK (true);
```

4. Haz clic en **Run** para ejecutar

---

## Paso 2: Crear Usuario de Prueba en Supabase

### Opción A: Desde el Panel de Supabase (Recomendado)

1. Ve a **Authentication** → **Users**
2. Clic en **Add user** → **Create new user**
3. Completa los datos:
   - **Email**: `test@example.com`
   - **Password**: `Test123456!`
   - **Auto Confirm User**: ✅ Activar (para desarrollo)
4. Clic en **Create user**

### Opción B: Desde la App

1. Abre la aplicación en `http://localhost:5173`
2. Haz clic en **Iniciar Sesión**
3. Ve a la pestaña **Registrarse**
4. Completa el formulario:
   - Email: `test@example.com`
   - Contraseña: `Test123456!`
5. Haz clic en **Crear Cuenta**

---

## Paso 3: Verificar Correo (si está habilitado)

Si la confirmación de email está habilitada en Supabase:

1. Ve a **Authentication** → **Settings**
2. En **Email Auth**:
   - Desactiva **Enable email confirmations** (solo para desarrollo)
   - O revisa el email de confirmación

---

## Paso 4: Testear una Compra

1. **Inicia sesión** con el usuario de prueba
2. Ve a **Tienda** (`/shop`)
3. **Agrega productos** al carrito
4. Ve al **Carrito** y haz clic en **Finalizar Compra**
5. Completa los **datos de envío**
6. Haz clic en **Continuar al Pago**
7. Selecciona un método de pago y haz clic en **Pagar**
8. Espera la confirmación ✅

> 💡 **Testing de Pagos**: El sistema usa un **Payment Gateway Mock** que simula pagos reales. Por defecto, todos los pagos se procesan exitosamente. Para probar escenarios de error, consulta [PAYMENT_TESTING.md](./PAYMENT_TESTING.md).

---

## Paso 5: Verificar en Supabase

1. Ve a **Table Editor** → **orders**
2. Deberías ver la orden creada con:
   - `id`: UUID generado
   - `status`: `pending`
   - `total`: El monto de la compra
   - `shipping_address`: JSON con los datos de envío

3. Ve a **Table Editor** → **order_items**
4. Deberías ver los items de la orden

---

## Paso 6: Ver Pedido en la App

1. Con la sesión iniciada, ve a **Mi Cuenta**
2. Haz clic en **Mis Pedidos**
3. Deberías ver el pedido recién creado

---

## Solución de Problemas

### Error: "new row violates row-level security policy"

- Ejecuta el script SQL del Paso 1 para actualizar las políticas

### Error: "Failed to fetch" o "Error de red"

- Verifica que las credenciales en `.env` sean correctas
- La URL debe ser `https://xxxxx.supabase.co`
- La key debe comenzar con `eyJ...`

### Los pedidos no aparecen

- Verifica en Supabase → Table Editor → orders
- Revisa la consola del navegador para errores

### El checkout no guarda la orden

- Verifica que la función `createOrder` se esté llamando
- Revisa la consola del navegador para errores
- Asegúrate de que las políticas RLS estén actualizadas

---

## Credenciales de Prueba

| Campo    | Valor              |
| -------- | ------------------ |
| Email    | `test@example.com` |
| Password | `Test123456!`      |

---

## Para Desarrollo: Deshabilitar RLS (No recomendado para producción)

Si sigues teniendo problemas, puedes deshabilitar temporalmente RLS:

```sql
ALTER TABLE orders DISABLE ROW LEVEL SECURITY;
ALTER TABLE order_items DISABLE ROW LEVEL SECURITY;
```

> ⚠️ **IMPORTANTE**: Vuelve a habilitar RLS antes de ir a producción.

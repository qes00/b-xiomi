# Guía de Migración - Base de Datos

## ⚠️ IMPORTANTE: Ejecuta estas migraciones ANTES de usar las nuevas funciones

Tienes que ejecutar **2 migraciones SQL** en Supabase para que funcionen las nuevas características.

---

## Paso 1: Acceder a Supabase

1. Ve a tu proyecto en [Supabase Dashboard](https://supabase.com/dashboard)
2. En el menú lateral, selecciona **"SQL Editor"**
3. Click en **"New query"**

---

## Paso 2: Migración 1 - Productos Destacados

**Archivo:** `migrations/add_featured_products.sql`

Copia y pega este SQL:

```sql
-- Migration: Add is_featured column to products table
-- Description: Allows marking products as featured for display on landing page

-- Add the is_featured column
ALTER TABLE products
ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT false;

-- Create an index for better query performance
CREATE INDEX IF NOT EXISTS idx_products_featured
ON products(is_featured)
WHERE is_featured = true;

-- Optional: Mark first few products as featured for testing
-- UPDATE products
-- SET is_featured = true
-- WHERE id IN (
--   SELECT id FROM products
--   ORDER BY created_at DESC
--   LIMIT 4
-- );

COMMENT ON COLUMN products.is_featured IS 'Whether this product should be featured on the landing page';
```

**Ejecuta** con Ctrl+Enter o click en "Run"

✅ Espera el mensaje: "Success. No rows returned"

---

## Paso 3: Migración 2 - Múltiples Imágenes

**Archivo:** `migrations/add_multi_images.sql`

Copia y pega este SQL:

```sql
-- Migration: Add multi-image support to products
-- Description: Adds images JSONB column to store multiple product images with metadata

-- Add the images column
ALTER TABLE products
ADD COLUMN IF NOT EXISTS images JSONB DEFAULT '[]'::jsonb;

-- Migrate existing image_url to images array
UPDATE products
SET images = jsonb_build_array(
  jsonb_build_object(
    'url', image_url,
    'isPrimary', true,
    'order', 0
  )
)
WHERE image_url IS NOT NULL
  AND image_url != ''
  AND (images IS NULL OR images = '[]'::jsonb);

-- Create GIN index for efficient JSONB queries
CREATE INDEX IF NOT EXISTS idx_products_images
ON products USING GIN (images);

-- Add comment for documentation
COMMENT ON COLUMN products.images IS 'Array of product images with metadata (url, color, isPrimary, order)';
COMMENT ON COLUMN products.image_url IS 'DEPRECATED: Use images column instead. Kept for backward compatibility.';
```

**Ejecuta** con Ctrl+Enter o click en "Run"

✅ Espera el mensaje indicando que se actualizaron las filas

---

## Paso 4: Verificar

Ejecuta esta consulta para verificar:

```sql
SELECT
  column_name,
  data_type
FROM information_schema.columns
WHERE table_name = 'products'
  AND column_name IN ('is_featured', 'images')
ORDER BY column_name;
```

**Deberías ver:**

```
column_name  | data_type
-------------|----------
images       | jsonb
is_featured  | boolean
```

---

## Paso 5: Probar

1. Recarga tu aplicación (Ctrl+R)
2. Ve a Admin → Inventario
3. Edita un producto
4. Marca como destacado y/o agrega imágenes
5. Guarda → Debería funcionar sin errores ✅

---

## Solución de Problemas

### Error: "column already exists"

✅ Esto está bien. La migración usa `IF NOT EXISTS` por seguridad.

### Error: "permission denied"

❌ Necesitas permisos de admin en Supabase. Contacta al dueño del proyecto.

### Error: "relation products does not exist"

❌ Tu tabla de productos tiene otro nombre o no existe. Verifica el schema.

---

## Resumen

Después de ejecutar ambas migraciones:

- ✅ Campo `is_featured` → Para marcar productos destacados
- ✅ Campo `images` → Para múltiples imágenes con metadata
- ✅ Datos existentes migrados automáticamente
- ✅ Índices creados para mejor rendimiento

**¡Ya puedes usar todas las nuevas funciones!** 🎉

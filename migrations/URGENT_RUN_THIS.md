# 🚨 EJECUTA ESTAS MIGRACIONES AHORA

## Problema Actual

La app está mostrando el error:

```
Could not find the 'images' column of 'products' in the schema cache
```

Esto significa que las columnas `images` e `is_featured` **NO EXISTEN** en tu base de datos Supabase.

---

## ⚡ Solución Rápida (5 minutos)

### 1️⃣ Abre Supabase Dashboard

- Ve a: https://supabase.com/dashboard
- Selecciona tu proyecto: **allahuv3**
- Click en **SQL Editor** (ícono de terminal en menú izquierdo)

### 2️⃣ Ejecuta Primera Migración

Click en **"New query"** y pega esto:

```sql
ALTER TABLE products ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT false;
CREATE INDEX IF NOT EXISTS idx_products_featured ON products(is_featured) WHERE is_featured = true;
```

**Click "Run"** (o Ctrl+Enter)

✅ Debe decir: "Success. No rows returned"

---

### 3️⃣ Ejecuta Segunda Migración

**Nueva query** y pega esto:

```sql
ALTER TABLE products ADD COLUMN IF NOT EXISTS images JSONB DEFAULT '[]'::jsonb;

UPDATE products
SET images = jsonb_build_array(
  jsonb_build_object('url', image_url, 'isPrimary', true, 'order', 0)
)
WHERE image_url IS NOT NULL AND image_url != '' AND images = '[]'::jsonb;

CREATE INDEX IF NOT EXISTS idx_products_images ON products USING GIN (images);
```

**Click "Run"**

✅ Debe decir: "Success. X rows affected" (donde X = número de productos)

---

### 4️⃣ Verifica que Funcionó

Nueva query:

```sql
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'products'
AND column_name IN ('is_featured', 'images');
```

**Deberías ver:**

```
images      | jsonb
is_featured | boolean
```

---

### 5️⃣ Recarga la App

- Ctrl+R en tu navegador
- Prueba editar un producto en Inventario
- Ahora debería guardar correctamente ✅

---

## 📝 Nota Temporal

Por ahora he deshabilitado el guardado de `images` e `is_featured` para que no falle.  
**Después de ejecutar las migraciones**, tendré que revertir ese cambio temporal.

---

## ❓ Si Tienes Problemas

**"No tengo acceso a Supabase"**
→ Necesitas permisos de admin. Contacta al dueño del proyecto.

**"La tabla products no existe"**
→ Verifica que estás en el proyecto correcto de Supabase.

**Otro error**
→ Copia el mensaje de error exacto y dímelo.

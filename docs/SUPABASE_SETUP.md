# Guía de Configuración de Supabase

Esta guía explica cómo configurar Supabase para el proyecto ALLAHU-STORE.

## 1. Crear Proyecto en Supabase

1. Ve a [supabase.com](https://supabase.com) y crea una cuenta
2. Crea un nuevo proyecto:
   - **Nombre**: `allahu-store` (o el que prefieras)
   - **Región**: Selecciona la más cercana (ej: `South America - São Paulo`)
   - **Contraseña**: Genera una contraseña segura (guárdala)
3. Espera a que el proyecto se cree (~2 minutos)

## 2. Obtener Credenciales

1. Ve a **Project Settings** → **API**
2. Copia estos valores:
   - `Project URL` → `VITE_SUPABASE_URL`
   - `anon public` key → `VITE_SUPABASE_ANON_KEY`

## 3. Crear Archivo .env

Crea un archivo `.env` en la raíz del proyecto:

```env
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGci...
```

> ⚠️ **IMPORTANTE**: Nunca subas `.env` a git. Ya está en `.gitignore`.

## 4. Ejecutar Schema SQL

1. En Supabase, ve a **SQL Editor**
2. Copia el contenido de `docs/supabase-schema.sql`
3. Pega y ejecuta (botón **Run**)
4. Verifica que no haya errores

## 5. Configurar Autenticación

1. Ve a **Authentication** → **Providers**
2. Habilita **Email** (ya viene habilitado)
3. Opcional: Personaliza emails en **Email Templates**

### Deshabilitar confirmación de email (desarrollo):
1. Ve a **Authentication** → **Settings**
2. Desactiva "Enable email confirmations"

## 6. Verificar Tablas

Ve a **Table Editor** y confirma que existen:
- `products` (8 productos de ejemplo)
- `user_profiles`
- `user_addresses`
- `orders`
- `order_items`
- `coupons`
- `inventory`

## 7. Probar Conexión

```bash
npm run dev
```

Abre la consola del navegador. Si ves:
- ✅ Sin errores → Conexión exitosa
- ⚠️ "Supabase no configurado" → Revisa `.env`

---

## Troubleshooting

### Error "Invalid API key"
- Verifica que copiaste la key `anon public`, no la `service_role`
- Revisa que no haya espacios extra en `.env`

### Error "relation does not exist"
- Ejecuta nuevamente el schema SQL
- Verifica que estás en el proyecto correcto

### Error de CORS
- Asegúrate de usar `VITE_SUPABASE_URL` (con `https://`)
- Verifica en Supabase → Settings → API → Site URL

---

## Estructura de Datos

### Products
| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | UUID | ID único |
| name | VARCHAR | Nombre del producto |
| description | TEXT | Descripción |
| price | DECIMAL | Precio en PEN |
| image_url | TEXT | URL de imagen |
| category | VARCHAR | Categoría |
| brand | VARCHAR | Marca (opcional) |
| sizes | TEXT[] | Array de tallas |
| colors | TEXT[] | Array de colores |

### Orders
| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | UUID | ID único |
| user_id | UUID | ID del usuario |
| total | DECIMAL | Total del pedido |
| status | VARCHAR | pending/confirmed/shipped/delivered |
| shipping_address | JSONB | Dirección de envío |

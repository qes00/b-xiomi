-- =========================================
-- ALLAHU-STORE - Schema de Base de Datos
-- Supabase PostgreSQL Schema
-- =========================================

-- Habilitar extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =========================================
-- TABLA: products
-- =========================================
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL CHECK (price >= 0),
  image_url TEXT,
  category VARCHAR(100),
  brand VARCHAR(100),
  sizes TEXT[],
  colors TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para productos
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_created_at ON products(created_at DESC);

-- =========================================
-- TABLA: user_profiles
-- =========================================
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  phone VARCHAR(20),
  document_type VARCHAR(10) CHECK (document_type IN ('DNI', 'RUC', 'CE')),
  document_number VARCHAR(20),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =========================================
-- TABLA: user_addresses
-- =========================================
CREATE TABLE IF NOT EXISTS user_addresses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  street TEXT,
  district VARCHAR(100),
  province VARCHAR(100),
  department VARCHAR(100),
  reference TEXT,
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_addresses_user_id ON user_addresses(user_id);

-- =========================================
-- TABLA: orders
-- =========================================
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES user_profiles(id),
  subtotal DECIMAL(10,2) DEFAULT 0,
  shipping DECIMAL(10,2) DEFAULT 0,
  total DECIMAL(10,2) DEFAULT 0,
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled')),
  shipping_address JSONB,
  payment_method VARCHAR(50),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);

-- =========================================
-- TABLA: order_items
-- =========================================
CREATE TABLE IF NOT EXISTS order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id),
  product_name VARCHAR(255),
  product_image TEXT,
  price DECIMAL(10,2),
  quantity INTEGER DEFAULT 1 CHECK (quantity > 0)
);

CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);

-- =========================================
-- TABLA: coupons
-- =========================================
CREATE TABLE IF NOT EXISTS coupons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(50) UNIQUE NOT NULL,
  discount_type VARCHAR(20) CHECK (discount_type IN ('percentage', 'fixed')),
  discount_value DECIMAL(10,2) DEFAULT 0,
  min_purchase DECIMAL(10,2),
  max_discount DECIMAL(10,2),
  expires_at TIMESTAMPTZ,
  usage_limit INTEGER,
  used_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_coupons_code ON coupons(code);

-- =========================================
-- TABLA: inventory
-- =========================================
CREATE TABLE IF NOT EXISTS inventory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  stock INTEGER DEFAULT 0 CHECK (stock >= 0),
  reserved INTEGER DEFAULT 0 CHECK (reserved >= 0),
  low_stock_threshold INTEGER DEFAULT 5,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(product_id)
);

CREATE INDEX IF NOT EXISTS idx_inventory_product_id ON inventory(product_id);

-- =========================================
-- TRIGGER: Actualizar updated_at
-- =========================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar trigger a tablas
DROP TRIGGER IF EXISTS update_products_updated_at ON products;
CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_orders_updated_at ON orders;
CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_inventory_updated_at ON inventory;
CREATE TRIGGER update_inventory_updated_at
  BEFORE UPDATE ON inventory
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =========================================
-- ROW LEVEL SECURITY (RLS)
-- =========================================

-- Habilitar RLS
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory ENABLE ROW LEVEL SECURITY;

-- Políticas para productos (lectura pública)
CREATE POLICY "Productos visibles para todos" ON products
  FOR SELECT USING (true);

CREATE POLICY "Solo admins pueden modificar productos" ON products
  FOR ALL USING (auth.role() = 'authenticated');

-- Políticas para perfiles de usuario
CREATE POLICY "Usuarios pueden ver su propio perfil" ON user_profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Usuarios pueden actualizar su propio perfil" ON user_profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Usuarios pueden crear su propio perfil" ON user_profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Políticas para direcciones
CREATE POLICY "Usuarios pueden gestionar sus direcciones" ON user_addresses
  FOR ALL USING (auth.uid() = user_id);

-- Políticas para pedidos
CREATE POLICY "Usuarios pueden ver sus propios pedidos" ON orders
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Usuarios pueden crear pedidos" ON orders
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Políticas para items de pedido
CREATE POLICY "Usuarios pueden ver items de sus pedidos" ON order_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM orders 
      WHERE orders.id = order_items.order_id 
      AND orders.user_id = auth.uid()
    )
  );

-- Políticas para cupones (solo lectura para validar)
CREATE POLICY "Cupones activos visibles para todos" ON coupons
  FOR SELECT USING (is_active = true);

-- Políticas para inventario (lectura pública)
CREATE POLICY "Inventario visible para todos" ON inventory
  FOR SELECT USING (true);

-- =========================================
-- DATOS INICIALES (SEED)
-- =========================================
INSERT INTO products (name, description, price, image_url, category, brand, sizes, colors) VALUES
  ('Polo Algodón Pima Premium', 'Polo básico de alta calidad hecho con el mejor algodón peruano. Fresco y duradero.', 89.90, 'https://picsum.photos/400/400?random=1', 'Ropa', 'Pima Cotton Co.', ARRAY['S', 'M', 'L', 'XL'], ARRAY['Blanco', 'Negro', 'Azul Marino']),
  ('Zapatillas Urbanas Lima', 'Diseño moderno para caminar por la ciudad. Suela ergonómica.', 249.50, 'https://picsum.photos/400/400?random=2', 'Calzado', 'Urban Step', ARRAY['38', '39', '40', '41', '42', '43'], ARRAY['Negro', 'Gris', 'Marrón']),
  ('Mochila Andina', 'Mochila resistente con diseños inspirados en telares tradicionales.', 120.00, 'https://picsum.photos/400/400?random=3', 'Accesorios', NULL, NULL, NULL),
  ('Cartera de Cuero Genuino', 'Cartera artesanal de cuero peruano. Elegante y durable con múltiples compartimentos.', 159.90, 'https://picsum.photos/400/400?random=4', 'Accesorios', NULL, NULL, NULL),
  ('Chompa Alpaca Premium', 'Suéter tejido a mano con lana de alpaca 100% natural. Abrigador y suave.', 299.00, 'https://picsum.photos/400/400?random=5', 'Ropa', 'Alpaca Perú', ARRAY['S', 'M', 'L'], ARRAY['Beige', 'Gris', 'Marrón']),
  ('Sombrero de Paja Toquilla', 'Sombrero tradicional tejido a mano. Perfecto para el sol.', 79.90, 'https://picsum.photos/400/400?random=6', 'Accesorios', NULL, NULL, NULL),
  ('Pantalón Denim Nacional', 'Jean de corte moderno con tela resistente. Diseño casual urbano.', 189.50, 'https://picsum.photos/400/400?random=7', 'Ropa', 'Denim Nacional', ARRAY['28', '30', '32', '34', '36'], ARRAY['Azul', 'Negro']),
  ('Billetera Minimalista', 'Billetera compacta de cuero genuino con diseño slim.', 69.90, 'https://picsum.photos/400/400?random=8', 'Accesorios', NULL, NULL, NULL)
ON CONFLICT DO NOTHING;

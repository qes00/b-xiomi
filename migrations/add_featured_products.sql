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

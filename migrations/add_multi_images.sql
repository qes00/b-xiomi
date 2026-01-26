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

-- Example of images structure:
-- [
--   {"url": "product1.jpg", "color": "Rojo", "isPrimary": true, "order": 0},
--   {"url": "product1-detail.jpg", "color": "Rojo", "order": 1},
--   {"url": "product1-blue.jpg", "color": "Azul", "isPrimary": true, "order": 2}
-- ]

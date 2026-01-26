/**
 * Image Helper Utilities
 * @description Helper functions for working with product images
 */

import { Product, ProductImage } from '../types';

/**
 * Get the primary image URL for a product
 */
export const getPrimaryImage = (product: Product): string => {
  // Try to get from images array first
  if (product.images && product.images.length > 0) {
    const primary = product.images.find(img => img.isPrimary);
    return primary?.url || product.images[0].url;
  }
  
  // Fallback to legacy imageUrl
  return product.imageUrl || '';
};

/**
 * Get all images for a specific color variant
 */
export const getImagesByColor = (
  product: Product, 
  color: string
): ProductImage[] => {
  if (!product.images) return [];
  return product.images
    .filter(img => img.color === color)
    .sort((a, b) => (a.order || 0) - (b.order || 0));
};

/**
 * Get the primary image for a specific color
 */
export const getPrimaryImageForColor = (
  product: Product,
  color: string
): string | null => {
  if (!product.images) return null;
  
  const colorImages = product.images.filter(img => img.color === color);
  const primary = colorImages.find(img => img.isPrimary);
  
  return primary?.url || colorImages[0]?.url || null;
};

/**
 * Get all image URLs as a simple array
 */
export const getAllImages = (product: Product): string[] => {
  if (product.images && product.images.length > 0) {
    return product.images
      .sort((a, b) => (a.order || 0) - (b.order || 0))
      .map(img => img.url);
  }
  return product.imageUrl ? [product.imageUrl] : [];
};

/**
 * Get all unique colors that have images
 */
export const getColorsWithImages = (product: Product): string[] => {
  if (!product.images) return [];
  
  const colors = product.images
    .map(img => img.color)
    .filter((color): color is string => color !== undefined);
  
  return Array.from(new Set(colors));
};

/**
 * Check if a product has multiple images
 */
export const hasMultipleImages = (product: Product): boolean => {
  return (product.images?.length || 0) > 1;
};

/**
 * Get image count for a product
 */
export const getImageCount = (product: Product): number => {
  return product.images?.length || (product.imageUrl ? 1 : 0);
};

/**
 * Get display images filtered by color
 * Returns images for the selected color + images with no color
 * Falls back to all images if no specific images found
 */
export const getDisplayImages = (product: Product, selectedColor?: string): string[] => {
  if (!product.images || product.images.length === 0) {
    return product.imageUrl ? [product.imageUrl] : [];
  }

  // If no color selected, show all images sorted
  if (!selectedColor) {
    return getAllImages(product);
  }

  // Filter images: matching color OR no color assigned
  const relevantImages = product.images.filter(img => 
    img.color === selectedColor || !img.color
  );

  // If we found relevant images, return them sorted
  if (relevantImages.length > 0) {
    return relevantImages
      .sort((a, b) => {
        // Primary images first
        if (a.isPrimary && !b.isPrimary) return -1;
        if (!a.isPrimary && b.isPrimary) return 1;
        // Then by order
        return (a.order || 0) - (b.order || 0);
      })
      .map(img => img.url);
  }

  // Fallback: If no images match the color (shouldn't happen if logic is correct), show all
  return getAllImages(product);
};

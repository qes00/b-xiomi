/**
 * Product Service - CRUD de Productos
 * @description Servicio para gestionar productos en Supabase
 */

import { supabase, isSupabaseConfigured, handleSupabaseError } from './supabase';
import type { Tables, InsertTables, UpdateTables } from './database.types';
import { Product, ProductImage } from '../types';

// Tipo de producto de la base de datos
type DBProduct = Tables<'products'>;
type DBProductInsert = InsertTables<'products'>;
type DBProductUpdate = UpdateTables<'products'>;

// Convertir de formato DB a formato de la app
const mapDBToProduct = (dbProduct: DBProduct): Product => {
    // Parse images JSON if it exists
    let images: ProductImage[] | undefined;
    if (dbProduct.images) {
        try {
            const parsed = typeof dbProduct.images === 'string' 
                ? JSON.parse(dbProduct.images) 
                : dbProduct.images;
            images = Array.isArray(parsed) ? parsed : undefined;
        } catch (e) {
            console.warn('Failed to parse product images:', e);
            images = undefined;
        }
    }

    return {
        id: dbProduct.id,
        name: dbProduct.name,
        description: dbProduct.description || '',
        price: dbProduct.price,
        imageUrl: dbProduct.image_url || '',
        images,
        category: dbProduct.category || 'General',
        brand: dbProduct.brand || undefined,
        sizes: dbProduct.sizes || undefined,
        colors: dbProduct.colors || undefined,
        isFeatured: dbProduct.is_featured || false,
    };
};

// Convertir de formato app a formato DB
const mapProductToDB = (product: Partial<Product>): DBProductInsert | DBProductUpdate => {
    const dbProduct: any = {
        name: product.name,
        description: product.description,
        price: product.price,
        image_url: product.imageUrl,
        category: product.category,
        brand: product.brand,
        sizes: product.sizes,
        colors: product.colors,
    };

    // Only include new fields if they're defined (for backward compatibility)
    if (product.images !== undefined) {
        dbProduct.images = product.images ? JSON.stringify(product.images) : undefined;
    }
    if (product.isFeatured !== undefined) {
        dbProduct.is_featured = product.isFeatured;
    }

    return dbProduct;
};

/**
 * Obtener todos los productos
 */
export const getProducts = async (): Promise<Product[]> => {
    if (!isSupabaseConfigured() || !supabase) {
        console.warn('⚠️ Supabase no configurado - no hay productos disponibles');
        return [];
    }

    const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error obteniendo productos:', handleSupabaseError(error));
        return [];
    }

    return (data || []).map(mapDBToProduct);
};

/**
 * Obtener productos destacados para la landing page
 */
export const getFeaturedProducts = async (): Promise<Product[]> => {
    if (!isSupabaseConfigured() || !supabase) {
        console.warn('⚠️ Supabase no configurado - no hay productos destacados disponibles');
        return [];
    }

    const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('is_featured', true)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error obteniendo productos destacados:', handleSupabaseError(error));
        return [];
    }

    return (data || []).map(mapDBToProduct);
};

/**
 * Obtener producto por ID
 */
export const getProductById = async (id: string): Promise<Product | null> => {
    if (!isSupabaseConfigured() || !supabase) {
        console.warn('⚠️ Supabase no configurado');
        return null;
    }

    const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single();

    if (error) {
        console.error('Error obteniendo producto:', handleSupabaseError(error));
        return null;
    }

    return data ? mapDBToProduct(data) : null;
};

/**
 * Obtener productos por categoría
 */
export const getProductsByCategory = async (category: string): Promise<Product[]> => {
    if (!isSupabaseConfigured() || !supabase) {
        console.warn('⚠️ Supabase no configurado');
        return [];
    }

    const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('category', category)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error obteniendo productos por categoría:', handleSupabaseError(error));
        return [];
    }

    return (data || []).map(mapDBToProduct);
};

/**
 * Crear nuevo producto
 */
export const createProduct = async (product: Omit<Product, 'id'>): Promise<Product | null> => {
    if (!isSupabaseConfigured() || !supabase) {
        console.warn('⚠️ Supabase no configurado - no se puede crear producto');
        return null;
    }

    const dbProduct = mapProductToDB(product) as DBProductInsert;

    const { data, error } = await supabase
        .from('products')
        .insert(dbProduct)
        .select()
        .single();

    if (error) {
        console.error('Error creando producto:', handleSupabaseError(error));
        throw new Error(handleSupabaseError(error));
    }

    return data ? mapDBToProduct(data) : null;
};

/**
 * Actualizar producto existente
 */
export const updateProduct = async (id: string, product: Partial<Product>): Promise<Product | null> => {
    if (!isSupabaseConfigured() || !supabase) {
        console.warn('⚠️ Supabase no configurado - no se puede actualizar producto');
        return null;
    }

    const dbProduct = mapProductToDB(product) as DBProductUpdate;
    dbProduct.updated_at = new Date().toISOString();

    const { data, error } = await supabase
        .from('products')
        .update(dbProduct)
        .eq('id', id)
        .select()
        .single();

    if (error) {
        console.error('Error actualizando producto:', handleSupabaseError(error));
        throw new Error(handleSupabaseError(error));
    }

    return data ? mapDBToProduct(data) : null;
};

/**
 * Eliminar producto
 */
export const deleteProduct = async (id: string): Promise<boolean> => {
    if (!isSupabaseConfigured() || !supabase) {
        console.warn('⚠️ Supabase no configurado - no se puede eliminar producto');
        return false;
    }

    const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);

    if (error) {
        console.error('Error eliminando producto:', handleSupabaseError(error));
        throw new Error(handleSupabaseError(error));
    }

    return true;
};

/**
 * Buscar productos por término
 */
export const searchProducts = async (searchTerm: string): Promise<Product[]> => {
    if (!isSupabaseConfigured() || !supabase) {
        console.warn('⚠️ Supabase no configurado');
        return [];
    }

    const { data, error } = await supabase
        .from('products')
        .select('*')
        .or(`name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error buscando productos:', handleSupabaseError(error));
        return [];
    }

    return (data || []).map(mapDBToProduct);
};

/**
 * Obtener categorías únicas
 */
export const getCategories = async (): Promise<string[]> => {
    if (!isSupabaseConfigured() || !supabase) {
        console.warn('⚠️ Supabase no configurado');
        return [];
    }

    const { data, error } = await supabase
        .from('products')
        .select('category')
        .not('category', 'is', null);

    if (error) {
        console.error('Error obteniendo categorías:', handleSupabaseError(error));
        return [];
    }

    const categories = [...new Set(data?.map(p => p.category).filter(Boolean))];
    return categories as string[];
};

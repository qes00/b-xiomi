/**
 * Inventory Service - Control de Inventario
 * @description Servicio para gestionar stock de productos
 */

import { supabase, isSupabaseConfigured, handleSupabaseError } from './supabase';
import type { Tables, InsertTables, UpdateTables } from './database.types';
import { InventoryItem } from '../types';

// Tipo de la base de datos
type DBInventory = Tables<'inventory'>;

// Convertir de formato DB a formato de la app
const mapDBToInventory = (dbInventory: DBInventory): InventoryItem => ({
    productId: dbInventory.product_id,
    stock: dbInventory.stock,
    reserved: dbInventory.reserved,
    lowStockThreshold: dbInventory.low_stock_threshold,
    lastUpdated: new Date(dbInventory.updated_at),
});

/**
 * Obtener inventario de un producto
 */
export const getInventory = async (productId: string): Promise<InventoryItem | null> => {
    if (!isSupabaseConfigured() || !supabase) {
        // Retornar stock simulado
        return {
            productId,
            stock: 100,
            reserved: 0,
            lowStockThreshold: 5,
            lastUpdated: new Date(),
        };
    }

    const { data, error } = await supabase
        .from('inventory')
        .select('*')
        .eq('product_id', productId)
        .single();

    if (error || !data) {
        return null;
    }

    return mapDBToInventory(data);
};

/**
 * Obtener inventario de todos los productos
 */
export const getAllInventory = async (): Promise<InventoryItem[]> => {
    if (!isSupabaseConfigured() || !supabase) {
        return [];
    }

    const { data, error } = await supabase
        .from('inventory')
        .select('*')
        .order('updated_at', { ascending: false });

    if (error) {
        console.error('Error obteniendo inventario:', handleSupabaseError(error));
        return [];
    }

    return (data || []).map(mapDBToInventory);
};

/**
 * Actualizar stock de un producto
 */
export const updateInventory = async (productId: string, stock: number): Promise<InventoryItem | null> => {
    console.log('📦 updateInventory called:', { productId, stock });
    
    if (!isSupabaseConfigured() || !supabase) {
        console.warn('⚠️ Supabase not configured, skipping inventory update');
        return null;
    }

    // Verificar si existe el registro
    const { data: existing, error: checkError } = await supabase
        .from('inventory')
        .select('id')
        .eq('product_id', productId)
        .single();

    console.log('📦 Existing inventory check:', { existing, checkError });

    if (existing) {
        // Actualizar
        console.log('📦 Updating existing inventory...');
        const { data, error } = await supabase
            .from('inventory')
            .update({
                stock,
                updated_at: new Date().toISOString(),
            })
            .eq('product_id', productId)
            .select()
            .single();

        if (error) {
            console.error('❌ Error actualizando inventario:', handleSupabaseError(error));
            return null;
        }

        console.log('✅ Inventory updated successfully:', data);
        return data ? mapDBToInventory(data) : null;
    } else {
        // Crear nuevo
        console.log('📦 Creating new inventory record...');
        const { data, error } = await supabase
            .from('inventory')
            .insert({
                product_id: productId,
                stock,
            })
            .select()
            .single();

        if (error) {
            console.error('❌ Error creando inventario:', handleSupabaseError(error));
            return null;
        }

        console.log('✅ Inventory created successfully:', data);
        return data ? mapDBToInventory(data) : null;
    }
};

/**
 * Reservar stock para una venta
 */
export const reserveStock = async (productId: string, quantity: number): Promise<boolean> => {
    if (!isSupabaseConfigured() || !supabase) {
        return true; // Simular éxito
    }

    const inventory = await getInventory(productId);

    if (!inventory) {
        return false;
    }

    const availableStock = inventory.stock - inventory.reserved;

    if (availableStock < quantity) {
        return false;
    }

    const { error } = await supabase
        .from('inventory')
        .update({
            reserved: inventory.reserved + quantity,
            updated_at: new Date().toISOString(),
        })
        .eq('product_id', productId);

    if (error) {
        console.error('Error reservando stock:', handleSupabaseError(error));
        return false;
    }

    return true;
};

/**
 * Liberar stock reservado
 */
export const releaseStock = async (productId: string, quantity: number): Promise<boolean> => {
    if (!isSupabaseConfigured() || !supabase) {
        return true;
    }

    const inventory = await getInventory(productId);

    if (!inventory) {
        return false;
    }

    const newReserved = Math.max(0, inventory.reserved - quantity);

    const { error } = await supabase
        .from('inventory')
        .update({
            reserved: newReserved,
            updated_at: new Date().toISOString(),
        })
        .eq('product_id', productId);

    if (error) {
        console.error('Error liberando stock:', handleSupabaseError(error));
        return false;
    }

    return true;
};

/**
 * Confirmar venta (reducir stock real)
 */
export const confirmSale = async (productId: string, quantity: number): Promise<boolean> => {
    if (!isSupabaseConfigured() || !supabase) {
        return true;
    }

    const inventory = await getInventory(productId);

    if (!inventory) {
        return false;
    }

    const { error } = await supabase
        .from('inventory')
        .update({
            stock: Math.max(0, inventory.stock - quantity),
            reserved: Math.max(0, inventory.reserved - quantity),
            updated_at: new Date().toISOString(),
        })
        .eq('product_id', productId);

    if (error) {
        console.error('Error confirmando venta:', handleSupabaseError(error));
        return false;
    }

    return true;
};

/**
 * Obtener productos con stock bajo
 */
export const getLowStockProducts = async (): Promise<InventoryItem[]> => {
    if (!isSupabaseConfigured() || !supabase) {
        return [];
    }

    const { data, error } = await supabase
        .from('inventory')
        .select('*')
        .lte('stock', supabase.rpc('get_low_stock_threshold'));

    // Fallback si no existe la función RPC
    if (error) {
        const { data: allInventory } = await supabase
            .from('inventory')
            .select('*');

        if (!allInventory) return [];

        return allInventory
            .filter(inv => inv.stock <= inv.low_stock_threshold)
            .map(mapDBToInventory);
    }

    return (data || []).map(mapDBToInventory);
};

/**
 * Verificar disponibilidad de stock
 */
export const checkAvailability = async (productId: string, quantity: number): Promise<boolean> => {
    const inventory = await getInventory(productId);

    if (!inventory) {
        return true; // Si no hay registro de inventario, asumir disponible
    }

    const availableStock = inventory.stock - inventory.reserved;
    return availableStock >= quantity;
};

/**
 * Coupon Service - Sistema de Cupones
 * @description Servicio para gestionar cupones de descuento
 */

import { supabase, isSupabaseConfigured, handleSupabaseError } from './supabase';
import type { Tables, InsertTables, UpdateTables } from './database.types';
import { Coupon } from '../types';

// Tipo de la base de datos
type DBCoupon = Tables<'coupons'>;

// Convertir de formato DB a formato de la app
const mapDBToCoupon = (dbCoupon: DBCoupon): Coupon => ({
    id: dbCoupon.id,
    code: dbCoupon.code,
    discountType: (dbCoupon.discount_type as Coupon['discountType']) || 'percentage',
    discountValue: dbCoupon.discount_value || 0,
    minPurchase: dbCoupon.min_purchase || undefined,
    maxDiscount: dbCoupon.max_discount || undefined,
    expiresAt: dbCoupon.expires_at ? new Date(dbCoupon.expires_at) : undefined,
    usageLimit: dbCoupon.usage_limit || undefined,
    usedCount: dbCoupon.used_count,
    isActive: dbCoupon.is_active,
    createdAt: new Date(dbCoupon.created_at),
});

/**
 * Validar cupón por código
 */
export const validateCoupon = async (code: string): Promise<{ valid: boolean; coupon?: Coupon; error?: string }> => {
    if (!isSupabaseConfigured() || !supabase) {
        return { valid: false, error: 'Servicio no disponible' };
    }

    const { data, error } = await supabase
        .from('coupons')
        .select('*')
        .eq('code', code.toUpperCase())
        .single();

    if (error || !data) {
        return { valid: false, error: 'Cupón no encontrado' };
    }

    const coupon = mapDBToCoupon(data);

    // Validaciones
    if (!coupon.isActive) {
        return { valid: false, error: 'Cupón inactivo' };
    }

    if (coupon.expiresAt && new Date() > coupon.expiresAt) {
        return { valid: false, error: 'Cupón expirado' };
    }

    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
        return { valid: false, error: 'Cupón agotado' };
    }

    return { valid: true, coupon };
};

/**
 * Aplicar cupón (incrementar contador de uso)
 */
export const applyCoupon = async (couponId: string): Promise<boolean> => {
    if (!isSupabaseConfigured() || !supabase) {
        return false;
    }

    const { error } = await supabase.rpc('increment_coupon_usage', {
        coupon_id: couponId,
    });

    // Si no existe la función RPC, hacerlo manualmente
    if (error) {
        const { data: coupon } = await supabase
            .from('coupons')
            .select('used_count')
            .eq('id', couponId)
            .single();

        if (coupon) {
            await supabase
                .from('coupons')
                .update({ used_count: (coupon.used_count || 0) + 1 })
                .eq('id', couponId);
        }
    }

    return true;
};

/**
 * Calcular descuento
 */
export const calculateDiscount = (coupon: Coupon, subtotal: number): number => {
    if (coupon.minPurchase && subtotal < coupon.minPurchase) {
        return 0;
    }

    let discount = 0;

    if (coupon.discountType === 'percentage') {
        discount = subtotal * (coupon.discountValue / 100);
    } else {
        discount = coupon.discountValue;
    }

    // Aplicar máximo descuento si existe
    if (coupon.maxDiscount && discount > coupon.maxDiscount) {
        discount = coupon.maxDiscount;
    }

    return Math.round(discount * 100) / 100;
};

/**
 * Obtener todos los cupones (Admin)
 */
export const getCoupons = async (): Promise<Coupon[]> => {
    if (!isSupabaseConfigured() || !supabase) {
        return [];
    }

    const { data, error } = await supabase
        .from('coupons')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error obteniendo cupones:', handleSupabaseError(error));
        return [];
    }

    return (data || []).map(mapDBToCoupon);
};

/**
 * Crear nuevo cupón (Admin)
 */
export const createCoupon = async (coupon: Omit<Coupon, 'id' | 'usedCount' | 'createdAt'>): Promise<Coupon | null> => {
    if (!isSupabaseConfigured() || !supabase) {
        return null;
    }

    const { data, error } = await supabase
        .from('coupons')
        .insert({
            code: coupon.code.toUpperCase(),
            discount_type: coupon.discountType,
            discount_value: coupon.discountValue,
            min_purchase: coupon.minPurchase,
            max_discount: coupon.maxDiscount,
            expires_at: coupon.expiresAt?.toISOString(),
            usage_limit: coupon.usageLimit,
            is_active: coupon.isActive,
        })
        .select()
        .single();

    if (error) {
        console.error('Error creando cupón:', handleSupabaseError(error));
        throw new Error(handleSupabaseError(error));
    }

    return data ? mapDBToCoupon(data) : null;
};

/**
 * Actualizar cupón (Admin)
 */
export const updateCoupon = async (id: string, coupon: Partial<Coupon>): Promise<Coupon | null> => {
    if (!isSupabaseConfigured() || !supabase) {
        return null;
    }

    const { data, error } = await supabase
        .from('coupons')
        .update({
            code: coupon.code?.toUpperCase(),
            discount_type: coupon.discountType,
            discount_value: coupon.discountValue,
            min_purchase: coupon.minPurchase,
            max_discount: coupon.maxDiscount,
            expires_at: coupon.expiresAt?.toISOString(),
            usage_limit: coupon.usageLimit,
            is_active: coupon.isActive,
        })
        .eq('id', id)
        .select()
        .single();

    if (error) {
        console.error('Error actualizando cupón:', handleSupabaseError(error));
        throw new Error(handleSupabaseError(error));
    }

    return data ? mapDBToCoupon(data) : null;
};

/**
 * Eliminar cupón (Admin)
 */
export const deleteCoupon = async (id: string): Promise<boolean> => {
    if (!isSupabaseConfigured() || !supabase) {
        return false;
    }

    const { error } = await supabase
        .from('coupons')
        .delete()
        .eq('id', id);

    if (error) {
        console.error('Error eliminando cupón:', handleSupabaseError(error));
        return false;
    }

    return true;
};

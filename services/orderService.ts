/**
 * Order Service - Gestión de Pedidos
 * @description Servicio para gestionar pedidos en Supabase
 */

import { supabase, isSupabaseConfigured, handleSupabaseError } from './supabase';
import type { Tables, InsertTables, UpdateTables, Json } from './database.types';
import { Order, OrderItem, OrderStatus } from '../types';

// Tipos de la base de datos
type DBOrder = Tables<'orders'>;
type DBOrderItem = Tables<'order_items'>;

// Convertir de formato DB a formato de la app
const mapDBToOrder = (dbOrder: DBOrder, items: DBOrderItem[] = []): Order => ({
    id: dbOrder.id,
    userId: dbOrder.user_id || '',
    items: items.map(item => ({
        productId: item.product_id || '',
        productName: item.product_name || '',
        productImage: item.product_image || '',
        price: item.price || 0,
        quantity: item.quantity || 1,
    })),
    subtotal: dbOrder.subtotal || 0,
    shipping: dbOrder.shipping || 0,
    total: dbOrder.total || 0,
    status: (dbOrder.status as OrderStatus) || 'pending',
    shippingAddress: (dbOrder.shipping_address as Order['shippingAddress']) || {
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        address: '',
        district: '',
        city: '',
    },
    paymentMethod: dbOrder.payment_method || '',
    notes: dbOrder.notes || undefined,
    createdAt: new Date(dbOrder.created_at),
    updatedAt: new Date(dbOrder.updated_at),
});

/**
 * Crear nuevo pedido
 */
export const createOrder = async (order: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>): Promise<Order | null> => {
    if (!isSupabaseConfigured() || !supabase) {
        console.warn('⚠️ Supabase no configurado - no se puede crear pedido');
        // Retornar un pedido simulado para desarrollo
        return {
            ...order,
            id: `mock-${Date.now()}`,
            createdAt: new Date(),
            updatedAt: new Date(),
        };
    }

    // Crear el pedido
    const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .insert({
            user_id: order.userId || null,
            subtotal: order.subtotal,
            shipping: order.shipping,
            total: order.total,
            status: order.status,
            shipping_address: order.shippingAddress as unknown as Json,
            payment_method: order.paymentMethod,
            notes: order.notes,
        })
        .select()
        .single();

    if (orderError || !orderData) {
        console.error('Error creando pedido:', handleSupabaseError(orderError));
        throw new Error(handleSupabaseError(orderError));
    }

    // Crear los items del pedido
    if (order.items.length > 0) {
        const orderItems = order.items.map(item => ({
            order_id: orderData.id,
            product_id: item.productId,
            product_name: item.productName,
            product_image: item.productImage,
            price: item.price,
            quantity: item.quantity,
        }));

        const { error: itemsError } = await supabase
            .from('order_items')
            .insert(orderItems);

        if (itemsError) {
            console.error('Error creando items del pedido:', handleSupabaseError(itemsError));
        }
    }

    return mapDBToOrder(orderData, []);
};

/**
 * Obtener pedidos de un usuario
 */
export const getOrdersByUser = async (userId: string): Promise<Order[]> => {
    if (!isSupabaseConfigured() || !supabase) {
        console.log('📦 Supabase no configurado - retornando lista vacía');
        return [];
    }

    const { data: orders, error } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error obteniendo pedidos:', handleSupabaseError(error));
        return [];
    }

    // Obtener items para cada pedido
    const ordersWithItems = await Promise.all(
        (orders || []).map(async (order) => {
            const { data: items } = await supabase
                .from('order_items')
                .select('*')
                .eq('order_id', order.id);

            return mapDBToOrder(order, items || []);
        })
    );

    return ordersWithItems;
};

/**
 * Obtener todos los pedidos (Admin)
 */
export const getAllOrders = async (): Promise<Order[]> => {
    if (!isSupabaseConfigured() || !supabase) {
        console.log('📦 Supabase no configurado - retornando lista vacía');
        return [];
    }

    const { data: orders, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error obteniendo pedidos:', handleSupabaseError(error));
        return [];
    }

    // Obtener items para cada pedido
    const ordersWithItems = await Promise.all(
        (orders || []).map(async (order) => {
            const { data: items } = await supabase
                .from('order_items')
                .select('*')
                .eq('order_id', order.id);

            return mapDBToOrder(order, items || []);
        })
    );

    return ordersWithItems;
};

/**
 * Actualizar estado del pedido
 */
export const updateOrderStatus = async (orderId: string, status: OrderStatus): Promise<Order | null> => {
    if (!isSupabaseConfigured() || !supabase) {
        console.warn('⚠️ Supabase no configurado - no se puede actualizar pedido');
        return null;
    }

    const { data, error } = await supabase
        .from('orders')
        .update({
            status,
            updated_at: new Date().toISOString(),
        })
        .eq('id', orderId)
        .select()
        .single();

    if (error) {
        console.error('Error actualizando estado del pedido:', handleSupabaseError(error));
        throw new Error(handleSupabaseError(error));
    }

    return data ? mapDBToOrder(data) : null;
};

/**
 * Obtener pedido por ID
 */
export const getOrderById = async (orderId: string): Promise<Order | null> => {
    if (!isSupabaseConfigured() || !supabase) {
        return null;
    }

    const { data: order, error } = await supabase
        .from('orders')
        .select('*')
        .eq('id', orderId)
        .single();

    if (error || !order) {
        console.error('Error obteniendo pedido:', handleSupabaseError(error));
        return null;
    }

    const { data: items } = await supabase
        .from('order_items')
        .select('*')
        .eq('order_id', orderId);

    return mapDBToOrder(order, items || []);
};

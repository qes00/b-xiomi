/**
 * Database Types - Tipos generados para Supabase
 * @description Tipos TypeScript para las tablas de la base de datos
 */

export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[];

export interface Database {
    public: {
        Tables: {
            products: {
                Row: {
                    id: string;
                    name: string;
                    description: string | null;
                    price: number;
                    image_url: string | null;
                    images: Json | null;
                    category: string | null;
                    brand: string | null;
                    sizes: string[] | null;
                    colors: string[] | null;
                    is_featured: boolean;
                    created_at: string;
                    updated_at: string;
                };
                Insert: {
                    id?: string;
                    name: string;
                    description?: string | null;
                    price: number;
                    image_url?: string | null;
                    images?: Json | null;
                    category?: string | null;
                    brand?: string | null;
                    sizes?: string[] | null;
                    colors?: string[] | null;
                    is_featured?: boolean;
                    created_at?: string;
                    updated_at?: string;
                };
                Update: {
                    id?: string;
                    name?: string;
                    description?: string | null;
                    price?: number;
                    image_url?: string | null;
                    images?: Json | null;
                    category?: string | null;
                    brand?: string | null;
                    sizes?: string[] | null;
                    colors?: string[] | null;
                    is_featured?: boolean;
                    updated_at?: string;
                };
            };
            user_profiles: {
                Row: {
                    id: string;
                    first_name: string | null;
                    last_name: string | null;
                    phone: string | null;
                    document_type: string | null;
                    document_number: string | null;
                    role: string | null;
                    created_at: string;
                };
                Insert: {
                    id: string;
                    first_name?: string | null;
                    last_name?: string | null;
                    phone?: string | null;
                    document_type?: string | null;
                    document_number?: string | null;
                    role?: string | null;
                    created_at?: string;
                };
                Update: {
                    first_name?: string | null;
                    last_name?: string | null;
                    phone?: string | null;
                    document_type?: string | null;
                    document_number?: string | null;
                    role?: string | null;
                };
            };
            user_addresses: {
                Row: {
                    id: string;
                    user_id: string;
                    street: string | null;
                    district: string | null;
                    province: string | null;
                    department: string | null;
                    reference: string | null;
                    is_default: boolean;
                };
                Insert: {
                    id?: string;
                    user_id: string;
                    street?: string | null;
                    district?: string | null;
                    province?: string | null;
                    department?: string | null;
                    reference?: string | null;
                    is_default?: boolean;
                };
                Update: {
                    street?: string | null;
                    district?: string | null;
                    province?: string | null;
                    department?: string | null;
                    reference?: string | null;
                    is_default?: boolean;
                };
            };
            orders: {
                Row: {
                    id: string;
                    user_id: string | null;
                    subtotal: number | null;
                    shipping: number | null;
                    total: number | null;
                    status: string;
                    shipping_address: Json | null;
                    payment_method: string | null;
                    notes: string | null;
                    created_at: string;
                    updated_at: string;
                };
                Insert: {
                    id?: string;
                    user_id?: string | null;
                    subtotal?: number | null;
                    shipping?: number | null;
                    total?: number | null;
                    status?: string;
                    shipping_address?: Json | null;
                    payment_method?: string | null;
                    notes?: string | null;
                    created_at?: string;
                    updated_at?: string;
                };
                Update: {
                    user_id?: string | null;
                    subtotal?: number | null;
                    shipping?: number | null;
                    total?: number | null;
                    status?: string;
                    shipping_address?: Json | null;
                    payment_method?: string | null;
                    notes?: string | null;
                    updated_at?: string;
                };
            };
            order_items: {
                Row: {
                    id: string;
                    order_id: string;
                    product_id: string | null;
                    product_name: string | null;
                    product_image: string | null;
                    price: number | null;
                    quantity: number | null;
                };
                Insert: {
                    id?: string;
                    order_id: string;
                    product_id?: string | null;
                    product_name?: string | null;
                    product_image?: string | null;
                    price?: number | null;
                    quantity?: number | null;
                };
                Update: {
                    order_id?: string;
                    product_id?: string | null;
                    product_name?: string | null;
                    product_image?: string | null;
                    price?: number | null;
                    quantity?: number | null;
                };
            };
            coupons: {
                Row: {
                    id: string;
                    code: string;
                    discount_type: string | null;
                    discount_value: number | null;
                    min_purchase: number | null;
                    max_discount: number | null;
                    expires_at: string | null;
                    usage_limit: number | null;
                    used_count: number;
                    is_active: boolean;
                    created_at: string;
                };
                Insert: {
                    id?: string;
                    code: string;
                    discount_type?: string | null;
                    discount_value?: number | null;
                    min_purchase?: number | null;
                    max_discount?: number | null;
                    expires_at?: string | null;
                    usage_limit?: number | null;
                    used_count?: number;
                    is_active?: boolean;
                    created_at?: string;
                };
                Update: {
                    code?: string;
                    discount_type?: string | null;
                    discount_value?: number | null;
                    min_purchase?: number | null;
                    max_discount?: number | null;
                    expires_at?: string | null;
                    usage_limit?: number | null;
                    used_count?: number;
                    is_active?: boolean;
                };
            };
            inventory: {
                Row: {
                    id: string;
                    product_id: string;
                    stock: number;
                    reserved: number;
                    low_stock_threshold: number;
                    updated_at: string;
                };
                Insert: {
                    id?: string;
                    product_id: string;
                    stock?: number;
                    reserved?: number;
                    low_stock_threshold?: number;
                    updated_at?: string;
                };
                Update: {
                    stock?: number;
                    reserved?: number;
                    low_stock_threshold?: number;
                    updated_at?: string;
                };
            };
        };
    };
}

// Tipos de ayuda
export type Tables<T extends keyof Database['public']['Tables']> =
    Database['public']['Tables'][T]['Row'];
export type InsertTables<T extends keyof Database['public']['Tables']> =
    Database['public']['Tables'][T]['Insert'];
export type UpdateTables<T extends keyof Database['public']['Tables']> =
    Database['public']['Tables'][T]['Update'];

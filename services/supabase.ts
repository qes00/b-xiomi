/**
 * Supabase Client Configuration
 * @description Cliente de Supabase para conexión a la base de datos
 */

import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

// Obtener variables de entorno
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Validación de configuración
if (!supabaseUrl || !supabaseAnonKey) {
    console.warn(
        '⚠️ Supabase no configurado. Usando modo offline/mock.',
        '\nConfigura VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY en .env'
    );
}

// Cliente de Supabase con tipado
export const supabase = supabaseUrl && supabaseAnonKey
    ? createClient<Database>(supabaseUrl, supabaseAnonKey, {
        auth: {
            persistSession: true,
            autoRefreshToken: true,
        },
    })
    : null;

// Helper para verificar si Supabase está disponible
export const isSupabaseConfigured = (): boolean => {
    return supabase !== null;
};

// Helper para manejar errores de Supabase
export const handleSupabaseError = (error: unknown): string => {
    if (error && typeof error === 'object' && 'message' in error) {
        return (error as { message: string }).message;
    }
    return 'Error desconocido al conectar con la base de datos';
};

export default supabase;

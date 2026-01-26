/**
 * User Service - Gestión de Perfiles de Usuario
 * @description Servicio para gestionar perfiles y direcciones de usuarios
 */

import { supabase, isSupabaseConfigured, handleSupabaseError } from './supabase';
import type { Tables, InsertTables, UpdateTables } from './database.types';
import { UserProfile, UserAddress, UserData } from '../types';

// Tipos de la base de datos
type DBUserProfile = Tables<'user_profiles'>;
type DBUserAddress = Tables<'user_addresses'>;

// Convertir de formato DB a formato de la app
const mapDBToUserProfile = (dbProfile: DBUserProfile, addresses: DBUserAddress[] = []): UserProfile => ({
    firstName: dbProfile.first_name || '',
    lastName: dbProfile.last_name || '',
    email: '', // Se obtiene de Supabase Auth
    phone: dbProfile.phone || '',
    documentType: (dbProfile.document_type as UserProfile['documentType']) || 'DNI',
    documentNumber: dbProfile.document_number || '',
    addresses: addresses.map(addr => ({
        id: addr.id,
        street: addr.street || '',
        district: addr.district || '',
        province: addr.province || '',
        department: addr.department || '',
        reference: addr.reference || undefined,
    })),
});

/**
 * Obtener el usuario actual de Supabase Auth
 */
export const getCurrentUser = async (): Promise<UserData | null> => {
    if (!isSupabaseConfigured() || !supabase) {
        return null;
    }

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return null;

    // Obtener perfil adicional
    const { data: profile } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user.id)
        .single();

    return {
        id: user.id,
        email: user.email || '',
        firstName: profile?.first_name || '',
        lastName: profile?.last_name || '',
        phone: profile?.phone || '',
    };
};

/**
 * Obtener perfil de usuario por ID
 */
export const getUserProfile = async (userId: string): Promise<UserProfile | null> => {
    if (!isSupabaseConfigured() || !supabase) {
        return null;
    }

    const { data: profile, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single();

    if (error || !profile) {
        console.error('Error obteniendo perfil:', handleSupabaseError(error));
        return null;
    }

    // Obtener direcciones
    const { data: addresses } = await supabase
        .from('user_addresses')
        .select('*')
        .eq('user_id', userId);

    return mapDBToUserProfile(profile, addresses || []);
};

/**
 * Obtener todos los usuarios (para Admin Dashboard)
 */
export const getAllUsers = async (): Promise<UserData[]> => {
    if (!isSupabaseConfigured() || !supabase) {
        return [];
    }

    const { data: profiles, error } = await supabase
        .from('user_profiles')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error obteniendo usuarios:', handleSupabaseError(error));
        return [];
    }

    // Map profiles to UserData format
    return (profiles || []).map(p => ({
        id: p.id,
        email: '', // Email not available in public profile table easily without admin role join, treating as separate concern or accepting limitation
        firstName: p.first_name || '',
        lastName: p.last_name || '',
        phone: p.phone || '',
    }));
};

/**
 * Crear perfil de usuario
 */
export const createUserProfile = async (
    userId: string,
    data: Partial<UserProfile>
): Promise<UserProfile | null> => {
    if (!isSupabaseConfigured() || !supabase) {
        return null;
    }

    const { data: profile, error } = await supabase
        .from('user_profiles')
        .insert({
            id: userId,
            first_name: data.firstName,
            last_name: data.lastName,
            phone: data.phone,
            document_type: data.documentType,
            document_number: data.documentNumber,
        })
        .select()
        .single();

    if (error) {
        console.error('Error creando perfil:', handleSupabaseError(error));
        throw new Error(handleSupabaseError(error));
    }

    return profile ? mapDBToUserProfile(profile) : null;
};

/**
 * Actualizar perfil de usuario
 */
export const updateUserProfile = async (
    userId: string,
    data: Partial<UserProfile>
): Promise<UserProfile | null> => {
    if (!isSupabaseConfigured() || !supabase) {
        return null;
    }

    const { data: profile, error } = await supabase
        .from('user_profiles')
        .update({
            first_name: data.firstName,
            last_name: data.lastName,
            phone: data.phone,
            document_type: data.documentType,
            document_number: data.documentNumber,
        })
        .eq('id', userId)
        .select()
        .single();

    if (error) {
        console.error('Error actualizando perfil:', handleSupabaseError(error));
        throw new Error(handleSupabaseError(error));
    }

    return profile ? mapDBToUserProfile(profile) : null;
};

/**
 * Agregar dirección de usuario
 */
export const addUserAddress = async (
    userId: string,
    address: Omit<UserAddress, 'id'>
): Promise<UserAddress | null> => {
    if (!isSupabaseConfigured() || !supabase) {
        return null;
    }

    const { data, error } = await supabase
        .from('user_addresses')
        .insert({
            user_id: userId,
            street: address.street,
            district: address.district,
            province: address.province,
            department: address.department,
            reference: address.reference,
        })
        .select()
        .single();

    if (error) {
        console.error('Error agregando dirección:', handleSupabaseError(error));
        throw new Error(handleSupabaseError(error));
    }

    return data ? {
        id: data.id,
        street: data.street || '',
        district: data.district || '',
        province: data.province || '',
        department: data.department || '',
        reference: data.reference || undefined,
    } : null;
};

/**
 * Eliminar dirección de usuario
 */
export const deleteUserAddress = async (addressId: string): Promise<boolean> => {
    if (!isSupabaseConfigured() || !supabase) {
        return false;
    }

    const { error } = await supabase
        .from('user_addresses')
        .delete()
        .eq('id', addressId);

    if (error) {
        console.error('Error eliminando dirección:', handleSupabaseError(error));
        return false;
    }

    return true;
};

/**
 * Registrar nuevo usuario
 */
export const signUp = async (email: string, password: string): Promise<{ user: UserData | null; error: string | null }> => {
    if (!isSupabaseConfigured() || !supabase) {
        return { user: null, error: 'Supabase no configurado' };
    }

    const { data, error } = await supabase.auth.signUp({
        email,
        password,
    });

    if (error) {
        return { user: null, error: handleSupabaseError(error) };
    }

    if (data.user) {
        // Al usar confirmación de correo, no tenemos sesión aún, así que no podemos crear el perfil manualmente por RLS.
        // Se debe usar un Trigger en la BD (recomendado) o esperar al primer login.
        if (data.session) {
            await createUserProfile(data.user.id, {});
        }

        return {
            user: {
                id: data.user.id,
                email: data.user.email || '',
                firstName: '',
                lastName: '',
                phone: '',
            },
            error: null,
        };
    }

    return { user: null, error: 'Error al crear usuario' };
};

/**
 * Iniciar sesión
 */
export const signIn = async (email: string, password: string): Promise<{ user: UserData | null; error: string | null }> => {
    if (!isSupabaseConfigured() || !supabase) {
        return { user: null, error: 'Supabase no configurado' };
    }

    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
    });

    if (error) {
        return { user: null, error: handleSupabaseError(error) };
    }

    if (data.user) {
        return {
            user: await getCurrentUser(),
            error: null,
        };
    }

    return { user: null, error: 'Error al iniciar sesión' };
};

/**
 * Cerrar sesión
 */
export const signOut = async (): Promise<void> => {
    if (!isSupabaseConfigured() || !supabase) {
        return;
    }

    await supabase.auth.signOut();
};

/**
 * Verificar contraseña actual (Fase 1 del cambio de contraseña)
 */
export const verifyCurrentPassword = async (currentPassword: string): Promise<{ success: boolean; error: string | null }> => {
    if (!isSupabaseConfigured() || !supabase) {
        return { success: false, error: 'Supabase no configurado' };
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user || !user.email) return { success: false, error: 'No hay usuario autenticado' };

    const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: currentPassword
    });

    if (signInError) {
        return { success: false, error: 'La contraseña actual es incorrecta' };
    }

    return { success: true, error: null };
};

/**
 * Cambiar contraseña (Fase 2) - con límite de 2 cambios por día
 */
export const changePassword = async (oldPassword: string, newPassword: string): Promise<{ success: boolean; error: string | null }> => {
    if (!isSupabaseConfigured() || !supabase) {
        return { success: false, error: 'Supabase no configurado' };
    }

    // 1. Obtener usuario actual
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || !user.email) return { success: false, error: 'No hay usuario autenticado' };

    // 2. Verificar límite diario
    const { data: profile } = await supabase
        .from('user_profiles')
        .select('last_password_update, password_update_count')
        .eq('id', user.id)
        .single();

    const today = new Date().toISOString().split('T')[0];
    const lastUpdateDate = profile?.last_password_update 
        ? new Date(profile.last_password_update).toISOString().split('T')[0]
        : null;
    
    const currentCount = (lastUpdateDate === today) ? (profile?.password_update_count || 0) : 0;
    
    if (currentCount >= 2) {
        return { success: false, error: 'Has alcanzado el límite de 2 cambios de contraseña por día. Intenta mañana.' };
    }

    // 3. Verificar contraseña actual re-autenticando
    const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: oldPassword
    });

    if (signInError) {
        return { success: false, error: 'La contraseña actual es incorrecta' };
    }

    // 4. Actualizar contraseña
    const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword
    });

    if (updateError) {
        return { success: false, error: handleSupabaseError(updateError) };
    }

    // 5. Actualizar conteo en user_profiles
    const newCount = currentCount + 1;
    await supabase
        .from('user_profiles')
        .update({
            last_password_update: new Date().toISOString(),
            password_update_count: newCount
        })
        .eq('id', user.id);

    return { success: true, error: null };
};

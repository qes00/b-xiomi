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
 * Iniciar sesión con Google OAuth
 */
export const signInWithGoogle = async (): Promise<{ error: string | null }> => {
    if (!isSupabaseConfigured() || !supabase) {
        return { error: 'Supabase no configurado' };
    }

    const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
            redirectTo: `${window.location.origin}/auth/callback`,
            queryParams: {
                access_type: 'offline',
                prompt: 'select_account',
            },
        },
    });

    if (error) {
        return { error: handleSupabaseError(error) };
    }

    return { error: null };
};


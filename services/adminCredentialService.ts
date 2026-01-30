/**
 * Admin Credential Service - Encrypted Credential Management
 * @description Service for managing encrypted credentials (API keys, tokens, passwords)
 * Uses cryptoService for encryption/decryption
 */

import { supabase, isSupabaseConfigured, handleSupabaseError } from './supabase';
import { encrypt, decrypt } from './cryptoService';

export interface AdminCredential {
    id: string;
    name: string;
    credential_type: 'api_key' | 'token' | 'password' | 'other';
    description?: string;
    created_at: string;
    updated_at: string;
}

export interface AdminCredentialWithValue extends AdminCredential {
    value: string; // Decrypted value
}

interface DBAdminCredential {
    id: string;
    name: string;
    encrypted_value: string;
    credential_type: string;
    description: string | null;
    created_at: string;
    updated_at: string;
}

/**
 * Save a new encrypted credential
 */
export const saveCredential = async (
    name: string,
    value: string,
    type: 'api_key' | 'token' | 'password' | 'other',
    description?: string
): Promise<AdminCredential | null> => {
    if (!isSupabaseConfigured() || !supabase) {
        throw new Error('Supabase no configurado');
    }

    try {
        // Encrypt the value
        const encryptedValue = encrypt(value);

        // Get current user
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            throw new Error('Usuario no autenticado');
        }

        // Insert into database
        const { data, error } = await supabase
            .from('admin_credentials')
            .insert({
                name,
                encrypted_value: encryptedValue,
                credential_type: type,
                description: description || null,
                created_by: user.id,
            } as any)
            .select()
            .single();

        if (error) {
            console.error('Error saving credential:', handleSupabaseError(error));
            throw new Error(handleSupabaseError(error));
        }

        if (!data) {
            throw new Error('No data returned from insert operation');
        }

        const dbCred = data as DBAdminCredential;

        return {
            id: dbCred.id,
            name: dbCred.name,
            credential_type: dbCred.credential_type as AdminCredential['credential_type'],
            description: dbCred.description || undefined,
            created_at: dbCred.created_at,
            updated_at: dbCred.updated_at,
        };
    } catch (error) {
        console.error('Error in saveCredential:', error);
        throw error;
    }
};

/**
 * Get a credential by name (returns decrypted value)
 */
export const getCredential = async (name: string): Promise<AdminCredentialWithValue | null> => {
    if (!isSupabaseConfigured() || !supabase) {
        throw new Error('Supabase no configurado');
    }

    try {
        const { data, error } = await supabase
            .from('admin_credentials')
            .select('*')
            .eq('name', name)
            .single();

        if (error) {
            if (error.code === 'PGRST116') {
                return null; // Not found
            }
            console.error('Error getting credential:', handleSupabaseError(error));
            throw new Error(handleSupabaseError(error));
        }

        if (!data) {
            return null;
        }

        const dbCred = data as DBAdminCredential;

        // Decrypt the value
        const decryptedValue = decrypt(dbCred.encrypted_value);

        return {
            id: dbCred.id,
            name: dbCred.name,
            value: decryptedValue,
            credential_type: dbCred.credential_type as AdminCredential['credential_type'],
            description: dbCred.description || undefined,
            created_at: dbCred.created_at,
            updated_at: dbCred.updated_at,
        };
    } catch (error) {
        console.error('Error in getCredential:', error);
        throw error;
    }
};

/**
 * Get all credentials (without decrypted values for security)
 */
export const getAllCredentials = async (): Promise<AdminCredential[]> => {
    if (!isSupabaseConfigured() || !supabase) {
        return [];
    }

    try {
        const { data, error } = await supabase
            .from('admin_credentials')
            .select('id, name, credential_type, description, created_at, updated_at')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error getting credentials:', handleSupabaseError(error));
            throw new Error(handleSupabaseError(error));
        }

        return (data || []).map(cred => ({
            id: cred.id,
            name: cred.name,
            credential_type: cred.credential_type as AdminCredential['credential_type'],
            description: cred.description || undefined,
            created_at: cred.created_at,
            updated_at: cred.updated_at,
        }));
    } catch (error) {
        console.error('Error in getAllCredentials:', error);
        return [];
    }
};

/**
 * Update a credential's value
 */
export const updateCredential = async (
    id: string,
    value: string,
    description?: string
): Promise<AdminCredential | null> => {
    if (!isSupabaseConfigured() || !supabase) {
        throw new Error('Supabase no configurado');
    }

    try {
        // Encrypt the new value
        const encryptedValue = encrypt(value);

        const updateData: any = {
            encrypted_value: encryptedValue,
        };

        if (description !== undefined) {
            updateData.description = description;
        }

        const { data, error} = await supabase
            .from('admin_credentials')
            .update(updateData as any)
            .eq('id', id)
            .select()
            .single();

        if (error) {
            console.error('Error updating credential:', handleSupabaseError(error));
            throw new Error(handleSupabaseError(error));
        }

        if (!data) {
            throw new Error('No data returned from update operation');
        }

        const dbCred = data as DBAdminCredential;

        return {
            id: dbCred.id,
            name: dbCred.name,
            credential_type: dbCred.credential_type as AdminCredential['credential_type'],
            description: dbCred.description || undefined,
            created_at: dbCred.created_at,
            updated_at: dbCred.updated_at,
        };
    } catch (error) {
        console.error('Error in updateCredential:', error);
        throw error;
    }
};

/**
 * Delete a credential
 */
export const deleteCredential = async (id: string): Promise<boolean> => {
    if (!isSupabaseConfigured() || !supabase) {
        throw new Error('Supabase no configurado');
    }

    try {
        const { error } = await supabase
            .from('admin_credentials')
            .delete()
            .eq('id', id);

        if (error) {
            console.error('Error deleting credential:', handleSupabaseError(error));
            throw new Error(handleSupabaseError(error));
        }

        return true;
    } catch (error) {
        console.error('Error in deleteCredential:', error);
        return false;
    }
};

/**
 * Get credential value only (for quick access)
 */
export const getCredentialValue = async (name: string): Promise<string | null> => {
    const credential = await getCredential(name);
    return credential ? credential.value : null;
};

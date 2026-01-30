/**
 * Crypto Service - Encryption/Decryption Utility
 * @description Service for encrypting and decrypting sensitive data using AES-256
 * Inspired by Secure-Pass repository
 */

import CryptoJS from 'crypto-js';

/**
 * Get encryption key from environment variables
 */
const getEncryptionKey = (): string => {
    const key = import.meta.env.VITE_ENCRYPTION_KEY;
    
    if (!key) {
        console.error('VITE_ENCRYPTION_KEY is not defined in environment variables');
        throw new Error('Encryption key not configured');
    }
    
    if (key.length < 32) {
        console.warn('Encryption key should be at least 32 characters for better security');
    }
    
    return key;
};

/**
 * Encrypt data using AES-256
 * @param data - Plain text data to encrypt
 * @returns Encrypted string
 */
export const encrypt = (data: string): string => {
    try {
        const key = getEncryptionKey();
        const encrypted = CryptoJS.AES.encrypt(data, key).toString();
        return encrypted;
    } catch (error) {
        console.error('Encryption error:', error);
        throw new Error('Failed to encrypt data');
    }
};

/**
 * Decrypt data using AES-256
 * @param encryptedData - Encrypted string to decrypt
 * @returns Decrypted plain text
 */
export const decrypt = (encryptedData: string): string => {
    try {
        const key = getEncryptionKey();
        const decrypted = CryptoJS.AES.decrypt(encryptedData, key);
        const plainText = decrypted.toString(CryptoJS.enc.Utf8);
        
        if (!plainText) {
            throw new Error('Decryption failed - invalid key or corrupted data');
        }
        
        return plainText;
    } catch (error) {
        console.error('Decryption error:', error);
        throw new Error('Failed to decrypt data');
    }
};

/**
 * Generate SHA-256 hash of data (for verification, not encryption)
 * @param data - Data to hash
 * @returns SHA-256 hash string
 */
export const hashData = (data: string): string => {
    try {
        const hash = CryptoJS.SHA256(data).toString();
        return hash;
    } catch (error) {
        console.error('Hashing error:', error);
        throw new Error('Failed to hash data');
    }
};

/**
 * Verify if encrypted data can be decrypted (validation check)
 * @param encryptedData - Encrypted string to validate
 * @returns true if valid, false otherwise
 */
export const isValidEncryptedData = (encryptedData: string): boolean => {
    try {
        decrypt(encryptedData);
        return true;
    } catch {
        return false;
    }
};

/**
 * Encrypt object data (converts to JSON first)
 * @param data - Object to encrypt
 * @returns Encrypted string
 */
export const encryptObject = <T>(data: T): string => {
    try {
        const jsonString = JSON.stringify(data);
        return encrypt(jsonString);
    } catch (error) {
        console.error('Object encryption error:', error);
        throw new Error('Failed to encrypt object');
    }
};

/**
 * Decrypt object data (parses JSON after decryption)
 * @param encryptedData - Encrypted string to decrypt
 * @returns Decrypted object
 */
export const decryptObject = <T>(encryptedData: string): T => {
    try {
        const jsonString = decrypt(encryptedData);
        return JSON.parse(jsonString) as T;
    } catch (error) {
        console.error('Object decryption error:', error);
        throw new Error('Failed to decrypt object');
    }
};

export default {
    encrypt,
    decrypt,
    hashData,
    isValidEncryptedData,
    encryptObject,
    decryptObject,
};

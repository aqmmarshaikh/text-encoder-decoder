import CryptoJS from 'crypto-js';

/**
 * Encrypts a message using AES encryption
 * @param {string} message - The message to encrypt
 * @param {string} password - Optional password for encryption
 * @returns {string} - Encrypted message in base64
 */
export const encryptMessage = (message, password = '') => {
    try {
        if (!message || message.trim() === '') {
            throw new Error('Message cannot be empty');
        }

        // Use password if provided, otherwise use a default key
        const key = password || 'CipherVault-Default-Key-2024';

        // Encrypt the message
        const encrypted = CryptoJS.AES.encrypt(message, key).toString();

        return encrypted;
    } catch (error) {
        throw new Error(`Encryption failed: ${error.message}`);
    }
};

/**
 * Decrypts an encrypted message
 * @param {string} encryptedMessage - The encrypted message
 * @param {string} password - Optional password for decryption
 * @returns {string} - Decrypted message
 */
export const decryptMessage = (encryptedMessage, password = '') => {
    try {
        if (!encryptedMessage || encryptedMessage.trim() === '') {
            throw new Error('Encrypted message cannot be empty');
        }

        // Use password if provided, otherwise use the default key
        const key = password || 'CipherVault-Default-Key-2024';

        // Decrypt the message
        const decrypted = CryptoJS.AES.decrypt(encryptedMessage, key);
        const originalMessage = decrypted.toString(CryptoJS.enc.Utf8);

        if (!originalMessage) {
            throw new Error('Decryption failed. Please check your password and encrypted message.');
        }

        return originalMessage;
    } catch (error) {
        throw new Error(`Decryption failed: ${error.message}`);
    }
};

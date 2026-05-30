import CryptoJS from 'crypto-js';

const ONYX_FORMAT = 'onyx-encrypted-file';
const ONYX_VERSION = '1.0';
const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB limit

// Supported file types for UI hints (encryption works for ANY file)
export const SUPPORTED_TYPES = {
    'application/pdf': { label: 'PDF', ext: '.pdf', icon: '📄' },
    'application/msword': { label: 'Word', ext: '.doc', icon: '📝' },
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': { label: 'Word', ext: '.docx', icon: '📝' },
    'application/vnd.ms-excel': { label: 'Excel', ext: '.xls', icon: '📊' },
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': { label: 'Excel', ext: '.xlsx', icon: '📊' },
    'application/vnd.ms-powerpoint': { label: 'PowerPoint', ext: '.ppt', icon: '📑' },
    'application/vnd.openxmlformats-officedocument.presentationml.presentation': { label: 'PowerPoint', ext: '.pptx', icon: '📑' },
    'text/plain': { label: 'Text', ext: '.txt', icon: '📃' },
    'image/jpeg': { label: 'Image', ext: '.jpg', icon: '🖼️' },
    'image/png': { label: 'Image', ext: '.png', icon: '🖼️' },
};

/** Read a File as ArrayBuffer */
const readAsArrayBuffer = (file) =>
    new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target.result);
        reader.onerror = () => reject(new Error('Failed to read file'));
        reader.readAsArrayBuffer(file);
    });

/** Read a File as Text */
const readAsText = (file) =>
    new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target.result);
        reader.onerror = () => reject(new Error('Failed to read file'));
        reader.readAsText(file);
    });

/** ArrayBuffer → Base64 string */
const arrayBufferToBase64 = (buffer) => {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
};

/** Base64 string → ArrayBuffer */
const base64ToArrayBuffer = (base64) => {
    const binary = window.atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
    }
    return bytes.buffer;
};

/** Trigger browser download of a Blob */
const downloadBlob = (blob, filename) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
};

/** Format bytes to human-readable size */
export const formatFileSize = (bytes) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

/**
 * Encrypts a file with AES-256
 * @param {File} file - The file to encrypt
 * @param {string} password - Encryption password
 * @param {function} onProgress - Progress callback (0-100)
 * @returns {Promise<{success: boolean, filename: string}>}
 */
export const encryptFile = async (file, password, onProgress) => {
    if (!file) throw new Error('No file provided');
    if (!password || password.trim() === '') throw new Error('Password is required to encrypt a file');
    if (file.size > MAX_FILE_SIZE) throw new Error(`File too large. Maximum size is ${formatFileSize(MAX_FILE_SIZE)}`);

    onProgress?.(10);
    const arrayBuffer = await readAsArrayBuffer(file);

    onProgress?.(30);
    const base64 = arrayBufferToBase64(arrayBuffer);

    onProgress?.(50);
    const encrypted = CryptoJS.AES.encrypt(base64, password).toString();

    onProgress?.(80);
    const packageData = JSON.stringify({
        format: ONYX_FORMAT,
        version: ONYX_VERSION,
        originalName: file.name,
        originalType: file.type || 'application/octet-stream',
        originalSize: file.size,
        encryptedAt: new Date().toISOString(),
        data: encrypted,
    });

    const blob = new Blob([packageData], { type: 'application/json' });
    const outputFilename = `${file.name}.onyx`;
    downloadBlob(blob, outputFilename);

    onProgress?.(100);
    return { success: true, filename: outputFilename };
};

/**
 * Decrypts an .onyx file back to the original
 * @param {File} onyxFile - The .onyx file to decrypt
 * @param {string} password - Decryption password
 * @param {function} onProgress - Progress callback (0-100)
 * @returns {Promise<{success: boolean, filename: string, size: number}>}
 */
export const decryptFile = async (onyxFile, password, onProgress) => {
    if (!onyxFile) throw new Error('No file provided');
    if (!password || password.trim() === '') throw new Error('Password is required to decrypt a file');

    onProgress?.(10);
    const text = await readAsText(onyxFile);

    onProgress?.(30);
    let pkg;
    try {
        pkg = JSON.parse(text);
    } catch {
        throw new Error('Invalid .onyx file — file may be corrupted');
    }

    if (pkg.format !== ONYX_FORMAT) {
        throw new Error('This file was not encrypted by Onyx');
    }

    onProgress?.(50);
    let decrypted;
    try {
        decrypted = CryptoJS.AES.decrypt(pkg.data, password);
        const base64 = decrypted.toString(CryptoJS.enc.Utf8);
        if (!base64) throw new Error('Wrong password');

        onProgress?.(75);
        const arrayBuffer = base64ToArrayBuffer(base64);
        const blob = new Blob([arrayBuffer], { type: pkg.originalType });

        downloadBlob(blob, pkg.originalName);
        onProgress?.(100);

        return {
            success: true,
            filename: pkg.originalName,
            size: pkg.originalSize,
            encryptedAt: pkg.encryptedAt,
        };
    } catch {
        throw new Error('Decryption failed — check your password and try again');
    }
};

/** Check if a file is an .onyx encrypted file */
export const isOnyxFile = (file) =>
    file?.name?.endsWith('.onyx') || file?.type === 'application/json';

/** Get file type info */
export const getFileTypeInfo = (file) =>
    SUPPORTED_TYPES[file?.type] || { label: 'File', ext: '', icon: '📂' };

// Pure JS key vault — no external dependencies needed
import { getCurrentUser } from './auth';

/** Generate a UUID without external packages */
const generateId = () => {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
        return crypto.randomUUID();
    }
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
        const r = (Math.random() * 16) | 0;
        const v = c === 'x' ? r : (r & 0x3) | 0x8;
        return v.toString(16);
    });
};

const getKey = () => {
    const user = getCurrentUser();
    return user ? `onyx-keys-${user.id}` : 'onyx-keys-guest';
};

export const getKeys = () => {
    try {
        return JSON.parse(localStorage.getItem(getKey()) || '[]');
    } catch {
        return [];
    }
};

export const saveKey = (label, keyValue) => {
    if (!label?.trim()) throw new Error('Label is required');
    if (!keyValue?.trim()) throw new Error('Key value is required');
    const keys = getKeys();
    const newKey = {
        id: generateId(),
        label: label.trim(),
        keyValue: keyValue.trim(),
        createdAt: new Date().toISOString(),
    };
    keys.push(newKey);
    localStorage.setItem(getKey(), JSON.stringify(keys));
    return newKey;
};

export const deleteKey = (id) => {
    const keys = getKeys().filter((k) => k.id !== id);
    localStorage.setItem(getKey(), JSON.stringify(keys));
};

export const getKeyById = (id) => getKeys().find((k) => k.id === id);

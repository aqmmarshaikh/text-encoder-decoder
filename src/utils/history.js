// Pure JS history — no external dependencies needed
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

/** Format date without date-fns */
const formatDate = (date) => {
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, '0');
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    const month = months[d.getMonth()];
    const year = d.getFullYear();
    let hours = d.getHours();
    const minutes = String(d.getMinutes()).padStart(2, '0');
    const ampm = hours >= 12 ? 'pm' : 'am';
    hours = hours % 12 || 12;
    return `${day} ${month} ${year}, ${String(hours).padStart(2, '0')}:${minutes} ${ampm}`;
};

/** Format date for filename (yyyy-MM-dd) */
const formatDateForFile = (date) => {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

const getKey = () => {
    const user = getCurrentUser();
    return user ? `onyx-history-${user.id}` : 'onyx-history-guest';
};

/** Load all history entries */
export const getHistory = () => {
    try {
        return JSON.parse(localStorage.getItem(getKey()) || '[]');
    } catch {
        return [];
    }
};

/**
 * Save a new encryption/decryption entry
 * @param {object} entry - { mode, cipherType, inputPreview, outputPreview, hasPassword }
 */
export const saveHistoryEntry = (entry) => {
    const history = getHistory();
    const newEntry = {
        id: generateId(),
        timestamp: new Date().toISOString(),
        displayDate: formatDate(new Date()),
        mode: entry.mode || 'encode', // 'encode' | 'decode'
        cipherType: entry.cipherType || 'text', // 'text' | 'qr' | 'file'
        inputPreview: (entry.inputPreview || '').slice(0, 80),
        outputPreview: (entry.outputPreview || '').slice(0, 80),
        hasPassword: !!entry.hasPassword,
        fileName: entry.fileName || null,
    };
    history.unshift(newEntry); // newest first
    // Keep max 200 entries
    if (history.length > 200) history.pop();
    localStorage.setItem(getKey(), JSON.stringify(history));
    return newEntry;
};

/** Delete a single history entry */
export const deleteHistoryEntry = (id) => {
    const history = getHistory().filter((h) => h.id !== id);
    localStorage.setItem(getKey(), JSON.stringify(history));
};

/** Clear all history */
export const clearHistory = () => {
    localStorage.setItem(getKey(), '[]');
};

/** Search history by text */
export const searchHistory = (query) => {
    if (!query?.trim()) return getHistory();
    const q = query.toLowerCase();
    return getHistory().filter(
        (h) =>
            h.inputPreview.toLowerCase().includes(q) ||
            h.outputPreview.toLowerCase().includes(q) ||
            h.displayDate.toLowerCase().includes(q) ||
            h.cipherType.toLowerCase().includes(q) ||
            (h.fileName && h.fileName.toLowerCase().includes(q))
    );
};

/** Get history stats */
export const getHistoryStats = () => {
    const history = getHistory();
    return {
        total: history.length,
        encoded: history.filter((h) => h.mode === 'encode').length,
        decoded: history.filter((h) => h.mode === 'decode').length,
        qrCodes: history.filter((h) => h.cipherType === 'qr').length,
        files: history.filter((h) => h.cipherType === 'file').length,
        lastUsed: history[0]?.displayDate || 'Never',
    };
};

/** Export history as JSON */
export const exportHistory = () => {
    const history = getHistory();
    const blob = new Blob([JSON.stringify(history, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `onyx-history-${formatDateForFile(new Date())}.json`;
    a.click();
    URL.revokeObjectURL(url);
};

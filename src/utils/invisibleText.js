import CryptoJS from 'crypto-js';

// Zero-width characters for binary encoding
const ZW_ZERO = '\u200B'; // Zero-Width Space  = bit 0
const ZW_ONE  = '\u200C'; // Zero-Width Non-Joiner = bit 1
const ZW_SEP  = '\u200D'; // Zero-Width Joiner = byte separator
const ZW_START = '\uFEFF'; // BOM = marker (start of hidden data)
const ZW_END   = '\u2060'; // Word Joiner = marker (end of hidden data)

/**
 * Encode message as invisible zero-width characters
 * Flow: plaintext → AES-256 → binary bits → zero-width chars
 * The result looks like an EMPTY STRING but contains the hidden message
 */
export const invisibleEncode = (message, password = '') => {
    if (!message?.trim()) throw new Error('Message cannot be empty');
    const key = password || 'Onyx-Default-Key-2026';
    const encrypted = CryptoJS.AES.encrypt(message, key).toString();

    const invisible = ZW_START
        + [...encrypted]
            .map((ch) => {
                const bits = ch.charCodeAt(0).toString(2).padStart(8, '0');
                return bits.split('').map((b) => (b === '0' ? ZW_ZERO : ZW_ONE)).join('');
            })
            .join(ZW_SEP)
        + ZW_END;

    return invisible;
};

/**
 * Decode invisible zero-width characters back to plaintext
 * Works even when pasted into any text — extracts hidden chars
 */
export const invisibleDecode = (text, password = '') => {
    if (!text) throw new Error('No text provided');
    const key = password || 'Onyx-Default-Key-2026';

    // Extract everything between start and end markers
    const startIdx = text.indexOf(ZW_START);
    const endIdx = text.indexOf(ZW_END);
    if (startIdx === -1 || endIdx === -1) {
        throw new Error('No hidden message found in this text');
    }

    const zwStr = text.slice(startIdx + 1, endIdx);
    const byteGroups = zwStr.split(ZW_SEP);

    let base64 = '';
    for (const group of byteGroups) {
        if (!group) continue;
        const bits = group.split('').map((ch) => (ch === ZW_ZERO ? '0' : '1')).join('');
        if (bits.length !== 8) continue;
        base64 += String.fromCharCode(parseInt(bits, 2));
    }

    try {
        const bytes = CryptoJS.AES.decrypt(base64, key);
        const result = bytes.toString(CryptoJS.enc.Utf8);
        if (!result) throw new Error('Decryption failed');
        return result;
    } catch {
        throw new Error('Hidden message decryption failed — check your password');
    }
};

/**
 * Create a "cover text" with hidden message embedded
 * The invisible chars are injected between real words
 */
export const hideInCoverText = (coverText, hiddenMessage, password = '') => {
    const invisible = invisibleEncode(hiddenMessage, password);
    // Insert invisible chars after the first word
    const words = coverText.split(' ');
    if (words.length > 1) {
        words.splice(1, 0, invisible);
        return words.join(' ');
    }
    return coverText + invisible;
};

/** Count zero-width chars in a string (to show hidden data indicator) */
export const countHiddenChars = (text) => {
    return [...text].filter((ch) => [ZW_ZERO, ZW_ONE, ZW_SEP, ZW_START, ZW_END].includes(ch)).length;
};

/** Check if text contains hidden zero-width data */
export const hasHiddenData = (text) => text?.includes(ZW_START) && text?.includes(ZW_END);

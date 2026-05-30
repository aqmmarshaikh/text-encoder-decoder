import CryptoJS from 'crypto-js';

/** 2-bit to DNA base mapping */
const BITS_TO_BASE = { '00': 'A', '01': 'T', '10': 'G', '11': 'C' };
const BASE_TO_BITS = { A: '00', T: '01', G: '10', C: '11' };

/** DNA base colors for rendering */
export const DNA_BASE_COLORS = {
    A: '#00ff41', // green
    T: '#ff0040', // red
    G: '#00d9ff', // cyan
    C: '#ffd700', // gold
};

/**
 * Encode message as DNA sequence
 * Flow: plaintext → AES-256 → binary bits → DNA bases (2 bits per base)
 */
export const dnaEncode = (message, password = '') => {
    if (!message?.trim()) throw new Error('Message cannot be empty');
    const key = password || 'Onyx-Default-Key-2026';
    const encrypted = CryptoJS.AES.encrypt(message, key).toString();

    // Convert each char of encrypted string to 8-bit binary → 4 DNA bases
    let dna = '';
    for (const ch of encrypted) {
        const bits = ch.charCodeAt(0).toString(2).padStart(8, '0');
        for (let i = 0; i < 8; i += 2) {
            dna += BITS_TO_BASE[bits.slice(i, i + 2)];
        }
    }
    return dna;
};

/**
 * Decode a DNA sequence back to plaintext
 * Flow: DNA bases → bits → chars → AES-256 decrypt → plaintext
 */
export const dnaDecode = (dnaStr, password = '') => {
    if (!dnaStr?.trim()) throw new Error('DNA sequence cannot be empty');
    const key = password || 'Onyx-Default-Key-2026';

    // Validate DNA sequence
    const cleaned = dnaStr.toUpperCase().replace(/[^ATGC]/g, '');
    if (cleaned.length % 4 !== 0) throw new Error('Invalid DNA sequence length');

    let base64 = '';
    for (let i = 0; i < cleaned.length; i += 4) {
        const bits = cleaned.slice(i, i + 4)
            .split('')
            .map((b) => BASE_TO_BITS[b])
            .join('');
        base64 += String.fromCharCode(parseInt(bits, 2));
    }

    try {
        const bytes = CryptoJS.AES.decrypt(base64, key);
        const result = bytes.toString(CryptoJS.enc.Utf8);
        if (!result) throw new Error('Decryption failed');
        return result;
    } catch {
        throw new Error('Invalid DNA sequence or wrong password');
    }
};

/**
 * Format DNA string into codon groups (3 bases each, like real DNA)
 * Returns array of codon strings
 */
export const formatDnaCodons = (dnaStr, codonsPerLine = 10) => {
    const codons = [];
    for (let i = 0; i < dnaStr.length; i += 3) {
        codons.push(dnaStr.slice(i, i + 3));
    }
    // Group codons into lines
    const lines = [];
    for (let i = 0; i < codons.length; i += codonsPerLine) {
        lines.push(codons.slice(i, i + codonsPerLine));
    }
    return lines;
};

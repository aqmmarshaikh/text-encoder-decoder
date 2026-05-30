import CryptoJS from 'crypto-js';

/** Morse code table — letters + digits */
const MORSE_MAP = {
    A:'.-',   B:'-...', C:'-.-.',D:'-..', E:'.',   F:'..-.',
    G:'--.',  H:'....', I:'..',  J:'.---',K:'-.-', L:'.-..',
    M:'--',   N:'-.',   O:'---', P:'.--.',Q:'--.-',R:'.-.',
    S:'...',  T:'-',    U:'..-', V:'...-',W:'.--', X:'-..-',
    Y:'-.--', Z:'--..',
    '0':'-----','1':'.----','2':'..---','3':'...--','4':'....-',
    '5':'.....','6':'-....','7':'--...','8':'---..','9':'----.',
    '.':'.-.-.-', ',':'--..--', '?':'..--..', "'":'.----.',
    '!':'-.-.--', '/':'-..-.', '(':'-.--.', ')':'-.--.-',
    '&':'.-...',  ':':'---...', ';':'-.-.-.', '=':'-...-',
    '+':'.-.-.', '-':'-....-', '_':'..--.-', '"':'.-..-.',
    '$':'...-..-','@':'.--.-.', ' ':'/',
};

const REVERSE_MORSE = Object.fromEntries(
    Object.entries(MORSE_MAP).map(([k, v]) => [v, k])
);

/** Encode plain text to Morse code string */
export const textToMorse = (text) => {
    return text
        .toUpperCase()
        .split('')
        .map((ch) => MORSE_MAP[ch] ?? '?')
        .join(' ');
};

/** Decode Morse code string to plain text */
export const morseToText = (morse) => {
    return morse
        .split(' ')
        .map((token) => {
            if (token === '/') return ' ';
            return REVERSE_MORSE[token] ?? '?';
        })
        .join('');
};

/**
 * AES-encrypt a message then encode ciphertext as Morse
 * (for extra security — the Morse itself is a cipher)
 */
export const morseEncryptEncode = (message, password = '') => {
    if (!message?.trim()) throw new Error('Message cannot be empty');
    const key = password || 'Onyx-Default-Key-2026';
    const encrypted = CryptoJS.AES.encrypt(message, key).toString();
    // Encode each base64 char's ASCII value as Morse numbers
    const morseNumbers = [...encrypted]
        .map((ch) => {
            const code = ch.charCodeAt(0).toString();
            return code.split('').map((d) => MORSE_MAP[d]).join('-');
        })
        .join(' / ');
    return morseNumbers;
};

/**
 * Decode Morse-encoded ciphertext and AES-decrypt
 */
export const morseDecode = (morseStr, password = '') => {
    if (!morseStr?.trim()) throw new Error('Morse code cannot be empty');
    const key = password || 'Onyx-Default-Key-2026';
    try {
        // Split by ' / ' (char separators)
        const charGroups = morseStr.split(' / ');
        const base64 = charGroups
            .map((group) => {
                const digits = group.split('-').map((m) => REVERSE_MORSE[m] ?? '?').join('');
                return String.fromCharCode(parseInt(digits, 10));
            })
            .join('');
        const bytes = CryptoJS.AES.decrypt(base64, key);
        const result = bytes.toString(CryptoJS.enc.Utf8);
        if (!result) throw new Error('Decryption failed');
        return result;
    } catch {
        throw new Error('Invalid Morse code or wrong password');
    }
};

/** Play Morse code audio using Web Audio API */
export const playMorseAudio = (morseStr, onDone) => {
    try {
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        const DOT = 0.08;   // seconds
        const DASH = DOT * 3;
        const GAP = DOT * 1.2;
        const CHAR_GAP = DOT * 3;
        const WORD_GAP = DOT * 7;
        const FREQ = 700;

        const schedule = (start, duration) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.type = 'sine';
            osc.frequency.value = FREQ;
            gain.gain.setValueAtTime(0, start);
            gain.gain.linearRampToValueAtTime(0.6, start + 0.01);
            gain.gain.setValueAtTime(0.6, start + duration - 0.01);
            gain.gain.linearRampToValueAtTime(0, start + duration);
            osc.start(start);
            osc.stop(start + duration + 0.05);
        };

        let t = ctx.currentTime + 0.1;
        // Limit to first 60 chars to avoid very long playback
        const limited = morseStr.slice(0, 120);
        for (const ch of limited) {
            if (ch === '.') { schedule(t, DOT); t += DOT + GAP; }
            else if (ch === '-') { schedule(t, DASH); t += DASH + GAP; }
            else if (ch === ' ') { t += CHAR_GAP; }
            else if (ch === '/') { t += WORD_GAP; }
        }

        setTimeout(() => { onDone?.(); ctx.close(); }, (t - ctx.currentTime) * 1000 + 500);
        return t - ctx.currentTime;
    } catch {
        onDone?.();
        return 0;
    }
};

/** Format Morse string with styled spans info for rendering */
export const getMorseTokens = (morseStr) => {
    return morseStr.split('').map((ch, i) => ({
        char: ch,
        type: ch === '.' ? 'dot' : ch === '-' ? 'dash' : ch === '/' ? 'word' : 'space',
        key: i,
    }));
};

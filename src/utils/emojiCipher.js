import CryptoJS from 'crypto-js';

/**
 * Base64 char → Emoji mapping (65 unique entries)
 * Maps AES output (base64) directly to emojis — no data loss
 */
const B64_TO_EMOJI = {
    'A':'😀','B':'😂','C':'😎','D':'😍','E':'🥳','F':'😱','G':'😴',
    'H':'🤔','I':'😡','J':'🤩','K':'🥰','L':'😈','M':'👻','N':'💀',
    'O':'🤖','P':'👽','Q':'🎃','R':'🤡','S':'🤑','T':'😏','U':'🙈',
    'V':'🙉','W':'🙊','X':'🐶','Y':'🐱','Z':'🐭',
    'a':'🐹','b':'🐰','c':'🦊','d':'🐻','e':'🐼','f':'🐨','g':'🐯',
    'h':'🦁','i':'🐮','j':'🐷','k':'🐸','l':'🐵','m':'🐔','n':'🐧',
    'o':'🐦','p':'🦆','q':'🦅','r':'🦉','s':'🦇','t':'🐺','u':'🐗',
    'v':'🐴','w':'🦄','x':'🐝','y':'🐛','z':'🦋',
    '0':'🐌','1':'🐚','2':'🐞','3':'🐜','4':'🦟','5':'🦗','6':'🕷',
    '7':'🦂','8':'🐢','9':'🦎','+':'🐍','/':'🐲','=':'🦕',
};

const EMOJI_TO_B64 = Object.fromEntries(
    Object.entries(B64_TO_EMOJI).map(([k, v]) => [v, k])
);

/**
 * Emoji-encode a message
 * Flow: plaintext → AES-256 encrypt (base64) → emoji substitution
 */
export const emojiEncode = (message, password = '') => {
    if (!message?.trim()) throw new Error('Message cannot be empty');
    const key = password || 'Onyx-Default-Key-2026';
    const encrypted = CryptoJS.AES.encrypt(message, key).toString(); // base64 output
    return [...encrypted].map((ch) => B64_TO_EMOJI[ch] ?? ch).join('');
};

/**
 * Decode an emoji-encoded message
 * Flow: emoji string → base64 restoration → AES-256 decrypt → plaintext
 */
export const emojiDecode = (emojiText, password = '') => {
    if (!emojiText?.trim()) throw new Error('Emoji text cannot be empty');
    const key = password || 'Onyx-Default-Key-2026';

    // Split string properly handling multi-codepoint emoji
    const chars = [...emojiText];
    const base64 = chars.map((ch) => EMOJI_TO_B64[ch] ?? ch).join('');

    const bytes = CryptoJS.AES.decrypt(base64, key);
    const result = bytes.toString(CryptoJS.enc.Utf8);
    if (!result) throw new Error('Decryption failed — check your password');
    return result;
};

/** Preview first few emojis from an emoji-encoded string */
export const emojiPreview = (emojiStr, maxChars = 8) => {
    return [...emojiStr].slice(0, maxChars).join('') + (([...emojiStr].length > maxChars) ? '...' : '');
};

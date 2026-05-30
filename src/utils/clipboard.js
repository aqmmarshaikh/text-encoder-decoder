/**
 * Copies text to clipboard
 * @param {string} text - Text to copy
 * @returns {Promise<boolean>} - Success status
 */
export const copyToClipboard = async (text) => {
    try {
        if (navigator.clipboard && window.isSecureContext) {
            await navigator.clipboard.writeText(text);
            return true;
        } else {
            // Fallback for older browsers
            const textArea = document.createElement('textarea');
            textArea.value = text;
            textArea.style.position = 'fixed';
            textArea.style.left = '-999999px';
            document.body.appendChild(textArea);
            textArea.focus();
            textArea.select();

            try {
                document.execCommand('copy');
                textArea.remove();
                return true;
            } catch (error) {
                textArea.remove();
                return false;
            }
        }
    } catch (error) {
        console.error('Failed to copy:', error);
        return false;
    }
};

/**
 * Pastes text from clipboard
 * @returns {Promise<string>} - Clipboard text
 */
export const pasteFromClipboard = async () => {
    try {
        if (navigator.clipboard && window.isSecureContext) {
            const text = await navigator.clipboard.readText();
            return text;
        } else {
            throw new Error('Clipboard API not available');
        }
    } catch (error) {
        console.error('Failed to paste:', error);
        return '';
    }
};

/**
 * Shares text using Web Share API
 * @param {string} text - Text to share
 * @param {string} title - Share title
 * @returns {Promise<boolean>} - Success status
 */
export const shareText = async (text, title = 'CipherVault Message') => {
    try {
        if (navigator.share) {
            await navigator.share({
                title: title,
                text: text,
            });
            return true;
        } else {
            // Fallback: copy to clipboard
            return await copyToClipboard(text);
        }
    } catch (error) {
        console.error('Failed to share:', error);
        return false;
    }
};

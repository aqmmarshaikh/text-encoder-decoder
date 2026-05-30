import { useEffect, useCallback } from 'react';

/**
 * Global keyboard shortcuts for Onyx
 *
 * Shortcuts (only fire when NOT focused on an input/textarea):
 *   Alt + L  → Toggle login/profile modal
 *   Alt + H  → Open history panel
 *   Alt + K  → Open key vault
 *   Alt + S  → Open settings
 *   Alt + T  → Open theme changer
 *   Escape   → Close all modals (handled at modal level)
 *   Ctrl+/   → Show shortcut help toast
 */
const SHORTCUTS = [
    { key: 'l', alt: true, action: 'login',    label: 'Alt+L → Login / Profile' },
    { key: 'h', alt: true, action: 'history',  label: 'Alt+H → History' },
    { key: 'k', alt: true, action: 'keyvault', label: 'Alt+K → Key Vault' },
    { key: 's', alt: true, action: 'settings', label: 'Alt+S → Settings' },
    { key: 't', alt: true, action: 'theme',    label: 'Alt+T → Themes' },
];

export const SHORTCUT_LABELS = SHORTCUTS.map((s) => s.label);

const useKeyboardShortcuts = ({ isLoggedIn, onLogin, onProfile, onHistory, onKeyVault, onSettings, onTheme }) => {
    const isInputFocused = () => {
        const el = document.activeElement;
        return el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.isContentEditable);
    };

    const handleKey = useCallback((e) => {
        if (isInputFocused()) return;

        // Alt + key shortcuts
        if (e.altKey && !e.ctrlKey && !e.metaKey) {
            switch (e.key.toLowerCase()) {
                case 'l':
                    e.preventDefault();
                    isLoggedIn ? onProfile?.() : onLogin?.();
                    break;
                case 'h':
                    e.preventDefault();
                    onHistory?.();
                    break;
                case 'k':
                    e.preventDefault();
                    onKeyVault?.();
                    break;
                case 's':
                    e.preventDefault();
                    onSettings?.();
                    break;
                case 't':
                    e.preventDefault();
                    onTheme?.();
                    break;
            }
        }
    }, [isLoggedIn, onLogin, onProfile, onHistory, onKeyVault, onSettings, onTheme]);

    useEffect(() => {
        window.addEventListener('keydown', handleKey);
        return () => window.removeEventListener('keydown', handleKey);
    }, [handleKey]);
};

export default useKeyboardShortcuts;

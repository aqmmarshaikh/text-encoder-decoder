import { getCurrentUser } from './auth';

const getKey = () => {
    const user = getCurrentUser();
    return user ? `onyx-settings-${user.id}` : 'onyx-settings-guest';
};

const DEFAULTS = {
    autoSaveHistory: true,
    defaultCipherTab: 'text',
    livePreview: false,
    fontSize: 'md',
    language: 'en',
    autoLockMinutes: 15,
};

export const getSettings = () => {
    try {
        return { ...DEFAULTS, ...JSON.parse(localStorage.getItem(getKey()) || '{}') };
    } catch {
        return { ...DEFAULTS };
    }
};

export const getSetting = (key) => getSettings()[key] ?? DEFAULTS[key];

export const setSetting = (key, value) => {
    const settings = getSettings();
    settings[key] = value;
    localStorage.setItem(getKey(), JSON.stringify(settings));
};

export const resetSettings = () => {
    localStorage.setItem(getKey(), JSON.stringify(DEFAULTS));
    return { ...DEFAULTS };
};

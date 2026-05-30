import { createContext, useContext, useState, useCallback } from 'react';
import { saveHistoryEntry, getHistory, deleteHistoryEntry, clearHistory } from '../utils/history';
import { getSettings, setSetting } from '../utils/settings';

const UserContext = createContext(null);

export const UserProvider = ({ children }) => {
    const [history, setHistory] = useState(() => getHistory());
    const [settings, setSettings] = useState(() => getSettings());

    const addToHistory = useCallback((entry) => {
        const autoSave = settings.autoSaveHistory ?? true;
        if (!autoSave) return;
        const newEntry = saveHistoryEntry(entry);
        setHistory((prev) => [newEntry, ...prev].slice(0, 200));
    }, [settings.autoSaveHistory]);

    const removeFromHistory = useCallback((id) => {
        deleteHistoryEntry(id);
        setHistory((prev) => prev.filter((h) => h.id !== id));
    }, []);

    const wipeHistory = useCallback(() => {
        clearHistory();
        setHistory([]);
    }, []);

    const updateSetting = useCallback((key, value) => {
        setSetting(key, value);
        setSettings((prev) => ({ ...prev, [key]: value }));
    }, []);

    const refreshHistory = useCallback(() => {
        setHistory(getHistory());
    }, []);

    return (
        <UserContext.Provider value={{
            history,
            settings,
            addToHistory,
            removeFromHistory,
            wipeHistory,
            updateSetting,
            refreshHistory,
        }}>
            {children}
        </UserContext.Provider>
    );
};

export const useUser = () => {
    const ctx = useContext(UserContext);
    if (!ctx) throw new Error('useUser must be used inside UserProvider');
    return ctx;
};

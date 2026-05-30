import { createContext, useContext, useState, useEffect } from 'react';
import { getCurrentUser, loginUser, registerUser, logoutUser, updateUserProfile } from '../utils/auth';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Restore session on mount
    useEffect(() => {
        const session = getCurrentUser();
        if (session) setUser(session);
        setLoading(false);
    }, []);

    const login = async (email, password) => {
        const session = await loginUser(email, password);
        setUser(session);
        return session;
    };

    const register = async (name, email, password) => {
        const session = await registerUser(name, email, password);
        setUser(session);
        return session;
    };

    const logout = () => {
        logoutUser();
        setUser(null);
    };

    const updateProfile = (updates) => {
        const updated = updateUserProfile(updates);
        setUser(updated);
        return updated;
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, register, logout, updateProfile, isLoggedIn: !!user }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
    return ctx;
};

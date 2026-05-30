// Pure JS auth — no external dependencies needed
// Uses Web Crypto API for hashing (built into all modern browsers)

const USERS_KEY = 'onyx-users';
const SESSION_KEY = 'onyx-current-user';

/** Generate a UUID without the uuid package */
const generateId = () => {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
        return crypto.randomUUID();
    }
    // Fallback for older browsers
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
        const r = (Math.random() * 16) | 0;
        const v = c === 'x' ? r : (r & 0x3) | 0x8;
        return v.toString(16);
    });
};

/** Simple hash using Web Crypto API (SHA-256) */
const hashPassword = async (password) => {
    const encoder = new TextEncoder();
    // Add a static salt for security
    const data = encoder.encode(password + ':onyx-salt-2026');
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
};

/** Verify password against stored hash */
const verifyPassword = async (password, hash) => {
    const computed = await hashPassword(password);
    return computed === hash;
};

/** Get all registered users */
const getUsers = () => {
    try {
        return JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
    } catch {
        return [];
    }
};

/** Save all users */
const saveUsers = (users) => {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
};

/**
 * Register a new user
 */
export const registerUser = async (name, email, password) => {
    if (!name?.trim()) throw new Error('Name is required');
    if (!email?.trim()) throw new Error('Email is required');
    if (!password || password.length < 6) throw new Error('Password must be at least 6 characters');

    const users = getUsers();
    const exists = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (exists) throw new Error('An account with this email already exists');

    const hashedPassword = await hashPassword(password);
    const newUser = {
        id: generateId(),
        name: name.trim(),
        email: email.toLowerCase().trim(),
        password: hashedPassword,
        avatar: `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(email)}`,
        createdAt: new Date().toISOString(),
        isPro: false,
    };

    users.push(newUser);
    saveUsers(users);

    // Auto-login after register
    const session = { id: newUser.id, name: newUser.name, email: newUser.email, avatar: newUser.avatar, isPro: newUser.isPro };
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    return session;
};

/**
 * Login existing user
 */
export const loginUser = async (email, password) => {
    if (!email?.trim()) throw new Error('Email is required');
    if (!password) throw new Error('Password is required');

    const users = getUsers();
    const user = users.find((u) => u.email.toLowerCase() === email.toLowerCase().trim());
    if (!user) throw new Error('No account found with this email');

    const isMatch = await verifyPassword(password, user.password);
    if (!isMatch) throw new Error('Incorrect password');

    const session = { id: user.id, name: user.name, email: user.email, avatar: user.avatar, isPro: user.isPro };
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    return session;
};

/** Logout current user */
export const logoutUser = () => {
    localStorage.removeItem(SESSION_KEY);
};

/** Get current logged-in user from session */
export const getCurrentUser = () => {
    try {
        return JSON.parse(localStorage.getItem(SESSION_KEY) || 'null');
    } catch {
        return null;
    }
};

/** Check if a user is authenticated */
export const isAuthenticated = () => !!getCurrentUser();

/**
 * Update user profile (name, avatar)
 */
export const updateUserProfile = (updates) => {
    const session = getCurrentUser();
    if (!session) throw new Error('Not logged in');

    const users = getUsers();
    const index = users.findIndex((u) => u.id === session.id);
    if (index === -1) throw new Error('User not found');

    users[index] = { ...users[index], ...updates };
    saveUsers(users);

    const newSession = { ...session, ...updates };
    localStorage.setItem(SESSION_KEY, JSON.stringify(newSession));
    return newSession;
};

/**
 * Change password
 */
export const changePassword = async (oldPassword, newPassword) => {
    const session = getCurrentUser();
    if (!session) throw new Error('Not logged in');
    if (newPassword.length < 6) throw new Error('New password must be at least 6 characters');

    const users = getUsers();
    const user = users.find((u) => u.id === session.id);
    if (!user) throw new Error('User not found');

    const isMatch = await verifyPassword(oldPassword, user.password);
    if (!isMatch) throw new Error('Current password is incorrect');

    user.password = await hashPassword(newPassword);
    saveUsers(users);
    return true;
};

/**
 * Delete account and all associated data
 */
export const deleteAccount = () => {
    const session = getCurrentUser();
    if (!session) return;

    const users = getUsers().filter((u) => u.id !== session.id);
    saveUsers(users);

    // Remove all user data
    ['history', 'keys', 'settings', 'premium'].forEach((key) => {
        localStorage.removeItem(`onyx-${key}-${session.id}`);
    });
    localStorage.removeItem(SESSION_KEY);
};

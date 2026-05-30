/**
 * Custom Toast System — drop-in replacement for react-hot-toast
 * No external dependencies required
 */
import { createContext, useContext, useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const ToastContext = createContext(null);

let globalToast = null;

// Toast item component
const ToastItem = ({ id, message, type, onRemove }) => {
    const icons = { success: '✅', error: '❌', loading: '⏳', default: 'ℹ️' };
    const colors = {
        success: 'rgba(0,255,65,0.3)',
        error: 'rgba(255,0,64,0.3)',
        loading: 'rgba(0,217,255,0.3)',
        default: 'rgba(255,255,255,0.2)',
    };

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 50, scale: 0.85 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            onClick={() => onRemove(id)}
            style={{
                background: 'rgba(15,15,15,0.97)',
                border: `1px solid ${colors[type] || colors.default}`,
                borderRadius: '14px',
                padding: '12px 18px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                cursor: 'pointer',
                backdropFilter: 'blur(20px)',
                boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
                fontFamily: 'monospace',
                fontSize: '14px',
                color: '#fff',
                maxWidth: '380px',
                wordBreak: 'break-word',
                marginBottom: '8px',
            }}
        >
            <span style={{ fontSize: '16px', flexShrink: 0 }}>{icons[type] || icons.default}</span>
            <span style={{ flex: 1 }}>{message}</span>
        </motion.div>
    );
};

// Toast Provider
export const ToastProvider = ({ children }) => {
    const [toasts, setToasts] = useState([]);
    const idCounter = useRef(0);

    const addToast = useCallback((message, type = 'default', duration = 3000) => {
        const id = ++idCounter.current;
        setToasts((prev) => [...prev.slice(-4), { id, message: String(message), type }]);
        if (duration > 0) {
            setTimeout(() => {
                setToasts((prev) => prev.filter((t) => t.id !== id));
            }, duration);
        }
        return id;
    }, []);

    const removeToast = useCallback((id) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    }, []);

    // Expose globally
    globalToast = {
        success: (msg) => addToast(msg, 'success'),
        error: (msg) => addToast(msg, 'error'),
        loading: (msg) => addToast(msg, 'loading', 0),
        default: (msg) => addToast(msg, 'default'),
    };

    return (
        <ToastContext.Provider value={{ addToast, removeToast }}>
            {children}
            <div
                style={{
                    position: 'fixed',
                    bottom: '24px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    zIndex: 99999,
                    display: 'flex',
                    flexDirection: 'column-reverse',
                    alignItems: 'center',
                    pointerEvents: 'none',
                }}
            >
                <AnimatePresence>
                    {toasts.map((t) => (
                        <div key={t.id} style={{ pointerEvents: 'all' }}>
                            <ToastItem
                                id={t.id}
                                message={t.message}
                                type={t.type}
                                onRemove={removeToast}
                            />
                        </div>
                    ))}
                </AnimatePresence>
            </div>
        </ToastContext.Provider>
    );
};

// Hook
export const useToast = () => useContext(ToastContext);

// Global toast object — use like: toast.success('msg')
const toast = {
    success: (msg) => globalToast?.success(msg),
    error: (msg) => globalToast?.error(msg),
    loading: (msg) => globalToast?.loading(msg),
};

// Make toast callable directly: toast('msg')
const toastFn = (msg, opts) => {
    if (opts?.icon) return globalToast?.default(msg);
    return globalToast?.default(msg);
};
Object.assign(toastFn, toast);

export default toastFn;
export { toastFn as Toaster };

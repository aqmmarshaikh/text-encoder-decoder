import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Trash2, Copy, Key, Eye, EyeOff } from 'lucide-react';
import { getKeys, saveKey, deleteKey } from '../utils/keyVault';
import { copyToClipboard } from '../utils/clipboard';
import toast from '../utils/toast.jsx';

const THEME_COLORS = {
    terminal:'#00ff41', cyberred:'#ff0040', neonblue:'#00d9ff',
    purplehack:'#b400ff', matrix:'#00ff00', darkhack:'#00ffff',
    orange:'#ff6600', gold:'#ffd700', stealth:'#888888', toxic:'#39ff14',
};

const KeyVaultPanel = ({ theme, onClose, onSelectKey }) => {
    const primary = THEME_COLORS[theme] || THEME_COLORS.terminal;
    const [keys, setKeys] = useState(() => getKeys());
    const [showAdd, setShowAdd] = useState(false);
    const [label, setLabel] = useState('');
    const [keyValue, setKeyValue] = useState('');
    const [revealedIds, setRevealedIds] = useState(new Set());

    const handleAdd = () => {
        if (!label.trim() || !keyValue.trim()) { toast.error('Fill both fields'); return; }
        const newKey = saveKey(label, keyValue);
        setKeys(getKeys());
        setLabel(''); setKeyValue(''); setShowAdd(false);
        toast.success('Key saved!');
    };

    const handleDelete = (id) => {
        deleteKey(id);
        setKeys(getKeys());
        toast.success('Key deleted');
    };

    const toggleReveal = (id) => {
        setRevealedIds((prev) => {
            const next = new Set(prev);
            next.has(id) ? next.delete(id) : next.add(id);
            return next;
        });
    };

    const handleCopy = async (val) => {
        await copyToClipboard(val);
        toast.success('Key copied!');
    };

    const handleSelect = (keyVal) => {
        onSelectKey?.(keyVal);
        toast.success('Key loaded into password field!');
        onClose();
    };

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
            onClick={onClose}
        >
            <motion.div initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                onClick={(e) => e.stopPropagation()}
                className="glass-strong rounded-2xl p-5 max-w-md w-full border-2 border-white/10 max-h-[90vh] flex flex-col"
            >
                {/* Header */}
                <div className="flex items-center justify-between mb-5 flex-shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-xl" style={{ background: `${primary}20` }}>
                            <Key className="w-5 h-5" style={{ color: primary }} />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold">Key Vault</h2>
                            <p className="text-xs opacity-50">{keys.length} saved keys</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                            onClick={() => setShowAdd((v) => !v)}
                            className="p-2 rounded-xl border-2 font-bold text-xs px-3"
                            style={{ borderColor: primary, color: primary, background: `${primary}15` }}
                        >
                            <Plus className="w-4 h-4 inline mr-1" />Add
                        </motion.button>
                        <motion.button whileHover={{ rotate: 90 }} whileTap={{ scale: 0.9 }}
                            onClick={onClose} className="p-2 rounded-full glass border border-white/20">
                            <X className="w-5 h-5" />
                        </motion.button>
                    </div>
                </div>

                {/* Add key form */}
                <AnimatePresence>
                    {showAdd && (
                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="mb-4 p-4 rounded-xl glass border border-white/20 space-y-3 flex-shrink-0"
                        >
                            <p className="text-xs font-bold uppercase tracking-wide opacity-60">New Key</p>
                            <input value={label} onChange={(e) => setLabel(e.target.value)}
                                placeholder="Label (e.g. 'Work files')"
                                className="w-full px-4 py-2.5 rounded-xl glass text-sm focus:outline-none border border-white/10"
                                style={{ fontSize: '16px' }} />
                            <input value={keyValue} onChange={(e) => setKeyValue(e.target.value)}
                                type="password" placeholder="Encryption key / password"
                                className="w-full px-4 py-2.5 rounded-xl glass font-mono text-sm focus:outline-none border border-white/10"
                                style={{ fontSize: '16px' }} />
                            <div className="flex gap-2">
                                <button onClick={() => setShowAdd(false)} className="flex-1 py-2 rounded-xl glass border border-white/20 text-sm font-bold">Cancel</button>
                                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                                    onClick={handleAdd}
                                    className="flex-1 py-2 rounded-xl font-bold text-black text-sm"
                                    style={{ backgroundColor: primary }}
                                >
                                    Save Key
                                </motion.button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Keys list */}
                <div className="flex-1 overflow-y-auto space-y-2">
                    <AnimatePresence>
                        {keys.length === 0 ? (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                                className="text-center py-16 opacity-40"
                            >
                                <Key className="w-12 h-12 mx-auto mb-3 opacity-30" />
                                <p className="font-bold">No keys saved</p>
                                <p className="text-xs mt-1">Save your encryption passwords for quick access</p>
                            </motion.div>
                        ) : (
                            keys.map((k, i) => (
                                <motion.div key={k.id}
                                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, x: -20 }} transition={{ delay: i * 0.04 }}
                                    className="p-4 rounded-xl glass border border-white/10 group"
                                >
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-2">
                                            <Key className="w-4 h-4" style={{ color: primary }} />
                                            <p className="font-bold text-sm">{k.label}</p>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                                                onClick={() => toggleReveal(k.id)}
                                                className="p-1.5 rounded-lg glass border border-white/20 opacity-60 hover:opacity-100 transition-opacity"
                                            >
                                                {revealedIds.has(k.id) ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                                            </motion.button>
                                            <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                                                onClick={() => handleCopy(k.keyValue)}
                                                className="p-1.5 rounded-lg glass border border-white/20 opacity-60 hover:opacity-100 transition-opacity"
                                            >
                                                <Copy className="w-3.5 h-3.5" />
                                            </motion.button>
                                            <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                                                onClick={() => handleDelete(k.id)}
                                                className="p-1.5 rounded-lg text-red-400 hover:bg-red-400/20 transition-all opacity-0 group-hover:opacity-100"
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </motion.button>
                                        </div>
                                    </div>
                                    <p className="text-xs font-mono opacity-50 truncate">
                                        {revealedIds.has(k.id) ? k.keyValue : '••••••••••••'}
                                    </p>
                                    <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                                        onClick={() => handleSelect(k.keyValue)}
                                        className="mt-2 w-full py-1.5 rounded-lg text-xs font-bold border transition-all opacity-0 group-hover:opacity-100"
                                        style={{ borderColor: `${primary}50`, color: primary, background: `${primary}10` }}
                                    >
                                        Use This Key →
                                    </motion.button>
                                </motion.div>
                            ))
                        )}
                    </AnimatePresence>
                </div>
            </motion.div>
        </motion.div>
    );
};

export default KeyVaultPanel;

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Search, Trash2, Download, Filter, Clock, FileText, QrCode, FolderLock, FlaskConical } from 'lucide-react';
import { useUser } from '../context/UserContext';
import { exportHistory } from '../utils/history';
import toast from '../utils/toast.jsx';

const THEME_COLORS = {
    terminal:'#00ff41', cyberred:'#ff0040', neonblue:'#00d9ff',
    purplehack:'#b400ff', matrix:'#00ff00', darkhack:'#00ffff',
    orange:'#ff6600', gold:'#ffd700', stealth:'#888888', toxic:'#39ff14',
};

const TYPE_ICONS = { text: '📝', qr: '🔲', file: '📁', emoji: '😂', morse: '📡', dna: '🧬', invisible: '👻', selfdestruct: '💣' };
const MODE_COLORS = { encode: '#00ff41', decode: '#00d9ff' };

const HistoryPanel = ({ theme, onClose }) => {
    const { history, removeFromHistory, wipeHistory } = useUser();
    const primary = THEME_COLORS[theme] || THEME_COLORS.terminal;
    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState('all'); // 'all'|'encode'|'decode'|'qr'|'file'
    const [confirmWipe, setConfirmWipe] = useState(false);

    const filtered = useMemo(() => {
        return history.filter((h) => {
            const matchSearch = !search || [h.inputPreview, h.outputPreview, h.displayDate, h.cipherType, h.fileName]
                .some((s) => s?.toLowerCase().includes(search.toLowerCase()));
            const matchFilter = filter === 'all' || h.mode === filter || h.cipherType === filter;
            return matchSearch && matchFilter;
        });
    }, [history, search, filter]);

    const handleWipe = () => {
        wipeHistory();
        setConfirmWipe(false);
        toast.success('History cleared!');
    };

    const FILTERS = [
        { id: 'all', label: 'All' }, { id: 'encode', label: '🔒 Encoded' }, { id: 'decode', label: '🔓 Decoded' },
        { id: 'qr', label: '🔲 QR' }, { id: 'file', label: '📁 Files' },
    ];

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
            onClick={onClose}
        >
            <motion.div initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                onClick={(e) => e.stopPropagation()}
                className="glass-strong rounded-2xl p-5 max-w-lg w-full border-2 border-white/10 flex flex-col max-h-[90vh]"
            >
                {/* Header */}
                <div className="flex items-center justify-between mb-4 flex-shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-xl" style={{ background: `${primary}20` }}>
                            <Clock className="w-5 h-5" style={{ color: primary }} />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold">Encryption History</h2>
                            <p className="text-xs opacity-50">{history.length} total entries</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                            onClick={() => { exportHistory(); toast.success('History exported!'); }}
                            className="p-2 rounded-xl glass border border-white/20" title="Export">
                            <Download className="w-4 h-4" style={{ color: primary }} />
                        </motion.button>
                        <motion.button whileHover={{ rotate: 90 }} whileTap={{ scale: 0.9 }}
                            onClick={onClose} className="p-2 rounded-full glass border border-white/20">
                            <X className="w-5 h-5" />
                        </motion.button>
                    </div>
                </div>

                {/* Search */}
                <div className="relative mb-3 flex-shrink-0">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 opacity-40" />
                    <input value={search} onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search history..."
                        className="w-full pl-9 pr-4 py-2.5 rounded-xl glass text-sm focus:outline-none border border-white/10"
                        style={{ fontSize: '16px' }}
                    />
                </div>

                {/* Filter chips */}
                <div className="flex gap-2 mb-4 flex-wrap flex-shrink-0">
                    {FILTERS.map((f) => (
                        <button key={f.id} onClick={() => setFilter(f.id)}
                            className={`px-3 py-1 rounded-full text-xs font-bold border transition-all ${filter === f.id ? 'border-current glass-strong' : 'glass border-white/20 opacity-60'}`}
                            style={{ color: filter === f.id ? primary : 'inherit' }}
                        >
                            {f.label}
                        </button>
                    ))}
                </div>

                {/* History list */}
                <div className="flex-1 overflow-y-auto space-y-2 pr-1">
                    <AnimatePresence>
                        {filtered.length === 0 ? (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                                className="text-center py-16 opacity-40"
                            >
                                <Clock className="w-12 h-12 mx-auto mb-3 opacity-30" />
                                <p className="font-bold">No history yet</p>
                                <p className="text-xs mt-1">Start encrypting to see your history here</p>
                            </motion.div>
                        ) : (
                            filtered.map((entry) => (
                                <motion.div key={entry.id}
                                    initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 10, height: 0 }}
                                    layout
                                    className="flex items-start gap-3 p-3 rounded-xl glass border border-white/10 hover:border-white/20 transition-all group"
                                >
                                    <span className="text-xl flex-shrink-0 mt-0.5">{TYPE_ICONS[entry.cipherType] || '📝'}</span>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="text-xs font-bold px-2 py-0.5 rounded-full"
                                                style={{ background: `${MODE_COLORS[entry.mode] || primary}20`, color: MODE_COLORS[entry.mode] || primary }}>
                                                {entry.mode === 'encode' ? '🔒 Encoded' : '🔓 Decoded'}
                                            </span>
                                            <span className="text-xs opacity-40">{entry.cipherType}</span>
                                            {entry.hasPassword && <span className="text-xs opacity-40">🔑</span>}
                                        </div>
                                        <p className="text-xs opacity-60 truncate">
                                            {entry.fileName || entry.inputPreview || '—'}
                                        </p>
                                        <p className="text-[10px] opacity-30 mt-0.5">{entry.displayDate}</p>
                                    </div>
                                    <motion.button
                                        initial={{ opacity: 0 }} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                                        className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-red-400 hover:bg-red-400/20 transition-all flex-shrink-0"
                                        onClick={() => { removeFromHistory(entry.id); toast.success('Removed'); }}
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </motion.button>
                                </motion.div>
                            ))
                        )}
                    </AnimatePresence>
                </div>

                {/* Clear all button */}
                {history.length > 0 && (
                    <div className="mt-4 pt-3 border-t border-white/10 flex-shrink-0">
                        {confirmWipe ? (
                            <div className="flex gap-2">
                                <button onClick={() => setConfirmWipe(false)} className="flex-1 py-2 rounded-xl glass border border-white/20 text-sm font-bold">Cancel</button>
                                <button onClick={handleWipe} className="flex-1 py-2 rounded-xl bg-red-600/80 text-white text-sm font-bold">Delete All</button>
                            </div>
                        ) : (
                            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                                onClick={() => setConfirmWipe(true)}
                                className="w-full py-2 rounded-xl glass border border-red-500/30 text-red-400 text-sm font-bold"
                            >
                                🗑️ Clear All History
                            </motion.button>
                        )}
                    </div>
                )}
            </motion.div>
        </motion.div>
    );
};

export default HistoryPanel;

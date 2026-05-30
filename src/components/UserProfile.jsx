import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, User, Mail, Lock, Trash2, Edit3, Save, BarChart3, Key, Clock, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useUser } from '../context/UserContext';
import { getHistoryStats } from '../utils/history';
import { changePassword, deleteAccount } from '../utils/auth';
import toast from '../utils/toast.jsx';

const THEME_COLORS = {
    terminal:'#00ff41', cyberred:'#ff0040', neonblue:'#00d9ff',
    purplehack:'#b400ff', matrix:'#00ff00', darkhack:'#00ffff',
    orange:'#ff6600', gold:'#ffd700', stealth:'#888888', toxic:'#39ff14',
};

const StatCard = ({ icon, label, value, color }) => (
    <div className="glass rounded-xl p-4 border border-white/10 text-center">
        <div className="text-2xl mb-1">{icon}</div>
        <div className="text-2xl font-bold" style={{ color }}>{value}</div>
        <div className="text-xs opacity-50 mt-0.5">{label}</div>
    </div>
);

const UserProfile = ({ theme, onClose }) => {
    const { user, logout, updateProfile } = useAuth();
    const { wipeHistory } = useUser();
    const primary = THEME_COLORS[theme] || THEME_COLORS.terminal;
    const stats = getHistoryStats();

    const [editing, setEditing] = useState(false);
    const [name, setName] = useState(user?.name || '');
    const [tab, setTab] = useState('profile'); // 'profile' | 'security' | 'danger'
    const [oldPw, setOldPw] = useState('');
    const [newPw, setNewPw] = useState('');
    const [confirmPw, setConfirmPw] = useState('');
    const [loading, setLoading] = useState(false);
    const [confirmDelete, setConfirmDelete] = useState(false);

    const handleSaveName = () => {
        if (!name.trim()) { toast.error('Name cannot be empty'); return; }
        updateProfile({ name: name.trim() });
        setEditing(false);
        toast.success('Profile updated!');
    };

    const handleChangePw = async () => {
        if (!oldPw || !newPw) { toast.error('Fill all fields'); return; }
        if (newPw !== confirmPw) { toast.error('Passwords do not match'); return; }
        setLoading(true);
        try {
            await changePassword(oldPw, newPw);
            toast.success('Password changed!');
            setOldPw(''); setNewPw(''); setConfirmPw('');
        } catch (err) { toast.error(err.message); }
        finally { setLoading(false); }
    };

    const handleDeleteAccount = () => {
        deleteAccount();
        logout();
        toast.success('Account deleted');
        onClose();
    };

    const handleLogout = () => {
        logout();
        toast.success('Logged out');
        onClose();
    };

    const TABS = [
        { id: 'profile', label: '👤 Profile', icon: User },
        { id: 'security', label: '🔐 Security', icon: Lock },
        { id: 'danger', label: '⚠️ Account', icon: Trash2 },
    ];

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
            onClick={onClose}
        >
            <motion.div initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                onClick={(e) => e.stopPropagation()}
                className="glass-strong rounded-2xl p-6 max-w-md w-full border-2 border-white/10 max-h-[90vh] overflow-y-auto"
            >
                {/* Header */}
                <div className="flex items-center justify-between mb-5">
                    <h2 className="text-xl font-bold">My Profile</h2>
                    <motion.button whileHover={{ rotate: 90 }} whileTap={{ scale: 0.9 }}
                        onClick={onClose} className="p-2 rounded-full glass border border-white/20">
                        <X className="w-5 h-5" />
                    </motion.button>
                </div>

                {/* Avatar + Name */}
                <div className="flex items-center gap-4 mb-6 p-4 glass rounded-2xl border border-white/10">
                    <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-4xl"
                        style={{ background: `${primary}15`, border: `2px solid ${primary}40` }}>
                        {user?.avatar?.startsWith('http') ? (
                            <img src={user.avatar} alt="" className="w-full h-full rounded-2xl object-cover" />
                        ) : (user?.name?.[0]?.toUpperCase() || '?')}
                    </div>
                    <div className="flex-1">
                        {editing ? (
                            <div className="flex gap-2">
                                <input value={name} onChange={(e) => setName(e.target.value)}
                                    className="flex-1 px-3 py-1.5 rounded-lg glass text-sm focus:outline-none border border-white/20"
                                    style={{ fontSize: '16px' }} autoFocus />
                                <motion.button whileTap={{ scale: 0.9 }} onClick={handleSaveName}
                                    className="p-1.5 rounded-lg" style={{ background: `${primary}30`, color: primary }}>
                                    <Save className="w-4 h-4" />
                                </motion.button>
                            </div>
                        ) : (
                            <div className="flex items-center gap-2">
                                <p className="font-bold text-lg">{user?.name}</p>
                                <motion.button whileTap={{ scale: 0.9 }} onClick={() => setEditing(true)}
                                    className="opacity-40 hover:opacity-80 transition-opacity">
                                    <Edit3 className="w-4 h-4" />
                                </motion.button>
                            </div>
                        )}
                        <p className="text-xs opacity-50">{user?.email}</p>
                        {user?.isPro && <span className="text-xs px-2 py-0.5 rounded-full font-bold" style={{ background: `${primary}20`, color: primary }}>⭐ Pro</span>}
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex gap-1 p-1 glass rounded-xl mb-5 border border-white/10">
                    {TABS.map((t) => (
                        <motion.button key={t.id} whileTap={{ scale: 0.97 }}
                            onClick={() => setTab(t.id)}
                            className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${tab === t.id ? 'glass-strong' : 'opacity-40'}`}
                            style={{ color: tab === t.id ? primary : 'inherit' }}
                        >
                            {t.label}
                        </motion.button>
                    ))}
                </div>

                <AnimatePresence mode="wait">
                    {/* Profile Tab */}
                    {tab === 'profile' && (
                        <motion.div key="profile" initial={{ opacity: 0, x: -15 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 15 }}
                            className="space-y-4"
                        >
                            <p className="text-xs font-bold uppercase tracking-wide opacity-50 flex items-center gap-2">
                                <BarChart3 className="w-4 h-4" /> Your Stats
                            </p>
                            <div className="grid grid-cols-2 gap-3">
                                <StatCard icon="🔐" label="Total Operations" value={stats.total} color={primary} />
                                <StatCard icon="🔒" label="Encrypted" value={stats.encoded} color={primary} />
                                <StatCard icon="🔓" label="Decrypted" value={stats.decoded} color={primary} />
                                <StatCard icon="🔲" label="QR Codes" value={stats.qrCodes} color={primary} />
                                <StatCard icon="📁" label="Files Encrypted" value={stats.files} color={primary} />
                                <StatCard icon="🕐" label="Last Used" value={stats.lastUsed === 'Never' ? 'Never' : 'Recently'} color={primary} />
                            </div>
                            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                                onClick={handleLogout}
                                className="w-full py-3 rounded-xl font-bold border-2 border-white/20 glass-strong text-sm hover:bg-white/10 transition-all"
                            >
                                🚪 Logout
                            </motion.button>
                        </motion.div>
                    )}

                    {/* Security Tab */}
                    {tab === 'security' && (
                        <motion.div key="security" initial={{ opacity: 0, x: -15 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 15 }}
                            className="space-y-4"
                        >
                            <p className="text-xs font-bold uppercase tracking-wide opacity-50 flex items-center gap-2">
                                <ShieldCheck className="w-4 h-4" /> Change Password
                            </p>
                            {[
                                { label: 'Current Password', val: oldPw, set: setOldPw },
                                { label: 'New Password', val: newPw, set: setNewPw },
                                { label: 'Confirm New Password', val: confirmPw, set: setConfirmPw },
                            ].map((f) => (
                                <div key={f.label} className="space-y-1">
                                    <label className="text-xs opacity-60">{f.label}</label>
                                    <input type="password" value={f.val} onChange={(e) => f.set(e.target.value)}
                                        className="w-full px-4 py-3 rounded-xl glass text-sm focus:outline-none border border-white/10"
                                        style={{ fontSize: '16px' }} />
                                </div>
                            ))}
                            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                                onClick={handleChangePw} disabled={loading}
                                className="w-full py-3 rounded-xl font-bold text-black disabled:opacity-50"
                                style={{ backgroundColor: primary }}
                            >
                                {loading ? 'Updating...' : '🔑 Update Password'}
                            </motion.button>
                        </motion.div>
                    )}

                    {/* Danger Tab */}
                    {tab === 'danger' && (
                        <motion.div key="danger" initial={{ opacity: 0, x: -15 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 15 }}
                            className="space-y-4"
                        >
                            <div className="p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/30 text-sm opacity-80">
                                ⚠️ These actions are <strong>irreversible</strong>. Proceed with caution.
                            </div>
                            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                                onClick={() => { wipeHistory(); toast.success('History cleared!'); }}
                                className="w-full py-3 rounded-xl font-bold border border-yellow-500/40 text-yellow-400 glass text-sm"
                            >
                                🗑️ Clear All History
                            </motion.button>
                            {!confirmDelete ? (
                                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                                    onClick={() => setConfirmDelete(true)}
                                    className="w-full py-3 rounded-xl font-bold border border-red-500/40 text-red-400 glass text-sm"
                                >
                                    ❌ Delete My Account
                                </motion.button>
                            ) : (
                                <div className="space-y-2">
                                    <p className="text-xs text-red-400 text-center">Are you sure? This cannot be undone!</p>
                                    <div className="flex gap-2">
                                        <button onClick={() => setConfirmDelete(false)}
                                            className="flex-1 py-3 rounded-xl font-bold glass border border-white/20 text-sm">
                                            Cancel
                                        </button>
                                        <button onClick={handleDeleteAccount}
                                            className="flex-1 py-3 rounded-xl font-bold bg-red-600 text-white text-sm">
                                            Yes, Delete
                                        </button>
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        </motion.div>
    );
};

export default UserProfile;

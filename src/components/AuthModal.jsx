import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, Lock, User, Eye, EyeOff, LogIn, UserPlus, Shield } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import toast from '../utils/toast.jsx';

const THEME_COLORS = {
    terminal:'#00ff41', cyberred:'#ff0040', neonblue:'#00d9ff',
    purplehack:'#b400ff', matrix:'#00ff00', darkhack:'#00ffff',
    orange:'#ff6600', gold:'#ffd700', stealth:'#888888', toxic:'#39ff14',
};

const AVATARS = ['😀','😎','🤖','👻','🦊','🐉','🔮','🦁','🐺','🦋',
                 '🐼','👽','🎃','🤡','🧙','🥷','👾','🦄','🐯','🤩'];

const InputField = ({ label, type, value, onChange, placeholder, icon: Icon, showToggle, onToggle, showVal }) => (
    <div className="space-y-1.5">
        <label className="text-xs font-bold uppercase tracking-wide opacity-70">{label}</label>
        <div className="relative">
            {Icon && <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 opacity-40" />}
            <input
                type={showToggle ? (showVal ? 'text' : 'password') : type}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                className="w-full pl-9 pr-10 py-3 rounded-xl glass font-mono text-sm focus:outline-none border border-white/10 focus:border-white/30 transition-all"
                style={{ fontSize: '16px' }}
            />
            {showToggle && (
                <button type="button" onClick={onToggle}
                    className="absolute right-3 top-1/2 -translate-y-1/2 opacity-40 hover:opacity-80 transition-opacity"
                >
                    {showVal ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
            )}
        </div>
    </div>
);

const AuthModal = ({ theme, onClose }) => {
    const { login, register } = useAuth();
    const primary = THEME_COLORS[theme] || THEME_COLORS.terminal;
    const [tab, setTab] = useState('login');
    const [showPw, setShowPw] = useState(false);
    const [loading, setLoading] = useState(false);
    const [selectedAvatar, setSelectedAvatar] = useState('😎');

    const [loginForm, setLoginForm] = useState({ email: '', password: '' });
    const [regForm, setRegForm] = useState({ name: '', email: '', password: '', confirm: '' });

    const handleLogin = async (e) => {
        e.preventDefault();
        if (!loginForm.email || !loginForm.password) { toast.error('Fill all fields'); return; }
        setLoading(true);
        try {
            await login(loginForm.email, loginForm.password);
            toast.success('Welcome back! 🎉');
            onClose();
        } catch (err) { toast.error(err.message); }
        finally { setLoading(false); }
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        if (!regForm.name || !regForm.email || !regForm.password) { toast.error('Fill all fields'); return; }
        if (regForm.password !== regForm.confirm) { toast.error('Passwords do not match'); return; }
        setLoading(true);
        try {
            await register(regForm.name, regForm.email, regForm.password);
            toast.success('Account created! 🚀');
            onClose();
        } catch (err) { toast.error(err.message); }
        finally { setLoading(false); }
    };

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
            onClick={onClose}
        >
            <motion.div initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                onClick={(e) => e.stopPropagation()}
                className="glass-strong rounded-2xl p-6 max-w-sm w-full border-2 border-white/10 max-h-[90vh] overflow-y-auto"
            >
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-xl" style={{ background: `${primary}20`, border: `1px solid ${primary}40` }}>
                            <Shield className="w-6 h-6" style={{ color: primary }} />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold">Onyx Account</h2>
                            <p className="text-xs opacity-50">Secure your data</p>
                        </div>
                    </div>
                    <motion.button whileHover={{ rotate: 90 }} whileTap={{ scale: 0.9 }}
                        onClick={onClose} className="p-2 rounded-full glass border border-white/20"
                    >
                        <X className="w-5 h-5" />
                    </motion.button>
                </div>

                {/* Tab switcher */}
                <div className="flex gap-1 p-1 glass rounded-xl mb-5 border border-white/10">
                    {['login', 'register'].map((t) => (
                        <motion.button key={t} whileTap={{ scale: 0.97 }}
                            onClick={() => setTab(t)}
                            className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all ${tab === t ? 'glass-strong' : 'opacity-50'}`}
                            style={{ color: tab === t ? primary : 'inherit' }}
                        >
                            {t === 'login' ? <><LogIn className="w-4 h-4 inline mr-1.5" />Login</> : <><UserPlus className="w-4 h-4 inline mr-1.5" />Register</>}
                        </motion.button>
                    ))}
                </div>

                <AnimatePresence mode="wait">
                    {tab === 'login' ? (
                        <motion.form key="login" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
                            onSubmit={handleLogin} className="space-y-4"
                        >
                            <InputField label="Email" type="email" value={loginForm.email} icon={Mail}
                                onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                                placeholder="you@example.com" />
                            <InputField label="Password" type="password" value={loginForm.password} icon={Lock}
                                onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                                placeholder="Your password" showToggle showVal={showPw} onToggle={() => setShowPw(v => !v)} />
                            <motion.button type="submit" disabled={loading}
                                whileHover={{ scale: 1.02, y: -1 }} whileTap={{ scale: 0.98 }}
                                className="w-full py-3.5 rounded-xl font-bold text-black mt-2 disabled:opacity-50 flex items-center justify-center gap-2"
                                style={{ backgroundColor: primary }}
                            >
                                {loading ? <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                                    className="w-5 h-5 border-2 border-black border-t-transparent rounded-full" />
                                : <><LogIn className="w-5 h-5" /> Login</>}
                            </motion.button>
                            <p className="text-center text-xs opacity-50 cursor-pointer hover:opacity-80" onClick={() => setTab('register')}>
                                No account? <span style={{ color: primary }}>Register free →</span>
                            </p>
                        </motion.form>
                    ) : (
                        <motion.form key="register" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                            onSubmit={handleRegister} className="space-y-4"
                        >
                            {/* Avatar picker */}
                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase tracking-wide opacity-70">Pick an Avatar</label>
                                <div className="flex flex-wrap gap-2">
                                    {AVATARS.map((av) => (
                                        <motion.button key={av} type="button" whileTap={{ scale: 0.85 }}
                                            onClick={() => setSelectedAvatar(av)}
                                            className={`text-2xl p-1.5 rounded-lg border-2 transition-all ${selectedAvatar === av ? 'border-current glass-strong' : 'border-transparent'}`}
                                            style={{ borderColor: selectedAvatar === av ? primary : undefined }}
                                        >
                                            {av}
                                        </motion.button>
                                    ))}
                                </div>
                            </div>
                            <InputField label="Your Name" type="text" value={regForm.name} icon={User}
                                onChange={(e) => setRegForm({ ...regForm, name: e.target.value })} placeholder="John Hacker" />
                            <InputField label="Email" type="email" value={regForm.email} icon={Mail}
                                onChange={(e) => setRegForm({ ...regForm, email: e.target.value })} placeholder="you@example.com" />
                            <InputField label="Password (min 6 chars)" type="password" value={regForm.password} icon={Lock}
                                onChange={(e) => setRegForm({ ...regForm, password: e.target.value })}
                                placeholder="Strong password" showToggle showVal={showPw} onToggle={() => setShowPw(v => !v)} />
                            <InputField label="Confirm Password" type="password" value={regForm.confirm} icon={Lock}
                                onChange={(e) => setRegForm({ ...regForm, confirm: e.target.value })} placeholder="Repeat password" />
                            <motion.button type="submit" disabled={loading}
                                whileHover={{ scale: 1.02, y: -1 }} whileTap={{ scale: 0.98 }}
                                className="w-full py-3.5 rounded-xl font-bold text-black mt-2 disabled:opacity-50 flex items-center justify-center gap-2"
                                style={{ backgroundColor: primary }}
                            >
                                {loading ? <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                                    className="w-5 h-5 border-2 border-black border-t-transparent rounded-full" />
                                : <><UserPlus className="w-5 h-5" /> Create Account</>}
                            </motion.button>
                        </motion.form>
                    )}
                </AnimatePresence>
            </motion.div>
        </motion.div>
    );
};

export default AuthModal;

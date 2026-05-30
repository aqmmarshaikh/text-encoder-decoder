import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MoreVertical, Palette, Info, MessageSquare, Coffee, AppWindow, Rocket, LogIn, User, Clock, Key, Settings, BarChart3 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Header = ({ theme, onThemeClick, onAboutClick, onFeedbackClick, onDonateClick, onAboutAppClick, onOtherAppsClick,
    onLoginClick, onProfileClick, onHistoryClick, onKeyVaultClick, onSettingsClick, onDashboardClick }) => {
    const [menuOpen, setMenuOpen] = useState(false);
    const { user, isLoggedIn } = useAuth();

    const menuItems = [
        { icon: Palette,       label: 'Hacker Themes',    onClick: onThemeClick },
        { icon: AppWindow,     label: 'About App',         onClick: onAboutAppClick },
        { icon: Rocket,        label: 'Our Other Apps',    onClick: onOtherAppsClick },
        { icon: Info,          label: 'About Developer',   onClick: onAboutClick },
        { icon: MessageSquare, label: 'Send Feedback',     onClick: onFeedbackClick },
        { icon: Coffee,        label: 'Donate Us',         onClick: onDonateClick },
    ];

    const getThemeColors = () => {
        const colors = {
            terminal: 'from-green-500 to-green-700', cyberred: 'from-red-600 to-red-800',
            neonblue: 'from-cyan-400 to-blue-600',   purplehack: 'from-purple-500 to-purple-800',
            matrix: 'from-green-400 to-green-600',   darkhack: 'from-cyan-300 to-cyan-600',
            orange: 'from-orange-500 to-orange-700', gold: 'from-yellow-400 to-yellow-700',
            stealth: 'from-gray-400 to-gray-700',    toxic: 'from-lime-400 to-green-600',
        };
        return colors[theme] || colors.terminal;
    };

    const THEME_HEX = {
        terminal:'#00ff41', cyberred:'#ff0040', neonblue:'#00d9ff', purplehack:'#b400ff',
        matrix:'#00ff00', darkhack:'#00ffff', orange:'#ff6600', gold:'#ffd700',
        stealth:'#888888', toxic:'#39ff14',
    };
    const primary = THEME_HEX[theme] || '#00ff41';

    const close = () => setMenuOpen(false);

    return (
        <motion.header
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, type: 'spring', stiffness: 100 }}
            className="glass-strong sticky top-0 z-50 backdrop-blur-xl border-b-2 border-white/10"
        >
            <div className="container mx-auto px-3 md:px-4 py-3 md:py-4">
                <div className="flex items-center justify-between">
                    {/* Logo */}
                    <motion.div className="flex items-center gap-3" whileHover={{ scale: 1.05 }}
                        transition={{ type: 'spring', stiffness: 400, damping: 10 }}>
                        <motion.div className="w-10 h-10 rounded-xl overflow-hidden shadow-lg border-2 border-white/20"
                            whileHover={{ rotate: 5, scale: 1.1 }} transition={{ type: 'spring', stiffness: 300 }}>
                            <img src="https://i.ibb.co/pBcdpL6B/Whats-App-Image-2026-01-02-at-4-19-46-PM.jpg"
                                alt="Onyx" className="w-full h-full object-cover" />
                        </motion.div>
                        <div>
                            <motion.h1 className={`text-xl md:text-2xl font-bold bg-gradient-to-r ${getThemeColors()} bg-clip-text text-transparent`}
                                initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
                                Onyx
                            </motion.h1>
                            <p className="text-xs opacity-70 font-mono hidden sm:block">🔐 Secure Message Encryption</p>
                        </div>
                    </motion.div>

                    {/* Right side: User area + Kebab */}
                    <div className="flex items-center gap-2">
                        {/* User quick actions (logged in) */}
                        {isLoggedIn && (
                            <div className="flex items-center gap-1">
                                {[
                                    { icon: BarChart3, label: 'Dashboard', fn: onDashboardClick },
                                    { icon: Clock,     label: 'History',   fn: onHistoryClick },
                                    { icon: Key,       label: 'Key Vault', fn: onKeyVaultClick },
                                    { icon: Settings,  label: 'Settings',  fn: onSettingsClick },
                                ].map(({ icon: Icon, label, fn }) => (
                                    <motion.button key={label} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                                        onClick={fn} title={label}
                                        className="p-2 rounded-xl glass border border-white/10 hidden md:flex items-center justify-center opacity-60 hover:opacity-100 transition-opacity"
                                    >
                                        <Icon className="w-4 h-4" />
                                    </motion.button>
                                ))}
                            </div>
                        )}

                        {/* User avatar OR Login button */}
                        {isLoggedIn ? (
                            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                                onClick={onProfileClick}
                                className="flex items-center gap-2 px-3 py-1.5 rounded-xl glass-strong border border-white/20 touch-target"
                                style={{ borderColor: `${primary}40` }}
                            >
                                <div className="w-7 h-7 rounded-lg flex items-center justify-center text-sm font-bold"
                                    style={{ background: `${primary}20`, color: primary }}>
                                    {user?.name?.[0]?.toUpperCase() || '?'}
                                </div>
                                <span className="text-sm font-bold hidden sm:block max-w-[80px] truncate">{user?.name}</span>
                            </motion.button>
                        ) : (
                            <motion.button whileHover={{ scale: 1.05, y: -1 }} whileTap={{ scale: 0.95 }}
                                onClick={onLoginClick}
                                className="flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-black text-sm touch-target"
                                style={{ backgroundColor: primary }}
                            >
                                <LogIn className="w-4 h-4" />
                                <span className="hidden sm:block">Login</span>
                            </motion.button>
                        )}

                        {/* Kebab Menu */}
                        <div className="relative">
                            <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95, rotate: 90 }}
                                onClick={() => setMenuOpen(!menuOpen)}
                                className="p-3 rounded-full glass hover:glass-strong transition-all border border-white/20 touch-target"
                            >
                                <motion.div animate={{ rotate: menuOpen ? 90 : 0 }} transition={{ duration: 0.3 }}>
                                    <MoreVertical className="w-5 h-5" />
                                </motion.div>
                            </motion.button>

                            <AnimatePresence>
                                {menuOpen && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                                        transition={{ duration: 0.2, type: 'spring', stiffness: 300 }}
                                        className="absolute right-0 mt-2 w-56 glass-strong rounded-xl overflow-hidden shadow-2xl border-2 border-white/10 z-50"
                                    >
                                        {/* Mobile-only user items */}
                                        {isLoggedIn && (
                                            <div className="md:hidden border-b border-white/10">
                                                {[
                                                    { icon: BarChart3, label: 'Dashboard', fn: onDashboardClick },
                                                    { icon: Clock,     label: 'History',   fn: onHistoryClick },
                                                    { icon: Key,       label: 'Key Vault', fn: onKeyVaultClick },
                                                    { icon: Settings,  label: 'Settings',  fn: onSettingsClick },
                                                ].map(({ icon: Icon, label, fn }) => (
                                                    <motion.button key={label}
                                                        whileHover={{ x: 6, backgroundColor: 'rgba(255,255,255,0.1)' }}
                                                        onClick={() => { fn?.(); close(); }}
                                                        className="w-full flex items-center gap-3 px-4 py-3 text-left transition-all border-b border-white/5 last:border-b-0 text-sm"
                                                    >
                                                        <Icon className="w-4 h-4 opacity-70" />
                                                        <span className="font-medium">{label}</span>
                                                    </motion.button>
                                                ))}
                                            </div>
                                        )}
                                        {menuItems.map((item, index) => (
                                            <motion.button key={index}
                                                initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: index * 0.04 }}
                                                whileHover={{ x: 8, backgroundColor: 'rgba(255,255,255,0.12)' }}
                                                whileTap={{ scale: 0.98 }}
                                                onClick={() => { item.onClick?.(); close(); }}
                                                className="w-full flex items-center gap-3 px-4 py-3 text-left transition-all border-b border-white/5 last:border-b-0"
                                            >
                                                <item.icon className="w-4 h-4 opacity-70" />
                                                <span className="font-medium text-sm">{item.label}</span>
                                            </motion.button>
                                        ))}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </div>
            </div>

            {menuOpen && (
                <div className="fixed inset-0 z-40" onClick={close} />
            )}
        </motion.header>
    );
};

export default Header;

import { motion, AnimatePresence } from 'framer-motion';
import { X, Palette, Lock, Sparkles } from 'lucide-react';
import { useState, useEffect } from 'react';
import PremiumPurchaseModal from './PremiumPurchaseModal';

const ThemeChanger = ({ currentTheme, onThemeChange, onClose }) => {
    const [purchasedThemes, setPurchasedThemes] = useState([]);
    const [selectedPremiumTheme, setSelectedPremiumTheme] = useState(null);

    // Load purchased themes from localStorage
    useEffect(() => {
        const saved = localStorage.getItem('onyx-premium-themes');
        if (saved) {
            setPurchasedThemes(JSON.parse(saved));
        }
    }, []);

    const handleUnlockTheme = (themeId) => {
        const updated = [...purchasedThemes, themeId];
        setPurchasedThemes(updated);
        localStorage.setItem('onyx-premium-themes', JSON.stringify(updated));
        setSelectedPremiumTheme(null);
    };

    const handleThemeClick = (theme) => {
        if (theme.premium && !purchasedThemes.includes(theme.id)) {
            // Show purchase modal
            setSelectedPremiumTheme(theme);
        } else {
            // Apply theme
            onThemeChange(theme.id);
        }
    };

    const freeThemes = [
        {
            id: 'terminal',
            name: 'Terminal Green',
            description: 'Classic hacker terminal aesthetic',
            gradient: 'from-green-500 via-green-600 to-green-700',
            preview: 'bg-gradient-to-br from-green-500 via-green-600 to-black',
            icon: '⌨️',
        },
        {
            id: 'cyberred',
            name: 'Cyber Red',
            description: 'High-alert cybersecurity theme',
            gradient: 'from-red-600 via-red-700 to-red-900',
            preview: 'bg-gradient-to-br from-red-600 via-red-700 to-black',
            icon: '🚨',
        },
        {
            id: 'neonblue',
            name: 'Neon Blue',
            description: 'Futuristic neon hacker interface',
            gradient: 'from-cyan-400 via-blue-500 to-blue-900',
            preview: 'bg-gradient-to-br from-cyan-400 via-blue-500 to-black',
            icon: '💠',
        },
        {
            id: 'purplehack',
            name: 'Purple Hacker',
            description: 'Elite purple hacking aesthetic',
            gradient: 'from-purple-500 via-purple-700 to-purple-900',
            preview: 'bg-gradient-to-br from-purple-500 via-purple-700 to-black',
            icon: '👾',
        },
        {
            id: 'matrix',
            name: 'Matrix Code',
            description: 'Iconic Matrix falling code style',
            gradient: 'from-green-400 via-green-500 to-green-600',
            preview: 'bg-gradient-to-br from-green-400 via-green-500 to-black',
            icon: '🔰',
        },
        {
            id: 'darkhack',
            name: 'Dark Hacker',
            description: 'Stealth mode dark operations',
            gradient: 'from-cyan-300 via-cyan-500 to-cyan-700',
            preview: 'bg-gradient-to-br from-cyan-300 via-cyan-500 to-black',
            icon: '🕶️',
        },
        {
            id: 'orange',
            name: 'Orange Alert',
            description: 'Warning level orange security',
            gradient: 'from-orange-500 via-orange-600 to-orange-800',
            preview: 'bg-gradient-to-br from-orange-500 via-orange-600 to-black',
            icon: '⚠️',
        },
        {
            id: 'gold',
            name: 'Elite Gold',
            description: 'Premium elite hacker status',
            gradient: 'from-yellow-400 via-yellow-600 to-yellow-800',
            preview: 'bg-gradient-to-br from-yellow-400 via-yellow-600 to-black',
            icon: '👑',
        },
        {
            id: 'stealth',
            name: 'Stealth Gray',
            description: 'Ghost mode grayscale operations',
            gradient: 'from-gray-400 via-gray-600 to-gray-800',
            preview: 'bg-gradient-to-br from-gray-400 via-gray-600 to-black',
            icon: '🥷',
        },
        {
            id: 'toxic',
            name: 'Toxic Green',
            description: 'Radioactive toxic hacker theme',
            gradient: 'from-lime-400 via-green-500 to-green-700',
            preview: 'bg-gradient-to-br from-lime-400 via-green-500 to-black',
            icon: '☢️',
        },
    ];

    const premiumThemes = [
        {
            id: 'neon-cyberpunk',
            name: 'Neon Cyberpunk',
            description: 'Electric pink & cyan with glowing neon effects',
            gradient: 'from-fuchsia-500 via-cyan-400 to-purple-600',
            preview: 'bg-gradient-to-br from-fuchsia-500 via-cyan-400 to-purple-900',
            icon: '💎',
            premium: true,
        },
        {
            id: 'aurora',
            name: 'Aurora Borealis',
            description: 'Northern lights gradient with ethereal shimmer',
            gradient: 'from-green-400 via-blue-500 to-purple-600',
            preview: 'bg-gradient-to-br from-green-400 via-blue-500 to-purple-600',
            icon: '✨',
            premium: true,
        },
        {
            id: 'blood-moon',
            name: 'Blood Moon',
            description: 'Gothic crimson with glowing red moon effects',
            gradient: 'from-red-900 via-red-600 to-gray-900',
            preview: 'bg-gradient-to-br from-red-900 via-red-600 to-black',
            icon: '🌙',
            premium: true,
        },
        {
            id: 'electric-storm',
            name: 'Electric Storm',
            description: 'Lightning effects with electric blue energy',
            gradient: 'from-blue-400 via-cyan-300 to-gray-700',
            preview: 'bg-gradient-to-br from-blue-400 via-cyan-300 to-gray-900',
            icon: '⚡',
            premium: true,
        },
        {
            id: 'holographic',
            name: 'Holographic',
            description: 'Rainbow iridescent color-shifting hologram',
            gradient: 'from-pink-500 via-purple-500 to-cyan-500',
            preview: 'bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500',
            icon: '🌈',
            premium: true,
        },
        {
            id: 'quantum',
            name: 'Quantum',
            description: 'Futuristic quantum computing interface',
            gradient: 'from-emerald-400 via-purple-500 to-orange-400',
            preview: 'bg-gradient-to-br from-emerald-400 via-purple-600 to-orange-500',
            icon: '⚛️',
            premium: true,
        },
        {
            id: 'synthwave',
            name: 'Synthwave',
            description: 'Retro-futuristic 80s neon aesthetic',
            gradient: 'from-pink-500 via-purple-600 to-blue-500',
            preview: 'bg-gradient-to-br from-pink-500 via-purple-600 to-blue-600',
            icon: '🎵',
            premium: true,
        },
        {
            id: 'cosmic',
            name: 'Cosmic',
            description: 'Deep space nebula with cosmic energy',
            gradient: 'from-purple-600 via-blue-500 to-pink-500',
            preview: 'bg-gradient-to-br from-purple-900 via-blue-600 to-pink-600',
            icon: '🌌',
            premium: true,
        },
        {
            id: 'vaporwave',
            name: 'Vaporwave',
            description: 'Aesthetic vaporwave with dreamy pastels',
            gradient: 'from-pink-400 via-purple-400 to-cyan-400',
            preview: 'bg-gradient-to-br from-pink-400 via-purple-400 to-cyan-400',
            icon: '🏝️',
            premium: true,
        },
        {
            id: 'crystal',
            name: 'Crystal',
            description: 'Crystalline ice with prismatic reflections',
            gradient: 'from-cyan-300 via-blue-400 to-cyan-500',
            preview: 'bg-gradient-to-br from-cyan-300 via-blue-400 to-cyan-600',
            icon: '💠',
            premium: true,
        },
        {
            id: 'ghost-protocol',
            name: 'Ghost Protocol',
            description: 'Ultra-stealth black ops hacking interface',
            gradient: 'from-green-500 via-green-600 to-black',
            preview: 'bg-gradient-to-br from-green-500 via-green-700 to-black',
            icon: '👻',
            premium: true,
        },
        {
            id: 'digital-warfare',
            name: 'Digital Warfare',
            description: 'Military-grade cyber operations command',
            gradient: 'from-green-500 via-orange-500 to-yellow-600',
            preview: 'bg-gradient-to-br from-green-600 via-orange-600 to-yellow-700',
            icon: '⚔️',
            premium: true,
        },
        {
            id: 'neon-samurai',
            name: 'Neon Samurai',
            description: 'Japanese cyberpunk warrior aesthetic',
            gradient: 'from-pink-500 via-cyan-400 to-purple-600',
            preview: 'bg-gradient-to-br from-pink-600 via-cyan-500 to-purple-700',
            icon: '🗡️',
            premium: true,
        },
        {
            id: 'dark-web',
            name: 'Dark Web',
            description: 'Deep web underground hacking network',
            gradient: 'from-red-900 via-red-700 to-black',
            preview: 'bg-gradient-to-br from-red-900 via-red-800 to-black',
            icon: '🕸️',
            premium: true,
        },
        {
            id: 'code-breaker',
            name: 'Code Breaker',
            description: 'Advanced cryptography and cipher cracking',
            gradient: 'from-cyan-400 via-yellow-500 to-pink-500',
            preview: 'bg-gradient-to-br from-cyan-500 via-yellow-600 to-pink-600',
            icon: '🔓',
            premium: true,
        },
    ];

    const themes3D = [
        { id: 'cyber-grid',  name: 'Cyber Grid',   description: 'Animated neon grid floor — pure cyberpunk', preview: 'bg-gradient-to-br from-cyan-400 via-cyan-600 to-fuchsia-700', icon: '🔷', glow: 'shadow-cyan-500/50' },
        { id: 'deep-ocean',  name: 'Deep Ocean',   description: 'Deep underwater bioluminescent abyss',      preview: 'bg-gradient-to-br from-blue-500 via-blue-700 to-cyan-900',    icon: '🌊', glow: 'shadow-blue-500/50' },
        { id: 'fire-storm',  name: 'Fire Storm',   description: 'Blazing inferno with flickering fire light', preview: 'bg-gradient-to-br from-orange-500 via-red-600 to-red-900',    icon: '🔥', glow: 'shadow-orange-500/50' },
        { id: 'glacier',     name: 'Glacier',      description: 'Arctic ice crystal with prismatic light',    preview: 'bg-gradient-to-br from-sky-200 via-blue-400 to-slate-800',    icon: '❄️', glow: 'shadow-sky-400/50' },
        { id: 'void-dark',   name: 'Void Dark',    description: 'Cosmic void energy — purple singularity',   preview: 'bg-gradient-to-br from-purple-600 via-fuchsia-700 to-black',   icon: '🌀', glow: 'shadow-purple-500/50' },
    ];

    const allThemes = [...freeThemes, ...premiumThemes, ...themes3D];

    return (
        <>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
                onClick={onClose}
            >
                <motion.div
                    initial={{ scale: 0.9, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.9, opacity: 0, y: 20 }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    onClick={(e) => e.stopPropagation()}
                    className="glass-strong rounded-2xl p-4 md:p-6 lg:p-8 max-w-5xl w-full max-h-[90vh] overflow-y-auto border-2 border-white/10 modal-mobile"
                >
                    {/* Header */}
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <div className="p-3 rounded-lg bg-gradient-to-br from-green-500 to-cyan-500 shadow-lg">
                                <Palette className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h2 className="text-xl md:text-2xl font-bold">Hacker Themes</h2>
                                <p className="text-xs md:text-sm opacity-70">Choose your hacking aesthetic</p>
                            </div>
                        </div>
                        <motion.button
                            whileHover={{ scale: 1.1, rotate: 90 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={onClose}
                            className="p-2 rounded-full glass hover:glass-strong transition-all touch-target"
                        >
                            <X className="w-6 h-6" />
                        </motion.button>
                    </div>

                    {/* Free Themes Section */}
                    <div className="mb-6">
                        <h3 className="text-lg font-bold mb-3 opacity-80">Free Themes</h3>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4">
                            {freeThemes.map((theme, index) => (
                                <motion.button
                                    key={theme.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.05, duration: 0.3 }}
                                    whileHover={{ scale: 1.05, y: -5 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => handleThemeClick(theme)}
                                    className={`relative p-4 md:p-4 rounded-xl glass hover:glass-strong transition-all duration-300 text-center touch-target ${currentTheme === theme.id ? 'ring-2 ring-green-400 shadow-lg shadow-green-500/50' : ''
                                        }`}
                                >
                                    <motion.div
                                        className="text-3xl md:text-4xl mb-2"
                                        whileHover={{ scale: 1.2, rotate: 5 }}
                                        transition={{ type: "spring", stiffness: 400 }}
                                    >
                                        {theme.icon}
                                    </motion.div>
                                    <div className={`w-full h-12 md:h-16 rounded-lg ${theme.preview} mb-3 shadow-lg border border-white/20`} />
                                    <h3 className="text-xs md:text-sm font-bold mb-1">{theme.name}</h3>
                                    <p className="text-xs opacity-70 leading-tight hidden md:block">{theme.description}</p>
                                    {currentTheme === theme.id && (
                                        <motion.div
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            transition={{ type: "spring", stiffness: 500, damping: 15 }}
                                            className="absolute top-2 right-2 w-6 h-6 rounded-full bg-green-500 flex items-center justify-center shadow-lg shadow-green-500/50"
                                        >
                                            <span className="text-white text-xs font-bold">✓</span>
                                        </motion.div>
                                    )}
                                </motion.button>
                            ))}
                        </div>
                    </div>

                    {/* Premium Themes Section */}
                    <div>
                        <div className="flex items-center gap-2 mb-3">
                            <h3 className="text-lg font-bold bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
                                Premium Themes
                            </h3>
                            <Sparkles className="w-5 h-5 text-yellow-400" />
                            <span className="text-xs opacity-60">₹9 each</span>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4">
                            {premiumThemes.map((theme, index) => {
                                const isUnlocked = purchasedThemes.includes(theme.id);
                                return (
                                    <motion.button
                                        key={theme.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: (index + freeThemes.length) * 0.05, duration: 0.3 }}
                                        whileHover={{ scale: 1.05, y: -5 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => handleThemeClick(theme)}
                                        className={`relative p-4 rounded-xl glass hover:glass-strong transition-all duration-300 text-center touch-target border-2 ${isUnlocked ? 'border-yellow-500/50' : 'border-yellow-500/30'
                                            } ${currentTheme === theme.id ? 'ring-2 ring-yellow-400 shadow-lg shadow-yellow-500/50' : ''}`}
                                    >
                                        {/* PRO Badge */}
                                        <motion.div
                                            className="absolute top-1 left-1 bg-gradient-to-r from-yellow-400 to-orange-500 text-black text-[8px] md:text-[10px] font-bold px-1.5 py-0.5 rounded"
                                            whileHover={{ scale: 1.1 }}
                                        >
                                            PRO
                                        </motion.div>

                                        <motion.div
                                            className="text-3xl md:text-4xl mb-2"
                                            whileHover={{ scale: 1.2, rotate: isUnlocked ? 5 : 0 }}
                                            transition={{ type: "spring", stiffness: 400 }}
                                        >
                                            {theme.icon}
                                        </motion.div>
                                        <div className={`w-full h-12 md:h-16 rounded-lg ${theme.preview} mb-3 shadow-lg border border-white/20 relative overflow-hidden`}>
                                            {!isUnlocked && (
                                                <motion.div
                                                    className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center"
                                                    whileHover={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
                                                >
                                                    <Lock className="w-6 h-6 text-white" />
                                                </motion.div>
                                            )}
                                        </div>
                                        <h3 className="text-xs md:text-sm font-bold mb-1">{theme.name}</h3>
                                        <p className="text-xs opacity-70 leading-tight hidden md:block">{theme.description}</p>

                                        {!isUnlocked && (
                                            <div className="mt-2 text-xs font-bold text-yellow-400">
                                                UNLOCK ₹9
                                            </div>
                                        )}

                                        {currentTheme === theme.id && isUnlocked && (
                                            <motion.div
                                                initial={{ scale: 0 }}
                                                animate={{ scale: 1 }}
                                                transition={{ type: "spring", stiffness: 500, damping: 15 }}
                                                className="absolute top-2 right-2 w-6 h-6 rounded-full bg-yellow-500 flex items-center justify-center shadow-lg shadow-yellow-500/50"
                                            >
                                                <span className="text-black text-xs font-bold">✓</span>
                                            </motion.div>
                                        )}
                                    </motion.button>
                                );
                            })}
                        </div>
                    </div>

                    {/* ── 3D Themes Section ── */}
                    <div className="mt-6">
                        <div className="flex items-center gap-2 mb-3">
                            <h3 className="text-lg font-bold bg-gradient-to-r from-cyan-400 via-fuchsia-400 to-purple-400 bg-clip-text text-transparent">
                                3D Special Themes
                            </h3>
                            <span className="text-lg">✨</span>
                            <span className="badge bg-gradient-to-r from-cyan-500 to-fuchsia-500 text-white ml-1">FREE</span>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4">
                            {themes3D.map((theme, index) => (
                                <motion.button
                                    key={theme.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.07, duration: 0.3 }}
                                    whileHover={{ scale: 1.06, y: -6 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => onThemeChange(theme.id)}
                                    className={`relative p-4 rounded-xl glass hover:glass-strong transition-all duration-300 text-center touch-target border-2 border-cyan-500/30 card-3d ${
                                        currentTheme === theme.id ? `ring-2 ring-cyan-400 shadow-lg ${theme.glow}` : ''
                                    }`}
                                >
                                    {/* 3D badge */}
                                    <motion.div
                                        className="absolute top-1 left-1 text-[9px] font-black px-1.5 py-0.5 rounded bg-gradient-to-r from-cyan-400 to-fuchsia-500 text-black"
                                        whileHover={{ scale: 1.1 }}
                                    >
                                        3D
                                    </motion.div>
                                    <motion.div className="text-3xl md:text-4xl mb-2"
                                        whileHover={{ scale: 1.2, rotate: 10 }}
                                        transition={{ type: 'spring', stiffness: 400 }}
                                    >
                                        {theme.icon}
                                    </motion.div>
                                    <div className={`w-full h-12 md:h-16 rounded-lg ${theme.preview} mb-3 shadow-lg border border-white/20 shimmer`} />
                                    <h3 className="text-xs md:text-sm font-bold mb-1">{theme.name}</h3>
                                    <p className="text-xs opacity-60 leading-tight hidden md:block">{theme.description}</p>
                                    {currentTheme === theme.id && (
                                        <motion.div
                                            initial={{ scale: 0 }} animate={{ scale: 1 }}
                                            className="absolute top-2 right-2 w-6 h-6 rounded-full bg-gradient-to-br from-cyan-400 to-fuchsia-500 flex items-center justify-center"
                                        >
                                            <span className="text-black text-xs font-bold">✓</span>
                                        </motion.div>
                                    )}
                                </motion.button>
                            ))}
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="mt-6 pt-6 border-t border-white/10 text-center">
                        <p className="text-xs opacity-60">
                            🔐 All themes feature professional hacking aesthetics with advanced visual effects
                        </p>
                        <p className="text-xs opacity-40 mt-1">
                            Premium themes unlock forever • One-time payment
                        </p>
                    </div>

                </motion.div>
            </motion.div>

            {/* Premium Purchase Modal */}
            <AnimatePresence>
                {selectedPremiumTheme && (
                    <PremiumPurchaseModal
                        theme={selectedPremiumTheme}
                        onClose={() => setSelectedPremiumTheme(null)}
                        onUnlock={handleUnlockTheme}
                    />
                )}
            </AnimatePresence>
        </>
    );
};

export default ThemeChanger;

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Header from './components/Header';
import EncryptionPanel from './components/EncryptionPanel';
import ThemeChanger from './components/ThemeChanger';
import AboutDeveloper from './components/AboutDeveloper';
import AboutApp from './components/AboutApp';
import FeedbackForm from './components/FeedbackForm';
import DonateModal from './components/DonateModal';
import OtherApps from './components/OtherApps';
import AuthModal from './components/AuthModal';
import UserProfile from './components/UserProfile';
import HistoryPanel from './components/HistoryPanel';
import KeyVaultPanel from './components/KeyVaultPanel';
import SettingsPanel from './components/SettingsPanel';
import useKeyboardShortcuts from './hooks/useKeyboardShortcuts';
import { useAuth } from './context/AuthContext';

const THEME_PRIMARY = {
    terminal:'#00ff41', cyberred:'#ff0040', neonblue:'#00d9ff', purplehack:'#b400ff',
    matrix:'#00ff00', darkhack:'#00ffff', orange:'#ff6600', gold:'#ffd700',
    stealth:'#888888', toxic:'#39ff14',
    'cyber-grid':'#00f5ff', 'deep-ocean':'#006fff', 'fire-storm':'#ff4500',
    glacier:'#a8edff', 'void-dark':'#9d00ff',
};

function App() {
    const [theme, setTheme] = useState('terminal');
    const { isLoggedIn } = useAuth();

    // Existing modals
    const [showThemeChanger, setShowThemeChanger] = useState(false);
    const [showAbout,        setShowAbout]        = useState(false);
    const [showAboutApp,     setShowAboutApp]     = useState(false);
    const [showFeedback,     setShowFeedback]     = useState(false);
    const [showDonate,       setShowDonate]       = useState(false);
    const [showOtherApps,    setShowOtherApps]    = useState(false);

    // Phase 3 modals
    const [showAuth,         setShowAuth]         = useState(false);
    const [showProfile,      setShowProfile]      = useState(false);
    const [showHistory,      setShowHistory]      = useState(false);
    const [showKeyVault,     setShowKeyVault]     = useState(false);
    const [showSettings,     setShowSettings]     = useState(false);

    const allModals = [
        showThemeChanger, showAbout, showAboutApp, showFeedback, showDonate,
        showOtherApps, showAuth, showProfile, showHistory, showKeyVault, showSettings,
    ];

    // Keyboard shortcuts (Phase 4)
    useKeyboardShortcuts({
        isLoggedIn,
        onLogin:    () => setShowAuth(true),
        onProfile:  () => setShowProfile(true),
        onHistory:  () => setShowHistory(true),
        onKeyVault: () => setShowKeyVault(true),
        onSettings: () => setShowSettings(true),
        onTheme:    () => setShowThemeChanger(true),
    });

    // Load theme
    useEffect(() => {
        const saved = localStorage.getItem('ciphervault-theme');
        if (saved) setTheme(saved);
    }, []);
    useEffect(() => {
        localStorage.setItem('ciphervault-theme', theme);
    }, [theme]);

    // Android back button
    useEffect(() => {
        const handle = (e) => {
            if (allModals.some(Boolean)) {
                e.preventDefault();
                if (showSettings)     setShowSettings(false);
                else if (showKeyVault) setShowKeyVault(false);
                else if (showHistory)  setShowHistory(false);
                else if (showProfile)  setShowProfile(false);
                else if (showAuth)     setShowAuth(false);
                else if (showOtherApps) setShowOtherApps(false);
                else if (showDonate)   setShowDonate(false);
                else if (showFeedback) setShowFeedback(false);
                else if (showAboutApp) setShowAboutApp(false);
                else if (showAbout)    setShowAbout(false);
                else if (showThemeChanger) setShowThemeChanger(false);
                return false;
            }
        };
        window.addEventListener('popstate', handle);
        return () => window.removeEventListener('popstate', handle);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [...allModals]);

    useEffect(() => {
        if (allModals.some(Boolean)) window.history.pushState({ modal: true }, '');
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [...allModals]);

    return (
        <div className={`min-h-screen theme-${theme} transition-all duration-500 scanlines`}>
            {/* Animated orb particles */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                {[...Array(6)].map((_, i) => {
                    const primary = THEME_PRIMARY[theme] || '#00ff41';
                    const size = 200 + i * 80;
                    return (
                        <motion.div key={i}
                            className="absolute rounded-full opacity-10"
                            style={{
                                width: size, height: size,
                                left: `${10 + i * 15}%`,
                                top: `${5 + (i % 3) * 30}%`,
                                background: `radial-gradient(circle, ${primary}60 0%, transparent 70%)`,
                                filter: 'blur(40px)',
                            }}
                            animate={{
                                x: [0, 30, -20, 0], y: [0, -40, 20, 0],
                                scale: [1, 1.1, 0.95, 1],
                            }}
                            transition={{
                                duration: 12 + i * 3,
                                repeat: Infinity,
                                delay: i * 1.5,
                                ease: 'easeInOut',
                            }}
                        />
                    );
                })}
                {/* Tiny star particles */}
                {[...Array(20)].map((_, i) => (
                    <motion.div key={`s${i}`}
                        className="absolute w-0.5 h-0.5 bg-white rounded-full"
                        style={{ left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%` }}
                        animate={{ opacity: [0, 0.6, 0], scale: [0, 1.5, 0] }}
                        transition={{ duration: 3 + Math.random() * 3, repeat: Infinity, delay: Math.random() * 5 }}
                    />
                ))}
            </div>

            <div className="relative z-10">
                <Header
                    theme={theme}
                    onThemeClick={() => setShowThemeChanger(true)}
                    onAboutClick={() => setShowAbout(true)}
                    onAboutAppClick={() => setShowAboutApp(true)}
                    onFeedbackClick={() => setShowFeedback(true)}
                    onDonateClick={() => setShowDonate(true)}
                    onOtherAppsClick={() => setShowOtherApps(true)}
                    onLoginClick={() => setShowAuth(true)}
                    onProfileClick={() => setShowProfile(true)}
                    onHistoryClick={() => setShowHistory(true)}
                    onKeyVaultClick={() => setShowKeyVault(true)}
                    onSettingsClick={() => setShowSettings(true)}
                    onDashboardClick={() => setShowHistory(true)}
                />

                <main className="container mx-auto px-4 py-8 max-w-6xl">
                    <EncryptionPanel theme={theme} />
                </main>

                <footer className="text-center py-6 opacity-50 text-sm font-mono">
                    <p>🔐 Onyx v3.0 | Made with ❤️ in India 🇮🇳</p>
                    <p className="text-xs mt-1">Elite Hacker Edition | AES-256 · QR · File Vault · Cipher Lab</p>
                </footer>
            </div>

            {/* All Modals */}
            <AnimatePresence>
                {showThemeChanger && <ThemeChanger currentTheme={theme} onThemeChange={(t) => { setTheme(t); setShowThemeChanger(false); }} onClose={() => setShowThemeChanger(false)} />}
                {showAbout        && <AboutDeveloper theme={theme} onClose={() => setShowAbout(false)} />}
                {showAboutApp     && <AboutApp theme={theme} onClose={() => setShowAboutApp(false)} />}
                {showFeedback     && <FeedbackForm theme={theme} onClose={() => setShowFeedback(false)} />}
                {showDonate       && <DonateModal theme={theme} onClose={() => setShowDonate(false)} />}
                {showOtherApps    && <OtherApps theme={theme} onClose={() => setShowOtherApps(false)} />}

                {/* Phase 3 modals */}
                {showAuth         && <AuthModal theme={theme} onClose={() => setShowAuth(false)} />}
                {showProfile      && <UserProfile theme={theme} onClose={() => setShowProfile(false)} />}
                {showHistory      && <HistoryPanel theme={theme} onClose={() => setShowHistory(false)} />}
                {showKeyVault     && <KeyVaultPanel theme={theme} onClose={() => setShowKeyVault(false)} />}
                {showSettings     && <SettingsPanel theme={theme} onClose={() => setShowSettings(false)} />}
            </AnimatePresence>
        </div>
    );
}

export default App;

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Unlock, Copy, Share2, Clipboard, Trash2, Key, FileText, QrCode, FolderLock, FlaskConical } from 'lucide-react';
import { encryptMessage, decryptMessage } from '../utils/encryption';
import { copyToClipboard, pasteFromClipboard, shareText } from '../utils/clipboard';
import { useUser } from '../context/UserContext';
import QRCodePanel from './QRCodePanel';
import FileVaultPanel from './FileVaultPanel';
import CipherLabPanel from './CipherLabPanel';
import toast from '../utils/toast.jsx';

const THEME_COLORS = {
    terminal: { primary: '#00ff41', secondary: '#00cc33', glow: 'glow-terminal' },
    cyberred: { primary: '#ff0040', secondary: '#cc0033', glow: 'glow-cyberred' },
    neonblue: { primary: '#00d9ff', secondary: '#0099cc', glow: 'glow-neonblue' },
    purplehack: { primary: '#b400ff', secondary: '#8800cc', glow: 'glow-purplehack' },
    matrix: { primary: '#00ff00', secondary: '#00cc00', glow: 'glow-matrix' },
    darkhack: { primary: '#00ffff', secondary: '#00cccc', glow: 'glow-darkhack' },
    orange: { primary: '#ff6600', secondary: '#cc5200', glow: 'glow-orange' },
    gold: { primary: '#ffd700', secondary: '#ccac00', glow: 'glow-gold' },
    stealth: { primary: '#888888', secondary: '#666666', glow: 'glow-stealth' },
    toxic: { primary: '#39ff14', secondary: '#2dcc10', glow: 'glow-toxic' },
};

// ── Tab definitions ───────────────────────────────────────────────────────────
const TABS = [
    { id: 'text',    label: 'Text',       icon: FileText,     desc: 'AES Encrypt' },
    { id: 'qr',      label: 'QR Code',    icon: QrCode,       desc: 'QR Encrypt' },
    { id: 'file',    label: 'File Vault', icon: FolderLock,   desc: 'File Encrypt' },
    { id: 'lab',     label: 'Cipher Lab', icon: FlaskConical, desc: 'Fun Ciphers' },
];

// ── Text Encryption Panel (inner component) ───────────────────────────────────
const TextEncryptPanel = ({ theme, themeColors }) => {
    const { addToHistory } = useUser();
    const [mode, setMode] = useState('encode');
    const [inputText, setInputText] = useState('');
    const [outputText, setOutputText] = useState('');
    const [password, setPassword] = useState('');

    const clearAll = () => { setInputText(''); setOutputText(''); setPassword(''); };

    const handleEncrypt = () => {
        if (!inputText.trim()) { toast.error('Please enter a message'); return; }
        try {
            const encrypted = encryptMessage(inputText, password);
            setOutputText(encrypted);
            addToHistory({ mode: 'encode', cipherType: 'text', inputPreview: inputText, outputPreview: encrypted, hasPassword: !!password });
            toast.success('Message encrypted!');
        } catch (err) { toast.error(err.message); }
    };

    const handleDecrypt = () => {
        if (!inputText.trim()) { toast.error('Please enter encrypted text'); return; }
        try {
            const decrypted = decryptMessage(inputText, password);
            setOutputText(decrypted);
            addToHistory({ mode: 'decode', cipherType: 'text', inputPreview: inputText, outputPreview: decrypted, hasPassword: !!password });
            toast.success('Message decrypted!');
        } catch (err) { toast.error(err.message); }
    };

    const handlePaste = async () => {
        const text = await pasteFromClipboard();
        if (text) { setInputText(text); toast.success('Pasted!'); }
    };

    const handleCopy = async () => {
        if (!outputText) { toast.error('Nothing to copy'); return; }
        const ok = await copyToClipboard(outputText);
        if (ok) toast.success('Copied to clipboard!');
    };

    const handleShare = async () => {
        if (!outputText) { toast.error('Nothing to share'); return; }
        await shareText(outputText);
        toast.success('Shared!');
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.35 }}
        >
            {/* Encode / Decode switcher */}
            <div className="flex justify-center gap-3 mb-5">
                {[
                    { id: 'encode', label: 'ENCODE', icon: Lock },
                    { id: 'decode', label: 'DECODE', icon: Unlock },
                ].map(({ id, label, icon: Icon }) => (
                    <motion.button
                        key={id}
                        whileHover={{ scale: 1.05, y: -2 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => { setMode(id); clearAll(); }}
                        className={`flex-1 md:flex-none px-8 py-3 rounded-xl font-bold transition-all duration-300 border-2 touch-target ${
                            mode === id ? `glass-strong ${themeColors.glow} border-current` : 'glass opacity-60 border-transparent'
                        }`}
                        style={{ color: mode === id ? themeColors.primary : 'inherit' }}
                    >
                        <Icon className="w-4 h-4 inline mr-2" />
                        {label}
                    </motion.button>
                ))}
            </div>

            {/* Main card */}
            <div className="glass-strong rounded-2xl p-6 md:p-8 space-y-5 border-2 border-white/10">
                {/* Input */}
                <div className="space-y-2">
                    <label className="text-sm font-bold opacity-90 uppercase tracking-wide">
                        {mode === 'encode' ? '📝 Message to Encrypt' : '🔐 Encrypted Message'}
                    </label>
                    <textarea
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        placeholder={mode === 'encode' ? 'Type your secret message here...' : 'Paste encrypted message here...'}
                        className="w-full h-36 px-4 py-3 rounded-xl glass font-mono text-sm resize-none focus:outline-none border transition-all"
                        style={{ borderColor: themeColors.primary, fontSize: '16px' }}
                    />
                </div>

                {/* Password */}
                <div className="space-y-2">
                    <label className="text-sm font-bold opacity-90 uppercase tracking-wide flex items-center gap-2">
                        <Key className="w-4 h-4" /> Password <span className="text-xs font-normal opacity-50">(optional)</span>
                    </label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && (mode === 'encode' ? handleEncrypt() : handleDecrypt())}
                        placeholder="Extra security key..."
                        className="w-full px-4 py-3 rounded-xl glass font-mono text-sm focus:outline-none border transition-all"
                        style={{ borderColor: themeColors.primary, fontSize: '16px' }}
                    />
                </div>

                {/* Action buttons */}
                <div className="flex flex-col md:flex-row gap-3">
                    <motion.button
                        whileHover={{ scale: 1.03, y: -2 }}
                        whileTap={{ scale: 0.96 }}
                        onClick={mode === 'encode' ? handleEncrypt : handleDecrypt}
                        className={`w-full md:flex-1 px-6 py-4 rounded-xl font-bold text-black ${themeColors.glow} shadow-lg border-2`}
                        style={{ backgroundColor: themeColors.primary, borderColor: themeColors.secondary }}
                    >
                        {mode === 'encode'
                            ? <><Lock className="w-5 h-5 inline mr-2" />ENCRYPT MESSAGE</>
                            : <><Unlock className="w-5 h-5 inline mr-2" />DECRYPT MESSAGE</>}
                    </motion.button>
                    <div className="flex gap-3">
                        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                            onClick={handlePaste}
                            className="flex-1 md:flex-none px-5 py-4 rounded-xl glass hover:glass-strong border border-white/20 touch-target"
                        >
                            <Clipboard className="w-5 h-5 inline mr-2" />Paste
                        </motion.button>
                        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                            onClick={clearAll}
                            className="flex-1 md:flex-none px-5 py-4 rounded-xl glass hover:glass-strong border border-white/20 touch-target"
                        >
                            <Trash2 className="w-5 h-5 inline mr-2" />Clear
                        </motion.button>
                    </div>
                </div>

                {/* Output */}
                <AnimatePresence>
                    {outputText && (
                        <motion.div
                            initial={{ opacity: 0, height: 0, scale: 0.95 }}
                            animate={{ opacity: 1, height: 'auto', scale: 1 }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.3, type: 'spring', stiffness: 200 }}
                            className="space-y-2"
                        >
                            <label className="text-sm font-bold opacity-90 uppercase tracking-wide">
                                {mode === 'encode' ? '🔒 Encrypted Output' : '✅ Decrypted Message'}
                            </label>
                            <div className="relative">
                                <textarea
                                    value={outputText}
                                    readOnly
                                    className="w-full h-36 px-4 py-3 rounded-xl glass font-mono text-sm resize-none focus:outline-none border border-white/10"
                                />
                                <div className="absolute top-2 right-2 flex gap-2">
                                    <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                                        onClick={handleCopy} title="Copy"
                                        className="p-2 rounded-lg glass-strong hover:bg-white/20"
                                    >
                                        <Copy className="w-4 h-4" />
                                    </motion.button>
                                    <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                                        onClick={handleShare} title="Share"
                                        className="p-2 rounded-lg glass-strong hover:bg-white/20"
                                    >
                                        <Share2 className="w-4 h-4" />
                                    </motion.button>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </motion.div>
    );
};

// ── Main EncryptionPanel Hub ──────────────────────────────────────────────────
const EncryptionPanel = ({ theme }) => {
    const [activeTab, setActiveTab] = useState('text');
    const themeColors = THEME_COLORS[theme] || THEME_COLORS.terminal;

    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2, type: 'spring', stiffness: 100 }}
            className="space-y-6"
        >
            {/* ── Tab Bar ── */}
            <div className="flex gap-2 md:gap-3 p-2 glass-strong rounded-2xl border border-white/10">
                {TABS.map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;
                    return (
                        <motion.button
                            key={tab.id}
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.97 }}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex-1 flex flex-col items-center gap-1 py-3 px-2 rounded-xl font-bold text-xs md:text-sm transition-all duration-300 relative ${
                                isActive ? 'glass-strong' : 'hover:bg-white/5 opacity-60'
                            }`}
                            style={{ color: isActive ? themeColors.primary : 'inherit' }}
                        >
                            <Icon className="w-5 h-5" />
                            <span className="font-bold">{tab.label}</span>
                            <span className="text-[10px] opacity-50 hidden md:block">{tab.desc}</span>
                            {isActive && (
                                <motion.div
                                    layoutId="activeTabIndicator"
                                    className="absolute bottom-0 left-1/4 right-1/4 h-0.5 rounded-full"
                                    style={{ backgroundColor: themeColors.primary }}
                                />
                            )}
                        </motion.button>
                    );
                })}
            </div>

            {/* ── Tab Content ── */}
            <AnimatePresence mode="wait">
                <motion.div key={activeTab}>
                    {activeTab === 'text' && (
                        <TextEncryptPanel theme={theme} themeColors={themeColors} />
                    )}
                    {activeTab === 'qr' && (
                        <QRCodePanel theme={theme} />
                    )}
                    {activeTab === 'file' && (
                        <FileVaultPanel theme={theme} />
                    )}
                    {activeTab === 'lab' && (
                        <CipherLabPanel theme={theme} />
                    )}
                </motion.div>
            </AnimatePresence>
        </motion.div>
    );
};

export default EncryptionPanel;

import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, Lock, Unlock, FileText, X, CheckCircle, AlertCircle, FolderOpen } from 'lucide-react';
import { encryptFile, decryptFile, isOnyxFile, getFileTypeInfo, formatFileSize, SUPPORTED_TYPES } from '../utils/fileEncryption';
import { useUser } from '../context/UserContext';
import toast from '../utils/toast.jsx';

const THEME_COLORS = {
    terminal: '#00ff41', cyberred: '#ff0040', neonblue: '#00d9ff',
    purplehack: '#b400ff', matrix: '#00ff00', darkhack: '#00ffff',
    orange: '#ff6600', gold: '#ffd700', stealth: '#888888', toxic: '#39ff14',
};

const FileVaultPanel = ({ theme }) => {
    const { addToHistory } = useUser();
    const primaryColor = THEME_COLORS[theme] || THEME_COLORS.terminal;

    const [subMode, setSubMode] = useState('encrypt'); // 'encrypt' | 'decrypt'
    const [selectedFile, setSelectedFile] = useState(null);
    const [password, setPassword] = useState('');
    const [isDragging, setIsDragging] = useState(false);
    const [progress, setProgress] = useState(0);
    const [isProcessing, setIsProcessing] = useState(false);
    const [result, setResult] = useState(null); // { success, filename, size }
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const fileInputRef = useRef(null);

    const resetState = () => {
        setSelectedFile(null);
        setPassword('');
        setProgress(0);
        setResult(null);
        setError('');
    };

    // File validation
    const validateFile = useCallback((file) => {
        if (!file) return 'No file selected';
        if (subMode === 'decrypt' && !isOnyxFile(file)) {
            return 'Please upload a .onyx encrypted file';
        }
        if (subMode === 'encrypt' && file.size > 50 * 1024 * 1024) {
            return 'File too large (max 50MB)';
        }
        return null;
    }, [subMode]);

    const handleFileSelect = useCallback((file) => {
        if (!file) return;
        const validationError = validateFile(file);
        if (validationError) { toast.error(validationError); return; }
        setSelectedFile(file);
        setResult(null);
        setError('');
    }, [validateFile]);

    // Drag & Drop handlers
    const handleDrop = useCallback((e) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files?.[0];
        handleFileSelect(file);
    }, [handleFileSelect]);

    const handleDragOver = useCallback((e) => { e.preventDefault(); setIsDragging(true); }, []);
    const handleDragLeave = useCallback(() => setIsDragging(false), []);

    // Process file
    const handleProcess = async () => {
        if (!selectedFile) { toast.error('Please select a file first'); return; }
        if (!password.trim()) { toast.error('Password is required'); return; }

        setIsProcessing(true);
        setError('');
        setProgress(0);

        try {
            let res;
            if (subMode === 'encrypt') {
                res = await encryptFile(selectedFile, password, setProgress);
                addToHistory({
                    mode: 'encode', cipherType: 'file',
                    inputPreview: selectedFile.name,
                    outputPreview: res.filename,
                    hasPassword: true,
                    fileName: selectedFile.name,
                });
                toast.success(`✓ File encrypted as ${res.filename}`);
            } else {
                res = await decryptFile(selectedFile, password, setProgress);
                addToHistory({
                    mode: 'decode', cipherType: 'file',
                    inputPreview: selectedFile.name,
                    outputPreview: res.filename,
                    hasPassword: true,
                    fileName: res.filename,
                });
                toast.success(`✓ File restored: ${res.filename}`);
            }
            setResult(res);
        } catch (err) {
            setError(err.message);
            setProgress(0);
            toast.error(err.message);
        } finally {
            setIsProcessing(false);
        }
    };

    const fileInfo = selectedFile ? getFileTypeInfo(selectedFile) : null;
    const isDecryptMode = subMode === 'decrypt';

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
            className="space-y-5"
        >
            {/* Sub-mode switcher */}
            <div className="flex gap-3 justify-center">
                {[
                    { id: 'encrypt', label: '🔒 Encrypt File', desc: 'Lock any document' },
                    { id: 'decrypt', label: '🔓 Decrypt File', desc: 'Restore .onyx file' },
                ].map((m) => (
                    <motion.button
                        key={m.id}
                        whileHover={{ scale: 1.04, y: -2 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => { setSubMode(m.id); resetState(); }}
                        className={`flex-1 py-3 px-4 rounded-xl font-bold transition-all duration-300 border-2 text-sm ${
                            subMode === m.id ? 'glass-strong border-current' : 'glass opacity-60 border-transparent'
                        }`}
                        style={{ color: subMode === m.id ? primaryColor : 'inherit' }}
                    >
                        {m.label}
                        <span className="block text-xs font-normal opacity-60 mt-0.5">{m.desc}</span>
                    </motion.button>
                ))}
            </div>

            <div className="glass-strong rounded-2xl p-6 space-y-5 border-2 border-white/10">
                {/* Supported formats hint (encrypt mode only) */}
                {!isDecryptMode && (
                    <div className="flex flex-wrap gap-2">
                        {Object.values(SUPPORTED_TYPES).filter((v, i, arr) => arr.findIndex(x => x.label === v.label) === i).map((t) => (
                            <span key={t.label} className="text-xs px-2 py-1 rounded-full glass border border-white/10 opacity-70">
                                {t.icon} {t.label}
                            </span>
                        ))}
                        <span className="text-xs px-2 py-1 rounded-full glass border border-white/10 opacity-70">📂 Any file</span>
                    </div>
                )}

                {/* Drop zone */}
                <AnimatePresence mode="wait">
                    {!selectedFile ? (
                        <motion.div
                            key="dropzone"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onDrop={handleDrop}
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onClick={() => fileInputRef.current?.click()}
                            className={`relative border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all duration-300 ${
                                isDragging ? 'border-current scale-[1.02]' : 'border-white/20 hover:border-white/40'
                            }`}
                            style={isDragging ? { borderColor: primaryColor, background: `${primaryColor}10` } : {}}
                        >
                            <motion.div
                                animate={isDragging ? { scale: 1.2, rotate: -5 } : { scale: 1, rotate: 0 }}
                                transition={{ type: 'spring', stiffness: 300 }}
                            >
                                <FolderOpen className="w-14 h-14 mx-auto mb-3 opacity-40" />
                            </motion.div>
                            <p className="font-bold text-lg mb-1">
                                {isDecryptMode ? 'Drop your .onyx file here' : 'Drop your file here'}
                            </p>
                            <p className="text-sm opacity-50">or click to browse</p>
                            {isDragging && (
                                <motion.div
                                    initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                                    className="absolute inset-0 rounded-2xl flex items-center justify-center"
                                    style={{ background: `${primaryColor}15` }}
                                >
                                    <p className="text-xl font-bold" style={{ color: primaryColor }}>Drop it! 🎯</p>
                                </motion.div>
                            )}
                            <input
                                ref={fileInputRef}
                                type="file"
                                className="hidden"
                                accept={isDecryptMode ? '.onyx,.json' : undefined}
                                onChange={(e) => handleFileSelect(e.target.files?.[0])}
                            />
                        </motion.div>
                    ) : (
                        <motion.div
                            key="filecard"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="flex items-center gap-4 p-4 rounded-xl border border-white/20 glass"
                        >
                            <div className="text-4xl">{fileInfo?.icon || '📂'}</div>
                            <div className="flex-1 min-w-0">
                                <p className="font-bold truncate">{selectedFile.name}</p>
                                <p className="text-xs opacity-50">{formatFileSize(selectedFile.size)} · {fileInfo?.label || 'File'}</p>
                            </div>
                            <motion.button
                                whileHover={{ scale: 1.1, rotate: 90 }} whileTap={{ scale: 0.9 }}
                                onClick={resetState}
                                className="p-2 rounded-full glass-strong border border-white/20 flex-shrink-0"
                            >
                                <X className="w-4 h-4" />
                            </motion.button>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Password field */}
                <div className="space-y-2">
                    <label className="text-sm font-bold uppercase tracking-wide opacity-90 flex items-center gap-2">
                        🔑 {isDecryptMode ? 'Decryption' : 'Encryption'} Password
                        <span className="text-red-400 text-xs font-normal">(required)</span>
                    </label>
                    <div className="relative">
                        <input
                            type={showPassword ? 'text' : 'password'}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleProcess()}
                            placeholder="Enter a strong password..."
                            className="w-full px-4 py-3 pr-12 rounded-xl glass font-mono text-sm focus:outline-none border border-white/10"
                            style={{ borderColor: primaryColor, fontSize: '16px' }}
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword((v) => !v)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 opacity-50 hover:opacity-100 transition-opacity"
                        >
                            {showPassword ? '🙈' : '👁️'}
                        </button>
                    </div>
                    {!isDecryptMode && (
                        <p className="text-xs opacity-40">⚠️ Save your password — if lost, the file cannot be recovered</p>
                    )}
                </div>

                {/* Progress bar */}
                <AnimatePresence>
                    {isProcessing && (
                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
                            <div className="flex justify-between text-xs opacity-60 mb-1">
                                <span>{isDecryptMode ? 'Decrypting...' : 'Encrypting...'}</span>
                                <span>{progress}%</span>
                            </div>
                            <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
                                <motion.div
                                    className="h-full rounded-full"
                                    style={{ backgroundColor: primaryColor }}
                                    initial={{ width: '0%' }}
                                    animate={{ width: `${progress}%` }}
                                    transition={{ duration: 0.3 }}
                                />
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Error message */}
                <AnimatePresence>
                    {error && (
                        <motion.div
                            initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                            className="flex items-center gap-3 p-3 rounded-xl bg-red-500/15 border border-red-500/40"
                        >
                            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                            <p className="text-sm text-red-300">{error}</p>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Success result */}
                <AnimatePresence>
                    {result && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                            className="flex items-center gap-3 p-4 rounded-xl border-2"
                            style={{ borderColor: `${primaryColor}60`, background: `${primaryColor}10` }}
                        >
                            <CheckCircle className="w-6 h-6 flex-shrink-0" style={{ color: primaryColor }} />
                            <div>
                                <p className="font-bold text-sm" style={{ color: primaryColor }}>
                                    {isDecryptMode ? '✅ File Decrypted!' : '✅ File Encrypted!'}
                                </p>
                                <p className="text-xs opacity-70 mt-0.5">Saved as: {result.filename}</p>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Action button */}
                <motion.button
                    whileHover={{ scale: 1.03, y: -2 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={handleProcess}
                    disabled={isProcessing || !selectedFile || !password.trim()}
                    className="w-full py-4 rounded-xl font-bold text-black shadow-lg transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    style={{ backgroundColor: primaryColor }}
                >
                    {isProcessing ? (
                        <>
                            <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                                className="w-5 h-5 border-2 border-black border-t-transparent rounded-full" />
                            {isDecryptMode ? 'Decrypting...' : 'Encrypting...'}
                        </>
                    ) : isDecryptMode ? (
                        <><Unlock className="w-5 h-5" /> Decrypt & Restore File</>
                    ) : (
                        <><Lock className="w-5 h-5" /> Encrypt & Save File</>
                    )}
                </motion.button>

                {/* Info box */}
                {!isDecryptMode && (
                    <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                        <p className="text-xs opacity-60 leading-relaxed">
                            🔐 Your file is encrypted with <strong>AES-256</strong> and saved as a <code className="bg-white/10 px-1 rounded">.onyx</code> file.
                            Share it safely — only someone with your password can decrypt it using Onyx.
                        </p>
                    </div>
                )}
            </div>
        </motion.div>
    );
};

export default FileVaultPanel;

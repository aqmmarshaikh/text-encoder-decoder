import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { QrCode, Camera, Upload, Download, Share2, X, RefreshCw, Eye } from 'lucide-react';
import { encryptMessage, decryptMessage } from '../utils/encryption';
import { useUser } from '../context/UserContext';
import toast from '../utils/toast.jsx';

// Dynamically import heavy QR libs to keep initial bundle small
let QRCodeLib = null;
let jsQR = null;
let libsLoadError = null;

const loadLibs = async () => {
    if (QRCodeLib && jsQR) return; // already loaded
    try {
        const [qrMod, jsqrMod] = await Promise.all([
            import('qrcode').catch(() => null),
            import('jsqr').catch(() => null),
        ]);
        QRCodeLib = qrMod?.default || null;
        jsQR = jsqrMod?.default || null;
        if (!QRCodeLib || !jsQR) {
            libsLoadError = 'QR libraries not installed. Run: npm install qrcode jsqr';
        }
    } catch (err) {
        libsLoadError = 'QR libraries not installed. Run: npm install qrcode jsqr';
    }
};

const THEME_COLORS = {
    terminal: { primary: '#00ff41', glow: '#00ff4140' },
    cyberred: { primary: '#ff0040', glow: '#ff004040' },
    neonblue: { primary: '#00d9ff', glow: '#00d9ff40' },
    purplehack: { primary: '#b400ff', glow: '#b400ff40' },
    matrix: { primary: '#00ff00', glow: '#00ff0040' },
    darkhack: { primary: '#00ffff', glow: '#00ffff40' },
    orange: { primary: '#ff6600', glow: '#ff660040' },
    gold: { primary: '#ffd700', glow: '#ffd70040' },
    stealth: { primary: '#888888', glow: '#88888840' },
    toxic: { primary: '#39ff14', glow: '#39ff1440' },
};

const QRCodePanel = ({ theme }) => {
    const { addToHistory } = useUser();
    const colors = THEME_COLORS[theme] || THEME_COLORS.terminal;

    const [subMode, setSubMode] = useState('generate'); // 'generate' | 'scan'
    const [message, setMessage] = useState('');
    const [password, setPassword] = useState('');
    const [qrDataUrl, setQrDataUrl] = useState('');
    const [encryptedText, setEncryptedText] = useState('');
    const [scannedEncrypted, setScannedEncrypted] = useState('');
    const [decryptedMessage, setDecryptedMessage] = useState('');
    const [scanPassword, setScanPassword] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [isCameraActive, setIsCameraActive] = useState(false);
    const [isScanning, setIsScanning] = useState(false);
    const [qrTooLong, setQrTooLong] = useState(false);

    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const streamRef = useRef(null);
    const animFrameRef = useRef(null);
    const fileInputRef = useRef(null);

    const stopCamera = useCallback(() => {
        if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
        if (streamRef.current) {
            streamRef.current.getTracks().forEach((t) => t.stop());
            streamRef.current = null;
        }
        setIsCameraActive(false);
        setIsScanning(false);
    }, []);

    useEffect(() => () => stopCamera(), [stopCamera]);

    // ── GENERATE QR ──────────────────────────────────────────────
    const handleGenerateQR = async () => {
        if (!message.trim()) { toast.error('Please enter a message'); return; }
        setIsGenerating(true);
        try {
            await loadLibs();
            if (libsLoadError || !QRCodeLib) {
                toast.error('QR libs not installed. Run: npm install qrcode jsqr');
                return;
            }
            const encrypted = encryptMessage(message, password);
            if (encrypted.length > 2000) {
                setQrTooLong(true);
                toast('Message is very long — QR may be dense', { icon: '⚠️' });
            } else {
                setQrTooLong(false);
            }
            const dataUrl = await QRCodeLib.toDataURL(encrypted, {
                width: 300,
                margin: 2,
                color: { dark: colors.primary, light: '#0d0d0d' },
            });
            setQrDataUrl(dataUrl);
            setEncryptedText(encrypted);
            addToHistory({ mode: 'encode', cipherType: 'qr', inputPreview: message, outputPreview: encrypted, hasPassword: !!password });
            toast.success('QR code generated!');
        } catch (err) {
            toast.error(err.message);
        } finally {
            setIsGenerating(false);
        }
    };

    // ── DOWNLOAD QR ───────────────────────────────────────────────
    const handleDownload = () => {
        const a = document.createElement('a');
        a.href = qrDataUrl;
        a.download = 'onyx-encrypted-qr.png';
        a.click();
        toast.success('QR code saved!');
    };

    // ── SHARE QR ──────────────────────────────────────────────────
    const handleShare = async () => {
        if (navigator.share) {
            try {
                const res = await fetch(qrDataUrl);
                const blob = await res.blob();
                const file = new File([blob], 'onyx-qr.png', { type: 'image/png' });
                await navigator.share({ files: [file], title: 'Onyx Encrypted QR', text: 'Scan to decrypt' });
            } catch { /* user cancelled */ }
        } else {
            await navigator.clipboard.writeText(encryptedText);
            toast.success('Encrypted text copied to clipboard!');
        }
    };

    // ── CAMERA SCAN ───────────────────────────────────────────────
    const startCamera = async () => {
        try {
            await loadLibs();
            if (libsLoadError || !jsQR) {
                toast.error('QR libs not installed. Run: npm install qrcode jsqr');
                return;
            }
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'environment', width: { ideal: 640 }, height: { ideal: 480 } },
            });
            streamRef.current = stream;
            setIsCameraActive(true);
            setIsScanning(true);

            // Wait for video element to be in DOM
            setTimeout(() => {
                if (!videoRef.current) return;
                videoRef.current.srcObject = stream;
                videoRef.current.play().then(() => scanFrame());
            }, 100);
        } catch (err) {
            toast.error('Camera access denied. Please upload a QR image instead.');
        }
    };

    const scanFrame = () => {
        if (!videoRef.current || !canvasRef.current) return;
        const video = videoRef.current;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');

        if (video.readyState === HTMLMediaElement.HAVE_ENOUGH_DATA) {
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            ctx.drawImage(video, 0, 0);
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const code = jsQR(imageData.data, imageData.width, imageData.height, {
                inversionAttempts: 'dontInvert',
            });
            if (code?.data) {
                setScannedEncrypted(code.data);
                stopCamera();
                toast.success('QR code scanned!');
                return;
            }
        }
        animFrameRef.current = requestAnimationFrame(scanFrame);
    };

    // ── IMAGE UPLOAD SCAN ─────────────────────────────────────────
    const handleImageUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        try {
            await loadLibs();
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                canvas.width = img.width;
                canvas.height = img.height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0);
                const imageData = ctx.getImageData(0, 0, img.width, img.height);
                const code = jsQR(imageData.data, imageData.width, imageData.height);
                if (code?.data) {
                    setScannedEncrypted(code.data);
                    toast.success('QR decoded from image!');
                } else {
                    toast.error('No QR code found in image');
                }
            };
            img.src = URL.createObjectURL(file);
        } catch (err) {
            toast.error('Failed to read image');
        }
        e.target.value = '';
    };

    // ── DECRYPT SCANNED QR ────────────────────────────────────────
    const handleDecryptScanned = () => {
        if (!scannedEncrypted) { toast.error('No scanned QR data'); return; }
        try {
            const result = decryptMessage(scannedEncrypted, scanPassword);
            setDecryptedMessage(result);
            addToHistory({ mode: 'decode', cipherType: 'qr', inputPreview: scannedEncrypted, outputPreview: result, hasPassword: !!scanPassword });
            toast.success('Message decrypted!');
        } catch (err) {
            toast.error(err.message);
        }
    };

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
                    { id: 'generate', label: '🔲 Generate QR', desc: 'Encrypt → QR Code' },
                    { id: 'scan', label: '📷 Scan QR', desc: 'Scan → Decrypt' },
                ].map((m) => (
                    <motion.button
                        key={m.id}
                        whileHover={{ scale: 1.04, y: -2 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => { setSubMode(m.id); stopCamera(); }}
                        className={`flex-1 py-3 px-4 rounded-xl font-bold transition-all duration-300 border-2 text-sm ${
                            subMode === m.id
                                ? 'glass-strong border-current'
                                : 'glass opacity-60 border-transparent'
                        }`}
                        style={{ color: subMode === m.id ? colors.primary : 'inherit' }}
                    >
                        {m.label}
                        <span className="block text-xs font-normal opacity-60 mt-0.5">{m.desc}</span>
                    </motion.button>
                ))}
            </div>

            {/* ── GENERATE MODE ── */}
            <AnimatePresence mode="wait">
                {subMode === 'generate' && (
                    <motion.div
                        key="generate"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        className="glass-strong rounded-2xl p-6 space-y-5 border-2 border-white/10"
                    >
                        <div className="space-y-3">
                            <label className="text-sm font-bold uppercase tracking-wide opacity-90">📝 Secret Message</label>
                            <textarea
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                placeholder="Type your secret message here..."
                                className="w-full h-32 px-4 py-3 rounded-xl glass font-mono text-sm resize-none focus:outline-none border border-white/10 transition-all"
                                style={{ borderColor: colors.primary, fontSize: '16px' }}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-bold uppercase tracking-wide opacity-90">🔑 Password (Optional)</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Add extra security..."
                                className="w-full px-4 py-3 rounded-xl glass font-mono text-sm focus:outline-none border border-white/10"
                                style={{ borderColor: colors.primary, fontSize: '16px' }}
                            />
                        </div>

                        <motion.button
                            whileHover={{ scale: 1.03, y: -2 }}
                            whileTap={{ scale: 0.97 }}
                            onClick={handleGenerateQR}
                            disabled={isGenerating || !message.trim()}
                            className="w-full py-4 rounded-xl font-bold text-black shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            style={{ backgroundColor: colors.primary }}
                        >
                            {isGenerating ? (
                                <span className="flex items-center justify-center gap-2">
                                    <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                                        className="w-5 h-5 border-2 border-black border-t-transparent rounded-full" />
                                    Generating QR...
                                </span>
                            ) : (
                                <span className="flex items-center justify-center gap-2">
                                    <QrCode className="w-5 h-5" /> Generate Encrypted QR
                                </span>
                            )}
                        </motion.button>

                        {/* QR Output */}
                        <AnimatePresence>
                            {qrDataUrl && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="text-center space-y-4"
                                >
                                    {qrTooLong && (
                                        <p className="text-yellow-400 text-xs bg-yellow-400/10 border border-yellow-400/30 rounded-lg px-3 py-2">
                                            ⚠️ Long message — QR may need a good scanner
                                        </p>
                                    )}
                                    <div className="inline-block p-4 rounded-2xl" style={{ background: '#0d0d0d', boxShadow: `0 0 30px ${colors.glow}` }}>
                                        <img src={qrDataUrl} alt="Encrypted QR Code" className="w-56 h-56 mx-auto rounded-xl" />
                                    </div>
                                    <p className="text-xs opacity-60">Scan this QR to get the encrypted message, then decrypt with Onyx</p>
                                    <div className="flex gap-3 justify-center">
                                        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                                            onClick={handleDownload}
                                            className="flex items-center gap-2 px-5 py-3 rounded-xl glass-strong border border-white/20 font-semibold text-sm"
                                        >
                                            <Download className="w-4 h-4" /> Save QR
                                        </motion.button>
                                        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                                            onClick={handleShare}
                                            className="flex items-center gap-2 px-5 py-3 rounded-xl glass-strong border border-white/20 font-semibold text-sm"
                                        >
                                            <Share2 className="w-4 h-4" /> Share
                                        </motion.button>
                                    </div>
                                    {/* Encrypted text preview */}
                                    <details className="text-left">
                                        <summary className="text-xs opacity-50 cursor-pointer hover:opacity-80 flex items-center gap-1">
                                            <Eye className="w-3 h-3" /> View encrypted text
                                        </summary>
                                        <p className="mt-2 text-xs font-mono opacity-50 break-all bg-black/30 rounded-lg p-3">{encryptedText}</p>
                                    </details>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>
                )}

                {/* ── SCAN MODE ── */}
                {subMode === 'scan' && (
                    <motion.div
                        key="scan"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="glass-strong rounded-2xl p-6 space-y-5 border-2 border-white/10"
                    >
                        {!scannedEncrypted ? (
                            <>
                                <p className="text-center opacity-70 text-sm">Use your camera or upload a QR code image</p>
                                <div className="grid grid-cols-2 gap-3">
                                    <motion.button
                                        whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
                                        onClick={isCameraActive ? stopCamera : startCamera}
                                        className={`py-4 rounded-xl font-bold border-2 transition-all flex flex-col items-center gap-2 ${
                                            isCameraActive ? 'border-red-500 text-red-400' : 'glass border-white/20'
                                        }`}
                                    >
                                        {isCameraActive ? <><X className="w-6 h-6" />Stop Camera</> : <><Camera className="w-6 h-6" />Open Camera</>}
                                    </motion.button>
                                    <motion.button
                                        whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
                                        onClick={() => fileInputRef.current?.click()}
                                        className="py-4 rounded-xl font-bold border-2 glass border-white/20 transition-all flex flex-col items-center gap-2"
                                    >
                                        <Upload className="w-6 h-6" /> Upload Image
                                    </motion.button>
                                    <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                                </div>

                                {/* Camera viewfinder */}
                                <AnimatePresence>
                                    {isCameraActive && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            exit={{ opacity: 0, height: 0 }}
                                            className="relative rounded-2xl overflow-hidden border-2"
                                            style={{ borderColor: colors.primary }}
                                        >
                                            <video ref={videoRef} className="w-full rounded-2xl" playsInline muted />
                                            <canvas ref={canvasRef} className="hidden" />
                                            {/* Scanner overlay */}
                                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                                <div className="w-48 h-48 border-2 rounded-xl relative" style={{ borderColor: colors.primary }}>
                                                    {[['top-0 left-0', '-top-0.5 -left-0.5'], ['top-0 right-0', '-top-0.5 -right-0.5'], ['bottom-0 left-0', '-bottom-0.5 -left-0.5'], ['bottom-0 right-0', '-bottom-0.5 -right-0.5']].map(([_, cls], i) => (
                                                        <div key={i} className={`absolute w-6 h-6 border-2 rounded-sm ${cls}`} style={{ borderColor: colors.primary }} />
                                                    ))}
                                                    <motion.div animate={{ scaleX: [0.3, 1, 0.3] }} transition={{ duration: 2, repeat: Infinity }}
                                                        className="absolute top-1/2 left-0 right-0 h-0.5 -translate-y-1/2"
                                                        style={{ background: `linear-gradient(90deg, transparent, ${colors.primary}, transparent)` }}
                                                    />
                                                </div>
                                            </div>
                                            <div className="absolute bottom-3 left-0 right-0 text-center">
                                                <span className="text-xs px-3 py-1 rounded-full glass" style={{ color: colors.primary }}>
                                                    Scanning for QR code...
                                                </span>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </>
                        ) : (
                            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <p className="text-sm font-bold" style={{ color: colors.primary }}>✓ QR Code Scanned!</p>
                                    <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                                        onClick={() => { setScannedEncrypted(''); setDecryptedMessage(''); }}
                                        className="p-1.5 rounded-lg glass border border-white/20 text-xs"
                                    >
                                        <RefreshCw className="w-4 h-4" />
                                    </motion.button>
                                </div>
                                <div>
                                    <label className="text-xs opacity-60 uppercase tracking-wide">Encrypted Content</label>
                                    <p className="mt-1 text-xs font-mono opacity-50 break-all bg-black/30 rounded-lg p-3 max-h-20 overflow-y-auto">{scannedEncrypted}</p>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold uppercase tracking-wide opacity-90">🔑 Password (if used)</label>
                                    <input
                                        type="password"
                                        value={scanPassword}
                                        onChange={(e) => setScanPassword(e.target.value)}
                                        placeholder="Enter decryption password..."
                                        className="w-full px-4 py-3 rounded-xl glass font-mono text-sm focus:outline-none border border-white/10"
                                        style={{ borderColor: colors.primary, fontSize: '16px' }}
                                    />
                                </div>
                                <motion.button
                                    whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                                    onClick={handleDecryptScanned}
                                    className="w-full py-4 rounded-xl font-bold text-black shadow-lg"
                                    style={{ backgroundColor: colors.primary }}
                                >
                                    🔓 Decrypt Message
                                </motion.button>
                                <AnimatePresence>
                                    {decryptedMessage && (
                                        <motion.div
                                            initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                                            className="p-4 rounded-xl border-2"
                                            style={{ borderColor: `${colors.primary}50`, backgroundColor: `${colors.primary}10` }}
                                        >
                                            <p className="text-xs uppercase tracking-wide mb-2 font-bold" style={{ color: colors.primary }}>✅ Decrypted Message</p>
                                            <p className="font-mono text-sm break-words">{decryptedMessage}</p>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </motion.div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default QRCodePanel;

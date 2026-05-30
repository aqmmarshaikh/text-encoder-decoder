import { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Copy, Mic, MicOff, Play, Square, RefreshCw, Clipboard } from 'lucide-react';
import { emojiEncode, emojiDecode } from '../utils/emojiCipher';
import { textToMorse, morseEncryptEncode, morseDecode, playMorseAudio, getMorseTokens } from '../utils/morseCode';
import { dnaEncode, dnaDecode, formatDnaCodons, DNA_BASE_COLORS } from '../utils/dnaCipher';
import { invisibleEncode, invisibleDecode, hasHiddenData } from '../utils/invisibleText';
import { encryptMessage, decryptMessage } from '../utils/encryption';
import { copyToClipboard } from '../utils/clipboard';
import { useUser } from '../context/UserContext';
import toast from '../utils/toast.jsx';

const THEME_COLORS = {
    terminal:'#00ff41', cyberred:'#ff0040', neonblue:'#00d9ff',
    purplehack:'#b400ff', matrix:'#00ff00', darkhack:'#00ffff',
    orange:'#ff6600', gold:'#ffd700', stealth:'#888888', toxic:'#39ff14',
};

const MODES = [
    { id:'emoji',       icon:'😂', label:'Emoji',       desc:'Looks like fun!' },
    { id:'morse',       icon:'📡', label:'Morse',       desc:'Dots & Dashes' },
    { id:'dna',         icon:'🧬', label:'DNA',         desc:'ATGC Sequence' },
    { id:'invisible',   icon:'👻', label:'Invisible',   desc:'Hidden chars' },
    { id:'voice',       icon:'🎙️', label:'Voice',       desc:'Speak to encrypt' },
    { id:'selfdestruct',icon:'💣', label:'Self-Destruct',desc:'Auto-expires' },
];

const SD_TIMERS = [
    { label:'5 minutes', ms: 5*60*1000 },
    { label:'1 hour',    ms: 60*60*1000 },
    { label:'24 hours',  ms: 24*60*60*1000 },
    { label:'7 days',    ms: 7*24*60*60*1000 },
    { label:'Burn once', ms: 0 },
];

// ── Self-Destruct helpers ─────────────────────────────────────────────────────
const sdEncode = (message, password, timerMs) => {
    const expiry = timerMs === 0 ? 'BURN' : (Date.now() + timerMs).toString();
    const pkg = `SD:${expiry}:${message}`;
    return encryptMessage(pkg, password || 'Onyx-SD-Key-2026');
};

const sdDecode = (encrypted, password) => {
    const raw = decryptMessage(encrypted, password || 'Onyx-SD-Key-2026');
    if (!raw.startsWith('SD:')) throw new Error('Not a self-destruct message');
    const parts = raw.split(':');
    const expiry = parts[1];
    const message = parts.slice(2).join(':');
    if (expiry !== 'BURN' && Date.now() > parseInt(expiry, 10)) {
        throw new Error('⏰ Message has EXPIRED and self-destructed!');
    }
    return { message, isBurn: expiry === 'BURN', expiryMs: expiry === 'BURN' ? 0 : parseInt(expiry, 10) };
};

// ── Main Component ────────────────────────────────────────────────────────────
const CipherLabPanel = ({ theme }) => {
    const { addToHistory } = useUser();
    const primary = THEME_COLORS[theme] || THEME_COLORS.terminal;

    const [activeMode, setActiveMode] = useState('emoji');
    const [subMode, setSubMode] = useState('encode'); // 'encode'|'decode'
    const [input, setInput] = useState('');
    const [password, setPassword] = useState('');
    const [output, setOutput] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);

    // Morse audio state
    const [isPlayingAudio, setIsPlayingAudio] = useState(false);
    const [audioDuration, setAudioDuration] = useState(0);

    // Voice state
    const [isListening, setIsListening] = useState(false);
    const [transcript, setTranscript] = useState('');
    const recognitionRef = useRef(null);

    // Self-destruct state
    const [sdTimer, setSdTimer] = useState(SD_TIMERS[2]); // 24h default
    const [sdResult, setSdResult] = useState(null);

    // Live preview
    const [livePreview, setLivePreview] = useState(false);

    // Reset output when mode or submode changes
    useEffect(() => { setOutput(''); setSdResult(null); }, [activeMode, subMode]);

    // ── Live preview ──────────────────────────────────────────────────────────
    useEffect(() => {
        if (!livePreview || !input.trim() || subMode === 'decode') return;
        const timer = setTimeout(() => { runProcess(true); }, 600);
        return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [input, password, livePreview, activeMode, subMode]);

    // ── Process ───────────────────────────────────────────────────────────────
    const runProcess = useCallback(async (silent = false) => {
        if (!input.trim()) { if (!silent) toast.error('Enter a message first'); return; }
        setIsProcessing(true);
        try {
            let result = '';
            const isEncode = subMode === 'encode';

            if (activeMode === 'emoji') {
                result = isEncode ? emojiEncode(input, password) : emojiDecode(input, password);
            } else if (activeMode === 'morse') {
                if (isEncode) {
                    result = morseEncryptEncode(input, password);
                } else {
                    result = morseDecode(input, password);
                }
            } else if (activeMode === 'dna') {
                result = isEncode ? dnaEncode(input, password) : dnaDecode(input, password);
            } else if (activeMode === 'invisible') {
                result = isEncode ? invisibleEncode(input, password) : invisibleDecode(input, password);
            } else if (activeMode === 'selfdestruct') {
                if (isEncode) {
                    result = sdEncode(input, password, sdTimer.ms);
                    setSdResult({ type: 'encoded', timer: sdTimer.label });
                } else {
                    const { message, isBurn, expiryMs } = sdDecode(input, password);
                    result = message;
                    setSdResult({ type: 'decoded', isBurn, expiryMs });
                }
            }

            setOutput(result);
            if (!silent) {
                addToHistory({ mode: subMode === 'encode' ? 'encode' : 'decode', cipherType: activeMode, inputPreview: input, outputPreview: result, hasPassword: !!password });
                toast.success(isEncode ? 'Encoded!' : 'Decoded!');
            }
        } catch (err) {
            if (!silent) toast.error(err.message);
        } finally {
            setIsProcessing(false);
        }
    }, [input, password, activeMode, subMode, sdTimer, addToHistory]);

    // ── Copy output ───────────────────────────────────────────────────────────
    const handleCopy = async () => {
        if (!output) { toast.error('Nothing to copy'); return; }
        await copyToClipboard(output);
        toast.success('Copied!');
    };

    // ── Morse audio ───────────────────────────────────────────────────────────
    const handlePlayMorse = () => {
        if (!output) { toast.error('Generate morse first'); return; }
        setIsPlayingAudio(true);
        const dur = playMorseAudio(output, () => setIsPlayingAudio(false));
        setAudioDuration(Math.ceil(dur));
    };

    // ── Voice recognition ─────────────────────────────────────────────────────
    const startVoice = () => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) { toast.error('Voice not supported in this browser'); return; }
        const rec = new SpeechRecognition();
        rec.continuous = false;
        rec.interimResults = true;
        rec.lang = 'en-US';
        rec.onstart = () => setIsListening(true);
        rec.onresult = (e) => {
            const t = Array.from(e.results).map((r) => r[0].transcript).join('');
            setTranscript(t);
            if (e.results[e.results.length - 1].isFinal) { setInput(t); }
        };
        rec.onerror = () => { toast.error('Voice recognition error'); setIsListening(false); };
        rec.onend = () => setIsListening(false);
        rec.start();
        recognitionRef.current = rec;
    };

    const stopVoice = () => { recognitionRef.current?.stop(); setIsListening(false); };

    // ── Render output by mode ─────────────────────────────────────────────────
    const renderOutput = () => {
        if (!output) return null;

        if (activeMode === 'emoji') {
            return (
                <div className="p-4 rounded-xl glass border border-white/10 text-3xl leading-relaxed break-all select-all">
                    {output}
                </div>
            );
        }

        if (activeMode === 'morse') {
            const tokens = getMorseTokens(output);
            return (
                <div className="space-y-3">
                    <div className="p-4 rounded-xl glass border border-white/10 font-mono text-sm break-all leading-loose max-h-40 overflow-y-auto">
                        {tokens.map((t) => (
                            <span key={t.key} style={{ color: t.type === 'dot' || t.type === 'dash' ? primary : undefined }}>
                                {t.char}
                            </span>
                        ))}
                    </div>
                    <motion.button
                        whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                        onClick={handlePlayMorse}
                        disabled={isPlayingAudio}
                        className="flex items-center gap-2 px-5 py-2 rounded-xl glass-strong border border-white/20 text-sm font-bold disabled:opacity-50"
                    >
                        {isPlayingAudio
                            ? <><Square className="w-4 h-4" style={{ color: primary }} /> Playing ({audioDuration}s)...</>
                            : <><Play className="w-4 h-4" style={{ color: primary }} /> Play Morse Audio</>}
                    </motion.button>
                </div>
            );
        }

        if (activeMode === 'dna') {
            const lines = formatDnaCodons(output, 8);
            return (
                <div className="p-4 rounded-xl glass border border-white/10 font-mono text-sm max-h-48 overflow-y-auto leading-8">
                    {lines.map((line, li) => (
                        <div key={li} className="flex flex-wrap gap-2 mb-1">
                            {line.map((codon, ci) => (
                                <span key={ci} className="tracking-widest">
                                    {[...codon].map((base, bi) => (
                                        <span key={bi} style={{ color: DNA_BASE_COLORS[base] || '#fff' }}>{base}</span>
                                    ))}
                                </span>
                            ))}
                        </div>
                    ))}
                </div>
            );
        }

        if (activeMode === 'invisible') {
            const charCount = [...output].filter(c => c.charCodeAt(0) < 32 || (c.charCodeAt(0) >= 0x200B && c.charCodeAt(0) <= 0x2060)).length;
            return (
                <div className="space-y-2">
                    <div className="p-4 rounded-xl border-2 border-dashed" style={{ borderColor: `${primary}50` }}>
                        <p className="text-xs opacity-60 mb-2">↓ This area contains hidden invisible data — copy all of it</p>
                        <textarea
                            value={output}
                            readOnly
                            className="w-full h-16 bg-transparent font-mono text-sm resize-none focus:outline-none select-all"
                            style={{ fontSize: '16px' }}
                        />
                        <p className="text-xs mt-1" style={{ color: primary }}>
                            👻 {charCount} invisible characters hidden inside
                        </p>
                    </div>
                </div>
            );
        }

        if (activeMode === 'selfdestruct') {
            return (
                <div className="space-y-3">
                    {sdResult?.type === 'encoded' && (
                        <div className="p-3 rounded-xl text-xs" style={{ background: `${primary}15`, borderColor: `${primary}40`, border: '1px solid' }}>
                            💣 Self-destructs in: <strong style={{ color: primary }}>{sdResult.timer}</strong>
                            {sdTimer.ms === 0 && <span className="ml-2 text-red-400">🔥 Burns after first read!</span>}
                        </div>
                    )}
                    {sdResult?.type === 'decoded' && (
                        <div className="p-3 rounded-xl bg-green-500/10 border border-green-500/30 text-xs">
                            {sdResult.isBurn
                                ? '🔥 Burn-after-read: This message cannot be decrypted again!'
                                : `⏰ Expires: ${new Date(sdResult.expiryMs).toLocaleString()}`}
                        </div>
                    )}
                    <textarea readOnly value={output}
                        className="w-full h-28 px-4 py-3 rounded-xl glass font-mono text-xs resize-none focus:outline-none border border-white/10"
                    />
                </div>
            );
        }

        // Default text output
        return (
            <textarea readOnly value={output}
                className="w-full h-28 px-4 py-3 rounded-xl glass font-mono text-sm resize-none focus:outline-none border border-white/10"
            />
        );
    };

    const isVoiceMode = activeMode === 'voice';

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
            className="space-y-4"
        >
            {/* Mode selector */}
            <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
                {MODES.map((m) => (
                    <motion.button
                        key={m.id}
                        whileHover={{ scale: 1.05, y: -2 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setActiveMode(m.id)}
                        className={`py-3 px-2 rounded-xl flex flex-col items-center gap-1 border-2 transition-all duration-200 text-xs font-bold ${
                            activeMode === m.id ? 'glass-strong border-current' : 'glass border-transparent opacity-60'
                        }`}
                        style={{ color: activeMode === m.id ? primary : 'inherit' }}
                    >
                        <span className="text-xl">{m.icon}</span>
                        <span>{m.label}</span>
                        <span className="text-[9px] opacity-50 hidden md:block">{m.desc}</span>
                    </motion.button>
                ))}
            </div>

            <div className="glass-strong rounded-2xl p-5 space-y-4 border-2 border-white/10">
                {/* Sub-mode + live preview toggle */}
                {!isVoiceMode && (
                    <div className="flex items-center gap-3">
                        <div className="flex gap-2 flex-1">
                            {['encode', 'decode'].map((sm) => (
                                <motion.button key={sm} whileTap={{ scale: 0.96 }}
                                    onClick={() => setSubMode(sm)}
                                    className={`flex-1 py-2 rounded-xl font-bold text-sm border-2 transition-all ${
                                        subMode === sm ? 'glass-strong border-current' : 'glass border-transparent opacity-50'
                                    }`}
                                    style={{ color: subMode === sm ? primary : 'inherit' }}
                                >
                                    {sm === 'encode' ? '🔒 Encode' : '🔓 Decode'}
                                </motion.button>
                            ))}
                        </div>
                        {/* Live preview toggle */}
                        {subMode === 'encode' && (
                            <button
                                onClick={() => setLivePreview((v) => !v)}
                                className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all ${
                                    livePreview ? 'glass-strong border-current' : 'glass border-white/20 opacity-50'
                                }`}
                                style={{ color: livePreview ? primary : 'inherit' }}
                            >
                                ⚡ Live
                            </button>
                        )}
                    </div>
                )}

                {/* Self-destruct timer */}
                {activeMode === 'selfdestruct' && subMode === 'encode' && (
                    <div className="flex flex-wrap gap-2">
                        {SD_TIMERS.map((t) => (
                            <button key={t.label}
                                onClick={() => setSdTimer(t)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                                    sdTimer.label === t.label ? 'border-current glass-strong' : 'glass border-white/20 opacity-60'
                                }`}
                                style={{ color: sdTimer.label === t.label ? primary : 'inherit' }}
                            >
                                {t.ms === 0 ? '🔥 Burn' : t.label}
                            </button>
                        ))}
                    </div>
                )}

                {/* Voice Mode UI */}
                {isVoiceMode ? (
                    <div className="space-y-4 text-center py-4">
                        <p className="opacity-60 text-sm">Speak your message — it will be encrypted with Emoji cipher</p>
                        <motion.button
                            whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                            onClick={isListening ? stopVoice : startVoice}
                            className="w-24 h-24 mx-auto rounded-full flex items-center justify-center border-4 transition-all"
                            style={{ borderColor: primary, background: isListening ? `${primary}20` : 'transparent' }}
                            animate={isListening ? { boxShadow: [`0 0 0px ${primary}`, `0 0 30px ${primary}`, `0 0 0px ${primary}`] } : {}}
                            transition={isListening ? { duration: 1.5, repeat: Infinity } : {}}
                        >
                            {isListening
                                ? <MicOff className="w-10 h-10" style={{ color: primary }} />
                                : <Mic className="w-10 h-10" style={{ color: primary }} />}
                        </motion.button>
                        <p className="text-sm font-bold" style={{ color: primary }}>
                            {isListening ? '🎙️ Listening...' : 'Tap to speak'}
                        </p>
                        {transcript && (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                                className="p-4 rounded-xl glass border border-white/10 text-left"
                            >
                                <p className="text-xs opacity-50 mb-1">Transcribed:</p>
                                <p className="font-mono">{transcript}</p>
                            </motion.div>
                        )}
                        {input && (
                            <motion.button
                                whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                                onClick={() => { setActiveMode('emoji'); setSubMode('encode'); }}
                                className="w-full py-3 rounded-xl font-bold text-black"
                                style={{ backgroundColor: primary }}
                            >
                                😂 Encrypt as Emoji →
                            </motion.button>
                        )}
                    </div>
                ) : (
                    <>
                        {/* Input */}
                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-wide opacity-70">
                                {subMode === 'encode' ? '📝 Message' : '🔐 Encoded Text'}
                            </label>
                            <div className="relative">
                                <textarea
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    placeholder={subMode === 'encode' ? 'Type your secret message...' : `Paste ${activeMode} encoded text...`}
                                    className="w-full h-28 px-4 py-3 rounded-xl glass font-mono text-sm resize-none focus:outline-none border transition-all"
                                    style={{ borderColor: primary, fontSize: '16px' }}
                                />
                                {activeMode === 'invisible' && subMode === 'decode' && hasHiddenData(input) && (
                                    <span className="absolute top-2 right-2 text-xs px-2 py-0.5 rounded-full" style={{ background: `${primary}30`, color: primary }}>
                                        👻 Hidden data detected
                                    </span>
                                )}
                                {/* Voice icon inside input */}
                                <button
                                    onClick={() => setActiveMode('voice')}
                                    className="absolute bottom-2 right-2 p-1.5 rounded-lg opacity-30 hover:opacity-80 transition-opacity"
                                    title="Switch to voice input"
                                >
                                    <Mic className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        {/* Password */}
                        <div className="flex gap-3">
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="🔑 Password (optional)"
                                className="flex-1 px-4 py-2.5 rounded-xl glass font-mono text-sm focus:outline-none border border-white/10"
                                style={{ borderColor: primary, fontSize: '16px' }}
                            />
                            <motion.button
                                whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
                                onClick={() => setInput('')}
                                className="px-3 py-2.5 rounded-xl glass border border-white/20"
                                title="Clear"
                            >
                                <RefreshCw className="w-4 h-4 opacity-60" />
                            </motion.button>
                        </div>

                        {/* Action button */}
                        <motion.button
                            whileHover={{ scale: 1.03, y: -2 }} whileTap={{ scale: 0.97 }}
                            onClick={() => runProcess(false)}
                            disabled={isProcessing || !input.trim()}
                            className="w-full py-4 rounded-xl font-bold text-black shadow-lg disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            style={{ backgroundColor: primary }}
                        >
                            {isProcessing ? (
                                <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                                    className="w-5 h-5 border-2 border-black border-t-transparent rounded-full"
                                />
                            ) : subMode === 'encode' ? (
                                `${MODES.find(m => m.id === activeMode)?.icon} Encode with ${MODES.find(m => m.id === activeMode)?.label}`
                            ) : (
                                `🔓 Decode from ${MODES.find(m => m.id === activeMode)?.label}`
                            )}
                        </motion.button>
                    </>
                )}

                {/* Output section */}
                <AnimatePresence>
                    {output && (
                        <motion.div
                            initial={{ opacity: 0, height: 0, scale: 0.97 }}
                            animate={{ opacity: 1, height: 'auto', scale: 1 }}
                            exit={{ opacity: 0, height: 0 }}
                            className="space-y-2 pt-2 border-t border-white/10"
                        >
                            <div className="flex items-center justify-between">
                                <label className="text-xs font-bold uppercase tracking-wide opacity-70">
                                    {subMode === 'encode' ? '✨ Encoded Output' : '✅ Decoded Message'}
                                </label>
                                <motion.button
                                    whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                                    onClick={handleCopy}
                                    className="flex items-center gap-1 px-3 py-1 rounded-lg glass-strong border border-white/20 text-xs"
                                >
                                    <Copy className="w-3 h-3" /> Copy
                                </motion.button>
                            </div>
                            {renderOutput()}
                            {livePreview && subMode === 'encode' && (
                                <p className="text-xs opacity-40 flex items-center gap-1">
                                    <span style={{ color: primary }}>⚡</span> Live preview active
                                </p>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </motion.div>
    );
};

export default CipherLabPanel;

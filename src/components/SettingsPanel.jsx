import { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Settings, ToggleLeft, ToggleRight, RotateCcw } from 'lucide-react';
import { useUser } from '../context/UserContext';
import { resetSettings } from '../utils/settings';
import toast from '../utils/toast.jsx';

const THEME_COLORS = {
    terminal:'#00ff41', cyberred:'#ff0040', neonblue:'#00d9ff',
    purplehack:'#b400ff', matrix:'#00ff00', darkhack:'#00ffff',
    orange:'#ff6600', gold:'#ffd700', stealth:'#888888', toxic:'#39ff14',
};

const Toggle = ({ value, onChange, primary }) => (
    <motion.button whileTap={{ scale: 0.9 }} onClick={() => onChange(!value)}
        className={`w-12 h-6 rounded-full border-2 flex items-center transition-all duration-300 ${value ? 'justify-end' : 'justify-start'}`}
        style={{ borderColor: value ? primary : 'rgba(255,255,255,0.2)', background: value ? `${primary}30` : 'transparent' }}
    >
        <motion.div layout className="w-4 h-4 rounded-full mx-0.5"
            style={{ background: value ? primary : 'rgba(255,255,255,0.3)' }} />
    </motion.button>
);

const SettingRow = ({ label, desc, children }) => (
    <div className="flex items-center justify-between p-4 glass rounded-xl border border-white/10">
        <div className="flex-1 pr-4">
            <p className="font-bold text-sm">{label}</p>
            {desc && <p className="text-xs opacity-50 mt-0.5">{desc}</p>}
        </div>
        <div className="flex-shrink-0">{children}</div>
    </div>
);

const SettingsPanel = ({ theme, onClose }) => {
    const { settings, updateSetting } = useUser();
    const primary = THEME_COLORS[theme] || THEME_COLORS.terminal;

    const handleReset = () => {
        const defaults = resetSettings();
        Object.entries(defaults).forEach(([k, v]) => updateSetting(k, v));
        toast.success('Settings reset to defaults!');
    };

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
            onClick={onClose}
        >
            <motion.div initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                onClick={(e) => e.stopPropagation()}
                className="glass-strong rounded-2xl p-5 max-w-md w-full border-2 border-white/10 max-h-[90vh] overflow-y-auto"
            >
                {/* Header */}
                <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-xl" style={{ background: `${primary}20` }}>
                            <Settings className="w-5 h-5" style={{ color: primary }} />
                        </div>
                        <h2 className="text-lg font-bold">Settings</h2>
                    </div>
                    <div className="flex items-center gap-2">
                        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                            onClick={handleReset}
                            className="p-2 rounded-xl glass border border-white/20 opacity-60 hover:opacity-100 transition-opacity"
                            title="Reset to defaults"
                        >
                            <RotateCcw className="w-4 h-4" />
                        </motion.button>
                        <motion.button whileHover={{ rotate: 90 }} whileTap={{ scale: 0.9 }}
                            onClick={onClose} className="p-2 rounded-full glass border border-white/20">
                            <X className="w-5 h-5" />
                        </motion.button>
                    </div>
                </div>

                <div className="space-y-3">
                    <p className="text-xs font-bold uppercase tracking-wider opacity-40 px-1">Behaviour</p>

                    <SettingRow label="Auto-Save History"
                        desc="Automatically save every encryption to history"
                    >
                        <Toggle value={settings.autoSaveHistory ?? true}
                            onChange={(v) => { updateSetting('autoSaveHistory', v); toast.success(v ? 'History auto-save ON' : 'History auto-save OFF'); }}
                            primary={primary} />
                    </SettingRow>

                    <SettingRow label="Live Preview"
                        desc="See encryption output update as you type"
                    >
                        <Toggle value={settings.livePreview ?? false}
                            onChange={(v) => { updateSetting('livePreview', v); toast.success(v ? 'Live preview ON' : 'Live preview OFF'); }}
                            primary={primary} />
                    </SettingRow>

                    <p className="text-xs font-bold uppercase tracking-wider opacity-40 px-1 pt-2">Defaults</p>

                    <SettingRow label="Default Tab"
                        desc="Which tab opens when you start the app"
                    >
                        <select value={settings.defaultCipherTab ?? 'text'}
                            onChange={(e) => { updateSetting('defaultCipherTab', e.target.value); toast.success('Default tab updated!'); }}
                            className="px-3 py-2 rounded-xl glass text-sm border border-white/20 focus:outline-none"
                            style={{ color: primary }}
                        >
                            <option value="text">📝 Text</option>
                            <option value="qr">🔲 QR Code</option>
                            <option value="file">📁 File Vault</option>
                            <option value="lab">🧪 Cipher Lab</option>
                        </select>
                    </SettingRow>

                    <SettingRow label="Auto-Lock After"
                        desc="Clear sensitive data after inactivity"
                    >
                        <select value={settings.autoLockMinutes ?? 15}
                            onChange={(e) => { updateSetting('autoLockMinutes', parseInt(e.target.value)); toast.success('Auto-lock updated!'); }}
                            className="px-3 py-2 rounded-xl glass text-sm border border-white/20 focus:outline-none"
                            style={{ color: primary }}
                        >
                            <option value={5}>5 minutes</option>
                            <option value={15}>15 minutes</option>
                            <option value={30}>30 minutes</option>
                            <option value={60}>1 hour</option>
                            <option value={0}>Never</option>
                        </select>
                    </SettingRow>

                    <p className="text-xs font-bold uppercase tracking-wider opacity-40 px-1 pt-2">Display</p>

                    <SettingRow label="Font Size"
                        desc="Adjust text size in the app"
                    >
                        <select value={settings.fontSize ?? 'md'}
                            onChange={(e) => { updateSetting('fontSize', e.target.value); toast.success('Font size updated!'); }}
                            className="px-3 py-2 rounded-xl glass text-sm border border-white/20 focus:outline-none"
                            style={{ color: primary }}
                        >
                            <option value="sm">Small</option>
                            <option value="md">Medium</option>
                            <option value="lg">Large</option>
                        </select>
                    </SettingRow>
                </div>

                <div className="mt-5 pt-4 border-t border-white/10 text-center">
                    <p className="text-xs opacity-30">Onyx v2.0 · All settings saved locally</p>
                </div>
            </motion.div>
        </motion.div>
    );
};

export default SettingsPanel;

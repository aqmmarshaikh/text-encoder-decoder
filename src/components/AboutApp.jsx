import { motion } from 'framer-motion';
import { X, Shield, Lock, Key, Zap, Eye, Download, Code, Globe } from 'lucide-react';

const AboutApp = ({ theme, onClose }) => {
    const getThemeColors = () => {
        const colors = {
            terminal: 'from-green-500 to-green-700',
            cyberred: 'from-red-600 to-red-800',
            neonblue: 'from-cyan-400 to-blue-600',
            purplehack: 'from-purple-500 to-purple-800',
            matrix: 'from-green-400 to-green-600',
            darkhack: 'from-cyan-300 to-cyan-600',
            orange: 'from-orange-500 to-orange-700',
            gold: 'from-yellow-400 to-yellow-700',
            stealth: 'from-gray-400 to-gray-700',
            toxic: 'from-lime-400 to-green-600',
        };
        return colors[theme] || colors.terminal;
    };

    const features = [
        {
            icon: Lock,
            title: 'AES-256 Encryption',
            description: 'Military-grade encryption to secure your messages'
        },
        {
            icon: Key,
            title: 'Custom Password',
            description: 'Use your own password for encryption and decryption'
        },
        {
            icon: Eye,
            title: 'Zero Knowledge',
            description: 'All encryption happens locally in your browser'
        },
        {
            icon: Zap,
            title: 'Instant Processing',
            description: 'Lightning-fast encryption and decryption'
        },
        {
            icon: Download,
            title: 'Offline Capable',
            description: 'Works completely offline, no internet required'
        },
        {
            icon: Code,
            title: 'Open Source',
            description: 'Transparent and verifiable security'
        },
        {
            icon: Globe,
            title: 'Cross-Platform',
            description: 'Works on any device with a modern browser'
        },
        {
            icon: Shield,
            title: 'No Data Storage',
            description: 'We never store your messages or passwords'
        }
    ];

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
            onClick={onClose}
        >
            <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                onClick={(e) => e.stopPropagation()}
                className="glass-strong rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border-2 border-white/20 shadow-2xl"
            >
                {/* Header */}
                <div className={`sticky top-0 bg-gradient-to-r ${getThemeColors()} p-6 rounded-t-2xl flex items-center justify-between z-10`}>
                    <div className="flex items-center gap-3">
                        <Shield className="w-8 h-8 text-white" />
                        <div>
                            <h2 className="text-2xl font-bold text-white">About Onyx</h2>
                            <p className="text-white/80 text-sm font-mono">Elite Hacker Edition v2.0</p>
                        </div>
                    </div>
                    <motion.button
                        whileHover={{ scale: 1.1, rotate: 90 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={onClose}
                        className="p-2 rounded-full bg-white/20 hover:bg-white/30 transition-all"
                    >
                        <X className="w-6 h-6 text-white" />
                    </motion.button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                    {/* App Description */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="glass rounded-xl p-6 border border-white/10"
                    >
                        <h3 className={`text-xl font-bold mb-3 bg-gradient-to-r ${getThemeColors()} bg-clip-text text-transparent`}>
                            What is Onyx?
                        </h3>
                        <p className="text-sm leading-relaxed opacity-90">
                            Onyx is a powerful, secure, and user-friendly message encryption tool designed for privacy-conscious individuals.
                            Built with cutting-edge AES-256 encryption technology, it allows you to encrypt and decrypt sensitive messages with
                            military-grade security. Whether you're sharing confidential information, protecting personal data, or just want to
                            keep your communications private, Onyx provides the ultimate solution.
                        </p>
                    </motion.div>

                    {/* How It Works */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="glass rounded-xl p-6 border border-white/10"
                    >
                        <h3 className={`text-xl font-bold mb-4 bg-gradient-to-r ${getThemeColors()} bg-clip-text text-transparent`}>
                            How Does It Work?
                        </h3>
                        <div className="space-y-4">
                            <div className="flex gap-4">
                                <div className={`flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-r ${getThemeColors()} flex items-center justify-center text-white font-bold`}>
                                    1
                                </div>
                                <div>
                                    <h4 className="font-semibold mb-1">Enter Your Message</h4>
                                    <p className="text-sm opacity-80">Type or paste the message you want to encrypt in the input field.</p>
                                </div>
                            </div>
                            <div className="flex gap-4">
                                <div className={`flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-r ${getThemeColors()} flex items-center justify-center text-white font-bold`}>
                                    2
                                </div>
                                <div>
                                    <h4 className="font-semibold mb-1">Set a Strong Password</h4>
                                    <p className="text-sm opacity-80">Create a secure password that will be used to encrypt your message. Remember this password!</p>
                                </div>
                            </div>
                            <div className="flex gap-4">
                                <div className={`flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-r ${getThemeColors()} flex items-center justify-center text-white font-bold`}>
                                    3
                                </div>
                                <div>
                                    <h4 className="font-semibold mb-1">Encrypt & Share</h4>
                                    <p className="text-sm opacity-80">Click the Encrypt button to generate an encrypted message. Share it securely with your recipient.</p>
                                </div>
                            </div>
                            <div className="flex gap-4">
                                <div className={`flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-r ${getThemeColors()} flex items-center justify-center text-white font-bold`}>
                                    4
                                </div>
                                <div>
                                    <h4 className="font-semibold mb-1">Decrypt Messages</h4>
                                    <p className="text-sm opacity-80">To decrypt, paste the encrypted message, enter the same password, and click Decrypt.</p>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Features Grid */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                    >
                        <h3 className={`text-xl font-bold mb-4 bg-gradient-to-r ${getThemeColors()} bg-clip-text text-transparent`}>
                            Key Features
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {features.map((feature, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: 0.4 + index * 0.05 }}
                                    whileHover={{ scale: 1.05, y: -5 }}
                                    className="glass rounded-lg p-4 border border-white/10 hover:border-white/30 transition-all"
                                >
                                    <div className="flex items-start gap-3">
                                        <div className={`p-2 rounded-lg bg-gradient-to-br ${getThemeColors()} shadow-lg`}>
                                            <feature.icon className="w-5 h-5 text-white" />
                                        </div>
                                        <div>
                                            <h4 className="font-semibold mb-1">{feature.title}</h4>
                                            <p className="text-xs opacity-80">{feature.description}</p>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>

                    {/* Security Notice */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                        className={`glass rounded-xl p-6 border-2 border-yellow-500/30 bg-gradient-to-r ${getThemeColors()} bg-opacity-10`}
                    >
                        <h3 className="text-lg font-bold mb-2 flex items-center gap-2">
                            <Shield className="w-5 h-5" />
                            Security Best Practices
                        </h3>
                        <ul className="text-sm space-y-2 opacity-90">
                            <li>• Always use strong, unique passwords for encryption</li>
                            <li>• Never share your encryption password through insecure channels</li>
                            <li>• Store your passwords securely using a password manager</li>
                            <li>• This app runs entirely in your browser - no data is sent to any server</li>
                            <li>• For maximum security, use this app offline</li>
                        </ul>
                    </motion.div>

                    {/* Footer Info */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.6 }}
                        className="text-center pt-4 border-t border-white/10"
                    >
                        <p className="text-sm opacity-70 font-mono">
                            🔐 Onyx v2.0 | Made with ❤️ in India 🇮🇳
                        </p>
                        <p className="text-xs opacity-50 mt-2">
                            © 2026 Onyx. All rights reserved. | Elite Hacker Edition
                        </p>
                    </motion.div>
                </div>
            </motion.div>
        </motion.div>
    );
};

export default AboutApp;

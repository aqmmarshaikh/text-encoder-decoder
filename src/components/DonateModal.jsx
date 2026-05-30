import { motion } from 'framer-motion';
import { X, Coffee, Heart, QrCode, Smartphone } from 'lucide-react';

const DonateModal = ({ theme, onClose }) => {
    const donationOptions = [
        { amount: '₹50', description: 'Buy me a chai ☕' },
        { amount: '₹100', description: 'Support development 💻' },
        { amount: '₹250', description: 'Generous supporter 🌟' },
        { amount: '₹500', description: 'Premium supporter 💎' },
        { amount: 'Custom', description: 'Choose your amount 💝' },
    ];

    const handleUPIPayment = () => {
        window.location.href = 'upi://pay?pa=9313560589@ybl&pn=Arman&tn=Donation%20for%20Creations&cu=INR';
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto"
            onClick={onClose}
        >
            <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                onClick={(e) => e.stopPropagation()}
                className="glass-strong rounded-2xl p-4 md:p-6 lg:p-8 max-w-md w-full my-8 modal-mobile"
            >
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-gradient-to-br from-orange-500 to-pink-500">
                            <Coffee className="w-6 h-6 text-white" />
                        </div>
                        <h2 className="text-2xl font-bold">Support Us</h2>
                    </div>
                    <motion.button
                        whileHover={{ scale: 1.1, rotate: 90 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={onClose}
                        className="p-2 rounded-full glass hover:glass-strong transition-all"
                    >
                        <X className="w-6 h-6" />
                    </motion.button>
                </div>

                {/* Message */}
                <div className="glass rounded-xl p-4 mb-6">
                    <p className="text-sm leading-relaxed opacity-90">
                        <Heart className="w-4 h-4 inline text-red-500 mr-1" />
                        If you find Onyx useful, consider supporting us!
                        Your contribution helps us maintain and improve this free tool for everyone.
                        Made with ❤️ in India 🇮🇳
                    </p>
                </div>

                {/* Donation Options */}
                <div className="grid grid-cols-2 gap-2 md:gap-3 mb-6">
                    {donationOptions.map((option, index) => (
                        <motion.button
                            key={index}
                            whileHover={{ scale: 1.05, y: -3 }}
                            whileTap={{ scale: 0.95 }}
                            className={`p-3 md:p-4 rounded-xl glass hover:glass-strong transition-all text-center touch-target ${index === donationOptions.length - 1 ? 'col-span-2' : ''
                                }`}
                        >
                            <div className="text-xl font-bold mb-1">{option.amount}</div>
                            <div className="text-xs opacity-70">{option.description}</div>
                        </motion.button>
                    ))}
                </div>

                {/* QR Code Section */}
                <div className="glass rounded-xl p-6 mb-6 text-center">
                    <div className="flex items-center justify-center gap-2 mb-4">
                        <QrCode className="w-5 h-5 text-purple-400" />
                        <h3 className="text-lg font-semibold">Scan to Donate</h3>
                    </div>

                    <motion.div
                        whileHover={{ scale: 1.05 }}
                        className="inline-block bg-white p-3 rounded-xl mb-4"
                    >
                        <img
                            src="https://i.ibb.co/F43hqvF0/my-donation-qr-code.jpg"
                            alt="Donation QR Code"
                            className="w-56 h-56 md:w-48 md:h-48 object-contain mx-auto rounded-lg"
                        />
                    </motion.div>

                    <p className="text-sm opacity-70 mb-4">
                        Scan the QR code with any UPI app or use the button below
                    </p>

                    <motion.button
                        whileHover={{ scale: 1.05, y: -2 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleUPIPayment}
                        className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold py-3 px-6 rounded-xl shadow-lg flex items-center justify-center gap-2 transition-all"
                    >
                        <Smartphone className="w-5 h-5" />
                        Donate With UPI
                    </motion.button>
                </div>

                {/* Payment Methods */}
                <div className="space-y-3">
                    <h4 className="text-sm font-semibold opacity-70">Other Payment Methods</h4>

                    <motion.a
                        href="https://www.buymeacoffee.com/ciphervault"
                        target="_blank"
                        rel="noopener noreferrer"
                        whileHover={{ x: 5, backgroundColor: 'rgba(255, 255, 255, 0.1)' }}
                        className="flex items-center gap-3 p-3 rounded-lg glass hover:glass-strong transition-all"
                    >
                        <Coffee className="w-5 h-5 text-orange-400" />
                        <span>Buy Me a Coffee</span>
                    </motion.a>
                </div>

                {/* Footer */}
                <div className="mt-6 pt-6 border-t border-white/10 text-center">
                    <p className="text-xs opacity-60">
                        All donations are voluntary and greatly appreciated! 🙏
                    </p>
                    <p className="text-xs opacity-50 mt-2">
                        UPI ID: 9313560589@ybl | Payee: Arman
                    </p>
                </div>
            </motion.div>
        </motion.div>
    );
};

export default DonateModal;

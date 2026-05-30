import { motion } from 'framer-motion';
import { X, Lock, Sparkles, Check, AlertCircle } from 'lucide-react';
import { useState } from 'react';

const PremiumPurchaseModal = ({ theme, onClose, onUnlock }) => {
    const [unlockCode, setUnlockCode] = useState('');
    const [utrNumber, setUtrNumber] = useState('');
    const [showSuccess, setShowSuccess] = useState(false);
    const [error, setError] = useState('');
    const [isVerifying, setIsVerifying] = useState(false);

    const handleUPIPayment = () => {
        // Open UPI payment with ₹9 amount
        window.location.href = `upi://pay?pa=9313560589@ybl&pn=Arman&am=9&tn=Premium%20Theme%20${theme.name}&cu=INR`;
    };

    const handleManualUnlock = () => {
        // For testing or customer support - unlock with code
        if (unlockCode === 'ONYX2026' || unlockCode.toLowerCase() === theme.id) {
            setShowSuccess(true);
            setTimeout(() => {
                onUnlock(theme.id);
                onClose();
            }, 2000);
        } else {
            setError('Invalid unlock code');
        }
    };

    const validateUTR = (utr) => {
        // UTR numbers are typically 12 digits
        const utrPattern = /^\d{12}$/;
        return utrPattern.test(utr);
    };

    const handleUTRVerification = () => {
        setError('');

        // Validate UTR format
        if (!utrNumber.trim()) {
            setError('Please enter your UTR number');
            return;
        }

        if (!validateUTR(utrNumber.trim())) {
            setError('Invalid UTR format. UTR must be 12 digits');
            return;
        }

        // Check if UTR was already used
        const usedUTRs = JSON.parse(localStorage.getItem('onyx-used-utrs') || '[]');
        if (usedUTRs.includes(utrNumber.trim())) {
            setError('This UTR number has already been used');
            return;
        }

        // Simulate verification process
        setIsVerifying(true);

        setTimeout(() => {
            // Store the UTR number
            const updatedUTRs = [...usedUTRs, utrNumber.trim()];
            localStorage.setItem('onyx-used-utrs', JSON.stringify(updatedUTRs));

            // Store payment details
            const paymentDetails = JSON.parse(localStorage.getItem('onyx-payment-details') || '{}');
            paymentDetails[theme.id] = {
                utr: utrNumber.trim(),
                date: new Date().toISOString(),
                amount: 9,
                themeName: theme.name
            };
            localStorage.setItem('onyx-payment-details', JSON.stringify(paymentDetails));

            setIsVerifying(false);
            setShowSuccess(true);

            setTimeout(() => {
                onUnlock(theme.id);
                onClose();
            }, 2000);
        }, 1500);
    };

    return (
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
                onClick={(e) => e.stopPropagation()}
                className="glass-strong rounded-2xl p-4 md:p-6 lg:p-8 max-w-md w-full modal-mobile border-2 border-white/20"
            >
                {!showSuccess ? (
                    <>
                        {/* Header */}
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3">
                                <div className={`p-2 rounded-lg bg-gradient-to-br ${theme.gradient}`}>
                                    <Sparkles className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <h2 className="text-xl md:text-2xl font-bold">Unlock Premium</h2>
                                    <p className="text-xs opacity-70">{theme.name}</p>
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

                        {/* Theme Preview */}
                        <div className="mb-6">
                            <div className={`w-full h-32 rounded-xl ${theme.preview} border-2 border-white/20 shadow-lg mb-3 relative overflow-hidden`}>
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <Sparkles className="w-12 h-12 text-white opacity-50" />
                                </div>
                            </div>
                            <p className="text-sm opacity-80 text-center">{theme.description}</p>
                        </div>

                        {/* Pricing */}
                        <div className="glass rounded-xl p-4 mb-6 text-center border border-white/10">
                            <p className="text-sm opacity-70 mb-2">One-time purchase</p>
                            <div className="text-5xl font-bold bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent mb-2">
                                ₹9
                            </div>
                            <p className="text-xs opacity-60">Unlock this premium theme forever</p>
                        </div>

                        {/* QR Code Section */}
                        <div className="glass rounded-xl p-4 mb-4 text-center border border-white/10">
                            <p className="text-sm font-semibold mb-3">Scan to Pay ₹9</p>
                            <div className="inline-block bg-white p-3 rounded-xl mb-3">
                                <img
                                    src="https://i.ibb.co/F43hqvF0/my-donation-qr-code.jpg"
                                    alt="Payment QR Code"
                                    className="w-40 h-40 md:w-32 md:h-32 object-contain mx-auto rounded-lg"
                                />
                            </div>
                            <p className="text-xs opacity-60 mb-3">Or use the button below</p>

                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={handleUPIPayment}
                                className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold py-3 px-6 rounded-xl shadow-lg mb-4 touch-target"
                            >
                                Pay ₹9 via UPI
                            </motion.button>

                            {/* UTR Verification Section */}
                            <div className="pt-4 border-t border-white/20">
                                <p className="text-sm font-semibold mb-2">After Payment, Enter UTR Number</p>
                                <p className="text-xs opacity-60 mb-3">
                                    Find your 12-digit UTR number in the payment confirmation
                                </p>

                                {error && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="mb-3 p-2 rounded-lg bg-red-500/20 border border-red-500/50 flex items-center gap-2"
                                    >
                                        <AlertCircle className="w-4 h-4 text-red-400" />
                                        <span className="text-xs text-red-300">{error}</span>
                                    </motion.div>
                                )}

                                <div className="flex gap-2 mb-2">
                                    <input
                                        type="text"
                                        value={utrNumber}
                                        onChange={(e) => {
                                            setUtrNumber(e.target.value.replace(/\D/g, '').slice(0, 12));
                                            setError('');
                                        }}
                                        placeholder="Enter 12-digit UTR"
                                        maxLength="12"
                                        className="flex-1 px-3 py-2 rounded-lg glass text-sm focus:outline-none focus:ring-2 focus:ring-green-500 text-center font-mono"
                                        style={{ fontSize: '16px' }}
                                        disabled={isVerifying}
                                    />
                                </div>

                                <motion.button
                                    whileHover={{ scale: isVerifying ? 1 : 1.02 }}
                                    whileTap={{ scale: isVerifying ? 1 : 0.98 }}
                                    onClick={handleUTRVerification}
                                    disabled={isVerifying || !utrNumber.trim()}
                                    className={`w-full font-bold py-3 px-6 rounded-xl shadow-lg transition-all ${isVerifying
                                            ? 'bg-gray-600 cursor-wait'
                                            : utrNumber.trim().length === 12
                                                ? 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white'
                                                : 'bg-gray-700 cursor-not-allowed opacity-50 text-gray-400'
                                        }`}
                                >
                                    {isVerifying ? (
                                        <span className="flex items-center justify-center gap-2">
                                            <motion.div
                                                animate={{ rotate: 360 }}
                                                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                                className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                                            />
                                            Verifying...
                                        </span>
                                    ) : (
                                        'Verify & Unlock Theme'
                                    )}
                                </motion.button>
                            </div>
                        </div>

                        {/* Manual Unlock (for testing) */}
                        <div className="pt-4 border-t border-white/10">
                            <p className="text-xs opacity-50 mb-2 text-center">Have an unlock code?</p>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={unlockCode}
                                    onChange={(e) => setUnlockCode(e.target.value)}
                                    placeholder="Enter code"
                                    className="flex-1 px-3 py-2 rounded-lg glass text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    style={{ fontSize: '16px' }}
                                />
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={handleManualUnlock}
                                    className="px-4 py-2 rounded-lg glass hover:glass-strong text-sm font-bold"
                                >
                                    Unlock
                                </motion.button>
                            </div>
                        </div>
                    </>
                ) : (
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="text-center py-8"
                    >
                        <motion.div
                            animate={{ scale: [1, 1.2, 1], rotate: [0, 360] }}
                            transition={{ duration: 0.6 }}
                            className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-r from-green-400 to-green-600 flex items-center justify-center"
                        >
                            <Check className="w-10 h-10 text-white" />
                        </motion.div>
                        <h3 className="text-2xl font-bold mb-2">Theme Unlocked!</h3>
                        <p className="opacity-70">Enjoy your premium {theme.name} theme</p>
                    </motion.div>
                )}
            </motion.div>
        </motion.div>
    );
};

export default PremiumPurchaseModal;

import { useState } from 'react';
import { motion } from 'framer-motion';
import { X, MessageSquare, Send } from 'lucide-react';

const FeedbackForm = ({ theme, onClose }) => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        message: '',
    });
    const [submitted, setSubmitted] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const response = await fetch('https://formspree.io/f/xyzndgby', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            if (response.ok) {
                setSubmitted(true);
                setTimeout(() => {
                    onClose();
                }, 2500);
            } else {
                alert('Failed to send feedback. Please try again.');
                setIsSubmitting(false);
            }
        } catch (error) {
            console.error('Error submitting feedback:', error);
            alert('Failed to send feedback. Please try again.');
            setIsSubmitting(false);
        }
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
        >
            <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                onClick={(e) => e.stopPropagation()}
                className="glass-strong rounded-2xl p-4 md:p-6 lg:p-8 max-w-md w-full modal-mobile"
            >
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500">
                            <MessageSquare className="w-6 h-6 text-white" />
                        </div>
                        <h2 className="text-xl md:text-2xl font-bold">Send Feedback</h2>
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

                {!submitted ? (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Name */}
                        <div>
                            <label className="block text-sm font-medium mb-2 opacity-80">
                                Your Name
                            </label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-4 md:py-3 rounded-xl glass focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                                placeholder="John Doe"
                                style={{ fontSize: '16px' }}
                            />
                        </div>

                        {/* Email */}
                        <div>
                            <label className="block text-sm font-medium mb-2 opacity-80">
                                Email Address
                            </label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-4 md:py-3 rounded-xl glass focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                                placeholder="john@example.com"
                                style={{ fontSize: '16px' }}
                            />
                        </div>

                        {/* Message */}
                        <div>
                            <label className="block text-sm font-medium mb-2 opacity-80">
                                Your Feedback
                            </label>
                            <textarea
                                name="message"
                                value={formData.message}
                                onChange={handleChange}
                                required
                                rows={5}
                                className="w-full px-4 py-3 rounded-xl glass focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all resize-none"
                                placeholder="Tell us what you think..."
                                style={{ fontSize: '16px' }}
                            />
                        </div>

                        {/* Submit Button */}
                        <motion.button
                            type="submit"
                            disabled={isSubmitting}
                            whileHover={{ scale: isSubmitting ? 1 : 1.02 }}
                            whileTap={{ scale: isSubmitting ? 1 : 0.98 }}
                            className={`w-full px-6 py-4 rounded-xl font-bold text-white bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 transition-all touch-target ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            <Send className="w-5 h-5 inline mr-2" />
                            {isSubmitting ? 'Sending...' : 'Send Feedback'}
                        </motion.button>
                    </form>
                ) : (
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="text-center py-8"
                    >
                        <motion.div
                            animate={{ scale: [1, 1.2, 1] }}
                            transition={{ duration: 0.5 }}
                            className="w-20 h-20 mx-auto mb-4 rounded-full bg-green-500 flex items-center justify-center"
                        >
                            <span className="text-4xl">✓</span>
                        </motion.div>
                        <h3 className="text-xl font-bold mb-2">Thank You!</h3>
                        <p className="opacity-70">Your feedback has been sent successfully.</p>
                    </motion.div>
                )}
            </motion.div>
        </motion.div>
    );
};

export default FeedbackForm;

import { motion } from 'framer-motion';
import { X, Mail, Code2, Shield, Facebook, Instagram } from 'lucide-react';

const AboutDeveloper = ({ theme, onClose }) => {
    const developers = [
        {
            name: 'Arman',
            role: 'IT Student & Full Stack Developer',
            image: '/developer1.jpg',
            bio: 'IT student passionate about cybersecurity and encryption technology. Focused on building secure, privacy-first applications that protect user data. Loves exploring cryptographic algorithms and implementing them in real-world projects like Onyx.',
            skills: ['React', 'Node.js', 'Cryptography', 'Security'],
            social: {
                facebook: 'https://www.facebook.com/white444ytbjc?mibextid=ZbWKwL',
                instagram: 'https://www.instagram.com/sunasaraah',
                email: 'sunasraarman7@gmail.com',
            },
        },
        {
            name: 'Ammar',
            role: 'IT Student & Frontend Developer',
            image: '/developer2.jpg',
            bio: 'IT student with a passion for creating stunning user interfaces and seamless user experiences. Specializes in modern web technologies and design systems. Dedicated to making encryption accessible through beautiful, intuitive design in applications like Onyx.',
            skills: ['React', 'UI/UX Design', 'Tailwind CSS', 'Framer Motion'],
            social: {
                facebook: 'https://www.facebook.com/share/17vXE4U2RQ/',
                instagram: 'https://www.instagram.com/ammar2712009?igsh=MnlxOXUwcnptcWxs',
                email: 'ammarshaikh6100@gmail.com',
            },
        },
    ];

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
                className="glass-strong rounded-2xl p-6 md:p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto border-2 border-white/10"
            >
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                        <div className="p-3 rounded-lg bg-gradient-to-br from-green-500 to-cyan-500 shadow-lg">
                            <Code2 className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold">Meet The Developers</h2>
                            <p className="text-sm opacity-70">The minds behind Onyx</p>
                        </div>
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

                {/* Developers Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    {developers.map((dev, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="glass rounded-xl p-6 border border-white/10 hover:border-green-500/50 transition-all"
                        >
                            {/* Developer Image */}
                            <div className="flex flex-col items-center mb-4">
                                <motion.div
                                    whileHover={{ scale: 1.05, rotate: 2 }}
                                    className="w-32 h-32 rounded-full overflow-hidden border-4 border-green-500/50 shadow-lg shadow-green-500/30 mb-4"
                                >
                                    <img
                                        src={dev.image}
                                        alt={dev.name}
                                        className="w-full h-full object-cover"
                                        onError={(e) => {
                                            e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="128" height="128"%3E%3Crect fill="%23333" width="128" height="128"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" fill="%2300ff41" font-size="48"%3E👤%3C/text%3E%3C/svg%3E';
                                        }}
                                    />
                                </motion.div>
                                <h3 className="text-xl font-bold mb-1">{dev.name}</h3>
                                <p className="text-sm opacity-70 text-center mb-3">{dev.role}</p>
                            </div>

                            {/* Bio */}
                            <div className="glass rounded-lg p-3 mb-4 border border-white/5">
                                <p className="text-sm leading-relaxed opacity-90 text-center">
                                    {dev.bio}
                                </p>
                            </div>

                            {/* Skills */}
                            <div className="mb-4">
                                <div className="flex flex-wrap gap-2 justify-center">
                                    {dev.skills.map((skill, idx) => (
                                        <span
                                            key={idx}
                                            className="px-3 py-1 rounded-full glass text-xs font-bold border border-green-500/30"
                                        >
                                            {skill}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            {/* Social Links */}
                            <div className="flex justify-center gap-3">
                                <motion.a
                                    href={dev.social.facebook}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    whileHover={{ scale: 1.1, y: -2 }}
                                    className="p-2 rounded-lg glass hover:glass-strong transition-all"
                                    title="Facebook"
                                >
                                    <Facebook className="w-5 h-5" />
                                </motion.a>
                                <motion.a
                                    href={dev.social.instagram}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    whileHover={{ scale: 1.1, y: -2 }}
                                    className="p-2 rounded-lg glass hover:glass-strong transition-all"
                                    title="Instagram"
                                >
                                    <Instagram className="w-5 h-5" />
                                </motion.a>
                                <motion.a
                                    href={`mailto:${dev.social.email}`}
                                    whileHover={{ scale: 1.1, y: -2 }}
                                    className="p-2 rounded-lg glass hover:glass-strong transition-all"
                                    title="Gmail"
                                >
                                    <Mail className="w-5 h-5" />
                                </motion.a>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Team Info */}
                <div className="glass rounded-xl p-6 border border-white/10">
                    <div className="flex items-center gap-3 mb-3">
                        <Shield className="w-6 h-6 text-green-500" />
                        <h3 className="text-lg font-bold">About Onyx</h3>
                    </div>
                    <p className="text-sm leading-relaxed opacity-90 mb-4">
                        Onyx was created by two IT students passionate about privacy and security.
                        Our mission is to provide everyone with access to military-grade AES encryption in a beautiful,
                        hacker-themed interface. All encryption happens locally in your browser - your messages never touch our servers.
                    </p>
                    <div className="flex flex-wrap gap-4 text-xs opacity-70">
                        <span>🔐 AES-256 Encryption</span>
                        <span>🇮🇳 Made in India</span>
                        <span>🚀 Open Source</span>
                        <span>🔒 Privacy First</span>
                    </div>
                </div>

                {/* Footer */}
                <div className="mt-6 pt-6 border-t border-white/10 text-center">
                    <p className="text-xs opacity-60">
                        Want to contribute? We're open to collaboration! 🤝
                    </p>
                </div>
            </motion.div>
        </motion.div>
    );
};

export default AboutDeveloper;

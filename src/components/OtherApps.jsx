import { motion } from 'framer-motion';
import { X, ExternalLink, Puzzle, Image, Gamepad2 } from 'lucide-react';

const OtherApps = ({ theme, onClose }) => {
    const apps = [
        {
            name: 'PuzzleVerse',
            description: 'Challenge your mind with amazing puzzles',
            url: 'https://puzzleverse1.netlify.app/',
            icon: Puzzle,
            gradient: 'from-purple-500 to-pink-600'
        },
        {
            name: 'WallCraft',
            description: 'Stunning wallpapers for your devices',
            url: 'https://wallcraft99.netlify.app/',
            icon: Image,
            gradient: 'from-blue-500 to-cyan-600'
        },
        {
            name: 'PokenGo',
            description: 'Catch and explore Pokémon adventures',
            url: 'https://pokengo.netlify.app/',
            icon: Gamepad2,
            gradient: 'from-red-500 to-yellow-600'
        }
    ];

    const handleAppClick = (url) => {
        window.open(url, '_blank', 'noopener,noreferrer');
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
            onClick={onClose}
        >
            <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                onClick={(e) => e.stopPropagation()}
                className="glass-strong rounded-2xl p-6 md:p-8 max-w-2xl w-full border-2 border-white/20 shadow-2xl max-h-[90vh] overflow-y-auto"
            >
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h2 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-cyan-400 to-purple-600 bg-clip-text text-transparent">
                            🚀 Our Other Apps & Webs
                        </h2>
                        <p className="text-sm opacity-70 mt-1 font-mono">
                            Explore our amazing collection
                        </p>
                    </div>
                    <motion.button
                        whileHover={{ scale: 1.1, rotate: 90 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={onClose}
                        className="p-2 rounded-full glass hover:glass-strong transition-all border border-white/20"
                    >
                        <X className="w-6 h-6" />
                    </motion.button>
                </div>

                {/* Apps Grid */}
                <div className="grid gap-4 md:gap-6">
                    {apps.map((app, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            whileHover={{ scale: 1.02, y: -2 }}
                            onClick={() => handleAppClick(app.url)}
                            className="glass rounded-xl p-5 border-2 border-white/10 hover:border-white/30 transition-all cursor-pointer group"
                        >
                            <div className="flex items-start gap-4">
                                {/* Icon */}
                                <motion.div
                                    whileHover={{ rotate: 360 }}
                                    transition={{ duration: 0.6 }}
                                    className={`w-14 h-14 rounded-xl bg-gradient-to-br ${app.gradient} flex items-center justify-center shadow-lg`}
                                >
                                    <app.icon className="w-7 h-7 text-white" />
                                </motion.div>

                                {/* Content */}
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <h3 className="text-xl font-bold">{app.name}</h3>
                                        <motion.div
                                            initial={{ opacity: 0, x: -10 }}
                                            whileHover={{ x: 5 }}
                                            className="opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <ExternalLink className="w-5 h-5 text-cyan-400" />
                                        </motion.div>
                                    </div>
                                    <p className="text-sm opacity-70 mb-2">{app.description}</p>
                                    <div className="flex items-center gap-2">
                                        <div className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-mono">
                                            {app.url.replace('https://', '')}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Hover Effect Line */}
                            <motion.div
                                initial={{ scaleX: 0 }}
                                whileHover={{ scaleX: 1 }}
                                className={`h-1 mt-4 rounded-full bg-gradient-to-r ${app.gradient}`}
                                style={{ transformOrigin: 'left' }}
                            />
                        </motion.div>
                    ))}
                </div>

                {/* Footer */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="mt-6 p-4 rounded-xl bg-gradient-to-r from-cyan-500/10 to-purple-500/10 border border-white/10"
                >
                    <p className="text-sm text-center opacity-80 font-mono">
                        💡 Click on any app to visit and explore!
                    </p>
                </motion.div>
            </motion.div>
        </motion.div>
    );
};

export default OtherApps;

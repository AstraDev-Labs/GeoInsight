'use client';

import { motion } from 'framer-motion';
import { Wrench, AlertTriangle, Globe } from 'lucide-react';

interface LockdownScreenProps {
    mode: 'maintenance' | 'technical_difficulties';
    message?: string;
}

export default function LockdownScreen({ mode, message }: LockdownScreenProps) {
    const isMaintenance = mode === 'maintenance';

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-[#0a0a0a] text-white relative overflow-hidden">
            {/* Animated background grid */}
            <div className="absolute inset-0 opacity-[0.03]" style={{
                backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
                backgroundSize: '60px 60px',
            }} />

            {/* Glowing orb */}
            <div className={`absolute w-[600px] h-[600px] rounded-full blur-[120px] opacity-20 ${isMaintenance ? 'bg-amber-500' : 'bg-red-500'}`}
                style={{ top: '30%', left: '50%', transform: 'translate(-50%, -50%)' }}
            />

            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
                className="relative z-10 text-center px-6 max-w-2xl"
            >
                {/* Icon */}
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: 'spring', stiffness: 200, damping: 15 }}
                    className={`w-24 h-24 rounded-2xl mx-auto mb-8 flex items-center justify-center ${isMaintenance
                            ? 'bg-gradient-to-br from-amber-500/20 to-amber-600/10 border border-amber-500/30'
                            : 'bg-gradient-to-br from-red-500/20 to-red-600/10 border border-red-500/30'
                        }`}
                >
                    {isMaintenance ? (
                        <Wrench className="w-12 h-12 text-amber-400" />
                    ) : (
                        <AlertTriangle className="w-12 h-12 text-red-400" />
                    )}
                </motion.div>

                {/* Status badge */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest mb-6 ${isMaintenance
                            ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                            : 'bg-red-500/10 text-red-400 border border-red-500/20'
                        }`}
                >
                    <span className={`w-2 h-2 rounded-full animate-pulse ${isMaintenance ? 'bg-amber-400' : 'bg-red-400'}`} />
                    {isMaintenance ? 'Scheduled Maintenance' : 'Technical Difficulties'}
                </motion.div>

                {/* Heading */}
                <motion.h1
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="text-4xl sm:text-5xl font-bold tracking-tight mb-4"
                >
                    {isMaintenance ? 'We\'ll Be Right Back' : 'Something Went Wrong'}
                </motion.h1>

                {/* Description */}
                <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="text-lg text-gray-400 mb-8 leading-relaxed"
                >
                    {message || (isMaintenance
                        ? 'GeoForesight is currently undergoing scheduled maintenance to improve your experience. We\'ll be back online shortly.'
                        : 'GeoForesight is currently experiencing technical difficulties. Our team is actively working to resolve the issue. Please check back soon.'
                    )}
                </motion.p>

                {/* Animated divider */}
                <motion.div
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ delay: 0.7, duration: 0.6 }}
                    className={`h-px w-48 mx-auto mb-8 ${isMaintenance ? 'bg-gradient-to-r from-transparent via-amber-500/50 to-transparent' : 'bg-gradient-to-r from-transparent via-red-500/50 to-transparent'}`}
                />

                {/* Footer info */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8 }}
                    className="flex items-center justify-center gap-2 text-gray-500 text-sm"
                >
                    <Globe className="w-4 h-4" />
                    <span>GeoForesight Intelligence Platform</span>
                </motion.div>
            </motion.div>
        </div>
    );
}

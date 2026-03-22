import { Outlet, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';

export default function AuthLayout() {
    return (
        <div className="min-h-screen flex items-center justify-center p-3 sm:p-4 relative overflow-hidden safe-area-padding"
            style={{
                background: 'radial-gradient(ellipse at top left, rgba(109,40,217,0.12) 0%, transparent 55%), radial-gradient(ellipse at bottom right, rgba(5,150,105,0.1) 0%, transparent 55%), #020617',
            }}
        >
            {/* Background Effects */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="blob absolute top-1/4 left-1/4 w-48 sm:w-72 h-48 sm:h-72 rounded-full"
                    style={{ background: 'radial-gradient(circle, rgba(109,40,217,0.25), transparent)' }}
                />
                <div className="blob-slow absolute bottom-1/4 right-1/4 w-48 sm:w-72 h-48 sm:h-72 rounded-full"
                    style={{ background: 'radial-gradient(circle, rgba(5,150,105,0.2), transparent)' }}
                />
                {/* Grid overlay */}
                <div className="absolute inset-0 opacity-[0.025]"
                    style={{
                        backgroundImage: 'linear-gradient(rgba(139,92,246,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(139,92,246,0.5) 1px, transparent 1px)',
                        backgroundSize: '60px 60px',
                    }}
                />
            </div>

            {/* Content */}
            <motion.div
                initial={{ opacity: 0, y: 24, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.5, ease: [0.34, 1.56, 0.64, 1] }}
                className="w-full max-w-sm sm:max-w-md relative z-10"
            >
                {/* Logo */}
                <Link to="/" className="flex items-center justify-center gap-2.5 mb-6 sm:mb-8 group">
                    <div className="relative">
                        <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-primary-500 to-secondary-500 blur-md opacity-60 group-hover:opacity-80 transition-opacity" />
                        <div className="relative w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-primary-600 via-primary-500 to-secondary-500 flex items-center justify-center shadow-lg">
                            <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                        </div>
                    </div>
                    <div>
                        <span className="font-display text-lg sm:text-xl font-bold gradient-text tracking-tight">
                            AI Interviewer
                        </span>
                        <p className="text-[9px] text-dark-500 font-medium tracking-widest -mt-0.5">PRACTICE PLATFORM</p>
                    </div>
                </Link>

                {/* Auth Form Container */}
                <div className="relative rounded-2xl p-5 sm:p-6 md:p-7"
                    style={{
                        background: 'rgba(9,14,35,0.75)',
                        backdropFilter: 'blur(24px)',
                        WebkitBackdropFilter: 'blur(24px)',
                        border: '1px solid rgba(71,85,105,0.35)',
                        boxShadow: '0 20px 60px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.05)',
                    }}
                >
                    {/* Top gradient line */}
                    <div className="absolute top-0 left-8 right-8 h-px rounded-full"
                        style={{
                            background: 'linear-gradient(90deg, transparent, rgba(139,92,246,0.5) 30%, rgba(16,185,129,0.5) 70%, transparent)',
                        }}
                    />
                    <Outlet />
                </div>

                {/* Footer */}
                <p className="text-center text-dark-600 text-[10px] sm:text-xs mt-5">
                    © 2024 AI Interviewer. All rights reserved.
                </p>
            </motion.div>
        </div>
    );
}

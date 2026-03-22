import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '../../stores/authStore';
import {
    LayoutDashboard,
    MessageSquarePlus,
    History,
    BarChart3,
    Settings,
    LogOut,
    ChevronLeft,
    Menu,
    X,
    Sparkles,
    User,
    Flame,
    Trophy
} from 'lucide-react';
import { useState } from 'react';

const navItems = [
    { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/daily-practice', icon: Flame, label: 'Daily Practice' },
    { path: '/interview/new', icon: MessageSquarePlus, label: 'New Interview' },
    { path: '/history', icon: History, label: 'History' },
    { path: '/analytics', icon: BarChart3, label: 'Analytics' },
    { path: '/achievements', icon: Trophy, label: 'Achievements' },
    { path: '/settings', icon: Settings, label: 'Settings' },
];

export default function Layout() {
    const navigate = useNavigate();
    const { user, logout } = useAuthStore();
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const handleLogout = async () => {
        await logout();
        navigate('/');
    };

    return (
        <div className="min-h-screen bg-dark-950 flex">
            {/* Desktop Sidebar */}
            <motion.aside
                initial={false}
                animate={{ width: sidebarCollapsed ? 76 : 272 }}
                transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
                className="hidden lg:flex flex-col fixed left-0 top-0 h-screen z-50"
                style={{
                    background: 'linear-gradient(180deg, rgba(9,14,35,0.97) 0%, rgba(7,10,26,0.98) 100%)',
                    borderRight: '1px solid rgba(51,65,85,0.4)',
                    boxShadow: '4px 0 30px rgba(0,0,0,0.4), inset -1px 0 0 rgba(255,255,255,0.03)',
                }}
            >
                {/* Logo */}
                <div className="p-5 flex items-center justify-between border-b border-dark-800/40">
                    <AnimatePresence>
                        {!sidebarCollapsed && (
                            <motion.div
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -10 }}
                                transition={{ duration: 0.2 }}
                                className="flex items-center gap-3"
                            >
                                <div className="relative">
                                    <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-primary-500 to-secondary-500 blur-md opacity-50" />
                                    <div className="relative w-9 h-9 rounded-xl bg-gradient-to-br from-primary-600 via-primary-500 to-secondary-500 flex items-center justify-center shadow-lg">
                                        <Sparkles className="w-5 h-5 text-white" />
                                    </div>
                                </div>
                                <div>
                                    <span className="font-display text-base font-bold gradient-text leading-none">
                                        AI Interviewer
                                    </span>
                                    <p className="text-[10px] text-dark-500 mt-0.5 font-medium tracking-wider">PRACTICE PLATFORM</p>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                    <button
                        onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                        className="p-2 rounded-lg text-dark-500 hover:text-dark-200 transition-all hover:bg-dark-800/60 flex-shrink-0"
                    >
                        <ChevronLeft
                            className={`w-4 h-4 transition-transform duration-300 ${sidebarCollapsed ? 'rotate-180' : ''}`}
                        />
                    </button>
                </div>

                {/* Navigation */}
                <nav className="flex-1 px-3 py-5 space-y-1 overflow-y-auto hide-scrollbar">
                    {navItems.map((item, index) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            className={({ isActive }) =>
                                `flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 cursor-pointer relative group ${
                                    isActive
                                        ? 'text-primary-300'
                                        : 'text-dark-400 hover:text-dark-100'
                                } ${sidebarCollapsed ? 'justify-center' : ''}`
                            }
                            style={({ isActive }) => isActive ? {
                                background: 'linear-gradient(135deg, rgba(109,40,217,0.18) 0%, rgba(16,185,129,0.08) 100%)',
                                border: '1px solid rgba(139,92,246,0.22)',
                                boxShadow: 'inset 0 1px 0 rgba(139,92,246,0.08), 0 2px 8px rgba(0,0,0,0.2)',
                            } : {
                                border: '1px solid transparent',
                            }}
                        >
                            {({ isActive }) => (
                                <>
                                    {/* Active pill indicator */}
                                    {isActive && (
                                        <span className="sidebar-active-pill" />
                                    )}

                                    {/* Icon with glow when active */}
                                    <span className={`flex-shrink-0 transition-all duration-200 ${
                                        isActive ? 'text-primary-400' : 'text-dark-500 group-hover:text-dark-200'
                                    }`}
                                    style={isActive ? {
                                        filter: 'drop-shadow(0 0 6px rgba(139,92,246,0.5))'
                                    } : {}}>
                                        <item.icon className="w-[18px] h-[18px]" />
                                    </span>

                                    {!sidebarCollapsed && (
                                        <motion.span
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            transition={{ delay: 0.05 }}
                                            className={`font-medium text-sm ${isActive ? 'text-primary-200' : ''}`}
                                        >
                                            {item.label}
                                        </motion.span>
                                    )}

                                    {/* Hover background for inactive */}
                                    {!({ isActive }).toString().includes('true') && (
                                        <span className="absolute inset-0 rounded-xl bg-dark-800/40 opacity-0 group-hover:opacity-100 transition-opacity" />
                                    )}
                                </>
                            )}
                        </NavLink>
                    ))}
                </nav>

                {/* User section */}
                <div className="p-3 border-t border-dark-800/40">
                    <div
                        className={`flex items-center gap-3 p-3 rounded-xl transition-all ${sidebarCollapsed ? 'justify-center' : ''}`}
                        style={{
                            background: 'rgba(15,23,42,0.6)',
                            border: '1px solid rgba(51,65,85,0.4)',
                        }}
                    >
                        <div className="relative flex-shrink-0">
                            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center shadow-glow-sm">
                                {user?.avatar ? (
                                    <img src={user.avatar} alt={user.fullName} className="w-full h-full rounded-full object-cover" />
                                ) : (
                                    <User className="w-4 h-4 text-white" />
                                )}
                            </div>
                            <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-secondary-500 border-2 border-dark-950" />
                        </div>

                        {!sidebarCollapsed && (
                            <>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-semibold text-white truncate leading-none">{user?.fullName}</p>
                                    <p className="text-[11px] text-dark-500 truncate mt-0.5">{user?.email}</p>
                                </div>
                                <button
                                    onClick={handleLogout}
                                    className="p-1.5 rounded-lg text-dark-500 hover:text-error-400 hover:bg-error-500/10 transition-all"
                                    title="Logout"
                                >
                                    <LogOut className="w-4 h-4" />
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </motion.aside>

            {/* Mobile Header */}
            <div className="lg:hidden fixed top-0 left-0 right-0 h-12 z-50 flex items-center justify-between px-3 safe-area-padding"
                style={{
                    background: 'rgba(7,10,26,0.92)',
                    backdropFilter: 'blur(20px)',
                    WebkitBackdropFilter: 'blur(20px)',
                    borderBottom: '1px solid rgba(51,65,85,0.3)',
                    boxShadow: '0 2px 16px rgba(0,0,0,0.4)',
                }}
            >
                <div className="flex items-center gap-2">
                    <div className="relative">
                        <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-primary-500 to-secondary-500 blur-sm opacity-60" />
                        <div className="relative w-7 h-7 rounded-lg bg-gradient-to-br from-primary-600 to-secondary-500 flex items-center justify-center">
                            <Sparkles className="w-3.5 h-3.5 text-white" />
                        </div>
                    </div>
                    <span className="font-display font-bold text-sm gradient-text tracking-tight">
                        AI Interviewer
                    </span>
                </div>
                <button
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    className="p-1.5 rounded-lg text-dark-400 hover:text-white hover:bg-dark-800 active:bg-dark-700 min-w-[36px] min-h-[36px] flex items-center justify-center transition-all"
                >
                    {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                </button>
            </div>

            {/* Mobile Menu Overlay */}
            <AnimatePresence>
                {mobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="lg:hidden fixed inset-0 z-40"
                        style={{ background: 'rgba(2,6,23,0.75)', backdropFilter: 'blur(4px)' }}
                        onClick={() => setMobileMenuOpen(false)}
                    />
                )}
            </AnimatePresence>

            {/* Mobile Menu */}
            <motion.div
                initial={{ x: '100%' }}
                animate={{ x: mobileMenuOpen ? 0 : '100%' }}
                transition={{ type: 'spring', damping: 22, stiffness: 200 }}
                className="lg:hidden fixed right-0 top-0 bottom-0 w-[72%] max-w-[260px] z-50 pt-14 safe-area-padding"
                style={{
                    background: 'linear-gradient(180deg, rgba(9,14,35,0.98) 0%, rgba(7,10,26,0.99) 100%)',
                    borderLeft: '1px solid rgba(51,65,85,0.4)',
                    boxShadow: '-4px 0 30px rgba(0,0,0,0.5)',
                }}
            >
                <nav className="px-3 py-3 space-y-1">
                    {navItems.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            onClick={() => setMobileMenuOpen(false)}
                            className={({ isActive }) =>
                                `flex items-center gap-2.5 px-3 py-2.5 rounded-xl transition-all ${
                                    isActive
                                        ? 'text-primary-300'
                                        : 'text-dark-400 hover:text-white hover:bg-dark-800/60'
                                }`
                            }
                            style={({ isActive }) => isActive ? {
                                background: 'linear-gradient(135deg, rgba(109,40,217,0.2) 0%, rgba(16,185,129,0.08) 100%)',
                                border: '1px solid rgba(139,92,246,0.25)',
                            } : { border: '1px solid transparent' }}
                        >
                            {({ isActive }) => (
                                <>
                                    <item.icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-primary-400' : 'text-dark-500'}`} />
                                    <span className="font-medium text-sm">{item.label}</span>
                                </>
                            )}
                        </NavLink>
                    ))}

                    <div className="pt-3 mt-3 border-t border-dark-800/50">
                        <button
                            onClick={handleLogout}
                            className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-error-400 hover:bg-error-500/10 transition-all border border-transparent"
                        >
                            <LogOut className="w-4 h-4" />
                            <span className="font-medium text-sm">Logout</span>
                        </button>
                    </div>
                </nav>
            </motion.div>

            {/* Main Content */}
            <main
                className={`flex-1 transition-all duration-300 ${sidebarCollapsed ? 'lg:ml-[76px]' : 'lg:ml-[272px]'} pt-12 lg:pt-0`}
            >
                <div className="min-h-screen p-3 sm:p-4 md:p-6 lg:p-8 safe-area-padding">
                    <Outlet />
                </div>
            </main>
        </div>
    );
}

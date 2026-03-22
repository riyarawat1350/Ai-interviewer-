import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '../stores/authStore';
import { useDailyPracticeStore } from '../stores/dailyPracticeStore';
import { analyticsService } from '../services/interviewService';
import { SkeletonDashboard } from '../components/ui/Skeleton';
import { BadgeSummary, BADGE_DEFINITIONS } from '../components/ui/AchievementBadges';
import {
    MessageSquarePlus,
    TrendingUp,
    Clock,
    Award,
    Target,
    ArrowRight,
    Calendar,
    Flame,
    BarChart3,
    Sparkles,
    CheckCircle2,
    Trophy,
    Zap
} from 'lucide-react';

export default function Dashboard() {
    const { user } = useAuthStore();
    const navigate = useNavigate();

    const { data: analytics, isLoading } = useQuery({
        queryKey: ['dashboard-analytics'],
        queryFn: analyticsService.getDashboard
    });

    const dashboardData = analytics?.data;

    const calculateUnlockedBadges = () => {
        const overview = dashboardData?.overview || {};
        const unlocked = [];

        if (overview.totalInterviews >= 1) unlocked.push('first_interview');
        if (overview.totalInterviews >= 10) unlocked.push('interview_10');
        if (overview.totalInterviews >= 25) unlocked.push('interview_25');
        if (overview.totalInterviews >= 50) unlocked.push('interview_50');

        const longestStreak = overview.longestStreak || overview.currentStreak || 0;
        if (longestStreak >= 3) unlocked.push('streak_3');
        if (longestStreak >= 7) unlocked.push('streak_7');
        if (longestStreak >= 14) unlocked.push('streak_14');

        if (overview.averageScore >= 80) unlocked.push('consistent');
        if ((dashboardData?.recentInterviews?.filter(i => i.score >= 90).length || 0) >= 5) unlocked.push('high_scorer');

        const dailyDaysCompleted = user?.statistics?.streakDays || 0;
        if (dailyDaysCompleted >= 1) unlocked.push('daily_first');
        if (dailyDaysCompleted >= 7) unlocked.push('daily_7');

        return unlocked;
    };

    const unlockedBadgeIds = calculateUnlockedBadges();

    const getScoreColor = (score) => {
        if (score >= 85) return 'text-success-400';
        if (score >= 70) return 'text-primary-400';
        if (score >= 55) return 'text-warning-400';
        return 'text-error-400';
    };

    const getPerformanceBadge = (level) => {
        const badges = {
            excellent: { text: 'Excellent', class: 'badge-success' },
            good: { text: 'Good', class: 'badge-primary' },
            average: { text: 'Average', class: 'badge-warning' },
            'needs-improvement': { text: 'Needs Work', class: 'badge-error' }
        };
        return badges[level] || badges.average;
    };

    if (isLoading) {
        return <SkeletonDashboard />;
    }

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.08 }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 16 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.4, 0, 0.2, 1] } }
    };

    const statCards = [
        {
            icon: Clock,
            label: 'Interviews',
            value: dashboardData?.overview?.totalInterviews || 0,
            gradient: 'from-violet-500 to-indigo-600',
            glow: 'rgba(139,92,246,0.4)',
            iconBg: 'rgba(109,40,217,0.25)',
            iconColor: '#a78bfa',
        },
        {
            icon: Target,
            label: 'Avg Score',
            value: `${dashboardData?.overview?.averageScore || 0}%`,
            gradient: 'from-emerald-500 to-teal-600',
            glow: 'rgba(16,185,129,0.4)',
            iconBg: 'rgba(4,120,87,0.25)',
            iconColor: '#34d399',
        },
        {
            icon: Flame,
            label: 'Streak',
            value: `${dashboardData?.overview?.currentStreak || 0}d`,
            gradient: 'from-orange-500 to-red-500',
            glow: 'rgba(249,115,22,0.4)',
            iconBg: 'rgba(194,65,12,0.25)',
            iconColor: '#fb923c',
        },
        {
            icon: Award,
            label: 'Level',
            value: dashboardData?.performanceLevel
                ? getPerformanceBadge(dashboardData.performanceLevel).text
                : 'N/A',
            gradient: 'from-fuchsia-500 to-pink-600',
            glow: 'rgba(192,38,211,0.4)',
            iconBg: 'rgba(134,25,143,0.25)',
            iconColor: '#e879f9',
        }
    ];

    return (
        <motion.div
            className="space-y-4 sm:space-y-5 lg:space-y-6"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >
            {/* Welcome Header */}
            <motion.div
                variants={itemVariants}
                className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
            >
                <div className="text-center sm:text-left">
                    <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-1">
                        Welcome back,{' '}
                        <span className="gradient-text">{user?.firstName}</span>! 👋
                    </h1>
                    <p className="text-dark-400 text-xs sm:text-sm">
                        Ready to sharpen your interview skills today?
                    </p>
                </div>
                <Link
                    to="/interview/new"
                    className="btn-neon text-xs sm:text-sm inline-flex self-center sm:self-auto"
                    style={{ padding: '0.6rem 1.25rem', borderRadius: '0.75rem', fontSize: '0.85rem' }}
                >
                    <MessageSquarePlus className="w-4 h-4" />
                    New Interview
                </Link>
            </motion.div>

            {/* Stats Overview */}
            <motion.div variants={itemVariants} className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3 lg:gap-4">
                {statCards.map((stat, index) => (
                    <motion.div
                        key={stat.label}
                        initial={{ opacity: 0, y: 20, scale: 0.97 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        transition={{ delay: 0.1 + index * 0.08, duration: 0.45, ease: [0.4, 0, 0.2, 1] }}
                        className="relative rounded-2xl p-3.5 sm:p-4 lg:p-5 overflow-hidden group cursor-default"
                        style={{
                            background: 'linear-gradient(135deg, rgba(15,23,42,0.9) 0%, rgba(9,14,35,0.85) 100%)',
                            border: '1px solid rgba(51,65,85,0.45)',
                            boxShadow: '0 4px 20px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.04)',
                            transition: 'all 0.3s cubic-bezier(0.4,0,0.2,1)',
                        }}
                        onMouseEnter={e => {
                            e.currentTarget.style.transform = 'translateY(-4px)';
                            e.currentTarget.style.boxShadow = `0 8px 32px rgba(0,0,0,0.45), 0 0 20px ${stat.glow.replace('0.4', '0.2')}, inset 0 1px 0 rgba(255,255,255,0.06)`;
                            e.currentTarget.style.borderColor = stat.glow.replace('rgba', 'rgba').replace('0.4', '0.35');
                        }}
                        onMouseLeave={e => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.04)';
                            e.currentTarget.style.borderColor = 'rgba(51,65,85,0.45)';
                        }}
                    >
                        {/* BG gradient accent */}
                        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                            style={{
                                background: `radial-gradient(circle at top right, ${stat.glow.replace('0.4', '0.08')} 0%, transparent 70%)`
                            }}
                        />

                        <div className="relative">
                            {/* Icon */}
                            <div
                                className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center mb-2.5 sm:mb-3"
                                style={{ background: stat.iconBg, border: `1px solid ${stat.iconColor}30` }}
                            >
                                <stat.icon className="w-4 h-4 sm:w-5 sm:h-5" style={{ color: stat.iconColor }} />
                            </div>

                            <p className="text-dark-500 text-[10px] sm:text-xs font-medium tracking-wide mb-0.5 uppercase">
                                {stat.label}
                            </p>
                            <p className="text-lg sm:text-2xl lg:text-3xl font-bold text-white truncate" style={{
                                textShadow: `0 0 20px ${stat.glow.replace('0.4', '0.3')}`
                            }}>
                                {stat.value}
                            </p>
                        </div>
                    </motion.div>
                ))}
            </motion.div>

            {/* Daily Practice Card */}
            <motion.div
                variants={itemVariants}
                className="relative rounded-2xl p-4 sm:p-5 overflow-hidden"
                style={{
                    background: 'linear-gradient(135deg, rgba(234,88,12,0.12) 0%, rgba(239,68,68,0.08) 50%, rgba(109,40,217,0.1) 100%)',
                    border: '1px solid rgba(234,88,12,0.25)',
                    boxShadow: '0 4px 24px rgba(0,0,0,0.3), inset 0 1px 0 rgba(251,146,60,0.08)',
                }}
            >
                {/* Decorative background orb */}
                <div className="absolute -right-8 -top-8 w-32 h-32 rounded-full opacity-20"
                    style={{ background: 'radial-gradient(circle, #f97316, transparent)' }}
                />
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 relative z-10">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
                            style={{ background: 'linear-gradient(135deg, #ea580c, #ef4444)', boxShadow: '0 4px 16px rgba(234,88,12,0.4)' }}>
                            <Flame className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h3 className="text-base sm:text-lg font-bold text-white mb-0.5">Daily Practice</h3>
                            <p className="text-dark-400 text-xs sm:text-sm">
                                Complete today's questions to maintain your streak!
                            </p>
                        </div>
                    </div>
                    <Link
                        to="/daily-practice"
                        className="self-start sm:self-auto inline-flex items-center gap-2 text-sm font-semibold text-white px-5 py-2.5 rounded-xl transition-all"
                        style={{
                            background: 'linear-gradient(135deg, #ea580c, #ef4444)',
                            boxShadow: '0 4px 16px rgba(234,88,12,0.35)',
                        }}
                        onMouseEnter={e => {
                            e.currentTarget.style.transform = 'translateY(-2px)';
                            e.currentTarget.style.boxShadow = '0 8px 24px rgba(234,88,12,0.5)';
                        }}
                        onMouseLeave={e => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = '0 4px 16px rgba(234,88,12,0.35)';
                        }}
                    >
                        <CheckCircle2 className="w-4 h-4" />
                        Start Practice
                        <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>
            </motion.div>

            {/* Main Content Grid */}
            <div className="grid gap-3 sm:gap-4 lg:gap-5 lg:grid-cols-3">
                {/* Quick Actions */}
                <motion.div
                    variants={itemVariants}
                    className="rounded-2xl p-4 sm:p-5"
                    style={{
                        background: 'linear-gradient(135deg, rgba(9,14,35,0.9) 0%, rgba(7,10,26,0.85) 100%)',
                        border: '1px solid rgba(51,65,85,0.4)',
                        boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
                    }}
                >
                    <h2 className="text-sm sm:text-base font-semibold text-white mb-3 sm:mb-4 flex items-center gap-2">
                        <Zap className="w-4 h-4 text-primary-400" />
                        Quick Start
                    </h2>
                    <div className="grid grid-cols-2 gap-2">
                        {[
                            { type: 'technical', label: 'Technical', icon: '💻', gradient: 'linear-gradient(135deg, #1d4ed8, #2563eb)', glow: 'rgba(37,99,235,0.3)' },
                            { type: 'behavioral', label: 'Behavioral', icon: '🧠', gradient: 'linear-gradient(135deg, #7e22ce, #9333ea)', glow: 'rgba(147,51,234,0.3)' },
                            { type: 'system-design', label: 'System', icon: '⚡', gradient: 'linear-gradient(135deg, #b45309, #d97706)', glow: 'rgba(217,119,6,0.3)' },
                            { type: 'hr', label: 'HR Round', icon: '🤝', gradient: 'linear-gradient(135deg, #065f46, #059669)', glow: 'rgba(5,150,105,0.3)' }
                        ].map((interview) => (
                            <Link
                                key={interview.type}
                                to={`/interview/new?type=${interview.type}`}
                                className="relative p-3 rounded-xl text-white font-semibold text-center text-xs sm:text-sm transition-all overflow-hidden group"
                                style={{
                                    background: `${interview.gradient}`,
                                    boxShadow: `0 4px 12px ${interview.glow}`,
                                }}
                                onMouseEnter={e => {
                                    e.currentTarget.style.transform = 'translateY(-2px) scale(1.03)';
                                    e.currentTarget.style.boxShadow = `0 8px 20px ${interview.glow.replace('0.3', '0.5')}`;
                                }}
                                onMouseLeave={e => {
                                    e.currentTarget.style.transform = 'translateY(0) scale(1)';
                                    e.currentTarget.style.boxShadow = `0 4px 12px ${interview.glow}`;
                                }}
                            >
                                <div className="text-lg mb-1">{interview.icon}</div>
                                {interview.label}
                            </Link>
                        ))}
                    </div>
                </motion.div>

                {/* Recent Interviews */}
                <motion.div
                    variants={itemVariants}
                    className="rounded-2xl p-4 sm:p-5 lg:col-span-2"
                    style={{
                        background: 'linear-gradient(135deg, rgba(9,14,35,0.9) 0%, rgba(7,10,26,0.85) 100%)',
                        border: '1px solid rgba(51,65,85,0.4)',
                        boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
                    }}
                >
                    <div className="flex items-center justify-between mb-3 sm:mb-4">
                        <h2 className="text-sm sm:text-base font-semibold text-white flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-primary-400" />
                            Recent Interviews
                        </h2>
                        <Link to="/history" className="text-primary-400 hover:text-primary-300 text-xs sm:text-sm flex items-center gap-0.5 transition-colors">
                            View All <ArrowRight className="w-3 h-3" />
                        </Link>
                    </div>

                    {isLoading ? (
                        <div className="space-y-2">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="h-12 skeleton rounded-xl" />
                            ))}
                        </div>
                    ) : dashboardData?.recentInterviews?.length > 0 ? (
                        <div className="space-y-2">
                            {dashboardData.recentInterviews.slice(0, 5).map((interview, idx) => (
                                <Link
                                    key={interview.sessionId}
                                    to={`/interview/${interview.sessionId}/report`}
                                    className="flex items-center justify-between p-3 rounded-xl transition-all group"
                                    style={{
                                        background: 'rgba(255,255,255,0.03)',
                                        border: '1px solid rgba(51,65,85,0.35)',
                                        transition: 'all 0.2s ease',
                                    }}
                                    onMouseEnter={e => {
                                        e.currentTarget.style.background = 'rgba(139,92,246,0.06)';
                                        e.currentTarget.style.borderColor = 'rgba(139,92,246,0.25)';
                                    }}
                                    onMouseLeave={e => {
                                        e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
                                        e.currentTarget.style.borderColor = 'rgba(51,65,85,0.35)';
                                    }}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                                            style={{ background: 'rgba(139,92,246,0.15)', border: '1px solid rgba(139,92,246,0.2)' }}>
                                            <BarChart3 className="w-4 h-4 text-primary-400" />
                                        </div>
                                        <div>
                                            <p className="text-white font-medium text-xs sm:text-sm capitalize">
                                                {interview.type}
                                            </p>
                                            <p className="text-dark-500 text-[10px] sm:text-xs">
                                                {new Date(interview.date).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right flex items-center gap-2">
                                        <div>
                                            <p className={`text-sm sm:text-base font-bold ${getScoreColor(interview.score)}`}>
                                                {interview.score}%
                                            </p>
                                            <p className="text-dark-500 text-[9px] sm:text-xs capitalize">{interview.difficulty}</p>
                                        </div>
                                        <ArrowRight className="w-3 h-3 text-dark-600 group-hover:text-primary-400 group-hover:translate-x-0.5 transition-all" />
                                    </div>
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8 sm:py-10">
                            <div className="w-14 h-14 rounded-2xl mx-auto mb-3 flex items-center justify-center"
                                style={{ background: 'rgba(139,92,246,0.1)', border: '1px dashed rgba(139,92,246,0.3)' }}>
                                <BarChart3 className="w-7 h-7 text-primary-400 opacity-60" />
                            </div>
                            <p className="text-dark-400 text-xs sm:text-sm mb-3">No interviews yet</p>
                            <Link to="/interview/new"
                                className="inline-flex items-center gap-1.5 text-xs font-semibold text-white px-4 py-2 rounded-lg transition-all"
                                style={{ background: 'linear-gradient(135deg, #7c3aed, #8b5cf6)', boxShadow: '0 4px 12px rgba(139,92,246,0.3)' }}
                            >
                                Start First Interview
                            </Link>
                        </div>
                    )}
                </motion.div>
            </div>

            {/* Skill Breakdown */}
            {dashboardData?.skillRadar?.length > 0 && (
                <motion.div
                    variants={itemVariants}
                    className="rounded-2xl p-4 sm:p-5"
                    style={{
                        background: 'linear-gradient(135deg, rgba(9,14,35,0.9) 0%, rgba(7,10,26,0.85) 100%)',
                        border: '1px solid rgba(51,65,85,0.4)',
                        boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
                    }}
                >
                    <h2 className="text-sm sm:text-base lg:text-lg font-semibold text-white mb-4 sm:mb-5 flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 lg:w-5 lg:h-5 text-secondary-400" />
                        Skill Breakdown
                    </h2>
                    <div className="grid grid-cols-5 gap-2 sm:gap-3 lg:gap-5">
                        {dashboardData.skillRadar.map((skill, index) => {
                            const score = skill.score;
                            const color = score >= 80 ? '#22c55e' : score >= 60 ? '#8b5cf6' : '#f59e0b';
                            const circumference = 2 * Math.PI * 35;
                            return (
                                <div key={skill.skill} className="text-center group">
                                    <div className="relative w-12 h-12 sm:w-14 sm:h-14 lg:w-20 lg:h-20 mx-auto mb-2">
                                        <svg className="w-full h-full" style={{ transform: 'rotate(-90deg)' }}>
                                            <circle
                                                cx="50%" cy="50%" r="42%"
                                                stroke="rgba(51,65,85,0.6)" strokeWidth="6"
                                                fill="transparent"
                                            />
                                            <circle
                                                cx="50%" cy="50%" r="42%"
                                                stroke={color}
                                                strokeWidth="6"
                                                fill="transparent"
                                                strokeDasharray={circumference}
                                                strokeDashoffset={circumference * (1 - score / 100)}
                                                strokeLinecap="round"
                                                style={{ filter: `drop-shadow(0 0 4px ${color}80)`, transition: 'stroke-dashoffset 1s ease' }}
                                            />
                                        </svg>
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <span className="text-[10px] sm:text-xs lg:text-sm font-bold text-white">{score}%</span>
                                        </div>
                                    </div>
                                    <p className="text-dark-400 group-hover:text-dark-200 font-medium text-[9px] sm:text-[10px] lg:text-xs truncate transition-colors">
                                        {skill.skill}
                                    </p>
                                </div>
                            );
                        })}
                    </div>
                </motion.div>
            )}

            {/* Achievements Summary */}
            <motion.div variants={itemVariants}>
                <BadgeSummary
                    unlockedBadgeIds={unlockedBadgeIds}
                    onViewAll={() => navigate('/achievements')}
                />
            </motion.div>

            {/* Subscription Banner for Free Users */}
            {user?.subscription?.plan === 'free' && (
                <motion.div
                    variants={itemVariants}
                    className="relative overflow-hidden rounded-2xl p-4 sm:p-5"
                    style={{
                        background: 'linear-gradient(135deg, rgba(109,40,217,0.12) 0%, rgba(5,150,105,0.08) 100%)',
                        border: '1px solid rgba(109,40,217,0.25)',
                    }}
                >
                    <div className="absolute -right-4 -top-4 w-24 h-24 rounded-full opacity-10"
                        style={{ background: 'radial-gradient(circle, #8b5cf6, transparent)' }}
                    />
                    <div className="flex items-center justify-between gap-3 relative z-10">
                        <div>
                            <h3 className="text-sm font-semibold text-white mb-0.5">🚀 Unlock Unlimited</h3>
                            <p className="text-dark-400 text-xs">
                                {user.subscription.interviewsRemaining || 0} interviews remaining
                            </p>
                        </div>
                        <button className="flex-shrink-0 text-xs font-semibold text-white px-4 py-2 rounded-xl transition-all"
                            style={{ background: 'linear-gradient(135deg, #7c3aed, #8b5cf6)', boxShadow: '0 4px 12px rgba(139,92,246,0.4)' }}>
                            Upgrade
                        </button>
                    </div>
                </motion.div>
            )}
        </motion.div>
    );
}

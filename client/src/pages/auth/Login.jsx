import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuthStore } from '../../stores/authStore';
import { Mail, Lock, Eye, EyeOff, ArrowRight, Loader2, Zap } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Login() {
    const navigate = useNavigate();
    const { login } = useAuthStore();
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState({ email: '', password: '' });

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.email || !formData.password) {
            toast.error('Please fill in all fields');
            return;
        }

        setIsLoading(true);

        try {
            await login(formData.email, formData.password);
            toast.success('Welcome back!');
            navigate('/dashboard');
        } catch (error) {
            const message = error.response?.data?.message || 'Login failed';
            toast.error(message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div>
            <div className="text-center mb-7">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full mb-3"
                    style={{
                        background: 'rgba(139,92,246,0.12)',
                        border: '1px solid rgba(139,92,246,0.25)',
                    }}
                >
                    <Zap className="w-3 h-3 text-primary-400" />
                    <span className="text-[11px] text-primary-300 font-medium">Practice · Learn · Improve</span>
                </div>
                <h1 className="text-xl sm:text-2xl font-bold text-white mb-1.5">Welcome back</h1>
                <p className="text-dark-400 text-sm">Sign in to continue your interview journey</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                {/* Email */}
                <div>
                    <label htmlFor="email" className="label">Email Address</label>
                    <div className="relative">
                        <div className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-500 pointer-events-none">
                            <Mail className="w-full h-full" />
                        </div>
                        <input
                            id="email"
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            className="input pl-10"
                            placeholder="you@example.com"
                            disabled={isLoading}
                        />
                    </div>
                </div>

                {/* Password */}
                <div>
                    <label htmlFor="password" className="label">Password</label>
                    <div className="relative">
                        <div className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-500 pointer-events-none">
                            <Lock className="w-full h-full" />
                        </div>
                        <input
                            id="password"
                            type={showPassword ? 'text' : 'password'}
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            className="input pl-10 pr-10"
                            placeholder="Enter your password"
                            disabled={isLoading}
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-dark-400 hover:text-dark-200 transition-colors"
                        >
                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                    </div>
                </div>

                {/* Forgot Password */}
                <div className="flex justify-end -mt-1">
                    <button type="button" className="text-xs text-primary-400 hover:text-primary-300 transition-colors">
                        Forgot password?
                    </button>
                </div>

                {/* Submit Button */}
                <motion.button
                    type="submit"
                    disabled={isLoading}
                    whileHover={{ scale: isLoading ? 1 : 1.02 }}
                    whileTap={{ scale: isLoading ? 1 : 0.98 }}
                    className="btn-neon w-full"
                    style={{ marginTop: '0.75rem' }}
                >
                    {isLoading ? (
                        <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Signing in...
                        </>
                    ) : (
                        <>
                            Sign In
                            <ArrowRight className="w-4 h-4" />
                        </>
                    )}
                </motion.button>
            </form>

            {/* Divider */}
            <div className="flex items-center gap-3 my-5">
                <div className="flex-1 h-px" style={{ background: 'rgba(51,65,85,0.5)' }} />
                <span className="text-dark-600 text-xs">or</span>
                <div className="flex-1 h-px" style={{ background: 'rgba(51,65,85,0.5)' }} />
            </div>

            {/* Register Link */}
            <p className="text-center text-dark-400 text-sm">
                Don't have an account?{' '}
                <Link to="/register" className="text-primary-400 hover:text-primary-300 font-semibold transition-colors">
                    Create one free
                </Link>
            </p>
        </div>
    );
}

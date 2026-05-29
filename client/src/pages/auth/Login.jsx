import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Mail, Lock, LogIn, ArrowRight, Zap, ChevronLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import Head from '../../components/common/Head';

const Login = () => {
    const { login } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const from = location.state?.from?.pathname || '/';
    
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        const success = await login(formData);
        if (success) {
            navigate(from, { replace: true });
        }
        setLoading(false);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-white py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
            <Head title="Login" />
            
            {/* Minimalist Background */}
            <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-primary-50 rounded-full blur-[100px] translate-x-1/2 -translate-y-1/2 opacity-60"></div>
            <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-accent-50 rounded-full blur-[80px] -translate-x-1/2 translate-y-1/2 opacity-50"></div>

            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-md w-full space-y-10 z-10"
            >
                {/* Brand Logo & Back */}
                <div className="flex flex-col items-center text-center">
                    <Link to="/" className="mb-8 group flex flex-col items-center gap-4">
                        <div className="w-16 h-16 bg-primary-600 text-white rounded-[1.5rem] flex items-center justify-center shadow-2xl shadow-primary-600/30 group-hover:rotate-12 transition-transform duration-500">
                            <Zap size={32} fill="currentColor" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-2xl font-black font-display text-gray-950 tracking-tighter uppercase">Agrawal Store</span>
                            <span className="text-[10px] text-primary-600 font-black uppercase tracking-[0.3em]">Premium Delivery</span>
                        </div>
                    </Link>
                    
                    <h2 className="text-4xl md:text-5xl font-black text-gray-950 tracking-tighter font-display uppercase leading-none">
                        Welcome <br /> <span className="text-primary-500">Back.</span>
                    </h2>
                    <p className="mt-4 text-gray-400 font-medium">Sign in to continue your shopping</p>
                </div>
                
                <form className="mt-12 space-y-6" onSubmit={handleSubmit}>
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-950 uppercase tracking-widest ml-4">Email Address</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none">
                                    <Mail className="h-5 w-5 text-gray-400 group-focus-within:text-primary-500 transition-colors" />
                                </div>
                                <input
                                    name="email"
                                    type="email"
                                    required
                                    className="w-full pl-14 pr-8 py-5 bg-gray-50 border-2 border-transparent rounded-[1.5rem] text-sm font-bold focus:bg-white focus:border-primary-500/30 outline-none transition-all"
                                    placeholder="your@email.com"
                                    value={formData.email}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>
                        
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-950 uppercase tracking-widest ml-4">Password</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none">
                                    <Lock className="h-5 w-5 text-gray-400 group-focus-within:text-primary-500 transition-colors" />
                                </div>
                                <input
                                    name="password"
                                    type="password"
                                    required
                                    className="w-full pl-14 pr-8 py-5 bg-gray-50 border-2 border-transparent rounded-[1.5rem] text-sm font-bold focus:bg-white focus:border-primary-500/30 outline-none transition-all"
                                    placeholder="••••••••"
                                    value={formData.password}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center justify-between px-2">
                        <div className="flex items-center gap-3 group cursor-pointer">
                            <input
                                id="remember-me"
                                name="remember-me"
                                type="checkbox"
                                className="w-5 h-5 rounded-lg border-2 border-gray-100 text-primary-600 focus:ring-primary-500 transition-all cursor-pointer"
                            />
                            <label htmlFor="remember-me" className="text-xs font-black text-gray-400 uppercase tracking-widest cursor-pointer group-hover:text-gray-950 transition-colors">
                                Remember me
                            </label>
                        </div>

                        <Link to="/forgot-password" weights="black" className="text-xs font-black text-primary-600 hover:text-gray-950 uppercase tracking-widest transition-colors">
                            Forgot?
                        </Link>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="group relative w-full h-20 bg-gray-950 text-white rounded-[2rem] overflow-hidden transition-all hover:bg-primary-600 active:scale-95 shadow-2xl shadow-gray-900/20 disabled:opacity-50"
                    >
                        <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-500"></div>
                        <div className="relative z-10 flex items-center justify-center gap-4">
                            <span className="text-sm font-black uppercase tracking-[0.3em]">
                                {loading ? 'Checking...' : 'Sign In Now'}
                            </span>
                            {!loading && (
                                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-white group-hover:text-primary-600 transition-all duration-500">
                                    <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                                </div>
                            )}
                        </div>
                    </button>
                    
                    <div className="text-center pt-4">
                        <p className="text-xs font-black text-gray-400 uppercase tracking-widest">
                            Don't have an account?{' '}
                            <Link to="/register" className="text-primary-600 hover:text-gray-950 transition-colors ml-2 underline decoration-2 underline-offset-4">
                                Create Account
                            </Link>
                        </p>
                    </div>
                </form>

                <div className="pt-10 flex justify-center">
                    <Link to="/" className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-gray-300 hover:text-primary-600 transition-colors">
                        <ChevronLeft size={14} /> Back to Store
                    </Link>
                </div>
            </motion.div>
        </div>
    );
};

export default Login;

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Mail, Lock, User, UserPlus, Phone, MapPin, ArrowRight, Zap, ChevronLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import Head from '../../components/common/Head';

const Register = () => {
    const { register } = useAuth();
    const navigate = useNavigate();
    
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        mobile: '',
        address: ''
    });
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        const success = await register(formData);
        if (success) {
            navigate('/login');
        }
        setLoading(false);
    };

    const stagger = {
        animate: {
            transition: {
                staggerChildren: 0.05
            }
        }
    };

    const item = {
        initial: { opacity: 0, x: -10 },
        animate: { opacity: 1, x: 0 }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-white py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
            <Head title="Create Account" />
            
            {/* Background Decor */}
            <div className="absolute top-0 left-0 w-[400px] h-[400px] bg-primary-50 rounded-full blur-[100px] -translate-x-1/2 -translate-y-1/2 opacity-60"></div>
            <div className="absolute bottom-0 right-0 w-[300px] h-[300px] bg-accent-50 rounded-full blur-[80px] translate-x-1/2 translate-y-1/2 opacity-50"></div>

            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-2xl w-full space-y-10 z-10"
            >
                {/* Brand Logo & Heading */}
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
                    
                    <h2 className="text-4xl md:text-6xl font-black text-gray-950 tracking-tighter font-display uppercase leading-none">
                        Create <br /> <span className="text-primary-500">Account.</span>
                    </h2>
                    <p className="mt-4 text-gray-400 font-medium">Join 50,000+ happy shoppers in Sabalgarh</p>
                </div>
                
                <form className="mt-12 space-y-8" onSubmit={handleSubmit}>
                    <motion.div variants={stagger} initial="initial" animate="animate" className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <motion.div variants={item} className="space-y-2">
                                <label className="text-[10px] font-black text-gray-950 uppercase tracking-widest ml-4">Full Name</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none">
                                        <User className="h-5 w-5 text-gray-400 group-focus-within:text-primary-500" />
                                    </div>
                                    <input
                                        name="name"
                                        type="text"
                                        required
                                        className="w-full pl-14 pr-8 py-5 bg-gray-50 border-2 border-transparent rounded-[1.5rem] text-sm font-bold focus:bg-white focus:border-primary-500/30 outline-none transition-all"
                                        placeholder="Rahul Sharma"
                                        value={formData.name}
                                        onChange={handleChange}
                                    />
                                </div>
                            </motion.div>

                            <motion.div variants={item} className="space-y-2">
                                <label className="text-[10px] font-black text-gray-950 uppercase tracking-widest ml-4">Mobile Number</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none">
                                        <Phone className="h-5 w-5 text-gray-400 group-focus-within:text-primary-500" />
                                    </div>
                                    <input
                                        name="mobile"
                                        type="tel"
                                        required
                                        pattern="[0-9]{10}"
                                        className="w-full pl-14 pr-8 py-5 bg-gray-50 border-2 border-transparent rounded-[1.5rem] text-sm font-bold focus:bg-white focus:border-primary-500/30 outline-none transition-all"
                                        placeholder="90989 74996"
                                        value={formData.mobile}
                                        onChange={handleChange}
                                    />
                                </div>
                            </motion.div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <motion.div variants={item} className="space-y-2">
                                <label className="text-[10px] font-black text-gray-950 uppercase tracking-widest ml-4">Email Address</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none">
                                        <Mail className="h-5 w-5 text-gray-400 group-focus-within:text-primary-500" />
                                    </div>
                                    <input
                                        name="email"
                                        type="email"
                                        required
                                        className="w-full pl-14 pr-8 py-5 bg-gray-50 border-2 border-transparent rounded-[1.5rem] text-sm font-bold focus:bg-white focus:border-primary-500/30 outline-none transition-all"
                                        placeholder="rahul@example.com"
                                        value={formData.email}
                                        onChange={handleChange}
                                    />
                                </div>
                            </motion.div>

                            <motion.div variants={item} className="space-y-2">
                                <label className="text-[10px] font-black text-gray-950 uppercase tracking-widest ml-4">Password</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none">
                                        <Lock className="h-5 w-5 text-gray-400 group-focus-within:text-primary-500" />
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
                            </motion.div>
                        </div>

                        <motion.div variants={item} className="space-y-2">
                            <label className="text-[10px] font-black text-gray-950 uppercase tracking-widest ml-4">Delivery Address</label>
                            <div className="relative group">
                                <div className="absolute top-6 left-6 pointer-events-none">
                                    <MapPin className="h-5 w-5 text-gray-400 group-focus-within:text-primary-500" />
                                </div>
                                <textarea
                                    name="address"
                                    required
                                    rows="3"
                                    className="w-full pl-14 pr-8 py-5 bg-gray-50 border-2 border-transparent rounded-[2rem] text-sm font-bold focus:bg-white focus:border-primary-500/30 outline-none transition-all resize-none"
                                    placeholder="Your full delivery address in Sabalgarh..."
                                    value={formData.address}
                                    onChange={handleChange}
                                />
                            </div>
                        </motion.div>
                    </motion.div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="group relative w-full h-20 bg-gray-950 text-white rounded-[2rem] overflow-hidden transition-all hover:bg-primary-600 active:scale-95 shadow-2xl shadow-gray-900/20 disabled:opacity-50"
                    >
                        <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-500"></div>
                        <div className="relative z-10 flex items-center justify-center gap-4">
                            <span className="text-sm font-black uppercase tracking-[0.3em]">
                                {loading ? 'Creating Account...' : 'Sign Up Now'}
                            </span>
                            {!loading && (
                                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-white group-hover:text-primary-600 transition-all duration-500">
                                    <UserPlus size={20} className="group-hover:scale-110 transition-transform" />
                                </div>
                            )}
                        </div>
                    </button>
                    
                    <div className="text-center pt-4">
                        <p className="text-xs font-black text-gray-400 uppercase tracking-widest">
                            Already have an account?{' '}
                            <Link to="/login" className="text-primary-600 hover:text-gray-950 transition-colors ml-2 underline decoration-2 underline-offset-4">
                                Login Here
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

export default Register;

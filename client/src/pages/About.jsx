import { motion } from 'framer-motion';
import { ShieldCheck, Heart, Users, Star, ArrowRight, Zap, Target, Leaf } from 'lucide-react';
import { Link } from 'react-router-dom';

const About = () => {
    const fadeIn = {
        initial: { opacity: 0, y: 30 },
        whileInView: { opacity: 1, y: 0 },
        viewport: { once: true },
        transition: { duration: 0.8, ease: "easeOut" }
    };

    const stagger = {
        animate: {
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    return (
        <div className="bg-white min-h-screen">
            {/* 1. HERO SECTION */}
            <section className="relative py-24 md:py-40 overflow-hidden bg-[#fafafa]">
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary-50 rounded-full blur-[120px] translate-x-1/2 -translate-y-1/2 opacity-50"></div>
                <div className="container-custom relative z-10 text-center">
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-2xl shadow-sm border border-gray-100 text-[10px] font-black uppercase tracking-[0.3em] text-primary-600 mb-10"
                    >
                        <Zap size={14} className="fill-current" /> Our Story
                    </motion.div>
                    <motion.h1 
                        initial={{ opacity: 0, y: 40 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        className="text-6xl md:text-9xl font-black text-gray-950 leading-[0.9] tracking-tighter mb-12 font-display"
                    >
                        Revolutionizing <br />
                        <span className="text-primary-500">Local Grocery.</span>
                    </motion.h1>
                    <motion.p 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.4 }}
                        className="text-lg md:text-2xl text-gray-400 max-w-3xl mx-auto font-medium leading-relaxed"
                    >
                        Started as a neighborhood shop in Sabalgarh, we're now on a mission to bring fresh, quality essentials to your doorstep in minutes.
                    </motion.p>
                </div>
            </section>

            {/* 2. OUR MISSION (Bento Style) */}
            <section className="py-32">
                <div className="container-custom">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                        <motion.div 
                            {...fadeIn}
                            className="lg:col-span-7 bg-primary-600 rounded-[3.5rem] p-12 md:p-20 text-white relative overflow-hidden group"
                        >
                            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-[80px] translate-x-1/2 -translate-y-1/2"></div>
                            <Target size={64} className="mb-10 opacity-20" />
                            <h2 className="text-4xl md:text-6xl font-black mb-8 leading-tight font-display tracking-tighter">Our Mission</h2>
                            <p className="text-xl text-primary-50 font-medium leading-relaxed max-w-xl">
                                To empower every household with the freshest local produce and high-quality essentials through cutting-edge technology and lightning-fast delivery.
                            </p>
                            <div className="mt-12 flex items-center gap-6">
                                <div className="text-center">
                                    <p className="text-4xl font-black">50k+</p>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-primary-200 mt-1">Users</p>
                                </div>
                                <div className="w-px h-12 bg-white/20"></div>
                                <div className="text-center">
                                    <p className="text-4xl font-black">10m</p>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-primary-200 mt-1">Avg Delivery</p>
                                </div>
                            </div>
                        </motion.div>

                        <motion.div 
                            {...fadeIn}
                            className="lg:col-span-5 bg-gray-950 rounded-[3.5rem] p-12 md:p-20 text-white flex flex-col justify-between group overflow-hidden relative"
                        >
                            <div className="absolute inset-0 bg-primary-500/5 group-hover:bg-primary-500/10 transition-colors"></div>
                            <div>
                                <Leaf size={40} className="text-primary-500 mb-8" />
                                <h3 className="text-3xl font-black mb-6 font-display tracking-tight">100% Organic & Fresh</h3>
                                <p className="text-gray-400 font-medium leading-relaxed">
                                    We partner directly with Sabalgarh's local farmers to ensure zero compromise on quality and taste.
                                </p>
                            </div>
                            <Link to="/products" className="mt-12 group/btn flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.3em] text-primary-500 hover:text-white transition-colors">
                                Browse Store <ArrowRight size={16} className="group-hover/btn:translate-x-2 transition-transform" />
                            </Link>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* 3. CORE VALUES */}
            <section className="py-32 bg-[#fafafa]">
                <div className="container-custom">
                    <div className="text-center mb-24">
                        <h2 className="text-4xl md:text-7xl font-black text-gray-950 leading-tight font-display tracking-tighter mb-6">Our Values</h2>
                        <p className="text-gray-400 font-medium text-lg">The principles that drive us every day.</p>
                    </div>

                    <motion.div 
                        variants={stagger}
                        initial="initial"
                        whileInView="animate"
                        viewport={{ once: true }}
                        className="grid grid-cols-1 md:grid-cols-3 gap-12"
                    >
                        {[
                            { icon: <ShieldCheck size={40} />, title: "Trust First", desc: "No questions asked replacements and guaranteed quality for every item." },
                            { icon: <Heart size={40} />, title: "Community", desc: "Supporting our local Sabalgarh economy and traditional vendors." },
                            { icon: <Users size={40} />, title: "Customer Obsessed", desc: "Your experience is the only metric that matters to us." }
                        ].map((value, idx) => (
                            <motion.div 
                                key={idx}
                                {...fadeIn}
                                className="bg-white p-12 rounded-[3rem] border border-gray-100 shadow-sm hover:shadow-2xl hover:-translate-y-4 transition-all duration-500 text-center"
                            >
                                <div className="w-20 h-20 bg-primary-50 text-primary-600 rounded-[1.5rem] flex items-center justify-center mx-auto mb-8 group-hover:bg-primary-600 group-hover:text-white transition-all">
                                    {value.icon}
                                </div>
                                <h4 className="text-2xl font-black text-gray-950 mb-4 font-display uppercase tracking-tight">{value.title}</h4>
                                <p className="text-gray-400 font-medium leading-relaxed">{value.desc}</p>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* 4. CTA */}
            <section className="py-32">
                <div className="container-custom">
                    <motion.div 
                        {...fadeIn}
                        className="rounded-[4rem] bg-gray-950 p-12 md:p-24 text-center relative overflow-hidden"
                    >
                        <div className="absolute top-0 left-0 w-full h-full bg-primary-600/5 -skew-x-12 translate-x-1/4"></div>
                        <div className="relative z-10">
                            <h2 className="text-4xl md:text-7xl font-black text-white leading-tight mb-8 font-display tracking-tighter">
                                Ready to Experience <br />
                                <span className="text-primary-500">The Future of Grocery?</span>
                            </h2>
                            <Link 
                                to="/products"
                                className="inline-flex items-center gap-4 bg-primary-500 text-white px-12 py-6 rounded-[2rem] font-black text-xs uppercase tracking-[0.3em] shadow-2xl hover:bg-white hover:text-gray-950 hover:scale-105 active:scale-95 transition-all"
                            >
                                Start Shopping <Zap size={18} fill="currentColor" />
                            </Link>
                        </div>
                    </motion.div>
                </div>
            </section>
        </div>
    );
};

export default About;

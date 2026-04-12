import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import {
  ArrowRight,
  ShoppingBag,
  Star,
  Clock,
  Truck,
  Shield,
  Leaf,
  Smartphone,
  CheckCircle2,
  Zap,
} from "lucide-react";
import { Link } from "react-router-dom";
import ProductCard from "../../components/common/ProductCard";
import CategoryCard from "../../components/common/CategoryCard";
import { useFetch } from "../../hooks/useFetch";
import { productService, categoryService } from "../../services";
import Head from "../../components/common/Head";

// Brand Logos (Using placeholder text for now, or icons)
const BRAND_LOGOS = [
  "Amul",
  "Nestle",
  "Britannia",
  "Tata",
  "Dabur",
  "Haldiram's",
  "Patanjali",
  "Cadbury",
  "CocaCola",
  "Pepsi",
];

const Home = () => {
  const { data: categories = [], loading: catLoading } = useFetch(
    categoryService.getAll,
  );
  const { data: featuredProducts = [], loading: featLoading } = useFetch(() =>
    productService.getFeatured(8),
  );
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Head
        title="Agrawal Store"
        description="Experience the freshest groceries delivered to your doorstep. Agrawal Store - Quality you can trust."
      />

      {/* 1. ULTRA-PREMIUM "SEXY" HERO SECTION */}
      <section className="relative pt-32 pb-24 lg:pt-48 lg:pb-40 overflow-hidden bg-white">
        {/* Abstract Background Shapes */}
        <div className="absolute top-0 right-0 w-[1000px] h-[1000px] bg-primary-100/30 rounded-full blur-[160px] -translate-y-1/2 translate-x-1/2 -z-10 animate-pulse" />
        <div className="absolute top-[20%] left-[-10%] w-[600px] h-[600px] bg-orange-100/30 rounded-full blur-[120px] -z-10" />
        
        <div className="container-custom relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left Content */}
            <motion.div
              initial={{ opacity: 0, x: -60 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-primary-50 border border-primary-100 mb-8 shadow-sm">
                 <div className="w-2 h-2 rounded-full bg-primary-500 animate-ping" />
                 <span className="text-[10px] font-black text-primary-700 tracking-[0.2em] uppercase">Morena's #1 Grocery App</span>
              </div>
              
              <h1 className="text-6xl md:text-9xl font-black mb-8 leading-[0.85] font-display text-gray-950 tracking-tighter">
                Freshness <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-primary-400">Delivered.</span>
              </h1>
              
              <p className="text-xl text-gray-500 mb-12 leading-relaxed max-w-lg font-medium">
                We bring the farm to your doorstep in <span className="text-primary-600 font-black">10 minutes</span>. 
                Experience premium grocery shopping like never before.
              </p>

              {/* Integrated Modern Search */}
              <div className="relative max-w-xl group mb-12">
                <div className="absolute inset-0 bg-primary-500/10 blur-2xl group-focus-within:bg-primary-500/20 transition-all rounded-[2.5rem]" />
                <div className="relative flex items-center bg-white border-2 border-gray-100 rounded-[2.5rem] p-2 shadow-2xl transition-all group-focus-within:border-primary-500/30">
                   <div className="pl-6 text-primary-500">
                      <Zap size={24} fill="currentColor" />
                   </div>
                   <input 
                      type="text" 
                      placeholder="Search 5000+ fresh items..." 
                      className="flex-1 bg-transparent px-6 py-4 outline-none text-lg font-bold placeholder:text-gray-300"
                   />
                   <button className="bg-gray-950 text-white px-10 py-4 rounded-[2rem] font-black text-sm uppercase tracking-widest hover:bg-primary-600 hover:shadow-xl transition-all active:scale-95">
                      Find Now
                   </button>
                </div>
              </div>

              <div className="flex items-center gap-12">
                 <div className="flex flex-col">
                    <span className="text-4xl font-black text-gray-950">10k+</span>
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">Happy Families</span>
                 </div>
                 <div className="w-px h-12 bg-gray-100" />
                 <div className="flex flex-col">
                    <span className="text-4xl font-black text-gray-950">5000+</span>
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">Premium Products</span>
                 </div>
              </div>
            </motion.div>

            {/* Right Content - 3D Visual Cluster */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, delay: 0.2 }}
              className="relative hidden lg:flex items-center justify-center p-12"
            >
               {/* Main 3D Asset */}
               <div className="relative z-20 w-full max-w-[550px] aspect-square transition-transform duration-1000 hover:scale-105">
                  <img 
                    src="https://png.pngtree.com/png-vector/20240125/ourmid/pngtree-grocery-bag-with-vegetables-and-fruits-isolated-on-transparent-background-png-image_11490214.png" 
                    className="w-full h-full object-contain filter drop-shadow-[0_60px_100px_rgba(47,171,115,0.3)] animate-float"
                    alt="Sexy Grocery" 
                  />
                  
                  {/* Floating Micro-Cards */}
                  <motion.div 
                    animate={{ y: [0, -20, 0] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute top-10 -right-12 bg-white/90 backdrop-blur-xl p-5 rounded-[2.5rem] shadow-2xl border border-white/50 flex items-center gap-4 animate-bounce-slow"
                  >
                    <div className="w-14 h-14 bg-orange-500 rounded-full flex items-center justify-center text-white shadow-lg">
                      <Star size={24} fill="currentColor" />
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Customer Rated</p>
                      <p className="font-black text-gray-950 text-xl tracking-tight">4.9 / 5.0</p>
                    </div>
                  </motion.div>

                  <motion.div 
                    animate={{ y: [0, 20, 0] }}
                    transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                    className="absolute -bottom-10 -left-12 bg-primary-600 p-6 rounded-[2.5rem] shadow-2xl flex items-center gap-5 text-white"
                  >
                    <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center">
                      <Clock size={32} />
                    </div>
                    <div>
                      <p className="text-[10px] text-primary-100 font-bold uppercase tracking-widest">Instant Delivery</p>
                      <p className="font-black text-2xl tracking-tight">10 Mins</p>
                    </div>
                  </motion.div>
               </div>

               {/* Background Decorative Rings */}
               <div className="absolute inset-0 border-[40px] border-primary-50 opacity-30 rounded-full scale-110 -z-10" />
               <div className="absolute inset-0 border-[1px] border-gray-100 p-20 rounded-full rotate-45 -z-10" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* 2. PROMO GRID (The Sexy Banners) */}
      <section className="pb-24 bg-white">
        <div className="container-custom">
           <div className="grid md:grid-cols-3 gap-8">
              <div className="md:col-span-2 group relative h-[350px] rounded-[3rem] overflow-hidden shadow-2xl transition-all duration-700 hover:shadow-primary-500/20">
                 <img 
                    src="https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=2574" 
                    className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                    alt="Promotion"
                 />
                 <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/30 to-transparent p-12 flex flex-col justify-center">
                    <span className="bg-primary-500 text-white px-4 py-1.5 rounded-full text-[10px] font-black mb-6 w-fit uppercase tracking-widest anim-fade-in">Limited Offer</span>
                    <h3 className="text-4xl md:text-6xl font-black text-white font-display mb-6 leading-none">Upto 50% <br /> <span className="text-primary-400 italic">Off</span> on Fruits</h3>
                    <Link to="/products" className="w-fit bg-white text-gray-950 px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-primary-500 hover:text-white transition-all shadow-xl">Shop Now</Link>
                 </div>
              </div>
              <div className="group relative h-[350px] rounded-[3rem] overflow-hidden shadow-2xl">
                 <img 
                    src="https://images.unsplash.com/photo-1550989460-0adf9ea622e2?auto=format&fit=crop&q=80&w=1000" 
                    className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                    alt="Dairy"
                 />
                 <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-all p-10 flex flex-col justify-end">
                    <h3 className="text-2xl font-black text-white font-display mb-2">Morning Fresh</h3>
                    <p className="text-gray-200 text-xs font-bold uppercase tracking-widest mb-6 border-b border-white/20 pb-4 inline-block">Pure Farm Milk & Eggs</p>
                    <Link to="/category/dairy" className="text-white font-black text-[10px] uppercase tracking-[0.3em] flex items-center gap-2 hover:gap-4 transition-all">Explore <ArrowRight size={14} /></Link>
                 </div>
              </div>
           </div>
        </div>
      </section>

      {/* 2. CIRCLE CATEGORY GRID (Zepto/Blinkit Style) */}
      <section className="py-12 bg-white">
        <div className="container-custom">
           <div className="flex items-center justify-between mb-8">
              <h2 className="text-xl md:text-2xl font-black text-gray-950 font-display">Shop by Category</h2>
              <Link to="/categories" className="text-primary-600 font-bold text-sm flex items-center gap-1 hover:gap-2 transition-all">View All <ArrowRight size={16} /></Link>
           </div>
           
           <div className="grid grid-cols-4 md:grid-cols-8 lg:grid-cols-10 gap-x-4 gap-y-8">
              {(categories || []).slice(0, 10).map((category) => (
                <div 
                   key={category._id} 
                   onClick={() => navigate(`/category/${category.slug}`)}
                   className="flex flex-col items-center gap-3 cursor-pointer group"
                >
                   <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-gray-50 flex items-center justify-center p-3 border-2 border-transparent group-hover:border-primary-500 group-hover:bg-primary-50 transition-all shadow-sm">
                      <img 
                        src={category.image ? `${import.meta.env.VITE_API_URL.replace('/api', '')}/${category.image.startsWith('/') ? category.image.slice(1) : category.image}` : `https://ui-avatars.com/api/?name=${category.name}&background=f3f4f6&color=2fab73`}
                        className="w-full h-full object-contain mix-blend-multiply group-hover:scale-110 transition-all"
                        alt={category.name}
                      />
                   </div>
                   <span className="text-[10px] md:text-xs font-bold text-gray-700 text-center group-hover:text-primary-600 truncate w-full px-1">{category.name}</span>
                </div>
              ))}
           </div>
        </div>
      </section>

      {/* 3. HORIZONTAL PRODUCT CAROUSEL (Trending) */}
      <section className="py-16 bg-[#f7f9f8]">
        <div className="container-custom">
           <div className="flex items-center justify-between mb-10">
              <div className="flex items-center gap-4">
                 <div className="w-10 h-10 rounded-2xl bg-orange-100 flex items-center justify-center text-orange-600">
                    <Zap size={22} fill="currentColor" />
                 </div>
                 <div>
                    <h2 className="text-2xl font-black text-gray-950 font-display leading-none">Trending Now</h2>
                    <p className="text-xs font-bold text-gray-400 mt-1 uppercase tracking-widest">Most ordered in your area</p>
                 </div>
              </div>
              <Link to="/products" className="hidden md:flex bg-white px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest border border-gray-100 hover:border-primary-500 transition-all shadow-sm">See More</Link>
           </div>

           <div className="flex overflow-x-auto gap-6 pb-8 scrollbar-hide snap-x no-scrollbar">
              {featuredProducts && featuredProducts.length > 0 ? (
                featuredProducts.map((product) => (
                  <div key={product._id} className="min-w-[280px] md:min-w-[300px] snap-start">
                     <ProductCard product={product} />
                  </div>
                ))
              ) : (
                 !featLoading && <p className="text-gray-400 font-bold p-10">Searching for newest stock...</p>
              )}
           </div>
        </div>
      </section>

      {/* 4. MID-BANNERS (AD-STRIPS) */}
      <section className="py-12 bg-white">
        <div className="container-custom">
           <div className="grid md:grid-cols-2 gap-6">
              <div className="h-44 rounded-3xl bg-blue-600 overflow-hidden relative group cursor-pointer shadow-lg">
                 <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1610348725531-843dff563e2c?w=800')] bg-cover opacity-20 transition-all duration-1000 group-hover:scale-110 group-hover:opacity-40" />
                 <div className="relative z-10 p-8 h-full flex flex-col justify-center text-white">
                    <h3 className="text-2xl font-black mb-1">Pesticide Free</h3>
                    <p className="text-blue-100 font-bold mb-4">Direct from farm to home</p>
                    <Link to="/category/fruits-vegetables" className="w-fit bg-white text-blue-600 px-4 py-2 rounded-xl font-black text-[10px] uppercase tracking-widest">Shop Veggies</Link>
                 </div>
              </div>
              <div className="h-44 rounded-3xl bg-orange-600 overflow-hidden relative group cursor-pointer shadow-lg">
                 <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1621939514649-280e2ee25f60?w=800')] bg-cover opacity-20 transition-all duration-1000 group-hover:scale-110 group-hover:opacity-40" />
                 <div className="relative z-10 p-8 h-full flex flex-col justify-center text-white">
                    <h3 className="text-2xl font-black mb-1">Weekend Munchies</h3>
                    <p className="text-orange-100 font-bold mb-4">Upto 40% Off on Snacks</p>
                    <Link to="/products" className="w-fit bg-white text-orange-600 px-4 py-2 rounded-xl font-black text-[10px] uppercase tracking-widest">Grab Now</Link>
                 </div>
              </div>
           </div>
        </div>
      </section>

      {/* 5. FRESH PRODUCE SECTION (Horizontal Scroll) */}
      <section className="py-16 bg-white border-y border-gray-50">
        <div className="container-custom">
           <div className="flex items-center justify-between mb-10">
              <div className="flex items-center gap-4">
                 <div className="w-10 h-10 rounded-2xl bg-green-100 flex items-center justify-center text-green-600">
                    <Leaf size={22} fill="currentColor" />
                 </div>
                 <div>
                    <h2 className="text-2xl font-black text-gray-950 font-display leading-none">Fresh From Farm</h2>
                    <p className="text-xs font-bold text-gray-400 mt-1 uppercase tracking-widest">Straight to your kitchen</p>
                 </div>
              </div>
           </div>

           <div className="flex overflow-x-auto gap-6 pb-8 scrollbar-hide snap-x no-scrollbar">
              {featuredProducts && featuredProducts.length > 0 ? (
                featuredProducts.filter(p => !p.isOrganic).map((product) => (
                   <div key={product._id} className="min-w-[280px] md:min-w-[300px] snap-start">
                      <ProductCard product={product} />
                   </div>
                ))
              ) : (
                [1,2,3,4].map(i => <div key={i} className="min-w-[300px] h-96 bg-gray-50 rounded-[2rem] animate-pulse" />)
              )}
           </div>
        </div>
      </section>

      {/* 6. TRUST SIGNALS (Service Strip) */}
      <section className="py-20 bg-gray-950 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
        <div className="container-custom relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              { title: "10 Minute Delivery", desc: "Super fast, super fresh.", icon: Clock, color: "text-primary-500" },
              { title: "Best Price Guarantee", desc: "Lower prices than supermarkets.", icon: Shield, color: "text-primary-500" },
              { title: "Exclusive Offers", desc: "Deals you can't say no to.", icon: Zap, color: "text-primary-500" }
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-6 group">
                <div className={`w-16 h-16 bg-white/5 rounded-2xl border border-white/10 flex items-center justify-center ${item.color} group-hover:bg-primary-500 group-hover:text-white transition-all duration-500`}>
                  <item.icon size={28} />
                </div>
                <div>
                  <h3 className="text-xl font-black text-white font-display tracking-tight">{item.title}</h3>
                  <p className="text-gray-400 font-medium text-sm">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 7. NEWSLETTER */}
      <section className="py-24 bg-white">
         <div className="container-custom">
            <div className="relative rounded-[4rem] overflow-hidden bg-primary-600 p-8 md:p-20 text-center text-white shadow-2xl">
               <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
               <div className="relative z-10 max-w-2xl mx-auto">
                  <h2 className="text-4xl md:text-6xl font-black mb-6 font-display leading-tight">Join Agrawal Family</h2>
                  <p className="text-primary-100 text-lg mb-10">Get ₹200 off your first order & weekly fresh harvest updates.</p>
                  <form className="flex flex-col sm:flex-row gap-4 max-w-lg mx-auto bg-white/10 backdrop-blur-md p-2 rounded-[2.5rem] border border-white/20 shadow-inner">
                     <input 
                        type="email" 
                        placeholder="Your email address" 
                        className="flex-1 bg-transparent px-8 py-4 outline-none placeholder:text-white/60 font-medium"
                     />
                     <button className="bg-white text-primary-700 px-8 py-4 rounded-full font-black text-xs uppercase tracking-widest hover:bg-gray-100 transition-all active:scale-95 shadow-lg">Subscribe</button>
                  </form>
               </div>
            </div>
         </div>
      </section>
    </div>
  );
};

export default Home;

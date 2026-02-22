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

      {/* 1. PREMIUM HERO SECTION */}
      <section
        ref={heroRef}
        className="relative pt-28 pb-20 lg:pt-36 lg:pb-32 overflow-hidden bg-white"
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-primary-50 via-white to-transparent -z-20" />
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary-100/40 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2 -z-10" />

        <div className="container-custom relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="max-w-2xl"
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-primary-100 shadow-sm mb-8 animate-fade-in-up">
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-primary-500"></span>
                </span>
                <span className="text-xs font-bold text-primary-700 tracking-wide uppercase">
                  No.1 Grocery App in Morena
                </span>
              </div>

              <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-[1.1] font-display text-gray-900 tracking-tight">
                Groceries delivered <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-primary-400">
                  fresh & fast.
                </span>
              </h1>

              <p className="text-lg md:text-xl text-gray-500 mb-10 leading-relaxed max-w-lg">
                Get your daily needs sorted with Agrawal Store.
                <span className="hidden sm:inline">
                  {" "}
                  Fresh vegetables, branded staples, and household items
                  delivered in minutes.
                </span>
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  to="/products"
                  className="btn btn-primary btn-lg shadow-primary-500/25"
                >
                  Start Shopping <ShoppingBag size={20} />
                </Link>
                <Link
                  to="/categories"
                  className="btn btn-outline btn-lg bg-white"
                >
                  View Categories
                </Link>
              </div>

              <div className="mt-12 flex items-center gap-4 text-sm font-medium text-gray-500">
                <div className="flex items-center gap-1">
                  <CheckCircle2 size={18} className="text-primary-500" /> Free
                  Delivery
                </div>
                <div className="w-1 h-1 bg-gray-300 rounded-full" />
                <div className="flex items-center gap-1">
                  <CheckCircle2 size={18} className="text-primary-500" /> Best
                  Prices
                </div>
                <div className="w-1 h-1 bg-gray-300 rounded-full" />
                <div className="flex items-center gap-1">
                  <CheckCircle2 size={18} className="text-primary-500" /> No
                  Minimum Order
                </div>
              </div>
            </motion.div>

            <motion.div style={{ y }} className="relative hidden lg:block">
              <div className="relative z-10 w-full aspect-square max-w-[600px] mx-auto">
                <img
                  src="https://png.pngtree.com/png-vector/20240125/ourmid/pngtree-grocery-bag-with-vegetables-and-fruits-isolated-on-transparent-background-png-image_11490214.png"
                  alt="Grocery Basket"
                  className="w-full h-full object-contain drop-shadow-2xl animate-float"
                />
                {/* Floating Badges */}
                <div className="absolute top-20 -right-0 bg-white/90 backdrop-blur-md p-4 rounded-2xl shadow-lg border border-white/50 flex items-center gap-3 animate-bounce-slow">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-green-600">
                    <Leaf size={24} />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-bold uppercase">
                      Freshness
                    </p>
                    <p className="font-bold text-gray-900 text-lg">
                      100% Guaranteed
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 2. BRAND MARQUEE (Infinite Scroll) */}
      <section className="py-10 bg-white border-y border-gray-100 overflow-hidden">
        <div className="container-custom mb-6 text-center">
          <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">
            Trusted by top brands
          </p>
        </div>
        <div className="relative flex overflow-x-hidden group">
          <div className="animate-marquee whitespace-nowrap flex items-center gap-16 px-8">
            {BRAND_LOGOS.concat(BRAND_LOGOS).map((brand, index) => (
              <span
                key={index}
                className="text-3xl md:text-4xl font-display font-bold text-gray-200 uppercase hover:text-primary-300 transition-colors cursor-default"
              >
                {brand}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* 3. CATEGORIES SECTION */}
      <section className="py-24 bg-gray-50/50">
        <div className="container-custom">
          <div className="flex justify-between items-end mb-12">
            <div>
              <span className="text-primary-600 font-bold tracking-wider uppercase text-xs mb-2 block">
                Shop By Category
              </span>
              <h2 className="text-3xl md:text-4xl font-bold font-display text-gray-900">
                Essentials for You
              </h2>
            </div>
            <Link
              to="/categories"
              className="hidden md:flex text-primary-600 font-bold hover:gap-2 gap-1 items-center transition-all"
            >
              View All <ArrowRight size={18} />
            </Link>
          </div>

          {catLoading ? (
            <div className="flex justify-center p-20">
              <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <div className="category-grid">
              {(categories || []).map((category) => (
                <CategoryCard key={category._id} category={category} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* 4. CURATED COLLECTIONS (MOSAIC) */}
      <section className="py-12">
        <div className="container-custom">
          <h2 className="text-3xl font-bold font-display text-gray-900 mb-10 text-center">
            Curated for your Lifestyle
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[600px] md:h-[500px]">
            {/* Large Card */}
            <div className="md:col-span-2 relative rounded-[2rem] overflow-hidden group cursor-pointer shadow-lg">
              <img
                src="https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=2574"
                alt="Healthy"
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
              <div className="absolute bottom-0 left-0 p-8 text-white">
                <span className="bg-primary-500 text-white text-xs font-bold px-3 py-1 rounded-full mb-3 inline-block">
                  Healthy Living
                </span>
                <h3 className="text-3xl font-bold mb-2">Organic & Fresh</h3>
                <p className="text-gray-200 mb-4 line-clamp-2">
                  Direct from farms to your table. Experience the taste of pure
                  nature.
                </p>
                <Link
                  to="/category/fruits-vegetables"
                  className="text-white border-b-2 border-white/30 pb-1 hover:border-white transition-all"
                >
                  Shop Collection
                </Link>
              </div>
            </div>

            {/* Right Column Stack */}
            <div className="grid grid-rows-2 gap-6">
              <div className="relative rounded-[2rem] overflow-hidden group cursor-pointer shadow-lg bg-orange-100">
                <img
                  src="https://images.unsplash.com/photo-1621939514649-280e2ee25f60?auto=format&fit=crop&q=80&w=2670"
                  alt="Snacks"
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 mix-blend-multiply opacity-90"
                />
                <div className="absolute bottom-0 left-0 p-6">
                  <h3 className="text-2xl font-bold text-gray-900 mb-1">
                    Snack Attack
                  </h3>
                  <p className="text-gray-700 text-sm">
                    Munchies for your movie night.
                  </p>
                </div>
              </div>
              <div className="relative rounded-[2rem] overflow-hidden group cursor-pointer shadow-lg bg-blue-100">
                <img
                  src="https://images.unsplash.com/photo-1563805042-7684c019e1cb?auto=format&fit=crop&q=80&w=2727"
                  alt="Beverages"
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 mix-blend-multiply opacity-90"
                />
                <div className="absolute bottom-0 left-0 p-6">
                  <h3 className="text-2xl font-bold text-gray-900 mb-1">
                    Cool Drinks
                  </h3>
                  <p className="text-gray-700 text-sm">
                    Beat the heat with chilled juices.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. FEATURED PRODUCTS */}
      <section className="py-24 bg-white relative">
        <div className="container-custom">
          <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-4">
            <div className="max-w-2xl">
              <span className="text-primary-600 font-bold tracking-wider uppercase text-xs mb-2 block">
                Weekly Best Sellers
              </span>
              <h2 className="text-3xl md:text-4xl font-bold font-display text-gray-900">
                Trending Near You
              </h2>
            </div>
            <Link to="/products" className="btn btn-outline rounded-full">
              Explore All
            </Link>
          </div>

          {featLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="h-96 bg-gray-100 rounded-3xl animate-pulse"
                />
              ))}
            </div>
          ) : (
            <div className="product-grid">
              {(featuredProducts || []).length > 0 ? (
                (featuredProducts || []).map((product) => (
                  <ProductCard key={product._id} product={product} />
                ))
              ) : (
                <div className="col-span-full py-12 text-center text-gray-500">
                  No products found
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* 6. APP DOWNLOAD SECTION (Dark Contrast) */}
      <section className="py-24 bg-[#0F1F18] relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
        <div className="container-custom relative z-10">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <span className="inline-block py-1 px-3 rounded-lg bg-green-500/20 text-green-400 text-xs font-bold mb-6 border border-green-500/30">
                COMING SOON
              </span>
              <h2 className="text-4xl md:text-6xl font-bold text-white mb-6 font-display leading-tight">
                Shop smarter with <br /> the{" "}
                <span className="text-primary-500">Agrawal App</span>
              </h2>
              <p className="text-gray-400 text-lg mb-10 leading-relaxed">
                Get exclusive app-only discounts, track your orders in
                real-time, and get personalized recommendations.
              </p>
              <div className="flex flex-wrap gap-4">
                <button className="bg-white text-gray-900 px-6 py-3 rounded-xl font-bold flex items-center gap-3 hover:bg-gray-100 transition-colors">
                  <Smartphone size={24} />
                  <div className="text-left">
                    <div className="text-[10px] uppercase font-bold text-gray-500">
                      Download on
                    </div>
                    <div className="text-sm font-bold leading-none">
                      App Store
                    </div>
                  </div>
                </button>
                <button className="bg-transparent border border-gray-600 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-3 hover:bg-white/5 transition-colors">
                  <div className="text-left">
                    <div className="text-[10px] uppercase font-bold text-gray-400">
                      Get it on
                    </div>
                    <div className="text-sm font-bold leading-none">
                      Google Play
                    </div>
                  </div>
                </button>
              </div>
            </div>
            <div className="relative">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary-500/20 rounded-full blur-3xl"></div>
              <img
                src="https://cdni.iconscout.com/illustration/premium/thumb/online-grocery-shopping-app-3560667-2984024.png"
                alt="Mobile App"
                className="relative z-10 w-full max-w-lg mx-auto drop-shadow-2xl animate-float"
              />
            </div>
          </div>
        </div>
      </section>

      {/* 7. WHY CHOOSE US STRIP */}
      <section className="py-20 bg-primary-50/50">
        <div className="container-custom">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center divide-y md:divide-y-0 md:divide-x divide-gray-200">
            <div className="px-4 py-4">
              <div className="w-16 h-16 bg-white rounded-2xl shadow-sm text-primary-500 flex items-center justify-center mx-auto mb-6 rotate-3 hover:rotate-6 transition-transform">
                <Clock size={32} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                10 Minute Delivery
              </h3>
              <p className="text-gray-500 text-sm px-8">
                We deliver your daily needs faster than you can get ready.
              </p>
            </div>
            <div className="px-4 py-4">
              <div className="w-16 h-16 bg-white rounded-2xl shadow-sm text-primary-500 flex items-center justify-center mx-auto mb-6 -rotate-3 hover:-rotate-6 transition-transform">
                <Shield size={32} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Best Quality Guarantee
              </h3>
              <p className="text-gray-500 text-sm px-8">
                If you don't like it, we take it back. No questions asked.
              </p>
            </div>
            <div className="px-4 py-4">
              <div className="w-16 h-16 bg-white rounded-2xl shadow-sm text-primary-500 flex items-center justify-center mx-auto mb-6 rotate-3 hover:rotate-6 transition-transform">
                <Zap size={32} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Exclusive Offers
              </h3>
              <p className="text-gray-500 text-sm px-8">
                Get the best prices on top brands every single day.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 8. NEWSLETTER BANNER */}
      <section className="py-24 container-custom">
        <div className="relative rounded-[2.5rem] overflow-hidden bg-primary-600 shadow-2xl shadow-primary-900/20 px-8 py-16 md:p-20 text-center">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-primary-400/30 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-primary-800/30 rounded-full blur-3xl"></div>

          <div className="relative z-10 max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-5xl font-bold mb-6 font-display text-white">
              Get ₹200 off your first order
            </h2>
            <p className="text-primary-100 text-lg mb-10">
              Join our newsletter and get exclusive coupons, recipe ideas, and
              more delivered to your inbox.
            </p>
            <form className="flex flex-col sm:flex-row gap-4 max-w-lg mx-auto">
              <input
                type="email"
                placeholder="Enter your email address"
                className="flex-1 bg-white/10 backdrop-blur-md border border-white/20 rounded-full px-6 py-4 text-white placeholder-white/60 focus:outline-none focus:bg-white/20 transition-all font-medium"
              />
              <button className="bg-white text-primary-700 px-8 py-4 rounded-full font-bold shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95 transition-all duration-300">
                Subscribe
              </button>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;

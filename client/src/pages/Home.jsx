import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../utils/api";
import ProductCard from "../components/common/ProductCard";
import BestSellingCategories from "../components/BestSellingCategories";

const Home = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [snacks, setSnacks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch featured products (general)
      const productsRes = await api.get("/products?featured=true&limit=6").catch(() => ({ data: { data: [] } }));
      
      // Attempt to fetch another specific category, like snacks or cold drinks. We'll use the same for demo if none exists.
      const snacksRes = await api.get("/products?limit=6").catch(() => ({ data: { data: [] } }));

      setFeaturedProducts(productsRes.data?.data || productsRes.data?.products || []);
      setSnacks(snacksRes.data?.data || snacksRes.data?.products || []);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-10 h-10 border-4 border-primary-100 border-t-primary-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen pb-20">
      <div className="container-custom pt-4">
        
        {/* 1. TOP PROMO BANNER CAROUSEL */}
        <div className="flex overflow-x-auto snap-x snap-mandatory gap-4 pb-4 no-scrollbar">
            {/* Banner 1 */}
            <div className="snap-center shrink-0 w-full sm:w-[80%] md:w-[60%] lg:w-[45%] h-36 md:h-48 bg-gradient-to-r from-blue-600 to-blue-400 rounded-xl md:rounded-2xl flex items-center p-6 relative overflow-hidden">
                <div className="relative z-10 text-white w-2/3">
                    <h3 className="text-xl md:text-3xl font-black mb-1">Mega Savings</h3>
                    <p className="text-sm md:text-base font-medium opacity-90 mb-3">Up to 50% off on Groceries</p>
                    <button className="bg-white text-blue-600 px-4 py-1.5 rounded text-xs font-bold">Shop Now</button>
                </div>
                <img src="https://dummyimage.com/200x200/ffffff/000000&text=Groceries" alt="Promo" className="absolute right-0 bottom-0 w-32 md:w-40 mix-blend-multiply opacity-50 translate-x-4 translate-y-4" />
            </div>
            
            {/* Banner 2 */}
            <div className="snap-center shrink-0 w-full sm:w-[80%] md:w-[60%] lg:w-[45%] h-36 md:h-48 bg-gradient-to-r from-green-600 to-teal-500 rounded-xl md:rounded-2xl flex items-center p-6 relative overflow-hidden">
                <div className="relative z-10 text-white w-2/3">
                    <h3 className="text-xl md:text-3xl font-black mb-1">Farm Fresh</h3>
                    <p className="text-sm md:text-base font-medium opacity-90 mb-3">Fresh Veggies everyday</p>
                    <button className="bg-white text-green-700 px-4 py-1.5 rounded text-xs font-bold">Explore</button>
                </div>
                <img src="https://dummyimage.com/200x200/ffffff/000000&text=Veggies" alt="Promo" className="absolute right-0 bottom-0 w-32 md:w-40 mix-blend-multiply opacity-50 translate-x-4 translate-y-4" />
            </div>

            {/* Banner 3 */}
            <div className="snap-center shrink-0 w-full sm:w-[80%] md:w-[60%] lg:w-[45%] h-36 md:h-48 bg-gradient-to-r from-orange-500 to-yellow-400 rounded-xl md:rounded-2xl flex items-center p-6 relative overflow-hidden">
                <div className="relative z-10 text-white w-2/3">
                    <h3 className="text-xl md:text-3xl font-black mb-1">Snack Time</h3>
                    <p className="text-sm md:text-base font-medium opacity-90 mb-3">Craving something?</p>
                    <button className="bg-white text-orange-600 px-4 py-1.5 rounded text-xs font-bold">Order</button>
                </div>
                <img src="https://dummyimage.com/200x200/ffffff/000000&text=Snacks" alt="Promo" className="absolute right-0 bottom-0 w-32 md:w-40 mix-blend-multiply opacity-50 translate-x-4 translate-y-4" />
            </div>
        </div>

        {/* 2. CATEGORY GRID */}
        <div className="mt-4 md:mt-8">
            <BestSellingCategories />
        </div>

        {/* 3. ROW: FEATURED / BESTSELLERS */}
        <div className="mt-8 md:mt-12">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg md:text-xl font-bold text-gray-900">Bestsellers Near You</h2>
                <Link to="/products" className="text-primary-600 text-sm font-semibold hover:underline">See all</Link>
            </div>
            {/* Horizontal Scroll for Mobile, Grid for Desktop */}
            <div className="flex overflow-x-auto gap-4 pb-4 no-scrollbar snap-x lg:grid lg:grid-cols-6 lg:overflow-visible">
                {(featuredProducts || []).map((product) => (
                    <div key={product._id} className="shrink-0 snap-start w-[140px] md:w-[160px] lg:w-auto">
                        <ProductCard product={product} />
                    </div>
                ))}
            </div>
        </div>

        {/* 4. MID-PAGE PROMO BANNER */}
        <div className="mt-4 md:mt-8 bg-[#fdf4e9] border border-orange-100 rounded-xl md:rounded-2xl p-4 md:p-6 flex flex-row items-center justify-between">
             <div>
                <h3 className="text-lg md:text-2xl font-bold text-gray-900 mb-1">Dairy & Breakfast</h3>
                <p className="text-xs md:text-sm text-gray-600 mb-3">Start your day right</p>
                <Link to="/products" className="bg-orange-500 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-sm">View Items</Link>
             </div>
             <img src="https://dummyimage.com/150x150/fdf4e9/000000&text=Dairy" alt="Dairy" className="w-24 md:w-32 object-contain mix-blend-multiply" />
        </div>

        {/* 5. ROW: SNACKS & DRINKS */}
        <div className="mt-8 md:mt-12">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg md:text-xl font-bold text-gray-900">Snacks & Munchies</h2>
                <Link to="/products" className="text-primary-600 text-sm font-semibold hover:underline">See all</Link>
            </div>
            <div className="flex overflow-x-auto gap-4 pb-4 no-scrollbar snap-x lg:grid lg:grid-cols-6 lg:overflow-visible">
                {(snacks || []).map((product) => (
                    <div key={product._id} className="shrink-0 snap-start w-[140px] md:w-[160px] lg:w-auto">
                        <ProductCard product={product} />
                    </div>
                ))}
            </div>
        </div>

      </div>
    </div>
  );
};

export default Home;

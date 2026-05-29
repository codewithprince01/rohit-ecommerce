import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import toast from 'react-hot-toast';
import api, { getImageUrl } from '../utils/api';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Zap, 
  Clock, 
  ShieldCheck, 
  ChevronRight, 
  Plus, 
  Minus, 
  ArrowLeft, 
  Star, 
  ShoppingBag,
  Info,
  Package,
  Share2
} from 'lucide-react';
import ProductCard from '../components/common/ProductCard';

const ProductDetail = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);

  useEffect(() => {
    fetchProduct();
    window.scrollTo(0, 0);
  }, [slug]);

  const fetchProduct = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/products/slug/${slug}`);
      const data = response.data.data;
      setProduct(data);
      
      // Fetch related products
      const relatedRes = await api.get(`/products/${data._id}/related`);
      setRelatedProducts(relatedRes.data.data || []);
    } catch (error) {
      console.error('Error:', error);
      toast.error('Product not found');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = () => {
    if (product.stock <= 0) {
      toast.error('Out of stock');
      return;
    }
    addToCart(product, quantity);
    toast.success('Added to your basket!', {
        icon: '⚡',
        style: { borderRadius: '16px', background: '#111827', color: '#fff' }
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="w-20 h-20 border-8 border-primary-50 border-t-primary-500 rounded-full animate-spin mx-auto mb-6"></div>
          <p className="text-gray-400 font-black uppercase tracking-widest text-xs">Fetching Freshness...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fafafa]">
        <div className="text-center p-12 bg-white rounded-[3rem] shadow-xl border border-gray-100">
          <Info size={64} className="mx-auto mb-6 text-gray-300" />
          <h2 className="text-3xl font-black text-gray-950 mb-4 tracking-tight">Product Not Found</h2>
          <Link to="/products" className="inline-flex items-center gap-2 px-8 py-4 bg-gray-950 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-primary-600 transition-all">
            Back to Store <ArrowLeft size={16} />
          </Link>
        </div>
      </div>
    );
  }

  const images = product.images && product.images.length > 0 
    ? product.images 
    : [product.image];

  const discount = product.comparePrice 
    ? Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)
    : 0;

  return (
    <div className="bg-white min-h-screen pb-32">
      {/* 1. TOP NAV / BREADCRUMB */}
      <section className="py-6 border-b border-gray-50 bg-[#fafafa]">
        <div className="container-custom flex items-center justify-between">
            <button 
                onClick={() => navigate(-1)}
                className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-primary-600 transition-colors"
            >
                <ArrowLeft size={14} /> Back
            </button>
            <nav className="hidden md:flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-gray-400">
                <Link to="/" className="hover:text-primary-600">Home</Link>
                <ChevronRight size={10} />
                <Link to="/products" className="hover:text-primary-600">Store</Link>
                <ChevronRight size={10} />
                <span className="text-gray-950 truncate max-w-[200px]">{product.name}</span>
            </nav>
            <button className="p-2 hover:bg-white rounded-xl transition-colors text-gray-400 hover:text-primary-600 border border-transparent hover:border-gray-100">
                <Share2 size={18} />
            </button>
        </div>
      </section>

      <div className="container-custom pt-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
          
          {/* 2. IMAGE GALLERY (Left - 5 cols) */}
          <div className="lg:col-span-6 space-y-6">
            <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="relative aspect-square bg-gradient-to-br from-gray-50 to-white rounded-[3.5rem] border border-gray-100 overflow-hidden group shadow-inner flex items-center justify-center p-12"
            >
                <AnimatePresence mode="wait">
                    <motion.img
                        key={selectedImage}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 1.1 }}
                        transition={{ duration: 0.5 }}
                        src={getImageUrl(images[selectedImage])}
                        alt={product.name}
                        className="w-full h-full object-contain mix-blend-multiply group-hover:scale-110 transition-transform duration-700 ease-out"
                    />
                </AnimatePresence>
                
                {/* Sale Badge */}
                {discount > 0 && (
                    <div className="absolute top-10 left-10 bg-primary-600 text-white px-6 py-2 rounded-2xl font-black text-xs uppercase tracking-widest shadow-2xl shadow-primary-600/20 rotate-[-12deg]">
                        {discount}% OFF
                    </div>
                )}
            </motion.div>

            {images.length > 1 && (
              <div className="grid grid-cols-4 gap-4">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(idx)}
                    className={`aspect-square bg-[#fafafa] rounded-[1.5rem] p-3 border-2 transition-all ${
                      selectedImage === idx ? 'border-primary-500 scale-95 shadow-lg' : 'border-gray-100 hover:border-primary-200'
                    }`}
                  >
                    <img
                      src={getImageUrl(img)}
                      alt={`${product.name} ${idx + 1}`}
                      className="w-full h-full object-contain mix-blend-multiply"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* 3. PRODUCT INFO (Right - 7 cols) */}
          <div className="lg:col-span-6">
            <div className="space-y-10">
                {/* Titles */}
                <div>
                    <div className="flex items-center gap-3 mb-4">
                        <span className="px-3 py-1 bg-primary-100 text-primary-700 text-[10px] font-black uppercase tracking-widest rounded-lg">
                            {product.category?.name || 'Fresh Item'}
                        </span>
                        {product.stock > 0 ? (
                            <div className="flex items-center gap-2 text-green-600 font-black text-[10px] uppercase tracking-widest">
                                <Zap size={14} className="fill-current" /> In Stock
                            </div>
                        ) : (
                            <div className="flex items-center gap-2 text-red-500 font-black text-[10px] uppercase tracking-widest">
                                <Clock size={14} /> Out of Stock
                            </div>
                        )}
                    </div>
                    <h1 className="text-4xl md:text-6xl font-black text-gray-950 leading-[1.05] tracking-tighter font-display mb-6">
                        {product.name}
                    </h1>
                    <div className="flex items-center gap-6">
                        <div className="flex flex-col">
                            <span className="text-4xl font-black text-gray-950 tracking-tight">₹{product.price}</span>
                            {product.comparePrice > product.price && (
                                <span className="text-lg text-gray-400 line-through font-bold">₹{product.comparePrice}</span>
                            )}
                        </div>
                        <div className="w-px h-12 bg-gray-100"></div>
                        <div className="flex flex-col">
                            <span className="text-sm font-black text-gray-950">{product.unit || '1 unit'}</span>
                            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Selected Size</span>
                        </div>
                    </div>
                </div>

                {/* Description */}
                <div className="p-8 bg-gray-50 rounded-[2.5rem] border border-gray-100">
                    <h3 className="text-[10px] font-black text-gray-950 uppercase tracking-[0.2em] mb-4">Product Details</h3>
                    <p className="text-gray-500 font-medium leading-relaxed text-base">{product.description}</p>
                </div>

                {/* Trust Badges Bento */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {[
                        { icon: <Zap size={18} />, label: "Express", sub: "10-15 Min" },
                        { icon: <ShieldCheck size={18} />, label: "Quality", sub: "Daily Fresh" },
                        { icon: <Package size={18} />, label: "Return", sub: "No Questions" }
                    ].map((item, i) => (
                        <div key={i} className="p-5 bg-white border border-gray-50 rounded-3xl flex flex-col items-center text-center shadow-sm hover:border-primary-100 transition-all">
                            <div className="text-primary-500 mb-2">{item.icon}</div>
                            <span className="text-[10px] font-black text-gray-950 uppercase tracking-widest">{item.label}</span>
                            <span className="text-[9px] text-gray-400 font-bold uppercase">{item.sub}</span>
                        </div>
                    ))}
                </div>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row items-center gap-6 pt-6">
                    {/* Quantity Selector */}
                    <div className="flex items-center bg-gray-50 rounded-[2rem] p-2 border border-gray-100 w-full sm:w-auto">
                        <button 
                            onClick={() => setQuantity(Math.max(1, quantity - 1))}
                            className="w-14 h-14 flex items-center justify-center bg-white hover:bg-gray-100 rounded-2xl transition-all text-gray-400 hover:text-primary-600 shadow-sm"
                        >
                            <Minus size={20} className="stroke-[3px]" />
                        </button>
                        <span className="w-16 text-center text-xl font-black text-gray-950">{quantity}</span>
                        <button 
                            onClick={() => setQuantity(quantity + 1)}
                            className="w-14 h-14 flex items-center justify-center bg-white hover:bg-gray-100 rounded-2xl transition-all text-gray-400 hover:text-primary-600 shadow-sm"
                        >
                            <Plus size={20} className="stroke-[3px]" />
                        </button>
                    </div>

                    <button
                        onClick={handleAddToCart}
                        disabled={product.stock <= 0}
                        className="group relative flex-1 h-20 bg-gray-950 text-white rounded-[2rem] overflow-hidden transition-all hover:bg-primary-600 active:scale-95 shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-500"></div>
                        <div className="relative z-10 flex items-center justify-center gap-4">
                            <ShoppingBag size={24} className="stroke-[2.5px]" />
                            <span className="text-sm font-black uppercase tracking-[0.3em]">
                                {product.stock > 0 ? 'Add to Basket' : 'Out of Stock'}
                            </span>
                        </div>
                    </button>
                </div>

                {/* Support Info */}
                <div className="flex items-center gap-4 py-4 px-6 bg-primary-50 rounded-2xl border border-primary-100 border-dashed">
                    <Star className="text-primary-500 fill-current" size={16} />
                    <p className="text-[10px] font-black text-primary-700 uppercase tracking-widest">100% Satisfaction Guarantee in Sabalgarh</p>
                </div>
            </div>
          </div>
        </div>

        {/* 4. RELATED PRODUCTS */}
        {relatedProducts.length > 0 && (
          <section className="mt-40">
            <div className="flex flex-col md:flex-row items-center justify-between mb-16 gap-8 text-center md:text-left">
                <div>
                    <div className="inline-flex items-center gap-2 text-primary-600 mb-2">
                        <Sparkles size={18} className="fill-current" />
                        <span className="font-black text-[10px] uppercase tracking-widest">Frequently Bought Together</span>
                    </div>
                    <h2 className="text-4xl md:text-6xl font-black text-gray-950 tracking-tighter font-display uppercase leading-none">Related <span className="text-primary-600">Items.</span></h2>
                </div>
                <Link to="/products" className="flex items-center gap-3 text-[10px] font-black text-gray-950 uppercase tracking-widest hover:text-primary-600 transition-colors">
                    View Entire Store <ChevronRight size={16} />
                </Link>
            </div>
            
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
                {relatedProducts.slice(0, 4).map((relatedProduct) => (
                    <ProductCard key={relatedProduct._id} product={relatedProduct} />
                ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

export default ProductDetail;

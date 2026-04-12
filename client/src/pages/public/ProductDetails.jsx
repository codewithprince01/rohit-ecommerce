import { useState, useRef, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { productService } from '../../services';
import { useFetch } from '../../hooks/useFetch';
import { ShoppingCart, Heart, Minus, Plus, ChevronRight, Truck, Shield, Clock, Star } from 'lucide-react';
import toast from 'react-hot-toast';
import Head from '../../components/common/Head';
import ProductCard from '../../components/common/ProductCard';

const ProductDetails = () => {
    const { slug } = useParams();
    const navigate = useNavigate();
    const { addToCart } = useCart();
    
    // States
    const [selectedImage, setSelectedImage] = useState(0);
    const [quantity, setQuantity] = useState(1);
    const [relatedProducts, setRelatedProducts] = useState([]);
    
    // Fetch Product Data
    const { data: product, loading, error } = useFetch(() => productService.getBySlug(slug), [slug]);

    useEffect(() => {
        if (product?._id) {
            // Fetch related products
            productService.getRelated(product.slug).then(res => {
                setRelatedProducts(res.data || []);
            });
        }
    }, [product]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="w-16 h-16 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
            </div>
        );
    }

    if (error || !product) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center text-center p-4">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Product Not Found</h1>
                <p className="text-gray-600 mb-6">The product you are looking for does not exist or has been removed.</p>
                <Link to="/products" className="btn btn-primary">Back to Shop</Link>
            </div>
        );
    }

    const handleAddToCart = () => {
        addToCart(product, quantity);
    };

    const handleBuyNow = () => {
        addToCart(product, quantity, false);
        navigate('/cart');
    };

    const discount = product.comparePrice 
        ? Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100) 
        : 0;

    const getProductImage = (img) => {
        if (!img) return 'https://dummyimage.com/800x800/f3f4f6/9ca3af.png&text=' + encodeURIComponent(product.name);
        const path = typeof img === 'string' ? img : img.url;
        if (!path) return 'https://dummyimage.com/800x800/f3f4f6/9ca3af.png&text=' + encodeURIComponent(product.name);
        if (path.startsWith('http')) return path;
        const baseUrl = import.meta.env.VITE_API_URL.replace('/api', '');
        return `${baseUrl}/${path.startsWith('/') ? path.substring(1) : path}`;
    };

    return (
        <div className="min-h-screen bg-white">
            <Head 
                title={product.name} 
                description={product.description}
                image={getProductImage(product.images?.[0])}
            />

            <div className="container-custom py-8">
                {/* Breadcrumb */}
                <nav className="flex items-center text-sm text-gray-500 mb-8 overflow-x-auto whitespace-nowrap pb-2">
                    <Link to="/" className="hover:text-primary-600 transition-colors">Home</Link>
                    <ChevronRight size={14} className="mx-2 text-gray-300" />
                    <Link to="/products" className="hover:text-primary-600 transition-colors">Products</Link>
                    <ChevronRight size={14} className="mx-2 text-gray-300" />
                    {product.category && (
                        <>
                            <Link to={`/category/${product.category.slug}`} className="hover:text-primary-600 transition-colors">{product.category.name}</Link>
                            <ChevronRight size={14} className="mx-2 text-gray-300" />
                        </>
                    )}
                    <span className="text-gray-900 font-semibold">{product.name}</span>
                </nav>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
                    {/* Image Gallery */}
                    <div className="space-y-6">
                        <div className="aspect-square bg-white rounded-[32px] overflow-hidden border border-gray-100 relative group shadow-sm ring-1 ring-gray-100">
                            <img 
                                src={getProductImage(product.images?.[selectedImage])} 
                                alt={product.name} 
                                className="w-full h-full object-contain mix-blend-multiply group-hover:scale-105 transition-transform duration-700 ease-out p-8"
                            />
                            {discount > 0 && (
                                <div className="absolute top-6 left-6 flex flex-col gap-2">
                                    <span className="bg-red-500 text-white text-xs font-black px-4 py-1.5 rounded-full shadow-lg shadow-red-500/30 uppercase tracking-tighter">
                                        Save {discount}%
                                    </span>
                                </div>
                            )}
                        </div>
                        {product.images?.length > 1 && (
                            <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide py-2">
                                {product.images.map((img, idx) => (
                                    <button 
                                        key={idx}
                                        onClick={() => setSelectedImage(idx)}
                                        className={`w-24 h-24 rounded-2xl border-2 overflow-hidden flex-shrink-0 transition-all duration-300 ${
                                            selectedImage === idx ? 'border-primary-600 ring-4 ring-primary-50' : 'border-gray-100 hover:border-primary-300 bg-gray-50/50 hover:bg-white'
                                        }`}
                                    >
                                        <img 
                                            src={getProductImage(img)} 
                                            alt={`Thumbnail ${idx}`} 
                                            className="w-full h-full object-cover p-2"
                                        />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Product Info */}
                    <div className="flex flex-col">
                        <div className="mb-6">
                           <span className="text-[10px] font-black text-primary-600 uppercase tracking-[0.2em] bg-primary-50 px-3 py-1.5 rounded-lg mb-4 inline-block">
                              {product.category?.name || 'Essential'}
                           </span>
                           <h1 className="text-4xl md:text-5xl font-black font-display text-gray-950 mb-3 tracking-tighter leading-[1.1]">
                              {product.name}
                           </h1>
                           <div className="flex items-center gap-2">
                              <span className="text-gray-400 font-bold text-sm tracking-tight">{product.unit || '1 unit'}</span>
                              <div className="w-1 h-1 bg-gray-300 rounded-full" />
                              <div className="flex items-center gap-1">
                                 <Star size={14} className="fill-amber-400 text-amber-400" />
                                 <span className="text-sm font-bold text-gray-700">4.8 (2k+ reviews)</span>
                              </div>
                           </div>
                        </div>
                        
                        <div className="bg-gray-50/50 p-8 rounded-[2.5rem] mb-10 border border-gray-100">
                           <div className="flex items-baseline gap-3 mb-1">
                               <span className="text-5xl font-black text-gray-950 tracking-tighter italic">₹{product.price}</span>
                               {product.comparePrice > product.price && (
                                   <span className="text-2xl text-gray-400 line-through font-bold">₹{product.comparePrice}</span>
                               )}
                               <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ml-auto translate-y-[-10px]">
                                  {discount}% OFF
                               </span>
                           </div>
                           <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">(Inclusive of all taxes)</p>
                        </div>

                        <div className="space-y-8">
                           <div className="flex items-center gap-8">
                               <div className="flex flex-col">
                                  <span className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3">Quantity</span>
                                  <div className="flex items-center bg-white border-2 border-primary-500 rounded-[1.25rem] h-14 w-40 overflow-hidden shadow-sm">
                                      <button 
                                          onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                          className="flex-1 h-full flex items-center justify-center hover:bg-primary-50 text-primary-600 transition-colors"
                                      >
                                          <Minus size={20} strokeWidth={3} />
                                      </button>
                                      <span className="w-12 text-center font-black text-2xl text-gray-950">{quantity}</span>
                                      <button 
                                          onClick={() => setQuantity(quantity + 1)}
                                          className="flex-1 h-full flex items-center justify-center hover:bg-primary-50 text-primary-600 transition-colors"
                                      >
                                          <Plus size={20} strokeWidth={3} />
                                      </button>
                                  </div>
                               </div>
                               <div className="flex-1">
                                  <span className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3 block">Quick Actions</span>
                                  <div className="flex gap-4">
                                     <button 
                                         onClick={handleAddToCart}
                                         className="flex-1 bg-gray-950 text-white h-14 rounded-[1.25rem] font-black text-xs uppercase tracking-[0.2em] shadow-xl hover:bg-primary-600 transition-all active:scale-95"
                                     >
                                         Add to Cart
                                     </button>
                                     <button 
                                         onClick={handleBuyNow}
                                         className="flex-1 bg-primary-600 text-white h-14 rounded-[1.25rem] font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-primary-500/20 hover:bg-black transition-all active:scale-95"
                                     >
                                         Buy Now
                                     </button>
                                  </div>
                               </div>
                           </div>

                           <div className="space-y-4 pt-8 border-t border-gray-100">
                              <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest">Product Details</h4>
                              <p className="text-gray-600 leading-relaxed font-medium">
                                 {product.description || 'Premium quality selection curated specifically for your daily health and kitchen needs.'}
                              </p>
                           </div>

                           <div className="grid grid-cols-3 gap-4 pt-10">
                              {[
                                 { title: "10 Min", sub: "Delivery", icon: Clock },
                                 { title: "Safe", sub: "Payment", icon: Shield },
                                 { title: "Best", sub: "Price", icon: Truck }
                              ].map((item, i) => (
                                 <div key={i} className="flex flex-col items-center text-center p-4 bg-gray-50 rounded-[2rem] border border-transparent hover:border-primary-100 transition-all">
                                    <item.icon className="text-primary-600 mb-3" size={20} />
                                    <p className="text-xs font-black text-gray-950 leading-none">{item.title}</p>
                                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tight mt-1">{item.sub}</p>
                                 </div>
                              ))}
                           </div>
                        </div>
                    </div>
v>
                </div>

                {/* Related Products */}
                {relatedProducts.length > 0 && (
                    <div className="mt-20 border-t border-gray-100 pt-16">
                        <h2 className="section-heading mb-8">You May Also Like</h2>
                        <div className="product-grid">
                            {relatedProducts.map(prod => (
                                <ProductCard key={prod._id} product={prod} />
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProductDetails;

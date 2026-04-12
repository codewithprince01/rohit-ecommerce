import { useState, useRef, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { productService } from '../../services';
import { useFetch } from '../../hooks/useFetch';
import { ShoppingCart, Heart, Minus, Plus, ChevronRight, Truck, Shield, Clock } from 'lucide-react';
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
                    <div>
                        <h1 className="text-3xl md:text-4xl font-bold font-display text-gray-900 mb-4">{product.name}</h1>
                        
                        <div className="flex items-center gap-4 mb-6">
                            <div className="flex items-end gap-3">
                                <span className="text-3xl font-bold text-primary-600">₹{product.price}</span>
                                {product.comparePrice > product.price && (
                                    <span className="text-xl text-gray-400 line-through mb-1">₹{product.comparePrice}</span>
                                )}
                            </div>
                            <span className="bg-primary-50 text-primary-700 px-3 py-1 rounded text-sm font-medium">
                                In Stock
                            </span>
                        </div>

                        <p className="text-gray-600 leading-relaxed mb-8 text-lg">
                            {product.description || 'No description available for this product.'}
                        </p>

                        {/* Actions */}
                        <div className="space-y-6 border-t border-b border-gray-100 py-8 mb-8">
                            <div className="flex items-center gap-6">
                                <span className="font-semibold text-gray-900">Quantity:</span>
                                <div className="flex items-center border border-gray-300 rounded-lg h-12 w-32">
                                    <button 
                                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                        className="w-10 h-full flex items-center justify-center hover:bg-gray-100 text-gray-600 rounded-l-lg"
                                    >
                                        <Minus size={18} />
                                    </button>
                                    <span className="flex-1 text-center font-bold text-lg">{quantity}</span>
                                    <button 
                                        onClick={() => setQuantity(quantity + 1)}
                                        className="w-10 h-full flex items-center justify-center hover:bg-gray-100 text-gray-600 rounded-r-lg"
                                    >
                                        <Plus size={18} />
                                    </button>
                                </div>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-4">
                                <button 
                                    onClick={handleAddToCart}
                                    className="flex-1 btn btn-secondary btn-lg rounded-xl shadow-lg shadow-secondary-600/20"
                                >
                                    <ShoppingCart size={22} /> Add to Cart
                                </button>
                                <button 
                                    onClick={handleBuyNow}
                                    className="flex-1 btn btn-primary btn-lg rounded-xl shadow-lg shadow-primary-600/20"
                                >
                                    Buy Now
                                </button>
                            </div>
                        </div>

                         {/* Trust Badges */}
                         <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                                <Truck className="text-primary-600" size={24} />
                                <div>
                                    <p className="font-bold text-gray-900 text-sm">Fast Delivery</p>
                                    <p className="text-xs text-gray-500">Local delivery within 24h</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                                <Shield className="text-primary-600" size={24} />
                                <div>
                                    <p className="font-bold text-gray-900 text-sm">Genuine Product</p>
                                    <p className="text-xs text-gray-500">100% Authentic items</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                                <Clock className="text-primary-600" size={24} />
                                <div>
                                    <p className="font-bold text-gray-900 text-sm">Support 24/7</p>
                                    <p className="text-xs text-gray-500">Contact us anytime</p>
                                </div>
                            </div>
                        </div>
                    </div>
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

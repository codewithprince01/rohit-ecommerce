import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useFetch } from '../../hooks/useFetch';
import { categoryService, productService } from '../../services';
import ProductCard from '../../components/common/ProductCard';
import Head from '../../components/common/Head';
import { ChevronRight, Filter } from 'lucide-react';

const CategoryPage = () => {
    const { slug } = useParams();
    const [category, setCategory] = useState(null);
    const [subcategories, setSubcategories] = useState([]);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                // Get Category Details
                const catRes = await categoryService.getBySlug(slug);
                setCategory(catRes.data);

                if (catRes.data?._id) {
                    // Get Subcategories
                    const subRes = await categoryService.getSubcategories(catRes.data._id);
                    setSubcategories(subRes.data);

                    // Get Products
                    const prodRes = await productService.getAll({ category: catRes.data._id, limit: 12 });
                    setProducts(prodRes.data);
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        if (slug) fetchData();
    }, [slug]);

    if (loading) return <div className="min-h-screen flex justify-center items-center"><div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-600 border-t-transparent"></div></div>;
    
    if (!category) return <div className="text-center py-20">Category Not Found</div>;

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <Head title={category.name} description={`Buy ${category.name} online at best prices.`} />

            <div className="container-custom">
                {/* Breadcrumb */}
                <nav className="flex items-center text-sm text-gray-500 mb-8">
                    <Link to="/" className="hover:text-primary-600">Home</Link>
                    <ChevronRight size={14} className="mx-2" />
                    <Link to="/products" className="hover:text-primary-600">Categories</Link>
                    <ChevronRight size={14} className="mx-2" />
                    <span className="text-gray-900 font-medium">{category.name}</span>
                </nav>

                {/* Banner */}
                <div className="relative bg-white rounded-2xl p-8 mb-12 overflow-hidden shadow-sm border border-gray-100 flex items-center justify-between">
                    <div className="relative z-10 max-w-xl">
                        <h1 className="text-4xl font-bold font-display text-gray-900 mb-4">{category.name}</h1>
                        <p className="text-gray-600 text-lg">{category.description || `Explore our wide range of ${category.name} products.`}</p>
                    </div>
                    {/* Decorative Circle */}
                    <div className="absolute right-0 top-0 h-64 w-64 bg-primary-50 rounded-full translate-x-1/3 -translate-y-1/3 blur-3xl"></div>
                </div>

                {/* Subcategories */}
                {subcategories.length > 0 && (
                    <div className="mb-16">
                        <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                            <Filter size={20} className="text-primary-600" />
                            Browse By Subcategory
                        </h2>
                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                            {subcategories.map(sub => (
                                <Link 
                                    key={sub._id} 
                                    to={`/category/${category.slug}/${sub.slug}`} // Assuming route setup
                                    className="bg-white p-4 rounded-xl border border-gray-100 hover:border-primary-500 hover:shadow-md transition-all text-center group"
                                >
                                    <h3 className="font-medium text-gray-900 group-hover:text-primary-600 text-sm">{sub.name}</h3>
                                </Link>
                            ))}
                        </div>
                    </div>
                )}

                {/* Products */}
                <div>
                    <h2 className="text-2xl font-bold font-display text-gray-900 mb-8">Products in {category.name}</h2>
                    
                    {products.length > 0 ? (
                        <div className="product-grid">
                            {products.map(product => (
                                <ProductCard key={product._id} product={product} />
                            ))}
                        </div>
                    ) : (
                        <div className="bg-white rounded-xl p-12 text-center border border-gray-100">
                            <p className="text-gray-500 text-lg">No products found in this category yet.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CategoryPage;

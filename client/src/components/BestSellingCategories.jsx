import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import api from '../utils/api';
import { getImageUrl } from '../services/api';

const BestSellingCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await api.get('/categories');
        const topLevel = (response.data.data || []).filter(cat => !cat.parent);
        // Take up to 16 for a dense grid
        setCategories(topLevel.slice(0, 16));
      } catch (error) {
        console.error('Error fetching best selling categories:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  if (loading) return null;

  return (
    <section className="bg-white">
        {/* Category Grid (Dense Blinkit/Zepto Style) */}
        <div className="grid grid-cols-4 md:grid-cols-8 gap-x-2 gap-y-4 md:gap-x-4 md:gap-y-6">
            {categories.map((category) => (
                <Link
                    key={category._id}
                    to={`/category/${category.slug}`}
                    className="flex flex-col items-center group cursor-pointer"
                >
                    {/* Soft circular/rounded-square background for image */}
                    <div className="w-16 h-16 md:w-24 md:h-24 rounded-2xl md:rounded-3xl bg-[#f4f6f9] p-2 md:p-4 mb-2 overflow-hidden flex items-center justify-center group-hover:shadow-md transition-shadow">
                        <img
                            src={getImageUrl(category.image) || `https://dummyimage.com/200x200/f3f4f6/9ca3af.png&text=${encodeURIComponent(category.name)}`}
                            alt={category.name}
                            className="w-full h-full object-contain mix-blend-multiply group-hover:scale-110 transition-transform duration-300"
                        />
                    </div>
                    {/* Text below image */}
                    <h3 className="text-[10px] md:text-sm font-semibold text-gray-800 text-center leading-tight max-w-[80px] md:max-w-full truncate w-full px-1">
                        {category.name}
                    </h3>
                </Link>
            ))}
        </div>
    </section>
  );
};

export default BestSellingCategories;

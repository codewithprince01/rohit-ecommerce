import { useNavigate } from 'react-router-dom';

const CategoryCard = ({ category }) => {
    const navigate = useNavigate();

    const getFallbackImage = (name) => {
        const query = name.toLowerCase();
        if (query.includes('atta') || query.includes('flour')) return 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400';
        if (query.includes('bread') || query.includes('pav')) return 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400';
        if (query.includes('dairy') || query.includes('bakery')) return 'https://images.unsplash.com/photo-1550583724-125581cc255b?w=400';
        if (query.includes('veg') || query.includes('fruit')) return 'https://images.unsplash.com/photo-1610348725531-843dff563e2c?w=400';
        if (query.includes('home') || query.includes('care')) return 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=400';
        if (query.includes('milk')) return 'https://images.unsplash.com/photo-1563636619-e910ef2a844b?w=400';
        if (query.includes('mango')) return 'https://images.unsplash.com/photo-1553279768-865429fa0078?w=400';
        return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=2fab73&color=fff&size=200`;
    };

    const imageUrl = category.image 
        ? `${import.meta.env.VITE_API_URL.replace('/api', '')}/${category.image.startsWith('/') ? category.image.slice(1) : category.image}`
        : getFallbackImage(category.name);

    return (
        <div 
            onClick={() => navigate(`/category/${category.slug}`)}
            className="group cursor-pointer flex flex-col items-center gap-3 p-4 rounded-3xl bg-white hover:bg-primary-50/30 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 text-center"
        >
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden bg-gray-50 p-4 ring-1 ring-gray-100 group-hover:ring-primary-200 group-hover:bg-white transition-all shadow-sm">
                <img 
                    src={imageUrl} 
                    alt={category.name} 
                    className="w-full h-full object-contain mix-blend-multiply group-hover:scale-110 transition-transform duration-500"
                />
            </div>
            <h3 className="text-sm sm:text-base font-bold text-gray-800 group-hover:text-primary-600 transition-colors line-clamp-1 w-full px-2">
                {category.name}
            </h3>
        </div>
    );
};

export default CategoryCard;

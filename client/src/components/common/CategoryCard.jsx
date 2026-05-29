import { useNavigate } from 'react-router-dom';
import { getImageUrl } from '../../services/api';
import { ChevronRight } from 'lucide-react';

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

    const imageUrl = getImageUrl(category.image) || getFallbackImage(category.name);

    return (
        <div 
            onClick={() => navigate(`/category/${category.slug}`)}
            className="group cursor-pointer flex flex-col items-center gap-4 p-6 rounded-[2.5rem] bg-white border border-gray-50 hover:bg-primary-50/30 hover:shadow-[0_20px_40px_-15px_rgba(47,171,115,0.15)] hover:border-primary-100 transition-all duration-500 transform hover:-translate-y-2 text-center"
        >
            <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full overflow-hidden bg-gradient-to-br from-gray-50 to-white p-4 border-2 border-transparent group-hover:border-primary-500/20 group-hover:rotate-6 transition-all duration-700 shadow-sm relative">
                <img 
                    src={imageUrl} 
                    alt={category.name} 
                    className="w-full h-full object-contain group-hover:scale-125 transition-transform duration-700 ease-out mix-blend-multiply"
                />
                <div className="absolute inset-0 bg-primary-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            
            <div className="flex flex-col items-center gap-1">
                <h3 className="text-sm sm:text-base font-black text-gray-950 group-hover:text-primary-600 transition-colors line-clamp-2 w-full px-2 uppercase tracking-tight">
                    {category.name}
                </h3>
                <div className="flex items-center gap-1 text-[9px] font-black text-gray-400 uppercase tracking-widest opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                    Explore <ChevronRight size={10} className="stroke-[3px]" />
                </div>
            </div>
        </div>
    );
};

export default CategoryCard;

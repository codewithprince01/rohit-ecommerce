import { useNavigate } from 'react-router-dom';

const CategoryCard = ({ category }) => {
    const navigate = useNavigate();

    const imageUrl = category.image 
        ? `${import.meta.env.VITE_API_URL.replace('/api', '')}${category.image}`
        : 'https://via.placeholder.com/150?text=Category';

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

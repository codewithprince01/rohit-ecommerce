import { MessageCircle, Zap } from 'lucide-react';

const WhatsAppButton = ({ phoneNumber = "919098974996", message = "Hi, I want to order grocery from your website." }) => {
    const handleClick = () => {
        const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
        window.open(url, '_blank');
    };

    return (
        <button 
            onClick={handleClick}
            className="fixed bottom-8 right-8 z-[90] flex items-center gap-3 p-4 bg-[#25D366] text-white rounded-[2rem] shadow-[0_20px_40px_-10px_rgba(37,211,102,0.4)] hover:shadow-[0_25px_50px_-12px_rgba(37,211,102,0.6)] hover:-translate-y-2 hover:scale-105 transition-all duration-500 group overflow-hidden"
            aria-label="Chat on WhatsApp"
        >
            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-500"></div>
            
            <div className="relative z-10 flex items-center justify-center">
                <MessageCircle size={32} className="fill-current group-hover:rotate-12 transition-transform duration-500" />
            </div>
            
            <div className="relative z-10 flex flex-col items-start leading-none pr-4">
                <span className="text-[10px] font-black uppercase tracking-widest opacity-80 mb-1">Help & Support</span>
                <span className="text-sm font-black uppercase tracking-tight">Chat with Us</span>
            </div>

            {/* Pulsing Dot */}
            <div className="absolute top-3 right-3 flex h-3 w-3 z-20">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
            </div>
        </button>
    );
};

export default WhatsAppButton;

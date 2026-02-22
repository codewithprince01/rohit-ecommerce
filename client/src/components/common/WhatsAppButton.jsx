import { MessageCircle } from 'lucide-react';

const WhatsAppButton = ({ phoneNumber = "919098974996", message = "Hi, I want to order grocery from your website." }) => {
    const handleClick = () => {
        const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
        window.open(url, '_blank');
    };

    return (
        <button 
            onClick={handleClick}
            className="whatsapp-float group flex items-center gap-2"
            aria-label="Chat on WhatsApp"
        >
            <MessageCircle size={28} />
            <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-500 whitespace-nowrap font-medium text-sm">
                Chat with us
            </span>
        </button>
    );
};

export default WhatsAppButton;

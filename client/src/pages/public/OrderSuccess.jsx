import { Link } from 'react-router-dom';
import { CheckCircle, Home, ShoppingBag } from 'lucide-react';
import Head from '../../components/common/Head';

const OrderSuccess = () => {
    return (
        <div className="min-h-[80vh] flex items-center justify-center bg-gray-50 p-4">
            <Head title="Order Placed" />
            
            <div className="bg-white max-w-md w-full rounded-2xl shadow-xl p-8 text-center animate-fade-in-up">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 text-green-600 animate-bounce-slow">
                    <CheckCircle size={40} />
                </div>
                
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Order Initiated Successfully!</h1>
                <p className="text-gray-600 mb-8 leading-relaxed">
                    Thank you for your order. We have prepared your order details on WhatsApp.
                    Please <span className="font-bold text-primary-600">send the message</span> to confirm your order.
                </p>

                <div className="space-y-4">
                    <Link to="/products" className="btn btn-primary w-full justify-center">
                        <ShoppingBag size={20} /> Continue Shopping
                    </Link>
                    <Link to="/" className="btn btn-ghost w-full justify-center">
                        <Home size={20} /> Back to Home
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default OrderSuccess;

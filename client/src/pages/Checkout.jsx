import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import toast from 'react-hot-toast';
import api from '../utils/api';

const Checkout = () => {
  const navigate = useNavigate();
  const { cart, getCartTotal, clearCart } = useCart();
  const [settings, setSettings] = useState(null);
  const [formData, setFormData] = useState({
    customerName: '',
    customerPhone: '',
    customerEmail: '',
    deliveryAddress: '',
    notes: ''
  });

  useEffect(() => {
    if (cart.length === 0) {
      navigate('/cart');
    }
    fetchSettings();
  }, [cart]);

  const fetchSettings = async () => {
    try {
      const response = await api.get('/settings');
      setSettings(response.data.data);
    } catch (error) {
      console.error('Error fetching settings:', error);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.customerName || !formData.customerPhone) {
      toast.error('Please fill in required fields');
      return;
    }

    try {
      // Create order log
      const orderData = {
        ...formData,
        items: cart.map(item => ({
          product: item.product._id,
          productName: item.product.name,
          quantity: item.quantity,
          price: item.product.price
        })),
        totalAmount: getCartTotal()
      };

      await api.post('/orders', orderData);

      // Create WhatsApp message
      const whatsappMessage = createWhatsAppMessage();
      const whatsappUrl = `https://wa.me/${settings?.whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`;

      // Clear cart
      clearCart();

      // Open WhatsApp
      window.open(whatsappUrl, '_blank');

      toast.success('Order placed! Redirecting to WhatsApp...');
      setTimeout(() => navigate('/'), 2000);
    } catch (error) {
      console.error('Error placing order:', error);
      toast.error('Failed to place order');
    }
  };

  const createWhatsAppMessage = () => {
    let message = settings?.whatsappMessage || 'Hello! I would like to order the following items:';
    message += '\n\n';

    cart.forEach((item, index) => {
      message += `${index + 1}. ${item.product.name} - ${item.quantity} x $${item.product.price.toFixed(2)} = $${(item.quantity * item.product.price).toFixed(2)}\n`;
    });

    message += `\n*Total: $${getCartTotal().toFixed(2)}*\n\n`;
    message += `Name: ${formData.customerName}\n`;
    message += `Phone: ${formData.customerPhone}\n`;
    if (formData.customerEmail) message += `Email: ${formData.customerEmail}\n`;
    if (formData.deliveryAddress) message += `Address: ${formData.deliveryAddress}\n`;
    if (formData.notes) message += `Notes: ${formData.notes}\n`;

    return message;
  };

  return (
    <div className="py-8 bg-gray-50 min-h-screen">
      <div className="container-custom max-w-4xl">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Checkout</h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Checkout Form */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Delivery Information</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  name="customerName"
                  value={formData.customerName}
                  onChange={handleChange}
                  required
                  className="input"
                  placeholder="John Doe"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number <span className="text-red-600">*</span>
                </label>
                <input
                  type="tel"
                  name="customerPhone"
                  value={formData.customerPhone}
                  onChange={handleChange}
                  required
                  className="input"
                  placeholder="+1234567890"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email (Optional)
                </label>
                <input
                  type="email"
                  name="customerEmail"
                  value={formData.customerEmail}
                  onChange={handleChange}
                  className="input"
                  placeholder="john@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Delivery Address
                </label>
                <textarea
                  name="deliveryAddress"
                  value={formData.deliveryAddress}
                  onChange={handleChange}
                  rows={3}
                  className="input"
                  placeholder="123 Main St, City, State"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Order Notes (Optional)
                </label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  rows={3}
                  className="input"
                  placeholder="Any special instructions..."
                />
              </div>

              <button type="submit" className="btn btn-primary w-full">
                Place Order via WhatsApp
              </button>
            </form>
          </div>

          {/* Order Summary */}
          <div>
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Order Summary</h2>
              <div className="space-y-3">
                {cart.map((item) => (
                  <div key={item.product._id} className="flex justify-between text-sm">
                    <span className="text-gray-600">
                      {item.product.name} x {item.quantity}
                    </span>
                    <span className="font-medium text-gray-900">
                      ${(item.product.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
                <div className="border-t pt-3 flex justify-between text-lg font-bold text-gray-900">
                  <span>Total</span>
                  <span>${getCartTotal().toFixed(2)}</span>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start">
                <svg className="w-5 h-5 text-blue-600 mt-0.5 mr-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                <div className="text-sm text-blue-800">
                  <p className="font-medium mb-1">WhatsApp Order</p>
                  <p>After submitting, you'll be redirected to WhatsApp to confirm your order with us directly.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;

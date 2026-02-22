import { MapPin, Phone, Mail, Clock, Send } from 'lucide-react';
import { useState } from 'react';
import Head from '../../components/common/Head';
import { contactService } from '../../services';
import toast from 'react-hot-toast';

const Contact = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: ''
    });
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await contactService.submit(formData);
            toast.success('Message sent successfully! We will get back to you soon.');
            setFormData({ name: '', email: '', subject: '', message: '' });
        } catch (error) {
            toast.error('Failed to send message. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 py-12">
            <Head title="Contact Us" />

            <div className="container-custom">
                {/* Header */}
                <div className="text-center max-w-2xl mx-auto mb-16">
                    <span className="text-primary-600 font-bold tracking-wider uppercase text-sm">Get in Touch</span>
                    <h1 className="section-heading mt-2">Contact Us</h1>
                    <p className="text-gray-600">
                        Have questions about our products or services? We're here to help. Reach out to us via phone, email, or visit our store.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Contact Info */}
                    <div className="lg:col-span-1 space-y-6">
                        {/* Address Card */}
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all">
                            <div className="w-12 h-12 bg-primary-50 rounded-lg flex items-center justify-center text-primary-600 mb-4">
                                <MapPin size={24} />
                            </div>
                            <h3 className="font-bold text-gray-900 text-lg mb-2">Our Store</h3>
                            <p className="text-gray-600 leading-relaxed">
                                Fatehchand Colony, Sabalgarh,<br />
                                District Morena, Madhya Pradesh,<br />
                                India, 476229
                            </p>
                        </div>

                        {/* Phone & Email */}
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all">
                            <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center text-green-600 mb-4">
                                <Phone size={24} />
                            </div>
                            <h3 className="font-bold text-gray-900 text-lg mb-2">Contact Info</h3>
                            <div className="space-y-2">
                                <a href="tel:+919098974996" className="block text-gray-600 hover:text-primary-600 transition-colors">
                                    +91 9098974996
                                </a>
                                <a href="mailto:info@agrawalstore.com" className="block text-gray-600 hover:text-primary-600 transition-colors">
                                    info@agrawalstore.com
                                </a>
                            </div>
                        </div>

                        {/* Hours */}
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all">
                            <div className="w-12 h-12 bg-orange-50 rounded-lg flex items-center justify-center text-orange-600 mb-4">
                                <Clock size={24} />
                            </div>
                            <h3 className="font-bold text-gray-900 text-lg mb-2">Opening Hours</h3>
                            <ul className="text-gray-600 space-y-1">
                                <li className="flex justify-between">
                                    <span>Mon - Sat:</span>
                                    <span className="font-medium text-gray-900">9:00 AM - 9:00 PM</span>
                                </li>
                                <li className="flex justify-between">
                                    <span>Sunday:</span>
                                    <span className="font-medium text-gray-900">10:00 AM - 2:00 PM</span>
                                </li>
                            </ul>
                        </div>
                    </div>

                    {/* Contact Form */}
                    <div className="lg:col-span-2">
                        <div className="bg-white p-8 rounded-xl shadow-lg border-t-4 border-primary-600 h-full">
                            <h2 className="text-2xl font-bold text-gray-900 mb-6">Send us a Message</h2>
                            
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Your Name</label>
                                        <input
                                            type="text"
                                            name="name"
                                            required
                                            value={formData.name}
                                            onChange={handleChange}
                                            className="input"
                                            placeholder="John Doe"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                                        <input
                                            type="email"
                                            name="email"
                                            required
                                            value={formData.email}
                                            onChange={handleChange}
                                            className="input"
                                            placeholder="john@example.com"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
                                    <input
                                        type="text"
                                        name="subject"
                                        required
                                        value={formData.subject}
                                        onChange={handleChange}
                                        className="input"
                                        placeholder="How can we help?"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
                                    <textarea
                                        name="message"
                                        required
                                        rows="5"
                                        value={formData.message}
                                        onChange={handleChange}
                                        className="input resize-none"
                                        placeholder="Write your message here..."
                                    ></textarea>
                                </div>

                                <button 
                                    type="submit" 
                                    disabled={loading}
                                    className="btn btn-primary w-full md:w-auto"
                                >
                                    {loading ? 'Sending...' : 'Send Message'} <Send size={18} />
                                </button>
                            </form>
                        </div>
                    </div>
                </div>

                {/* Map */}
                <div className="mt-12 bg-gray-200 rounded-xl overflow-hidden h-80 shadow-inner">
                    <iframe 
                        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d14578.50332822292!2d77.3995!3d26.2505!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39716fd0a18765f3%3A0x6e8a08c10e6a47a1!2sSabalgarh%2C%20Madhya%20Pradesh%20476229!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin" 
                        width="100%" 
                        height="100%" 
                        style={{ border: 0 }} 
                        allowFullScreen="" 
                        loading="lazy" 
                        referrerPolicy="no-referrer-when-downgrade"
                        title="Store Location"
                    ></iframe>
                </div>
            </div>
        </div>
    );
};

export default Contact;

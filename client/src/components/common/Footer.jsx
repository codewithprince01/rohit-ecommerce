import { Link } from 'react-router-dom';

const Footer = () => {
    return (
        <footer className="bg-white border-t border-gray-200 pt-8 pb-4 text-sm text-gray-600">
            <div className="container-custom">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
                    <div>
                        <h4 className="font-bold text-gray-900 mb-4">Agrawal Store</h4>
                        <ul className="space-y-2">
                            <li><Link to="/about" className="hover:text-primary-600">About Us</Link></li>
                            <li><Link to="/careers" className="hover:text-primary-600">Careers</Link></li>
                            <li><Link to="/contact" className="hover:text-primary-600">Contact</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-bold text-gray-900 mb-4">Help</h4>
                        <ul className="space-y-2">
                            <li><Link to="/faq" className="hover:text-primary-600">FAQ</Link></li>
                            <li><Link to="/terms" className="hover:text-primary-600">Terms of Use</Link></li>
                            <li><Link to="/privacy" className="hover:text-primary-600">Privacy Policy</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-bold text-gray-900 mb-4">Categories</h4>
                        <ul className="space-y-2">
                            <li><Link to="/products" className="hover:text-primary-600">Vegetables & Fruits</Link></li>
                            <li><Link to="/products" className="hover:text-primary-600">Dairy & Breakfast</Link></li>
                            <li><Link to="/products" className="hover:text-primary-600">Snacks & Drinks</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-bold text-gray-900 mb-4">Contact Us</h4>
                        <ul className="space-y-2">
                            <li>Fatehchand Colony, Sabalgarh</li>
                            <li>support@agrawalstore.com</li>
                            <li>+91 90989 74996</li>
                        </ul>
                    </div>
                </div>
                <div className="border-t border-gray-100 pt-4 flex flex-col md:flex-row justify-between items-center text-xs">
                    <p>© {new Date().getFullYear()} Agrawal Store. All rights reserved.</p>
                    <p className="mt-2 md:mt-0">Made with ❤️ in Sabalgarh</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;

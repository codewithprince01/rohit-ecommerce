import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Mail, Lock, User, UserPlus, Phone, MapPin, ArrowLeft } from 'lucide-react';
import Head from '../../components/common/Head';

const Register = () => {
    const { register } = useAuth();
    const navigate = useNavigate();
    
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        mobile: '',
        address: ''
    });
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        const success = await register(formData);
        if (success) {
            navigate('/login');
        }
        setLoading(false);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
            <Head title="Create Account" />
            
            {/* Background Decoration */}
             <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
                <div className="absolute top-40 -left-20 w-80 h-80 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
                <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-green-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-400"></div>
            </div>

            <div className="max-w-xl w-full space-y-8 bg-white p-8 rounded-2xl shadow-xl z-10 transition-all hover:shadow-2xl">
                <div className="text-center relative">
                    <Link to="/" className="absolute left-0 top-1 text-gray-400 hover:text-gray-600 transition-colors">
                        <ArrowLeft size={24} />
                    </Link>
                    <h2 className="mt-2 text-3xl font-bold font-display text-gray-900">
                        Create Account
                    </h2>
                    <p className="mt-2 text-sm text-gray-600">
                        Join us to get the best grocery experience
                    </p>
                </div>
                
                <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="relative">
                            <label className="text-xs font-semibold text-gray-500 ml-1">Full Name</label>
                            <div className="relative mt-1">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <User className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    name="name"
                                    type="text"
                                    required
                                    className="input pl-10"
                                    placeholder="John Doe"
                                    value={formData.name}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        <div className="relative">
                            <label className="text-xs font-semibold text-gray-500 ml-1">Mobile Number</label>
                            <div className="relative mt-1">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Phone className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    name="mobile"
                                    type="tel"
                                    required
                                    pattern="[0-9]{10}"
                                    title="10 digit mobile number"
                                    className="input pl-10"
                                    placeholder="9876543210"
                                    value={formData.mobile}
                                    onChange={handleChange}
                                    maxLength="10"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="relative">
                        <label className="text-xs font-semibold text-gray-500 ml-1">Email Address</label>
                        <div className="relative mt-1">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Mail className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                name="email"
                                type="email"
                                required
                                className="input pl-10"
                                placeholder="you@example.com"
                                value={formData.email}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    <div className="relative">
                        <label className="text-xs font-semibold text-gray-500 ml-1">Password</label>
                        <div className="relative mt-1">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Lock className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                name="password"
                                type="password"
                                required
                                className="input pl-10"
                                placeholder="Min 6 characters"
                                value={formData.password}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    <div className="relative">
                        <label className="text-xs font-semibold text-gray-500 ml-1">Address</label>
                        <div className="relative mt-1">
                            <div className="absolute top-3 left-3 pointer-events-none">
                                <MapPin className="h-5 w-5 text-gray-400" />
                            </div>
                            <textarea
                                name="address"
                                required
                                rows="2"
                                className="input pl-10 resize-none"
                                placeholder="Your full delivery address"
                                value={formData.address}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    <div className="pt-2">
                        <button
                            type="submit"
                            disabled={loading}
                            className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-secondary-600 hover:bg-secondary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-secondary-500 transition-all shadow-lg hover:shadow-secondary-600/30"
                        >
                            <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                                <UserPlus className="h-5 w-5 text-secondary-500 group-hover:text-secondary-400 transition-colors" />
                            </span>
                            {loading ? 'Creating Account...' : 'Sign Up'}
                        </button>
                    </div>
                </form>

                <div className="text-center mt-4 border-t border-gray-100 pt-6">
                    <p className="text-sm text-gray-600">
                        Already have an account?{' '}
                        <Link to="/login" className="font-medium text-primary-600 hover:text-primary-500">
                            Login here
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Register;

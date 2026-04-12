import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context";
import { Shield, Lock, Mail, Eye, EyeOff, ArrowRight, LayoutDashboard } from "lucide-react";
import toast from "react-hot-toast";

const AdminLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Please enter both email and password");
      return;
    }

    setLoading(true);
    try {
      const success = await login({ email, password });
      if (success) {
        navigate("/admin/dashboard", { replace: true });
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white p-4 font-sans">
      <div className="max-w-md w-full">
        {/* Logo & Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-500 rounded-2xl shadow-sm mb-4">
            <Shield className="text-white w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-1 font-display">
            Admin Login
          </h1>
          <p className="text-gray-500 text-sm">
            Please sign in to manage your store
          </p>
        </div>

        {/* Login Form Container */}
        <div className="bg-white p-8 border border-gray-200 rounded-3xl shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Field */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700 ml-1">
                Email Address
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
                  placeholder="admin@example.com"
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center ml-1">
                <label className="text-sm font-medium text-gray-700">
                  Password
                </label>
                <Link to="#" className="text-xs text-primary-600 hover:underline">
                  Forgot?
                </Link>
              </div>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-11 pr-12 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-6 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-xl transition-colors disabled:opacity-70 flex items-center justify-center gap-2 group"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  <span>Login to Dashboard</span>
                  <ArrowRight size={18} className="group-hover:translate-x-0.5 transition-transform" />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center space-y-4">
          <Link 
            to="/" 
            className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-primary-600 transition-colors"
          >
            <LayoutDashboard size={16} />
            <span>Go to store</span>
          </Link>
          <p className="text-gray-400 text-xs">
            &copy; 2026 Agrawal E-commerce.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;

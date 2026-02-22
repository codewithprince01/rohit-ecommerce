import { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const initAuth = async () => {
      try {
        const storedUser = localStorage.getItem('user');
        const token = localStorage.getItem('token');

        if (token && storedUser) {
          setUser(JSON.parse(storedUser));
          setIsAuthenticated(true);
          
          // Verify with backend
          try {
             const userData = await authService.getCurrentUser();
             setUser(userData.data);
             localStorage.setItem('user', JSON.stringify(userData.data));
          } catch (error) {
             console.error("Token verification failed", error);
             // Optional: logout if token invalid, but be careful with refresh cycles
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (credentials) => {
    try {
      const response = await authService.login(credentials);
      if (response.success) {
        setUser(response.data.user);
        setIsAuthenticated(true);
        toast.success(`Welcome back, ${response.data.user.name}!`);
        return true;
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Login failed');
      return false;
    }
  };

  const register = async (userData) => {
    try {
      const response = await authService.register(userData);
      if (response.success) {
        // Auto login after register or just redirect? 
        // Usually register returns token too.
        if (response.data.token) {
           localStorage.setItem('token', response.data.token);
           localStorage.setItem('user', JSON.stringify(response.data.user));
           setUser(response.data.user);
           setIsAuthenticated(true);
           toast.success('Registration successful!');
           return true;
        }
        toast.success('Registration successful! Please login.');
        return true;
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed');
      return false;
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
      setUser(null);
      setIsAuthenticated(false);
      toast.success('Logged out successfully');
    } catch (error) {
      console.error('Logout error:', error);
      // Force local cleanup anyway
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  const updateProfile = async (data) => {
      // Implement profile update logic here if needed
  };

  const isAdmin = user?.role === 'admin';

  const value = {
    user,
    loading,
    isAuthenticated,
    isAdmin,
    login,
    register,
    logout,
    updateProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

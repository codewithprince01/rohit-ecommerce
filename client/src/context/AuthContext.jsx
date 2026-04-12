import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { setAccessToken, clearAccessToken } from '../utils/api.js';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [accessToken, setAccessTokenState] = useState(null);

  // Initialize auth state on app load
  useEffect(() => {
    const initAuth = async () => {
      try {
        // Try to refresh session using refresh token cookie
        await refreshAccessToken();
      } catch (error) {
        console.log('No active session found');
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  // Guard to prevent multiple simultaneous refresh calls
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Refresh access token using refresh token cookie
  const refreshAccessToken = useCallback(async () => {
    if (isRefreshing) return;
    
    setIsRefreshing(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/auth/refresh`, {
        method: 'POST',
        credentials: 'include', // Important for cookies
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data.accessToken) {
          setAccessTokenState(data.data.accessToken);
          setAccessToken(data.data.accessToken); // Update sessionStorage via utility
          
          // Get user info with new token
          const userResponse = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/auth/me`, {
            headers: {
              'Authorization': `Bearer ${data.data.accessToken}`,
              'Content-Type': 'application/json',
            },
          });

          if (userResponse.ok) {
            const userData = await userResponse.json();
            setUser(userData.data.user);
            setIsAuthenticated(true);
            return true;
          }
        }
      }
      return false;
    } catch (error) {
      console.error('Token refresh failed:', error);
      return false;
    } finally {
      setIsRefreshing(false);
    }
  }, [isRefreshing]);

  // Login function
  const login = async (credentials) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/auth/login`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setUser(data.data.user);
        setAccessTokenState(data.data.accessToken);
        setAccessToken(data.data.accessToken);
        setIsAuthenticated(true);
        toast.success(`Welcome back, ${data.data.user.name}!`);
        return true;
      } else {
        // Show server-side error message if available
        const errorMsg = data.message || 'Login failed';
        toast.error(errorMsg);
        if (response.status === 500) {
          console.error('[SERVER 500 ERROR]:', data);
        }
        return false;
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error('Network error. Check if server is running.');
      return false;
    }
  };

  // Register function
  const register = async (userData) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/auth/register`, {
        method: 'POST',
        credentials: 'include', // Important for cookies
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setUser(data.data.user);
        setAccessTokenState(data.data.accessToken);
        setAccessToken(data.data.accessToken); // Update sessionStorage via utility
        setIsAuthenticated(true);
        toast.success('Registration successful!');
        return true;
      } else {
        toast.error(data.message || 'Registration failed');
        return false;
      }
    } catch (error) {
      console.error('Register error:', error);
      toast.error('Network error during registration');
      return false;
    }
  };

  // Logout function
  const logout = async () => {
    try {
      await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/auth/logout`, {
        method: 'POST',
        credentials: 'include', // Important for cookies
      });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear local state regardless of API call success
      setUser(null);
      setAccessTokenState(null);
      clearAccessToken(); // Clear sessionStorage
      setIsAuthenticated(false);
      toast.success('Logged out successfully');
    }
  };

  // Logout from all devices
  const logoutAll = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/auth/logout-all`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        setUser(null);
        setAccessTokenState(null);
        clearAccessToken(); // Clear sessionStorage
        setIsAuthenticated(false);
        toast.success('Logged out from all devices');
        return true;
      }
    } catch (error) {
      console.error('Logout all error:', error);
      toast.error('Failed to logout from all devices');
      return false;
    }
  };

  // Update user profile
  const updateProfile = async (profileData) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/auth/profile`, {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(profileData),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setUser(data.data.user);
        toast.success('Profile updated successfully');
        return true;
      } else {
        toast.error(data.message || 'Profile update failed');
        return false;
      }
    } catch (error) {
      console.error('Profile update error:', error);
      toast.error('Network error during profile update');
      return false;
    }
  };

  // Check if user has specific permission
  const hasPermission = (permission) => {
    return user?.permissions?.includes(permission) || false;
  };

  // Check if user is admin level
  const isAdmin = user?.role === 'admin' || user?.role === 'super_admin';
  const isSuperAdmin = user?.role === 'super_admin';
  const isStaff = ['staff', 'manager', 'admin', 'super_admin'].includes(user?.role);

  const value = {
    user,
    loading,
    isAuthenticated,
    accessToken,
    isAdmin,
    isSuperAdmin,
    isStaff,
    hasPermission,
    login,
    register,
    logout,
    logoutAll,
    updateProfile,
    refreshAccessToken,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

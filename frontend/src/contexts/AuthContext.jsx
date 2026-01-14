import React, { createContext, useContext, useState, useEffect } from 'react';
import authService from '@/lib/auth';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check if user is authenticated on mount
    const checkAuthStatus = async () => {
      try {
        if (authService.isAuthenticated()) {
          setIsAuthenticated(true);
          // Try to get user info from stored token
          const token = localStorage.getItem('authToken');
          if (token) {
            // In a real app, we would decode the JWT or make a profile request
            // For now, we'll store the token and fetch user info when needed
            try {
              // Extract user info from token (this would require decoding JWT)
              // Since JWT decoding on client is generally not recommended for sensitive data,
              // we'll rely on the user being stored after login
              const storedUserData = localStorage.getItem('userData');
              if (storedUserData) {
                setUser(JSON.parse(storedUserData));
              }
            } catch (decodeError) {
              console.error('Error decoding token or parsing user data:', decodeError);
            }
          }
        }
      } catch (error) {
        console.error('Auth check error:', error);
        authService.logout(); // Clear any invalid token
      } finally {
        setLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  const login = async (credentials) => {
    try {
      const { user: userData } = await authService.login(credentials);
      setUser(userData);
      setIsAuthenticated(true);
      // Store user data locally to persist after refresh
      localStorage.setItem('userData', JSON.stringify(userData));
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const register = async (userData) => {
    try {
      const response = await authService.register(userData);
      setUser(response.user);
      setIsAuthenticated(true);
      // Store user data locally to persist after refresh
      localStorage.setItem('userData', JSON.stringify(response.user));
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const logout = () => {
    authService.logout();
    localStorage.removeItem('userData'); // Remove stored user data
    setUser(null);
    setIsAuthenticated(false);
  };

  const value = {
    user,
    isAuthenticated,
    loading,
    login,
    register,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
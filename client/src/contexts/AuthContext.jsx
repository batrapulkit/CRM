import { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/client';

const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [agency, setAgency] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        setLoading(false);
        return;
      }

      const response = await api.get('/auth/me');
      setProfile(response.data.user);
      setUser({ email: response.data.user.email });

      // Extract agency data if available
      if (response.data.user?.agencies) {
        setAgency(response.data.user.agencies);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      localStorage.removeItem('auth_token');
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      const { token, user: userData, agency: agencyData } = response.data;

      localStorage.setItem('auth_token', token);
      setUser({ email: userData.email });
      setProfile(userData);

      // Store agency data
      if (agencyData) {
        setAgency(agencyData);
      }

      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Login failed');
    }
  };

  const signUp = async (email, password, fullName, agencyName) => {
    try {
      const response = await api.post('/auth/register', {
        email,
        password,
        full_name: fullName,
        agency_name: agencyName,
      });

      const { token, user: userData, agency: agencyData } = response.data;
      localStorage.setItem('auth_token', token);
      setUser({ email: userData.email });
      setProfile(userData);

      // Store agency data
      if (agencyData) {
        setAgency(agencyData);
      }

      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Registration failed');
    }
  };

  const signOut = async () => {
    localStorage.removeItem('auth_token');
    setUser(null);
    setProfile(null);
    setAgency(null);
  };

  const value = {
    user,
    profile,
    agency,
    loading,
    signIn,
    signUp,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

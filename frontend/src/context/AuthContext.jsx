import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authAPI } from '../api/axios';

const AuthContext = createContext(null);

/**
 * AuthProvider manages global authentication state:
 * - user object (id, fullName, email, roles)
 * - JWT token (stored in localStorage)
 * - login/register/logout functions
 * - role-checking helpers
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Restore auth state from localStorage on mount
  useEffect(() => {
    const savedToken = localStorage.getItem('smarthire_token');
    const savedUser = localStorage.getItem('smarthire_user');
    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const saveAuth = (authResponse) => {
    const userData = {
      id: authResponse.userId,
      fullName: authResponse.fullName,
      email: authResponse.email,
      roles: authResponse.roles,
    };
    localStorage.setItem('smarthire_token', authResponse.accessToken);
    localStorage.setItem('smarthire_user', JSON.stringify(userData));
    setToken(authResponse.accessToken);
    setUser(userData);
  };

  const login = useCallback(async (email, password) => {
    const response = await authAPI.login({ email, password });
    saveAuth(response.data);
    return response.data;
  }, []);

  const register = useCallback(async (fullName, email, password, phone, role) => {
    const response = await authAPI.register({ fullName, email, password, phone, role });
    saveAuth(response.data);
    return response.data;
  }, []);

  const googleLogin = useCallback(async (credential, role = null) => {
    const response = await authAPI.googleLogin({ credential, role });
    saveAuth(response.data);
    return response.data;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('smarthire_token');
    localStorage.removeItem('smarthire_user');
    setToken(null);
    setUser(null);
  }, []);

  const isRecruiter = user?.roles?.includes('RECRUITER');
  const isApplicant = user?.roles?.includes('APPLICANT');
  const isAuthenticated = !!token && !!user;

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated,
        isRecruiter,
        isApplicant,
        login,
        register,
        googleLogin,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

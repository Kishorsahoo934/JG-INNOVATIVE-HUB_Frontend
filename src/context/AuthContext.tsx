import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authApi, User } from '../services/api';
import { setAuthToken, removeAuthToken } from '../services/api';

export type RegisterPayload = {
  email: string;
  password: string;
  name?: string;
  mobile?: string;
};

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  googleLogin: (tokenId?: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('authToken');
      if (!token) {
        setIsLoading(false);
        return;
      }
      try {
        const res = await authApi.getMe();
        if (res.success && res.data) {
          const u = res.data as User;
          setUser({ ...u, _id: (u as User & { id?: string }).id || u._id });
        }
      } catch {
        removeAuthToken();
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };
    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    const res = await authApi.login({ email, password });
    if (res.success && res.data) {
      const d = res.data as { token: string; user: User & { id?: string } };
      if (d.token) setAuthToken(d.token);
      setUser({ ...d.user, _id: d.user.id || d.user._id });
    } else {
      throw new Error((res as { message?: string }).message || 'Login failed');
    }
  };

  const register = async (payload: RegisterPayload) => {
    const { email, password, name, mobile } = payload;
    const res = await authApi.register({
      name: name || email.split('@')[0],
      email,
      password,
      ...(mobile?.trim() ? { mobile: mobile.trim() } : {}),
    });
    if (res.success && res.data) {
      const d = res.data as { token?: string; user?: User & { id?: string } };
      if (d?.token && d?.user) {
        setAuthToken(d.token);
        setUser({ ...d.user, _id: d.user.id || d.user._id });
      }
      // If no token, backend requires email verification – do not set user; caller shows "check your email"
    } else {
      throw new Error((res as { message?: string }).message || 'Registration failed');
    }
  };

  const googleLogin = async (tokenId?: string) => {
    if (!tokenId) throw new Error('Google Sign-In: Please integrate Google Identity to get token');
    const res = await authApi.googleLogin({ tokenId });
    if (res.success && res.data) {
      const d = res.data as { token: string; user: User & { id?: string } };
      if (d.token) setAuthToken(d.token);
      setUser({ ...d.user, _id: d.user.id || d.user._id });
    } else {
      throw new Error((res as { message?: string }).message || 'Google login failed');
    }
  };

  const logout = () => {
    removeAuthToken();
    setUser(null);
  };

  const refreshUser = async () => {
    try {
      const res = await authApi.getMe();
      if (res.success && res.data) {
        const u = res.data as User;
        setUser({ ...u, _id: (u as User & { id?: string }).id || u._id });
      }
    } catch {
      removeAuthToken();
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        googleLogin,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

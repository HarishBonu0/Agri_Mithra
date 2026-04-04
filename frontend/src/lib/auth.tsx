import React, { createContext, useContext, useState, useEffect } from "react";
import { api } from "@/lib/api";

interface User {
  id: string;
  name: string;
  phone: string;
  mobile: string;
  isAdmin: boolean;
}

interface AuthContextType {
  user: User | null;
  isLoggedIn: boolean;
  isAdmin: boolean;
  token: string | null;
  signup: (name: string, mobile: string, password: string) => Promise<void>;
  login: (mobile: string, password: string) => Promise<User>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoggedIn: false,
  isAdmin: false,
  token: null,
  signup: async () => {},
  login: async () => ({ id: "", name: "", phone: "", mobile: "", isAdmin: false }),
  logout: () => {},
});

const TOKEN_KEY = "agrimitra-token";

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);

  const normalizeUser = (raw: { id: string; name: string; phone: string; isAdmin?: boolean }): User => ({
    id: raw.id,
    name: raw.name,
    phone: raw.phone,
    mobile: raw.phone,
    isAdmin: Boolean(raw.isAdmin),
  });

  // Load token and resolve session from backend
  useEffect(() => {
    const savedToken = localStorage.getItem(TOKEN_KEY);
    if (!savedToken) return;

    setToken(savedToken);
    api.auth
      .me(savedToken)
      .then((res) => setUser(normalizeUser(res.data.user)))
      .catch(() => {
        localStorage.removeItem(TOKEN_KEY);
        setToken(null);
        setUser(null);
      });
  }, []);

  const signup = async (name: string, mobile: string, password: string) => {
    const response = await api.auth.signup({
      name,
      phone: mobile,
      password,
    });

    localStorage.setItem(TOKEN_KEY, response.data.token);
    setToken(response.data.token);
    setUser(normalizeUser(response.data.user));
  };

  const login = async (mobile: string, password: string) => {
    const response = await api.auth.login({
      phone: mobile,
      password,
    });

    const normalizedUser = normalizeUser(response.data.user);
    localStorage.setItem(TOKEN_KEY, response.data.token);
    setToken(response.data.token);
    setUser(normalizedUser);
    return normalizedUser;
  };

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoggedIn: !!user && !!token,
        isAdmin: Boolean(user?.isAdmin),
        token,
        signup,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

import React, { createContext, useContext, useState, useEffect } from "react";
import { api } from "@/lib/api";

interface User {
  id: string;
  name: string;
  phone: string;
  mobile: string;
}

interface AuthContextType {
  user: User | null;
  isLoggedIn: boolean;
  token: string | null;
  signup: (name: string, mobile: string, password: string) => Promise<void>;
  login: (mobile: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoggedIn: false,
  token: null,
  signup: async () => {},
  login: async () => {},
  logout: () => {},
});

const TOKEN_KEY = "agrimitra-token";

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);

  const normalizeUser = (raw: { id: string; name: string; phone: string }): User => ({
    id: raw.id,
    name: raw.name,
    phone: raw.phone,
    mobile: raw.phone,
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

    localStorage.setItem(TOKEN_KEY, response.data.token);
    setToken(response.data.token);
    setUser(normalizeUser(response.data.user));
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

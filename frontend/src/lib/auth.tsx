import React, { createContext, useContext, useState, useEffect } from "react";

interface User {
  name: string;
  mobile: string;
}

interface AuthContextType {
  user: User | null;
  isLoggedIn: boolean;
  signup: (name: string, mobile: string, password: string) => void;
  login: (mobile: string, password: string) => boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoggedIn: false,
  signup: () => {},
  login: () => false,
  logout: () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  // Load user from localStorage on mount
  useEffect(() => {
    const savedUser = localStorage.getItem("agrimitra-user");
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        console.error("Failed to parse saved user:", e);
      }
    }
  }, []);

  const signup = (name: string, mobile: string, password: string) => {
    // Store user in localStorage and set as logged in
    const newUser = { name, mobile };
    localStorage.setItem("agrimitra-user", JSON.stringify(newUser));
    localStorage.setItem(`agrimitra-pwd-${mobile}`, password);
    setUser(newUser);
  };

  const login = (mobile: string, password: string): boolean => {
    // Check stored credentials
    const storedPassword = localStorage.getItem(`agrimitra-pwd-${mobile}`);
    if (storedPassword === password) {
      const users = Object.keys(localStorage)
        .filter((k) => k.startsWith("agrimitra-pwd-"))
        .map((k) => {
          const m = k.replace("agrimitra-pwd-", "");
          return { mobile: m };
        });

      const foundUser = users.find((u) => u.mobile === mobile);
      if (foundUser) {
        const savedUser = localStorage.getItem("agrimitra-user");
        let current = foundUser;
        if (savedUser) {
          try {
            current = JSON.parse(savedUser);
          } catch (e) {
            console.error("Failed to parse saved user:", e);
          }
        }
        // For demo: use name if exists, else use mobile
        const userToSet: User = {
          name: (current as any).name || "Farmer",
          mobile,
        };
        localStorage.setItem("agrimitra-user", JSON.stringify(userToSet));
        setUser(userToSet);
        return true;
      }
    }
    return false;
  };

  const logout = () => {
    localStorage.removeItem("agrimitra-user");
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoggedIn: !!user,
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

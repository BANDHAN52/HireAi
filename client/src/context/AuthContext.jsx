import { createContext, useContext, useState, useEffect } from "react";
import api from "../utils/api.js";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("hireai_token");
    const savedUser = localStorage.getItem("hireai_user");
    if (token && savedUser) {
      try {
        setUser(JSON.parse(savedUser));
        
        api.get("/auth/me").then(({ data }) => {
          if (data.user) {
            localStorage.setItem("hireai_user", JSON.stringify(data.user));
            setUser(data.user);
          }
        }).catch(() => {});
      } catch (e) {}
    }
    setLoading(false);
  }, []);

  const login = (token, userData) => {
    localStorage.setItem("hireai_token", token);
    localStorage.setItem("hireai_user", JSON.stringify(userData));
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem("hireai_token");
    localStorage.removeItem("hireai_user");
    setUser(null);
  };

  const updateUser = (updatedData) => {
    const newUser = { ...user, ...updatedData };
    localStorage.setItem("hireai_user", JSON.stringify(newUser));
    setUser(newUser);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, updateUser, loading, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
};

import { createContext, useContext, useState, type ReactNode } from "react";
import { apiFetch } from "../lib/api";

interface User {
  id: number;
  email: string;
  role: "USER" | "EMPLOYEE" | "ADMIN";
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isEmployee: boolean;
}

function getUserFromToken(): User | null {
  try {
    const token = localStorage.getItem("accessToken");
    if (!token) return null;
    const payload = JSON.parse(atob(token.split(".")[1]));
    // Check expiry
    if (payload.exp && payload.exp * 1000 < Date.now()) {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      return null;
    }
    return { id: Number(payload.sub), email: payload.email, role: payload.role };
  } catch {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    return null;
  }
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(getUserFromToken);

  const login = async (email: string, password: string) => {
    const data = await apiFetch<{ accessToken: string; refreshToken: string; user: User }>(
      "/auth/login",
      { method: "POST", body: JSON.stringify({ email, password }) }
    );
    localStorage.setItem("accessToken", data.accessToken);
    localStorage.setItem("refreshToken", data.refreshToken);
    setUser(data.user);
  };

  const register = async (email: string, password: string) => {
    const data = await apiFetch<{ accessToken: string; refreshToken: string; user: User }>(
      "/auth/register",
      { method: "POST", body: JSON.stringify({ email, password }) }
    );
    localStorage.setItem("accessToken", data.accessToken);
    localStorage.setItem("refreshToken", data.refreshToken);
    setUser(data.user);
  };

  const logout = () => {
    const refreshToken = localStorage.getItem("refreshToken");
    if (refreshToken) {
      apiFetch("/auth/logout", {
        method: "POST",
        body: JSON.stringify({ refreshToken }),
      }).catch(() => {});
    }
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    setUser(null);
  };

  const isEmployee = user?.role === "EMPLOYEE" || user?.role === "ADMIN";

  return (
    <AuthContext.Provider value={{ user, login, register, logout, isEmployee }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

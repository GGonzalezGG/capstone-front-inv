"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { jwtDecode } from "jwt-decode"; // 1. Importar jwt-decode

// 2. Definir la info del usuario y el payload del token
interface User {
  id: string;
  role: "ADMIN" | "MANAGER" | "NURSE";
}
interface JwtPayload {
  id: string;
  role: "ADMIN" | "MANAGER" | "NURSE";
  iat: number;
  exp: number;
}

// 3. Actualizar el tipo del Contexto
interface AuthContextType {
  token: string | null;
  user: User | null; // <-- AÑADIDO
  isLoading: boolean;
  error: string | null;
  login: (email: string, pass: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null); // <-- AÑADIDO
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    try {
      const storedToken = localStorage.getItem("jwtToken");
      if (storedToken) {
        // 4. Decodificar el token al cargar
        const decoded = jwtDecode<JwtPayload>(storedToken);

        // Verificar si el token ha expirado
        if (decoded.exp * 1000 > Date.now()) {
          setToken(storedToken);
          setUser({ id: decoded.id, role: decoded.role });
        } else {
          // Si expiró, limpiarlo
          localStorage.removeItem("jwtToken");
        }
      }
    } catch (e) {
      console.error("Error al decodificar token de localStorage", e);
      localStorage.removeItem("jwtToken");
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, pass: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password: pass }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Error al iniciar sesión");

      // 5. Guardar token y decodificar usuario
      const decoded = jwtDecode<JwtPayload>(data.token);
      setToken(data.token);
      setUser({ id: decoded.id, role: decoded.role });
      localStorage.setItem("jwtToken", data.token);

      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null); // <-- AÑADIDO
    localStorage.removeItem("jwtToken");
    router.push("/login");
  };

  const value = {
    token,
    user, // <-- AÑADIDO
    isLoading,
    error,
    login,
    logout,
  };

  // ... (resto del provider)
  if (isLoading) {
    return null;
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth debe ser usado dentro de un AuthProvider");
  }
  return context;
};

"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useRouter } from "next/navigation";
import apiClient from "../lib/apiClients"; 

interface User {
  id: string;
  role: "ADMIN" | "MANAGER" | "NURSE";
}

interface AuthContextType {
  user: User | null; 
  isLoading: boolean;
  error: string | null;
  login: (email: string, pass: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null); 
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    // Al recargar la página, recuperamos solo la información visual del usuario
    // El token de verdad está seguro en la cookie
    try {
      const storedUser = localStorage.getItem("authUser");
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (e) {
      console.error("Error al leer usuario de localStorage", e);
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, pass: string) => {
    setIsLoading(true);
    setError(null);
    try {
      // Usamos nuestro apiClient que ya tiene withCredentials: true
      const res = await apiClient.post("/auth/login", { 
        email, 
        password: pass 
      });

      // El backend nos devuelve el usuario (pero la cookie ya se guardó sola)
      const userData = res.data.user;
      
      setUser(userData);
      localStorage.setItem("authUser", JSON.stringify(userData));

      router.push("/dashboard");
    } catch (err: any) {
      // Manejo de errores con axios
      const errorMessage = err.response?.data?.message || err.message || "Error al iniciar sesión";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      // 1. Avisamos al backend para que destruya la cookie HttpOnly
      await apiClient.post("/auth/logout");
    } catch (error) {
      console.error("Error al cerrar sesión en el servidor:", error);
    } finally {
      // 2. Limpiamos la información visual (UI) del usuario
      setUser(null); 
      localStorage.removeItem("authUser");
      
      // 3. Redirigimos al login
      router.push("/login");
    }
  };

  const value = { user, isLoading, error, login, logout };

  if (isLoading) return null;

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth debe ser usado dentro de un AuthProvider");
  }
  return context;
};
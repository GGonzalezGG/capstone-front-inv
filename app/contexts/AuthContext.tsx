"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation'; // Importa useRouter

// Define la forma de los datos en el contexto
interface AuthContextType {
  token: string | null;
  isLoading: boolean;
  error: string | null;
  login: (email: string, pass: string) => Promise<void>;
  logout: () => void;
}

// 1. Crear el Contexto
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// 2. Crear el Proveedor (Provider)
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true); // Inicia en true para chequear localStorage
  const [error, setError] = useState<string | null>(null);
  const router = useRouter(); // Hook para redirigir

  // Al cargar, intentar leer el token de localStorage
  useEffect(() => {
    const storedToken = localStorage.getItem('jwtToken');
    if (storedToken) {
      setToken(storedToken);
    }
    setIsLoading(false); // Termina la carga inicial
  }, []);

  // Función de Login
  const login = async (email: string, pass: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password: pass }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Error al iniciar sesión');
      }

      // Éxito: Guardar el token
      setToken(data.token);
      localStorage.setItem('jwtToken', data.token);
      
      // Redirigir al dashboard
      router.push('/dashboard'); 

    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Función de Logout
  const logout = () => {
    setToken(null);
    localStorage.removeItem('jwtToken');
    // Redirigir al login
    router.push('/login');
  };

  const value = {
    token,
    isLoading,
    error,
    login,
    logout,
  };

  // No renderizar hijos si está en la carga inicial
  if (isLoading) {
    // Puedes poner un spinner global aquí si quieres
    return null; 
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// 3. Crear el Hook para consumir el contexto
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};
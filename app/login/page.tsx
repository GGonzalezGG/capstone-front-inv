"use client";

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation'; // 1. Importar useRouter para redirigir
import LoginForm from '../components/features/LoginForm';
import { useAuth } from '../contexts/AuthContext';

// import Image from 'next/image';

const LoginPage = () => {
  // 3. Usar el estado y las funciones del Context
  const { login, isLoading, error, token } = useAuth();
  const router = useRouter();

  /**
   * Manejador de login que ahora usa el contexto.
   */
  const handleLogin = async (email: string, pass: string) => {
    // 4. Llamar a la función de login del contexto
    await login(email, pass);
  };

  // 5. Efecto para redirigir si el login es exitoso
  useEffect(() => {
    if (token) {
      // Si el token existe (login exitoso), redirigir al dashboard
      router.push('/dashboard');
    }
  }, [token, router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-blue-100 p-4">
      <div className="mb-8">
        {}
        <h1 className="text-3xl font-bold text-blue-800">
          Duomo Salud
        </h1>
        <p className="text-gray-600 text-center">Gestión de Inventario</p>
      </div>

      <LoginForm 
        onLogin={handleLogin}
        isLoading={isLoading} // 6. Pasar el estado del contexto
        error={error}       // 6. Pasar el estado del contexto
      />
    </div>
  );
};

export default LoginPage;
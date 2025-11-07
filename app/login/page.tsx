"use client";

import React, { useState } from 'react';
import LoginForm from '../components/features/LoginForm';

// import Image from 'next/image';

const LoginPage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Simulación de la lógica de login.
   * Reemplaza esto con tu llamada real a la API.
   */
  const handleLogin = async (email: string, pass: string) => {
    setIsLoading(true);
    setError(null);
    
    // Simular una llamada a la API
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Lógica de validación de ejemplo
    if (email === "admin@duomo.cl" && pass === "1234") {
      console.log("Login exitoso!");
      // Aquí redirigirías al dashboard:
      // router.push('/dashboard');
      alert('¡Login Exitoso! Redirigiendo...');
    } else {
      console.log("Credenciales incorrectas");
      setError("Email o contraseña incorrectos. Inténtalo de nuevo.");
    }

    setIsLoading(false);
  };

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
        isLoading={isLoading}
        error={error}
      />
    </div>
  );
};

export default LoginPage;
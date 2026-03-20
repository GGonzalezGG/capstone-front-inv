"use client";

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Button from './components/ui/Button';
import Card from './components/ui/Card';
import { Package, ShieldPlus, Activity, ArrowRight } from 'lucide-react';
// 1. Importa el hook useAuth
import { useAuth } from './contexts/AuthContext'; 

// import LogoDuomo from '../public/logo_duomo.svg';

export default function HomePage() {
  const router = useRouter();
  // 2. Extrae el token y el estado de carga
  const { token, isLoading } = useAuth(); 

  // 3. Efecto de redirección
  useEffect(() => {
    // Si no está cargando y hay un token válido, envíalo al dashboard
    if (!isLoading && token) {
      router.push('/dashboard');
    }
  }, [token, isLoading, router]);

  // 4. (Opcional) Mostrar un spinner mientras valida el token
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Si no está logueado, muestra la Landing Page normal
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
       {/* ... TODO EL RESTO DEL CÓDIGO JSX SE MANTIENE IGUAL ... */}
      <nav className="w-full bg-white shadow-sm border-b border-gray-100 py-4 px-6 sm:px-8 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg p-1.5">
            <Package className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold bg-gradient-to-r from-blue-700 to-indigo-700 bg-clip-text text-transparent">
            Duomo Salud
          </span>
        </div>
        <div>
          <Button variant="secondary" onClick={() => router.push('/login')}>
            Iniciar Sesión
          </Button>
        </div>
      </nav>
      {/* ... */}
    </div>
  );
}
"use client";
import React from 'react';
  import StatCard from '../components/ui/StatCard';

  // --- Iconos de ejemplo (en una app real, vendrían de 'lucide-react' o similar) ---
  const BoxIcon = () => (
    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.27 6.96L12 12.01l8.73-5.05M12 22.08V12" />
    </svg>
  );
  
  const AlertIcon = () => (
    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    </svg>
  );

  const CheckIcon = () => (
    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
    </svg>
  );
  // --- Fin de iconos de ejemplo ---


  const DashboardExample = () => {
    return (
      <div className="p-10 bg-gray-50">
        <h2 className="w-full text-2xl font-bold text-blue-700 mb-6">
          Dashboard de Inventario
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <StatCard
            title="Total de Insumos"
            value="1,204"
            icon={<BoxIcon />}
            color="blue"
            description="+25 insumos esta semana"
          />
          <StatCard
            title="Stock Bajo"
            value="12"
            icon={<AlertIcon />}
            color="yellow"
            description="3 insumos críticos"
          />
          <StatCard
            title="Peticiones Completadas"
            value="128"
            icon={<CheckIcon />}
            color="lime"
            description="8 hoy"
          />
        </div>
      </div>
    );
  };
    export default DashboardExample;
"use client";
import React from 'react';
import InventorySummaryChart from '../components/features/InventorySummaryChart';
import RecentActivityFeed, { ActivityItem } from '../components/features/RecentActivityFeed';
import StatCard from '../components/ui/StatCard';
import Header from '../components/ui/Header';

// Datos simulados para el gráfico
const mockInventoryData = [
  { name: 'Jeringas', quantity: 150 },
  { name: 'Gasas', quantity: 300 },
  { name: 'Guantes', quantity: 450 },
  { name: 'Mascarillas', quantity: 200 },
  { name: 'Alcohol', quantity: 80 },
];

// Datos simulados para el feed de actividad
const mockActivityData: ActivityItem[] = [
  { id: '1', type: 'request', description: 'Enfermera Clara solicitó 50 Jeringas.', timestamp: 'hace 2 min' },
  { id: '2', type: 'alert', description: 'Stock bajo para "Guantes (M)". Quedan 10 uds.', timestamp: 'hace 15 min' },
  { id: '3', type: 'add', description: 'Secretaría agregó 200 "Mascarillas" al stock.', timestamp: 'hace 1h' },
  { id: '4', type: 'system', description: 'Reporte de inventario mensual generado.', timestamp: 'hace 3h' },
  { id: '5', type: 'request', description: 'Enfermero Juan solicitó 10 Vendas.', timestamp: 'hace 5h' },
];

// --- Iconos ---
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

const DashboardPage = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Title */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="mt-2 text-sm text-gray-600">
            Resumen general del sistema de inventario
          </p>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <StatCard 
            title="Stock Bajo" 
            value="12" 
            icon={<AlertIcon />} 
            color="yellow" 
          />
          <StatCard 
            title="Total de Insumos" 
            value="1204" 
            icon={<BoxIcon />} 
            color="blue" 
          />
          <StatCard 
            title="Peticiones de Hoy" 
            value="8" 
            icon={<CheckIcon />} 
            color="lime" 
          />
        </div>

        {/* Charts and Activity Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Chart - Takes 2/3 on large screens */}
          <div className="lg:col-span-2">
            <InventorySummaryChart 
              data={mockInventoryData} 
              title="Insumos Principales" 
            />
          </div>

          {/* Activity Feed - Takes 1/3 on large screens */}
          <div className="lg:col-span-1">
            <RecentActivityFeed activities={mockActivityData} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
"use client";

import React, { useState, useEffect } from 'react';

// --- Iconos de Lucide ---
import {
  Package,
  Clock,
  AlertTriangle,
  PackageX,
  CheckCircle,
  XCircle
} from 'lucide-react';
import StatCard from '../../components/ui/StatCard';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Spinner from '../../components/ui/Spinner';


import InventorySummaryChart from '../../components/features/InventorySummaryChart';
import RecentActivityFeed, { ActivityItem } from '../../components/features/RecentActivityFeed';
import RequestList, { RequestSummary } from '../../components/features/RequestList';
import PatientManagement from '@/app/components/features/PatientManagement';
import UserManagement from '@/app/components/features/UserManagement';

// --- Tipos de Datos (Re-definidos para este componente) ---
interface Kpi {
  title: string;
  value: string;
  icon: React.ReactNode;
  color: 'success' | 'warning' | 'danger' | 'info';
  description: string;
}

interface ChartData {
  name: string;
  quantity: number;
}

// --- Datos Simulados (Mock Data) ---
// En una app real, esto vendría de una API
const mockKpis: Kpi[] = [
  {
    title: 'Peticiones Pendientes',
    value: '8',
    icon: <Clock className="w-6 h-6" />,
    color: 'warning',
    description: 'Nuevas peticiones por revisar',
  },
  {
    title: 'Stock Bajo',
    value: '12',
    icon: <AlertTriangle className="w-6 h-6" />,
    color: 'danger',
    description: 'Insumos por debajo del mínimo',
  },
  {
    title: 'Insumos Vencidos',
    value: '3',
    icon: <PackageX className="w-6 h-6" />,
    color: 'danger',
    description: 'Requieren acción inmediata',
  },
  {
    title: 'Peticiones Listas',
    value: '4',
    icon: <Package className="w-6 h-6" />,
    color: 'info',
    description: 'Listas para retiro',
  },
];

const mockRequests: RequestSummary[] = [
  {
    id: 'req_1',
    patientName: 'Juan Pérez',
    requesterName: 'Enf. María González',
    status: 'pending',
    createdAt: new Date(Date.now() - 10 * 60000).toISOString(),
    items: [
      { id: 'item_1', name: 'Jeringas 5ml', quantity: 20 },
      { id: 'item_2', name: 'Gasas estériles', quantity: 50 },
    ],
  },
  {
    id: 'req_2',
    patientName: 'Ana López',
    requesterName: 'Enf. Carlos Soto',
    status: 'pending',
    createdAt: new Date(Date.now() - 2 * 60 * 60000).toISOString(),
    items: [{ id: 'item_3', name: 'Solución Salina 500ml', quantity: 5 }],
  },
];

const mockActivities: ActivityItem[] = [
  {
    id: 'act_1',
    type: 'request',
    description: 'Enf. María González solicitó 2 insumos para Juan Pérez.',
    timestamp: 'hace 10 min',
  },
  {
    id: 'act_2',
    type: 'alert',
    description: 'Stock de "Jeringas 5ml" ha bajado a 20 unidades.',
    timestamp: 'hace 12 min',
  },
  {
    id: 'act_3',
    type: 'add',
    description: 'Se agregaron 100 "Guantes de Nitrilo" al inventario.',
    timestamp: 'hace 1 hora',
  },
  {
    id: 'act_4',
    type: 'request',
    description: 'Enf. Carlos Soto solicitó 1 insumo para Ana López.',
    timestamp: 'hace 2 horas',
  },
];

const mockChartData: ChartData[] = [
  { name: 'Gasas', quantity: 20 },
  { name: 'Jeringas 5ml', quantity: 25 },
  { name: 'Vendas', quantity: 30 },
  { name: 'Alcohol Pad', quantity: 45 },
  { name: 'Mascarillas', quantity: 120 },
];

export default function AdminDashboardPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [kpis, setKpis] = useState<Kpi[]>([]);
  const [requests, setRequests] = useState<RequestSummary[]>([]);
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [chartData, setChartData] = useState<ChartData[]>([]);

  // --- Simulación de Carga de Datos (Data Fetching) ---
  useEffect(() => {
    // Simula una llamada API
    const fetchData = () => {
      setTimeout(() => {
        setKpis(mockKpis);
        setRequests(mockRequests);
        setActivities(mockActivities);
        setChartData(mockChartData);
        setIsLoading(false);
      }, 1200); // Simula 1.2 segundos de carga
    };

    fetchData();
  }, []);

  // --- Handlers (Manejadores de eventos) ---
  // Estos se pasarían a los componentes hijos

  const handleApprove = (request: RequestSummary) => {
    console.log('Aprobando:', request.id);
      // Lógica para llamar a la API (PUT /api/requests/:id/approve)
    setRequests(prev =>
      prev.map(r =>
        r.id === request.id ? { ...r, status: 'ready' } : r
      )
    );
    // También deberías filtrar esta petición de las "pendientes" y moverla
  };

  const handleReject = (request: RequestSummary) => {
    console.log('Rechazando:', request.id);
    // Lógica para llamar a la API (PUT /api/requests/:id/reject)
    // Al recibir OK de la API, actualiza el estado:
    setRequests(prev => prev.filter(r => r.id !== request.id));
  };

  const handleViewDetails = (request: RequestSummary) => {
    console.log('Viendo detalles:', request.id);
    // Aquí podrías abrir un Modal con los detalles completos
    alert(`Viendo detalles de la petición de ${request.requesterName} para ${request.patientName}`);
  };

  // --- Renderizado del Spinner de Carga ---
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-80px)]">
        <Spinner label="Cargando Dashboard..." size="lg" />
      </div>
    );
  }

  // --- Renderizado del Dashboard ---
  return (
    <div className="p-6 md:p-8 space-y-6">
      
      
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard de Inventario</h1>
        <p className="text-gray-600 mt-1">Resumen de la actividad y estado del sistema.</p>
      </div>

      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-5">
        {kpis.map((kpi) => (
          <StatCard
            key={kpi.title}
            title={kpi.title}
            value={kpi.value}
            icon={kpi.icon}
            color={kpi.color as any}
            description={kpi.description}
          />
        ))}
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* --- Columna Principal (2/3) --- */}
        <div className="lg:col-span-2 space-y-6">
          
          
          <Card>
            <Card.Header>
              <h3 className="text-xl font-semibold text-white">
                Peticiones Pendientes
              </h3>
            </Card.Header>
            <Card.Body className="p-0">
              <RequestList
                requests={requests}
                isLoading={false} // La carga principal ya pasó
                onApprove={handleApprove}
                onReject={handleReject}
                onViewDetails={handleViewDetails}
              />
            </Card.Body>
          </Card>

          {/* Gráfico de Inventario (InventorySummaryChart) */}
          <InventorySummaryChart
            data={chartData}
            title="Insumos con Stock Bajo (Top 5)"
          />

        </div>


        <div className="lg:col-span-1 space-y-6">
          
          <RecentActivityFeed activities={activities} />

        </div>
        <div className="lg:col-span-1 space-y-6">
          <UserManagement />
        </div>
        <div className="lg:col-span-1 space-y-6">
          <PatientManagement />
        </div>

      </div>
    </div>
  );
}
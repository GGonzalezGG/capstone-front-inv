"use client"; // Este componente incluye interactividad (botones)

import React from 'react';
import Table, { ColumnDef } from '../ui/Table'; // Importa la tabla genérica
import Badge from '../ui/Badge';
import Button from '../ui/Button';
import Spinner from '../ui/Spinner';

// 1. Define el tipo de dato para una petición (resumen)
export type RequestStatus = 'pending' | 'approved' | 'rejected';

export interface RequestSummary {
  id: string;
  patientName: string;
  requesterName: string; // Nombre de la enfermera
  status: RequestStatus;
  createdAt: string; // Fecha de creación (ISO string)
  itemCount: number; // Cuántos items distintos tiene la petición
}

// 2. Define las props del componente
interface RequestListProps {
  requests: RequestSummary[];
  isLoading: boolean;
  onViewDetails: (request: RequestSummary) => void; // Función para abrir el modal de detalles
}

// 3. Configuración de los Badges de estado
const statusConfig: Record<RequestStatus, { variant: 'warning' | 'success' | 'danger', text: string }> = {
  'pending': { variant: 'warning', text: 'Pendiente' },
  'approved': { variant: 'success', text: 'Aprobado' },
  'rejected': { variant: 'danger', text: 'Rechazado' },
};

/**
 * Un componente "feature" que implementa la tabla genérica
 * para mostrar una lista de peticiones de insumos.
 */
const RequestList: React.FC<RequestListProps> = ({ 
  requests, 
  isLoading, 
  onViewDetails 
}) => {
  
  // 4. Define las columnas para la tabla de peticiones
  const columns: ColumnDef<RequestSummary>[] = [
    {
      header: 'Paciente',
      accessor: 'patientName',
      render: (item) => (
        <span className="font-medium text-gray-900">{item.patientName}</span>
      )
    },
    {
      header: 'Solicitante',
      accessor: 'requesterName',
    },
    {
      header: 'N° de Ítems',
      accessor: 'itemCount',
      render: (item) => (
        <span>{item.itemCount} {item.itemCount === 1 ? 'ítem' : 'ítems'}</span>
      )
    },
    {
      header: 'Fecha',
      accessor: 'createdAt',
      render: (item) => (
        new Date(item.createdAt).toLocaleDateString('es-CL')
      )
    },
    {
      header: 'Estado',
      accessor: 'status',
      render: (item) => {
        const config = statusConfig[item.status] || statusConfig.pending;
        return (
          <Badge variant={config.variant}>{config.text}</Badge>
        );
      }
    },
    {
      header: 'Acciones',
      accessor: 'id',
      render: (item) => (
        <div className="flex space-x-2">
          <Button 
            variant="secondary"
            onClick={() => onViewDetails(item)}
            className="py-1 px-3 text-sm"
          >
            Ver Detalles
          </Button>
        </div>
      )
    },
  ];

  // 5. Renderiza el Spinner o la Tabla
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner label="Cargando peticiones..." />
      </div>
    );
  }

  return (
    <Table
      columns={columns}
      data={requests}
      emptyStateMessage="No se encontraron peticiones."
    />
  );
};

export default RequestList;



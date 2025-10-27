"use client";

import React, { useState, useMemo } from 'react';
import Table, { ColumnDef } from '../ui/Table';
import Badge from '../ui/Badge';
import Button from '../ui/Button';
import Spinner from '../ui/Spinner';
import Card from '../ui/Card';
import Input from '../ui/Input';
import SearchBar from '../ui/SearchBar';

// Types
type RequestStatus = 'pending' | 'ready' | 'rejected' | 'completed';

export interface RequestHistoryItem {
  id: string;
  patientName: string;
  requesterName: string;
  status: RequestStatus;
  createdAt: string;
  completedAt?: string;
  items: { id: string; name: string; quantity: number }[];
}

// Props
interface WithdrawalHistoryProps {
  requests: RequestHistoryItem[];
  isLoading: boolean;
  onViewDetails: (request: RequestHistoryItem) => void;
}

// Status configuration
const statusConfig: Record<RequestStatus, { variant: 'warning' | 'success' | 'danger' | 'info', text: string }> = {
  'pending': { variant: 'warning', text: 'Pendiente' },
  'ready': { variant: 'info', text: 'Listo' },
  'completed': { variant: 'success', text: 'Completado' },
  'rejected': { variant: 'danger', text: 'Rechazado' },
};

// Filter chip component
const FilterChip = ({ label, onRemove }: { label: string; onRemove: () => void }) => (
  <div className="inline-flex items-center gap-1 bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
    <span>{label}</span>
    <button
      onClick={onRemove}
      className="hover:bg-blue-200 rounded-full p-0.5 transition-colors"
      aria-label="Remover filtro"
    >
      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
      </svg>
    </button>
  </div>
);

/**
 * Enhanced Withdrawal History component with improved filters and mobile responsiveness
 */
const WithdrawalHistory: React.FC<WithdrawalHistoryProps> = ({ 
  requests, 
  isLoading, 
  onViewDetails 
}) => {
  
  // Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  // Calculate statistics
  const stats = useMemo(() => {
    const total = requests.length;
    const completed = requests.filter(r => r.status === 'completed').length;
    const pending = requests.filter(r => r.status === 'pending').length;
    const ready = requests.filter(r => r.status === 'ready').length;
    const rejected = requests.filter(r => r.status === 'rejected').length;
    
    return { total, completed, pending, ready, rejected };
  }, [requests]);

  // Filter logic
  const filteredRequests = useMemo(() => {
    let items = requests;

    // Search filter
    if (searchTerm) {
      const lowerSearch = searchTerm.toLowerCase();
      items = items.filter(req => 
        req.patientName.toLowerCase().includes(lowerSearch) ||
        req.requesterName.toLowerCase().includes(lowerSearch)
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      items = items.filter(req => req.status === statusFilter);
    }

    // Date range filter
    const start = startDate ? Date.parse(startDate) : 0;
    const end = endDate ? Date.parse(endDate) + 86400000 : Infinity;

    if (start || end !== Infinity) {
      items = items.filter(req => {
        const itemDate = Date.parse(req.completedAt || req.createdAt);
        return itemDate >= start && itemDate <= end;
      });
    }

    return items;
  }, [requests, searchTerm, statusFilter, startDate, endDate]);

  // Active filters
  const activeFilters = useMemo(() => {
    const filters = [];
    if (searchTerm) filters.push({ key: 'search', label: `Búsqueda: "${searchTerm}"`, clear: () => setSearchTerm('') });
    if (statusFilter !== 'all') filters.push({ key: 'status', label: `Estado: ${statusConfig[statusFilter as RequestStatus]?.text || statusFilter}`, clear: () => setStatusFilter('all') });
    if (startDate) filters.push({ key: 'startDate', label: `Desde: ${new Date(startDate).toLocaleDateString('es-CL')}`, clear: () => setStartDate('') });
    if (endDate) filters.push({ key: 'endDate', label: `Hasta: ${new Date(endDate).toLocaleDateString('es-CL')}`, clear: () => setEndDate('') });
    return filters;
  }, [searchTerm, statusFilter, startDate, endDate]);

  const clearAllFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setStartDate('');
    setEndDate('');
  };

  // Table columns
  const columns: ColumnDef<RequestHistoryItem>[] = [
    {
      header: 'Fecha Retiro',
      accessor: 'completedAt',
      render: (item) => (
        <div className="flex flex-col">
          {item.completedAt ? (
            <>
              <span className="font-medium text-gray-900">
                {new Date(item.completedAt).toLocaleDateString('es-CL')}
              </span>
              <span className="text-xs text-gray-500">
                {new Date(item.completedAt).toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' })}
              </span>
            </>
          ) : (
            <span className="text-gray-400 text-sm">Pendiente</span>
          )}
        </div>
      )
    },
    {
      header: 'Paciente',
      accessor: 'patientName',
      render: (item) => (
        <div className="font-medium text-gray-900">{item.patientName}</div>
      )
    },
    {
      header: 'Enfermera',
      accessor: 'requesterName',
      render: (item) => (
        <div className="text-gray-700">{item.requesterName}</div>
      )
    },
    {
      header: 'Estado',
      accessor: 'status',
      render: (item) => {
        const config = statusConfig[item.status] || statusConfig.pending;
        return <Badge variant={config.variant}>{config.text}</Badge>;
      }
    },
    {
      header: 'Insumos',
      accessor: 'items',
      render: (item) => (
        <div className="flex flex-col">
          <span className="text-sm text-gray-700">
            {item.items.slice(0, 2).map(i => i.name).join(', ')}
          </span>
          {item.items.length > 2 && (
            <span className="text-xs text-gray-500 mt-0.5">
              +{item.items.length - 2} más
            </span>
          )}
        </div>
      )
    },
    {
      header: 'Acciones',
      accessor: 'id',
      render: (item) => (
        <Button 
          variant="secondary"
          onClick={() => onViewDetails(item)}
          className="py-1 px-3 text-sm whitespace-nowrap"
        >
          Ver Detalles
        </Button>
      )
    },
  ];

  return (
    <div className="space-y-4">
      {/* Statistics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
          <p className="text-xs text-gray-500 mb-1">Total</p>
          <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
        </div>
        <div className="bg-green-50 rounded-lg p-4 shadow-sm border border-green-200">
          <p className="text-xs text-green-700 mb-1">Completadas</p>
          <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
        </div>
        <div className="bg-yellow-50 rounded-lg p-4 shadow-sm border border-yellow-200">
          <p className="text-xs text-yellow-700 mb-1">Pendientes</p>
          <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
        </div>
        <div className="bg-blue-50 rounded-lg p-4 shadow-sm border border-blue-200">
          <p className="text-xs text-blue-700 mb-1">Listas</p>
          <p className="text-2xl font-bold text-blue-600">{stats.ready}</p>
        </div>
        <div className="bg-red-50 rounded-lg p-4 shadow-sm border border-red-200">
          <p className="text-xs text-red-700 mb-1">Rechazadas</p>
          <p className="text-2xl font-bold text-red-600">{stats.rejected}</p>
        </div>
      </div>

      {/* Main Card */}
      <Card>
        <Card.Header>
          <div className="space-y-4">
            {/* Header with toggle */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <h2 className="text-xl font-semibold">Historial de Retiros</h2>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 text-sm text-zinc-100 hover:text-amber-300 font-medium"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                </svg>
                {showFilters ? 'Ocultar Filtros' : 'Mostrar Filtros'}
              </button>
            </div>

            {/* Filters */}
            {showFilters && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t">
                <div className="sm:col-span-2 lg:col-span-1">
                  <SearchBar
                    placeholder="Buscar paciente o enfermera..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <div>
                  <label htmlFor="statusFilter" className="block text-sm font-medium mb-1">
                    Estado
                  </label>
                  <select
                    id="statusFilter"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="block w-full bg-white text-zinc-900 pl-3 pr-10 py-2 text-base border-gray-50 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md shadow-sm"
                  >
                    <option value="all">Todos</option>
                    <option value="pending">Pendiente</option>
                    <option value="ready">Listo</option>
                    <option value="completed">Completado</option>
                    <option value="rejected">Rechazado</option>
                  </select>
                </div>
                <Input
                  label="Fecha Inicio"
                  id="startDate"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
                <Input
                  label="Fecha Fin"
                  id="endDate"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
            )}

            {/* Active Filters */}
            {activeFilters.length > 0 && (
              <div className="flex flex-wrap items-center gap-2 pt-3 border-t">
                <span className="text-sm  font-medium">Filtros activos:</span>
                {activeFilters.map(filter => (
                  <FilterChip key={filter.key} label={filter.label} onRemove={filter.clear} />
                ))}
                <button
                  onClick={clearAllFilters}
                  className="text-sm  hover:text-gray-900 underline ml-2"
                >
                  Limpiar todos
                </button>
              </div>
            )}

            {/* Results count */}
            <div className="text-sm text-zinc-100">
              Mostrando <span className="font-semibold">{filteredRequests.length}</span> de{' '}
              <span className="font-semibold">{requests.length}</span> registros
            </div>
          </div>
        </Card.Header>

        <Card.Body>
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <Spinner label="Cargando historial..." />
            </div>
          ) : filteredRequests.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-16 h-16 mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <p className=" font-medium mb-1">No se encontraron registros</p>
              <p className="text-gray-500 text-sm">
                {activeFilters.length > 0 
                  ? 'Intenta ajustar los filtros de búsqueda'
                  : 'No hay registros disponibles'
                }
              </p>
              {activeFilters.length > 0 && (
                <button
                  onClick={clearAllFilters}
                  className="mt-4 text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                  Limpiar filtros
                </button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table
                columns={columns}
                data={filteredRequests}
                emptyStateMessage="No se encontraron registros."
              />
            </div>
          )}
        </Card.Body>
      </Card>
    </div>
  );
};

export default WithdrawalHistory;
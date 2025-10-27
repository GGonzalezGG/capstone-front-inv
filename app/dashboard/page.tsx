"use client";
import React, { useState, useMemo } from 'react';
import InventoryTable, { InventoryItem } from '../components/features/InventoryTable';
import InventorySummaryChart from '../components/features/InventorySummaryChart';
import RecentActivityFeed, { ActivityItem } from '../components/features/RecentActivityFeed';
import StatCard from '../components/ui/StatCard';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import Card from '../components/ui/Card';
import InventoryForm from '../components/features/InventoryForm';
import SearchBar from '../components/ui/SearchBar';
import Header from '../components/ui/Header';

// Datos simulados para inventario
const mockInventoryData: InventoryItem[] = [
  { id: '1', name: 'Jeringas 5ml', category: 'Insumos Médicos', quantity: 150, status: 'available', expiryDate: '2025-12-31' },
  { id: '2', name: 'Guantes de Nitrilo (M)', category: 'Protección', quantity: 45, status: 'low_stock', expiryDate: '2024-11-30' },
  { id: '3', name: 'Gasas Estériles', category: 'Curación', quantity: 300, status: 'available' },
  { id: '4', name: 'Alcohol Pad', category: 'Desinfección', quantity: 0, status: 'expired', expiryDate: '2023-01-01' },
  { id: '5', name: 'Mascarillas KN95', category: 'Protección', quantity: 200, status: 'available', expiryDate: '2026-05-20' },
];

// Datos simulados para el gráfico
const mockChartData = [
  { name: 'Jeringas', quantity: 150 },
  { name: 'Gasas', quantity: 300 },
  { name: 'Guantes', quantity: 450 },
  { name: 'Mascarillas', quantity: 200 },
  { name: 'Alcohol', quantity: 80 },
];

// Datos simulados para actividad
const mockActivityData: ActivityItem[] = [
  { id: '1', type: 'request', description: 'Enfermera Clara solicitó 50 Jeringas.', timestamp: 'hace 2 min' },
  { id: '2', type: 'alert', description: 'Stock bajo para "Guantes (M)". Quedan 10 uds.', timestamp: 'hace 15 min' },
  { id: '3', type: 'add', description: 'Secretaría agregó 200 "Mascarillas" al stock.', timestamp: 'hace 1h' },
  { id: '4', type: 'system', description: 'Reporte de inventario mensual generado.', timestamp: 'hace 3h' },
  { id: '5', type: 'request', description: 'Enfermero Juan solicitó 10 Vendas.', timestamp: 'hace 5h' },
];

// Iconos
const BoxIcon = () => (
  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.27 6.96L12 12.01l8.73-5.05M12 22.08V12" />
  </svg>
);

const AlertIcon = () => (
  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
  </svg>
);

const CheckIcon = () => (
  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
  </svg>
);

const DashboardInventoryPage = () => {
  // Tab state
  const [activeTab, setActiveTab] = useState<'dashboard' | 'inventory'>('dashboard');
  
  // Inventory state
  const [isLoading, setIsLoading] = useState(false);
  const [items, setItems] = useState(mockInventoryData);
  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
  const [isEditModalOpen, setEditModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Filtrar items
  const filteredItems = useMemo(() => {
    if (!searchTerm) return items;
    return items.filter(item =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.category.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [items, searchTerm]);

  // Handlers
  const handleEdit = (item: InventoryItem) => {
    setSelectedItem(item);
    setEditModalOpen(true);
  };

  const handleDelete = (item: InventoryItem) => {
    setSelectedItem(item);
    setDeleteModalOpen(true);
  };

  const handleCreateNew = () => {
    setSelectedItem(null);
    setEditModalOpen(true);
  };

  const closeDeleteModal = () => {
    setSelectedItem(null);
    setDeleteModalOpen(false);
  };

  const confirmDelete = () => {
    if (selectedItem) {
      setItems(prev => prev.filter(i => i.id !== selectedItem.id));
      closeDeleteModal();
    }
  };

  const closeEditModal = () => {
    setSelectedItem(null);
    setEditModalOpen(false);
  };

  const handleSubmitForm = (data: Omit<InventoryItem, 'id'>) => {
    setIsSubmitting(true);
    setTimeout(() => {
      if (selectedItem) {
        const updatedItem = { ...selectedItem, ...data };
        setItems(prev => prev.map(i => i.id === selectedItem.id ? updatedItem : i));
      } else {
        const newItem: InventoryItem = { ...data, id: crypto.randomUUID() };
        setItems(prev => [newItem, ...prev]);
      }
      setIsSubmitting(false);
      closeEditModal();
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header with Tabs */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Sistema de Inventario</h1>
          
          {/* Tabs Navigation */}
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`
                  py-4 px-1 border-b-2 font-medium text-sm transition-colors
                  ${activeTab === 'dashboard'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }
                `}
              >
                Dashboard
              </button>
              <button
                onClick={() => setActiveTab('inventory')}
                className={`
                  py-4 px-1 border-b-2 font-medium text-sm transition-colors
                  ${activeTab === 'inventory'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }
                `}
              >
                Gestión de Inventario
              </button>
            </nav>
          </div>
        </div>

        {/* Dashboard View */}
        {activeTab === 'dashboard' && (
          <div className="space-y-8">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <StatCard title="Stock Bajo" value="12" icon={<AlertIcon />} color="yellow" />
              <StatCard title="Total de Insumos" value="1204" icon={<BoxIcon />} color="blue" />
              <StatCard title="Peticiones de Hoy" value="8" icon={<CheckIcon />} color="lime" />
            </div>

            {/* Charts and Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <InventorySummaryChart data={mockChartData} title="Insumos Principales" />
              </div>
              <div className="lg:col-span-1">
                <RecentActivityFeed activities={mockActivityData} />
              </div>
            </div>
          </div>
        )}

        {/* Inventory View */}
        {activeTab === 'inventory' && (
          <div>
            {/* Action Bar */}
            <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <Button onClick={handleCreateNew} className="sm:w-auto w-full">
                + Añadir Insumo
              </Button>
            </div>

            {/* Inventory Table Card */}
            <Card>
              <Card.Header>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <h2 className="text-xl font-semibold">
                    Insumos en Bodega
                  </h2>
                  <div className="w-full sm:w-80">
                    <SearchBar
                      placeholder=""
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>
              </Card.Header>
              <Card.Body>
                {filteredItems.length === 0 && searchTerm ? (
                  <div className="text-center py-12">
                    <p className="text-gray-500">
                      No se encontraron insumos que coincidan con "{searchTerm}"
                    </p>
                  </div>
                ) : (
                  <InventoryTable
                    items={filteredItems}
                    isLoading={isLoading}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                  />
                )}
              </Card.Body>
            </Card>
          </div>
        )}
      </div>

      {/* Delete Modal */}
      <Modal isOpen={isDeleteModalOpen} onClose={closeDeleteModal}>
        <Modal.Header onClose={closeDeleteModal}>
          Confirmar Eliminación
        </Modal.Header>
        <Modal.Body>
          <p className="text-gray-700">
            ¿Estás seguro de que deseas eliminar el insumo{' '}
            <span className="font-semibold">{selectedItem?.name}</span>?
          </p>
          <p className="text-sm text-gray-600 mt-2">
            Esta acción no se puede deshacer.
          </p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={closeDeleteModal}>
            Cancelar
          </Button>
          <Button variant="danger" onClick={confirmDelete}>
            Eliminar
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Edit/Create Modal */}
      <Modal isOpen={isEditModalOpen} onClose={closeEditModal}>
        <Modal.Header onClose={closeEditModal}>
          {selectedItem?.id ? 'Editar Insumo' : 'Crear Nuevo Insumo'}
        </Modal.Header>
        <Modal.Body>
          <InventoryForm
            itemToEdit={selectedItem}
            onSubmit={handleSubmitForm}
            onCancel={closeEditModal}
            isSubmitting={isSubmitting}
          />
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default DashboardInventoryPage;
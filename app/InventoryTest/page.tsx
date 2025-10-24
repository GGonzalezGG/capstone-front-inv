"use client";
import React, { useState, useMemo } from 'react'; // 1. Importar useMemo
import InventoryTable, { InventoryItem } from '../components/features/InventoryTable';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import Card from '../components/ui/Card';
import InventoryForm from '../components/features/InventoryForm';
import SearchBar from '../components/ui/SearchBar'; // 2. Importar SearchBar

// Datos simulados
const mockInventoryData: InventoryItem[] = [
  { id: '1', name: 'Jeringas 5ml', category: 'Insumos Médicos', quantity: 150, status: 'available', expiryDate: '2025-12-31' },
  { id: '2', name: 'Guantes de Nitrilo (M)', category: 'Protección', quantity: 45, status: 'low_stock', expiryDate: '2024-11-30' },
  { id: '3', name: 'Gasas Estériles', category: 'Curación', quantity: 300, status: 'available' },
  { id: '4', name: 'Alcohol Pad', category: 'Desinfección', quantity: 0, status: 'expired', expiryDate: '2023-01-01' },
  { id: '5', name: 'Mascarillas KN95', category: 'Protección', quantity: 200, status: 'available', expiryDate: '2026-05-20' },
];

const InventoryPage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [items, setItems] = useState(mockInventoryData);
  
  // Estado para los modales
  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
  const [isEditModalOpen, setEditModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);

  // Estado para el envío del formulario
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 3. Añadir estado para la búsqueda
  const [searchTerm, setSearchTerm] = useState('');

  // 4. Filtrar los items (usando useMemo para eficiencia)
  const filteredItems = useMemo(() => {
    if (!searchTerm) {
      return items; // Retorna todos si no hay búsqueda
    }
    return items.filter(item =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.category.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [items, searchTerm]);


  // Handlers para las acciones de la tabla
  const handleEdit = (item: InventoryItem) => {
    setSelectedItem(item);
    setEditModalOpen(true);
  };

  const handleDelete = (item: InventoryItem) => {
    setSelectedItem(item);
    setDeleteModalOpen(true);
  };

  // Handler para el botón "Añadir Nuevo Insumo"
  const handleCreateNew = () => {
    setSelectedItem(null); // Pasa null para el modo "Crear"
    setEditModalOpen(true);
  };

  // Handlers para los modales
  const closeDeleteModal = () => {
    setSelectedItem(null);
    setDeleteModalOpen(false);
  };

  const confirmDelete = () => {
    if (selectedItem) {
      // Lógica de borrado (API call)
      console.log('Borrando item:', selectedItem.id);
      setItems(prev => prev.filter(i => i.id !== selectedItem.id));
      closeDeleteModal();
    }
  };
  
  const closeEditModal = () => {
    setSelectedItem(null);
    setEditModalOpen(false);
  };

  // Handler para el submit del formulario
  const handleSubmitForm = (data: Omit<InventoryItem, 'id'>) => {
    setIsSubmitting(true);
    console.log("Datos a guardar:", data);

    // Simular una llamada a API
    setTimeout(() => {
      if (selectedItem) {
        // Lógica de "Editar"
        console.log("Editando item:", selectedItem.id);
        const updatedItem = { ...selectedItem, ...data };
        setItems(prev => prev.map(i => i.id === selectedItem.id ? updatedItem : i));
      } else {
        // Lógica de "Crear"
        console.log("Creando nuevo item");
        const newItem: InventoryItem = { 
          ...data, 
          id: crypto.randomUUID() // Genera un ID temporal
        };
        setItems(prev => [newItem, ...prev]);
      }
      setIsSubmitting(false);
      closeEditModal();
    }, 1500);
  };


  return (
    <div className="p-8 bg-gray-100 min-h-screen">
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <h1 className="text-3xl font-bold text-gray-900">Gestión de Inventario</h1>
        <Button onClick={handleCreateNew}>
          Añadir Nuevo Insumo
        </Button>
      </div>

      <Card>
        {/* 5. Añadir el SearchBar en el Card.Header */}
        <Card.Header>
          <div className='flex'>
            <p className='text-3xl text-bold'>Insumos en bodega</p>
            <div className="w-full max-w-md ml-auto">
              <SearchBar
                placeholder=""
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </Card.Header>
        <Card.Body>
          <InventoryTable
            items={filteredItems} // 6. Pasar los items filtrados
            isLoading={isLoading}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </Card.Body>
      </Card>

      {/* --- Modal de Eliminación --- */}
      <Modal isOpen={isDeleteModalOpen} onClose={closeDeleteModal}>
        <Modal.Header onClose={closeDeleteModal}>
          Confirmar Eliminación
        </Modal.Header>
        <Modal.Body>
          <p>¿Estás seguro de que deseas eliminar el insumo <span className="font-semibold">{selectedItem?.name}</span>?</p>
          <p className="text-sm text-gray-600 mt-2">Esta acción no se puede deshacer.</p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={closeDeleteModal}>Cancelar</Button>
          <Button variant="danger" onClick={confirmDelete}>Eliminar</Button>
        </Modal.Footer>
      </Modal>

      {/* --- Modal de Edición/Creación --- */}
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

export default InventoryPage;


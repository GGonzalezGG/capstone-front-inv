"use client";
import React, { useState } from 'react';
import Header from '../components/ui/Header';
import WithdrawalHistory, { RequestHistoryItem } from '../components/features/WithdrawalHistory';
import Modal from '../components/ui/Modal';
import Button from '../components/ui/Button';
import Spinner from '../components/ui/Spinner';

// Datos simulados (deberían venir de una API)
const mockHistoryData: RequestHistoryItem[] = [
  { 
    id: 'req1', 
    patientName: 'Juan Pérez', 
    requesterName: 'Enf. Clara', 
    status: 'completed', 
    createdAt: '2023-10-23T10:30:00Z', 
    completedAt: '2023-10-24T09:00:00Z',
    items: [
      { id: 'item1', name: 'Jeringas 5ml', quantity: 50 },
      { id: 'item2', name: 'Gasas Estériles', quantity: 100 },
    ]
  },
  { 
    id: 'req2', 
    patientName: 'María González', 
    requesterName: 'Enf. Juan', 
    status: 'completed', 
    createdAt: '2023-10-22T14:00:00Z', 
    completedAt: '2023-10-22T18:00:00Z',
    items: [
      { id: 'item3', name: 'Guantes de Nitrilo (M)', quantity: 20 },
    ]
  },
  { 
    id: 'req3', 
    patientName: 'Carlos Sánchez', 
    requesterName: 'Enf. Clara', 
    status: 'rejected', 
    createdAt: '2023-10-21T09:15:00Z', 
    items: [
      { id: 'item1', name: 'Jeringas 5ml', quantity: 10 },
      { id: 'item4', name: 'Mascarillas KN95', quantity: 30 },
    ]
  },
  { 
    id: 'req4', 
    patientName: 'Ana López', 
    requesterName: 'Enf. Clara', 
    status: 'pending', 
    createdAt: '2023-10-24T12:00:00Z', 
    items: [
      { id: 'item2', name: 'Gasas Estériles', quantity: 30 },
    ]
  },
  { 
    id: 'req5', 
    patientName: 'Luis Martínez', 
    requesterName: 'Enf. Pedro', 
    status: 'ready', 
    createdAt: '2023-10-24T14:00:00Z', 
    items: [
      { id: 'item1', name: 'Jeringas 5ml', quantity: 20 },
      { id: 'item3', name: 'Guantes de Nitrilo (M)', quantity: 100 },
      { id: 'item4', name: 'Mascarillas KN95', quantity: 50 },
    ]
  },
];

const HistoryPage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [historyItems, setHistoryItems] = useState(mockHistoryData);
  
  const [isDetailsModalOpen, setDetailsModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<RequestHistoryItem | null>(null);

  // Handlers para las acciones
  const handleViewDetails = (item: RequestHistoryItem) => {
    setSelectedItem(item);
    setDetailsModalOpen(true);
    // Aquí podrías hacer fetch de detalles más completos si fuera necesario
  };

  const closeDetailsModal = () => {
    setDetailsModalOpen(false);
    setSelectedItem(null);
  };

  return (
    <div className="bg-gray-100 min-h-screen">
      <Header />
      
      <main className="pt-16">
        <div className="p-4 md:p-8 max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-900">Historial de Retiros</h1>
          </div>

          <WithdrawalHistory
            requests={historyItems}
            isLoading={isLoading}
            onViewDetails={handleViewDetails}
          />
        </div>
      </main>

      {/* --- Modal de Detalles --- */}
      <Modal isOpen={isDetailsModalOpen} onClose={closeDetailsModal}>
        <Modal.Header onClose={closeDetailsModal}>
          Detalles del Retiro
        </Modal.Header>
        <Modal.Body>
          {selectedItem ? (
            <div className="space-y-4">
              <p><strong>ID Petición:</strong> {selectedItem.id}</p>
              <p><strong>Paciente:</strong> {selectedItem.patientName}</p>
              <p><strong>Solicitante:</strong> {selectedItem.requesterName}</p>
              <p><strong>Fecha Solicitud:</strong> {new Date(selectedItem.createdAt).toLocaleString('es-CL')}</p>
              <p><strong>Fecha Retiro:</strong> {selectedItem.completedAt ? new Date(selectedItem.completedAt).toLocaleString('es-CL') : 'N/A'}</p>
              
              <hr className="my-4" />
              <h4 className="font-semibold">Insumos Solicitados:</h4>
              <ul className="list-disc list-inside space-y-1 text-gray-700">
                {selectedItem.items.map(item => (
                  <li key={item.id}>
                    <span className="font-medium">{item.quantity}x</span> {item.name}
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <Spinner label="Cargando detalles..." />
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={closeDetailsModal}>
            Cerrar
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default HistoryPage;
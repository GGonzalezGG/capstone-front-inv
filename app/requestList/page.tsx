"use client";
import React, { useState, useMemo } from 'react';
// import Link from 'next/link'; // Eliminado para usar <a> como en el Header
import Header from '../components/ui/Header'; // 1. Importar Header
import RequestList, { RequestSummary, RequestStatus } from '../components/features/RequestList';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import Spinner from '../components/ui/Spinner';
import Card from '../components/ui/Card'; // 2. Importar Card para el resumen

// Datos simulados de peticiones (con lista de items)
const mockRequestData: RequestSummary[] = [
  { 
    id: 'req1', 
    patientName: 'Juan Pérez', 
    requesterName: 'Enf. Clara', 
    status: 'pending', 
    createdAt: '2023-10-23T10:30:00Z', 
    items: [
      { id: 'item1', name: 'Jeringas 5ml', quantity: 50 },
      { id: 'item2', name: 'Gasas Estériles', quantity: 100 },
    ]
  },
  { 
    id: 'req2', 
    patientName: 'María González', 
    requesterName: 'Enf. Juan', 
    status: 'ready', // 'ready' en lugar de 'approved' para coincidir
    createdAt: '2023-10-22T14:00:00Z', 
    items: [
      { id: 'item3', name: 'Guantes de Nitrilo (M)', quantity: 20 },
      { id: 'item2', name: 'Gasas Estériles', quantity: 50 }, // Añadido para el ejemplo de suma
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
];

// Re-definir statusConfig aquí
const statusConfigPage: Record<RequestStatus, { text: string }> = {
  'pending': { text: 'Pendiente' },
  'ready': { text: 'Listo' }, // Coincide con el mock
  'rejected': { text: 'Rechazado' },
};

// 3. NUEVO COMPONENTE: Resumen de Insumos
interface SummaryItem {
  name: string;
  quantity: number;
}

const PendingItemsSummary = ({ items }: { items: SummaryItem[] }) => {
  if (items.length === 0) {
    return (
      <Card>
        <Card.Header>Resumen de Insumos Activos</Card.Header>
        <Card.Body>
          <p className="text-gray-500">No hay insumos pendientes de aprobación o retiro.</p>
        </Card.Body>
      </Card>
    );
  }

  return (
    <Card>
      <Card.Header>Resumen de Insumos Activos</Card.Header>
      <Card.Body>
        <p className="text-sm text-gray-600 mb-4">Total de insumos de peticiones "Pendientes" y "Listas para retirar".</p>
        <ul className="divide-y divide-gray-200">
          {items.map(item => (
            <li key={item.name} className="flex justify-between items-center py-3">
              <span className="font-medium text-gray-800">{item.name}</span>
              <span className="font-bold text-lg text-blue-700">{item.quantity}</span>
            </li>
          ))}
        </ul>
      </Card.Body>
    </Card>
  );
};


const RequestsPage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [requests, setRequests] = useState(mockRequestData);
  
  const [isDetailsModalOpen, setDetailsModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<RequestSummary | null>(null);

  // 4. NUEVA LÓGICA: Calcular el resumen de insumos
  const activeItemsSummary = useMemo(() => {
    const summary = new Map<string, number>();
    
    requests
      .filter(req => req.status === 'pending' || req.status === 'ready') // Solo activas
      .forEach(req => {
        req.items.forEach(item => {
          const currentQuantity = summary.get(item.name) || 0;
          summary.set(item.name, currentQuantity + item.quantity);
        });
      });

    // Convertir mapa a array ordenado para renderizar
    return Array.from(summary.entries())
      .map(([name, quantity]) => ({ name, quantity }))
      .sort((a, b) => b.quantity - a.quantity); // Opcional: ordenar por cantidad

  }, [requests]); // Se recalcula si 'requests' cambia

  // Handlers para las acciones
  const handleViewDetails = (request: RequestSummary) => {
    setSelectedRequest(request);
    setDetailsModalOpen(true);
  };

  const handleApprove = (request: RequestSummary) => {
    console.log("Aprobando:", request.id);
    setRequests(prev => 
      prev.map(r => r.id === request.id ? { ...r, status: 'ready' } : r)
    );
  };

  const handleReject = (request: RequestSummary) => {
    console.log("Rechazando:", request.id);
    setRequests(prev => 
      prev.map(r => r.id === request.id ? { ...r, status: 'rejected' } : r)
    );
  };

  const closeDetailsModal = () => {
    setDetailsModalOpen(false);
    setSelectedRequest(null);
  };

  return (
    <div className="bg-gray-100 min-h-screen">
      {/* 5. HEADER AÑADIDO */}
      <Header />
      
      {/* Contenido principal con padding-top para el header fijo */}
      <main className="pt-16">
        <div className="p-4 md:p-8 max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-900">Peticiones de Insumos</h1>
            {/* 6. Botón cambiado a <a> para coincidir con Header.tsx */}
            <a href="/dashboard/requests/new">
              <Button>
                Crear Nueva Petición
              </Button>
            </a>
          </div>

          {/* 7. NUEVO LAYOUT: Grid de 2 columnas */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Columna de Peticiones (ocupa 2/3) */}
            <div className="lg:col-span-2 space-y-6">
              <RequestList
                requests={requests}
                isLoading={isLoading}
                onViewDetails={handleViewDetails}
                onApprove={handleApprove}
                onReject={handleReject}
              />
            </div>
            
            {/* Columna de Resumen (ocupa 1/3) */}
            <div className="lg:col-span-1 space-y-6">
              <PendingItemsSummary items={activeItemsSummary} />
            </div>
          </div>


          {/* --- Modal de Detalles --- */}
          <Modal isOpen={isDetailsModalOpen} onClose={closeDetailsModal}>
            <Modal.Header onClose={closeDetailsModal}>
              Detalles de la Petición
            </Modal.Header>
            <Modal.Body>
              {selectedRequest ? (
                <div className="space-y-4">
                  <p><strong>Paciente:</strong> {selectedRequest.patientName}</p>
                  <p><strong>Solicitante:</strong> {selectedRequest.requesterName}</p>
                  <p><strong>Fecha:</strong> {new Date(selectedRequest.createdAt).toLocaleString('es-CL')}</p>
                  <p><strong>Estado:</strong> <span className="font-semibold">{statusConfigPage[selectedRequest.status].text}</span></p>
                  <hr className="my-4" />
                  <h4 className="font-semibold">Insumos Solicitados:</h4>
                  <ul className="list-disc list-inside space-y-1 text-gray-700">
                    {selectedRequest.items.map(item => (
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
      </main>
    </div>
  );
};

export default RequestsPage;
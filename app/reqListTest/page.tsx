"use client";
  import React, { useState } from 'react';
  import Link from 'next/link';
  import RequestList, { RequestSummary, RequestStatus, RequestItemDetail } from '../components/features/RequestList';
  import Button from '../components/ui/Button';
  import Modal from '../components/ui/Modal';
  import Spinner from '../components/ui/Spinner';
  
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
      status: 'ready', 
      createdAt: '2023-10-22T14:00:00Z', 
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
  ];

  // Re-definir statusConfig aquí
  const statusConfigPage: Record<RequestStatus, { text: string }> = {
    'pending': { text: 'Pendiente' },
    'ready': { text: 'Listo' },
    'rejected': { text: 'Rechazado' },
  };

  const RequestsPage = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [requests, setRequests] = useState(mockRequestData);
    
    const [isDetailsModalOpen, setDetailsModalOpen] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState<RequestSummary | null>(null);

    // Handlers para las acciones
    const handleViewDetails = (request: RequestSummary) => {
      setSelectedRequest(request);
      setDetailsModalOpen(true);
    };

    const handleApprove = (request: RequestSummary) => {
      // Lógica de API para aprobar
      console.log("Aprobando:", request.id);
      setRequests(prev => 
        prev.map(r => r.id === request.id ? { ...r, status: 'ready' } : r)
      );
    };

    const handleReject = (request: RequestSummary) => {
      // Lógica de API para rechazar
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
      <div className="p-8 bg-gray-100 min-h-screen">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Historial de Peticiones</h1>
          <Link href="/dashboard/requests/new">
            <Button>
              Crear Nueva Petición
            </Button>
          </Link>
        </div>

        // La lista de cards se renderiza directamente aquí
        <RequestList
          requests={requests}
          isLoading={isLoading}
          onViewDetails={handleViewDetails}
          onApprove={handleApprove}
          onReject={handleReject}
        />

        // --- Modal de Detalles ---
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
    );
  };

  export default RequestsPage;
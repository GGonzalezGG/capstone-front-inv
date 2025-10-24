"use client";
  import React, { useState } from 'react';
  import Link from 'next/link';
  import RequestList, { RequestSummary, RequestStatus } from '../components/features/RequestList';
  import Button from '../components/ui/Button';
  import Modal from '../components/ui/Modal';
  import Card from '../components/ui/Card';
  import Spinner from '../components/ui/Spinner'; // Importar Spinner para el modal
  
  // Datos simulados de peticiones
  const mockRequestData: RequestSummary[] = [
    { id: 'req1', patientName: 'Juan Pérez', requesterName: 'Enf. Clara', status: 'pending', createdAt: '2023-10-23T10:30:00Z', itemCount: 3 },
    { id: 'req2', patientName: 'María González', requesterName: 'Enf. Juan', status: 'approved', createdAt: '2023-10-22T14:00:00Z', itemCount: 2 },
    { id: 'req3', patientName: 'Carlos Sánchez', requesterName: 'Enf. Clara', status: 'rejected', createdAt: '2023-10-21T09:15:00Z', itemCount: 5 },
    { id: 'req4', patientName: 'Ana Torres', requesterName: 'Secretaría', status: 'pending', createdAt: '2023-10-23T11:00:00Z', itemCount: 1 },
  ];

  // Re-definir statusConfig aquí o importarlo si se exporta desde RequestList
  const statusConfigPage: Record<RequestStatus, { text: string }> = {
    'pending': { text: 'Pendiente' },
    'approved': { text: 'Aprobado' },
    'rejected': { text: 'Rechazado' },
  };

  const RequestsPage = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [requests, setRequests] = useState(mockRequestData);
    
    // Estado para el modal de detalles
    const [isDetailsModalOpen, setDetailsModalOpen] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState<RequestSummary | null>(null);

    // Handlers para las acciones
    const handleViewDetails = (request: RequestSummary) => {
      setSelectedRequest(request);
      setDetailsModalOpen(true);
      // En una app real, aquí harías fetch de los detalles completos de la petición
      // (la lista de insumos, cantidades, etc.)
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

        <Card>
          <Card.Body>
            <RequestList
              requests={requests}
              isLoading={isLoading}
              onViewDetails={handleViewDetails}
            />
          </Card.Body>
        </Card>

        {/* --- Modal de Detalles --- */}
        <Modal isOpen={isDetailsModalOpen} onClose={closeDetailsModal}>
          <Modal.Header onClose={closeDetailsModal}>
            Detalles de la Petición
          </Modal.Header>
          <Modal.Body>
            {selectedRequest ? (
              <div className="space-y-4">
                <p><strong>ID Petición:</strong> {selectedRequest.id}</p>
                <p><strong>Paciente:</strong> {selectedRequest.patientName}</p>
                <p><strong>Solicitante:</strong> {selectedRequest.requesterName}</p>
                <p><strong>Fecha:</strong> {new Date(selectedRequest.createdAt).toLocaleString('es-CL')}</p>
                <p><strong>Estado:</strong> <span className="font-semibold">{statusConfigPage[selectedRequest.status].text}</span></p>
                <p><strong>Ítems:</strong> {selectedRequest.itemCount}</p>
                <hr className="my-4" />
                <h4 className="font-semibold">Insumos Solicitados:</h4>
                
                {/* En una app real, aquí harías fetch de los items
                  y los listarías. Por ahora, es un placeholder.
                */}
                
                <p className="text-gray-600 text-sm">(Aquí iría la lista detallada de insumos...)</p>
              </div>
            ) : (
              <Spinner label="Cargando detalles..." />
            )}
          </Modal.Body>
          <Modal.Footer>
            
            {/* Si el usuario es admin/secretaria, aquí irían los botones
              de "Aprobar" y "Rechazar" si el estado es 'pending'.
            */}
            
            {selectedRequest?.status === 'pending' && (
              <>
                <Button variant="danger" onClick={() => console.log('Rechazar')}>Rechazar</Button>
                <Button variant="primary" onClick={() => console.log('Aprobar')}>Aprobar Petición</Button>
              </>
            )}
            <Button variant="secondary" onClick={closeDetailsModal}>
              Cerrar
            </Button>
          </Modal.Footer>
        </Modal>
      </div>
    );
  };

  export default RequestsPage;

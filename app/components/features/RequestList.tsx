"use client";

import React from 'react';
import { Package, Clock, CheckCircle, XCircle, User, Calendar, Stethoscope } from 'lucide-react';
import Card from '../ui/Card';
import Badge from '../ui/Badge';
import Button from '../ui/Button';
import Spinner from '../ui/Spinner';

// Types
export interface RequestItemDetail {
  id: string;
  name: string;
  quantity: number;
}

export type RequestStatus = 'pending' | 'ready' | 'rejected';

export interface RequestSummary {
  id: string;
  patientName: string;
  requesterName: string;
  status: RequestStatus;
  createdAt: string;
  items: RequestItemDetail[];
}

interface RequestListProps {
  requests: RequestSummary[];
  isLoading: boolean;
  onViewDetails: (request: RequestSummary) => void;
  onApprove: (request: RequestSummary) => void;
  onReject: (request: RequestSummary) => void;
}

// Status configuration
const statusConfig: Record<RequestStatus, { 
  variant: 'warning' | 'success' | 'danger';
  icon: React.ReactNode;
  text: string;
}> = {
  'pending': { 
    variant: 'warning',
    icon: <Clock className="w-3.5 h-3.5" />,
    text: 'Pendiente' 
  },
  'ready': { 
    variant: 'success',
    icon: <CheckCircle className="w-3.5 h-3.5" />,
    text: 'Listo' 
  },
  'rejected': { 
    variant: 'danger',
    icon: <XCircle className="w-3.5 h-3.5" />,
    text: 'Rechazado' 
  },
};

const RequestList: React.FC<RequestListProps> = ({ 
  requests, 
  isLoading, 
  onViewDetails,
  onApprove,
  onReject
}) => {
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner label="Cargando peticiones..." />
      </div>
    );
  }

  if (requests.length === 0) {
    return (
      <Card>
        <Card.Body>
          <div className="flex flex-col items-center justify-center text-center py-8 space-y-4">
            <div className="bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full p-6">
              <Package className="w-12 h-12 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-1">
                No hay peticiones activas
              </h3>
              <p className="text-gray-500 text-sm">
                Las nuevas solicitudes aparecerán aquí
              </p>
            </div>
          </div>
        </Card.Body>
      </Card>
    );
  }

  return (
    <div className="space-y-5">
      {requests.map((request) => {
        const config = statusConfig[request.status];
        const isPending = request.status === 'pending';
        
        return (
          <Card key={request.id}>
            {/* Header - Requester name on top with gradient background */}
            <Card.Header>
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start space-x-3 flex-1 min-w-0">
                  <div className="bg-white/20 backdrop-blur-sm rounded-lg p-2.5 mt-0.5">
                    <User className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    {/* Requester name on top */}
                    <h3 className="font-bold text-white text-lg mb-0.5 truncate">
                      {request.requesterName}
                    </h3>
                    {/* Patient name below with icon */}
                    <div className="flex items-center space-x-1.5 text-blue-100">
                      <Stethoscope className="w-3.5 h-3.5 flex-shrink-0" />
                      <p className="text-sm truncate">
                        <span className="font-medium">{request.patientName}</span>
                      </p>
                    </div>
                  </div>
                </div>
                
                {/* Status Badge */}
                <div className="flex items-center space-x-1.5 bg-white px-3 py-1.5 rounded-full shadow-sm">
                  <Badge variant={config.variant}>
                    <span className="flex items-center space-x-1">
                      {config.icon}
                      <span>{config.text}</span>
                    </span>
                  </Badge>
                </div>
              </div>
            </Card.Header>

            {/* Body - Items list */}
            <Card.Body>
              <div className="flex items-center space-x-2 mb-3">
                <div className="bg-gradient-to-br from-blue-500 to-indigo-500 rounded-lg p-1.5">
                  <Package className="w-4 h-4 text-white" />
                </div>
                <h4 className="font-bold text-gray-900 text-sm">
                  Insumos Solicitados ({request.items.length})
                </h4>
              </div>
              
              <div className="bg-gradient-to-br from-gray-50 to-blue-50/30 rounded-xl p-4 space-y-2.5 border border-gray-100">
                {request.items.map(item => (
                  <div 
                    key={item.id}
                    className="flex items-center justify-between bg-white rounded-lg px-4 py-3 shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
                  >
                    <span className="text-gray-800 font-medium text-sm flex-1">
                      {item.name}
                    </span>
                    <span className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-3 py-1.5 rounded-lg text-xs font-bold ml-3 shadow-sm">
                      {item.quantity}x
                    </span>
                  </div>
                ))}
              </div>

              {/* Date */}
              <div className="flex items-center space-x-2 mt-4 px-3 py-2 bg-gradient-to-r from-gray-100 to-blue-50 rounded-lg border border-gray-200">
                <div className="bg-blue-500 rounded-md p-1">
                  <Calendar className="w-3.5 h-3.5 text-white" />
                </div>
                <span className="text-xs font-medium text-gray-700">
                  {new Date(request.createdAt).toLocaleString('es-CL', {
                    day: '2-digit',
                    month: 'long',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
              </div>
            </Card.Body>
            
            {/* Footer - Full-width buttons */}
            <Card.Footer>
              {isPending ? (
                <div className="grid grid-cols-2 gap-3 w-full">
                  <Button
                    variant="danger"
                    onClick={() => onReject(request)}
                    className="w-full flex items-center justify-center space-x-2 px-4 py-3"
                  >
                    <XCircle className="w-4 h-4" />
                    <span className="font-semibold">Rechazar</span>
                  </Button>
                  
                  <Button
                    variant="primary"
                    onClick={() => onApprove(request)}
                    className="w-full flex items-center justify-center space-x-2 px-4 py-3"
                  >
                    <CheckCircle className="w-4 h-4" />
                    <span className="font-semibold">Marcar Listo</span>
                  </Button>
                </div>
              ) : (
                <Button
                  variant="secondary"
                  onClick={() => onViewDetails(request)}
                  className="w-full flex items-center justify-center space-x-2 px-4 py-3"
                >
                  <Package className="w-4 h-4" />
                  <span className="font-semibold">Ver Detalles</span>
                </Button>
              )}
            </Card.Footer>
          </Card>
        );
      })}
    </div>
  );
};

export default RequestList;
"use client";
import React, { useState, useMemo, useEffect } from "react";
import Header from "../components/ui/Header";
import RequestList, {
  RequestSummary,
  RequestStatus,
} from "../components/features/RequestList";
import Button from "../components/ui/Button";
import Modal from "../components/ui/Modal";
import Spinner from "../components/ui/Spinner";
import Card from "../components/ui/Card";
import { useAuth } from "../contexts/AuthContext";
import { useRouter } from "next/navigation";

// --- 1. DEFINICIONES DE TIPOS (MOVIDAS AL INICIO) ---

// Tipos de Backend (Datos que llegan de la API)
type BackendRequestStatus = "PENDING" | "APPROVED" | "REJECTED" | "COMPLETED";
interface BackendItemLine {
  id: string;
  quantity: number;
  item: { id: string; name: string };
}
interface BackendRequest {
  id: string;
  patient: { name: string };
  requester: { name: string };
  status: BackendRequestStatus;
  createdAt: string;
  completedAt?: string;
  requestLines: BackendItemLine[];
}

// Tipos de Frontend (Datos que usa el componente)
type MappedFrontendStatus = "pending" | "ready" | "rejected" | "completed";
interface MappedRequest {
  id: string;
  patientName: string;
  requesterName: string;
  status: MappedFrontendStatus;
  createdAt: string;
  items: { id: string; name: string; quantity: number }[];
}

// --- 2. mapBackendRequest (CORREGIDO) ---
// La entrada 'req' ya no es 'Partial'. Es un 'BackendRequest' completo.
// Esto elimina todos los errores de "Property does not exist".
const mapBackendRequest = (req: BackendRequest): MappedRequest => {
  let mappedStatus: MappedFrontendStatus = "pending";

  if (req.status === "APPROVED") {
    mappedStatus = "ready";
  } else if (req.status === "COMPLETED") {
    mappedStatus = "completed";
  } else if (req.status === "REJECTED") {
    mappedStatus = "rejected";
  } else {
    mappedStatus = "pending";
  }

  return {
    id: req.id,
    patientName: req.patient.name, // Corregido: Ya no es opcional
    requesterName: req.requester.name, // Corregido: Ya no es opcional
    status: mappedStatus,
    createdAt: req.createdAt, // Corregido: Ya no es opcional
    items: req.requestLines.map((line) => ({
      // Corregido: Ya no es opcional
      id: line.item.id,
      name: line.item.name,
      quantity: line.quantity,
    })),
  };
};

// (El resto de las funciones helper no cambian)
const mapBackendStatusToFrontend = (
  status: BackendRequestStatus
): MappedFrontendStatus => {
  switch (status) {
    case "APPROVED":
      return "ready";
    case "COMPLETED":
      return "completed";
    case "REJECTED":
      return "rejected";
    case "PENDING":
    default:
      return "pending";
  }
};

const statusConfigPage: Record<
  RequestStatus,
  { text: string; backendStatus: BackendRequestStatus }
> = {
  pending: { text: "Pendiente", backendStatus: "PENDING" },
  ready: { text: "Listo", backendStatus: "APPROVED" },
  rejected: { text: "Rechazado", backendStatus: "REJECTED" },
};

// (Componente PendingItemsSummary - sin cambios)
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
          <p className="text-gray-500">
            No hay insumos pendientes de aprobación o retiro.
          </p>
        </Card.Body>
      </Card>
    );
  }
  return (
    <Card>
      <Card.Header>Resumen de Insumos Activos</Card.Header>
      <Card.Body>
        <p className="text-sm text-gray-600 mb-4">
          Total de insumos de peticiones "Pendientes" y "Listas para retirar".
        </p>
        <ul className="divide-y divide-gray-200">
          {items.map((item) => (
            <li
              key={item.name}
              className="flex justify-between items-center py-3"
            >
              <span className="font-medium text-gray-800">{item.name}</span>
              <span className="font-bold text-lg text-blue-700">
                {item.quantity}
              </span>
            </li>
          ))}
        </ul>
      </Card.Body>
    </Card>
  );
};

const RequestsPage = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [requests, setRequests] = useState<RequestSummary[]>([]);
  const { token, user } = useAuth();
  const router = useRouter();

  const [isDetailsModalOpen, setDetailsModalOpen] = useState(false);
  const [isRejectModalOpen, setRejectModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<RequestSummary | null>(
    null
  );

  // (fetchRequests - sin cambios)
  const fetchRequests = async () => {
    if (!token || !user) return;
    setIsLoading(true);
    try {
      const endpoint =
        user.role === "ADMIN" || user.role === "MANAGER"
          ? "/requests/all"
          : "/requests/my";

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}${endpoint}`, // [MODIFICADO]
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (!res.ok) throw new Error("Error al cargar peticiones");
      const data = await res.json();
      const allRequests: BackendRequest[] = data.data;

      const mappedRequests = allRequests.map(mapBackendRequest);

      const activeRequests = mappedRequests.filter(
        (req) => req.status !== "completed" && req.status !== "rejected"
      );

      setRequests(activeRequests as RequestSummary[]);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [token, user]);

  // (activeItemsSummary - sin cambios)
  const activeItemsSummary = useMemo(() => {
    const summary = new Map<string, number>();
    requests
      .filter((req) => req.status === "pending" || req.status === "ready")
      .forEach((req) => {
        req.items.forEach((item) => {
          const currentQuantity = summary.get(item.name) || 0;
          summary.set(item.name, currentQuantity + item.quantity);
        });
      });
    return Array.from(summary.entries())
      .map(([name, quantity]) => ({ name, quantity }))
      .sort((a, b) => b.quantity - a.quantity);
  }, [requests]);

  // (handleUpdateRequestStatus - sin cambios)
  const handleUpdateRequestStatus = async (
    requestId: string,
    newBackendStatus: BackendRequestStatus
  ) => {
    const originalRequests = requests;

    if (newBackendStatus === "COMPLETED" || newBackendStatus === "REJECTED") {
      setRequests((prev) => prev.filter((r) => r.id !== requestId));
    } else {
      const newFrontendStatus = mapBackendStatusToFrontend(newBackendStatus);
      setRequests((prev) =>
        prev.map((r) =>
          r.id === requestId
            ? { ...r, status: newFrontendStatus as RequestStatus }
            : r
        )
      );
    }

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/requests/${requestId}/status`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status: newBackendStatus }),
        }
      );

      if (!res.ok) {
        setRequests(originalRequests);
        const err = await res.json();
        throw new Error(err.message || "Error al actualizar la petición");
      }
    } catch (error: any) {
      console.error(error);
      setRequests(originalRequests);
    }
  };

  // (Todos los Handlers y el JSX - sin cambios)
  const handleViewDetails = (request: RequestSummary) => {
    setSelectedRequest(request);
    setDetailsModalOpen(true);
  };
  const closeDetailsModal = () => {
    setDetailsModalOpen(false);
    setSelectedRequest(null);
  };
  const handleApprove = (request: RequestSummary) => {
    handleUpdateRequestStatus(request.id, "APPROVED");
  };
  const handleReject = (request: RequestSummary) => {
    setSelectedRequest(request);
    setRejectModalOpen(true);
  };
  const handleComplete = (request: RequestSummary) => {
    handleUpdateRequestStatus(request.id, "COMPLETED");
  };
  const handleReopen = (request: RequestSummary) => {
    handleUpdateRequestStatus(request.id, "PENDING");
  };
  const closeRejectModal = () => {
    setRejectModalOpen(false);
    setSelectedRequest(null);
  };
  const confirmReject = () => {
    if (selectedRequest) {
      handleUpdateRequestStatus(selectedRequest.id, "REJECTED");
      closeRejectModal();
    }
  };

  return (
    <div className="bg-gray-100 min-h-screen">
      <Header />

      <main className="pt-16">
        <div className="p-4 md:p-8 max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-900">
              Peticiones de Insumos
            </h1>
            <Button onClick={() => router.push("/requestForm")}>
              Crear Nueva Petición
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <RequestList
                requests={requests}
                isLoading={isLoading}
                onViewDetails={handleViewDetails}
                onApprove={handleApprove}
                onReject={handleReject}
                onComplete={handleComplete}
                onReopen={handleReopen}
              />
            </div>

            <div className="lg:col-span-1 space-y-6">
              <PendingItemsSummary items={activeItemsSummary} />
            </div>
          </div>

          {/* Modal de Detalles */}
          <Modal isOpen={isDetailsModalOpen} onClose={closeDetailsModal}>
            <Modal.Header onClose={closeDetailsModal}>
              Detalles de la Petición
            </Modal.Header>
            <Modal.Body>
              {selectedRequest ? (
                <div className="space-y-4">
                  <p>
                    <strong>Paciente:</strong> {selectedRequest.patientName}
                  </p>
                  <p>
                    <strong>Solicitante:</strong>{" "}
                    {selectedRequest.requesterName}
                  </p>
                  <p>
                    <strong>Fecha:</strong>{" "}
                    {new Date(selectedRequest.createdAt).toLocaleString(
                      "es-CL"
                    )}
                  </p>
                  <p>
                    <strong>Estado:</strong>{" "}
                    <span className="font-semibold">
                      {statusConfigPage[selectedRequest.status]?.text ||
                        selectedRequest.status}
                    </span>
                  </p>
                  <hr className="my-4" />
                  <h4 className="font-semibold">Insumos Solicitados:</h4>
                  <ul className="list-disc list-inside space-y-1 text-gray-700">
                    {selectedRequest.items.map((item) => (
                      <li key={item.id}>
                        <span className="font-medium">{item.quantity}x</span>{" "}
                        {item.name}
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

          {/* Modal de Rechazo */}
          <Modal isOpen={isRejectModalOpen} onClose={closeRejectModal}>
            <Modal.Header onClose={closeRejectModal}>
              Confirmar Rechazo
            </Modal.Header>
            <Modal.Body>
              <p className="text-gray-700">
                ¿Estás seguro de que deseas rechazar la petición para{" "}
                <span className="font-semibold">
                  {selectedRequest?.patientName}
                </span>
                ?
              </p>
              <p className="text-sm text-red-600 mt-2">
                Esta acción es permanente y no se podrá deshacer. La petición
                desaparecerá de esta lista.
              </p>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={closeRejectModal}>
                Cancelar
              </Button>
              <Button variant="danger" onClick={confirmReject}>
                Confirmar Rechazo
              </Button>
            </Modal.Footer>
          </Modal>
        </div>
      </main>
    </div>
  );
};

export default RequestsPage;

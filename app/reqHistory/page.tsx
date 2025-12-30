"use client";
import React, { useState, useEffect } from "react"; // 1. Importar useEffect
import Header from "../components/ui/Header";
import WithdrawalHistory, {
  RequestHistoryItem,
} from "../components/features/WithdrawalHistory";
import Modal from "../components/ui/Modal";
import Button from "../components/ui/Button";
import Spinner from "../components/ui/Spinner";
import { useAuth } from "../contexts/AuthContext"; // 2. Importar el hook de autenticación

// --- (Datos simulados ELIMINADOS) ---

// --- 3. Definir tipos para los datos que llegan del Backend ---
// Basado en el `request.repository.ts`
type BackendRequestStatus = "PENDING" | "APPROVED" | "REJECTED" | "COMPLETED";
type FrontendRequestStatus = "pending" | "ready" | "rejected" | "completed";

interface BackendItemLine {
  id: string;
  quantity: number;
  item: {
    id: string;
    name: string;
  };
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

// 4. Función para mapear Backend -> Frontend
const mapBackendRequest = (req: BackendRequest): RequestHistoryItem => {
  // Mapear el estado 'APPROVED' del backend a 'ready' del frontend
  let mappedStatus: FrontendRequestStatus = "pending";
  if (req.status === "APPROVED") {
    mappedStatus = "ready";
  } else {
    mappedStatus = req.status.toLowerCase() as FrontendRequestStatus;
  }

  return {
    id: req.id,
    patientName: req.patient.name,
    requesterName: req.requester.name,
    status: mappedStatus,
    createdAt: req.createdAt,
    completedAt: req.completedAt,
    // Mapear las líneas de petición al formato 'items'
    items: req.requestLines.map((line) => ({
      id: line.item.id,
      name: line.item.name,
      quantity: line.quantity,
    })),
  };
};

const HistoryPage = () => {
  // 5. Ajustar estados iniciales
  const [isLoading, setIsLoading] = useState(true);
  const [historyItems, setHistoryItems] = useState<RequestHistoryItem[]>([]);
  const { token, user } = useAuth(); // 6. Obtener token

  const [isDetailsModalOpen, setDetailsModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<RequestHistoryItem | null>(
    null
  );

  // 7. useEffect para cargar los datos
  useEffect(() => {
    if (!token || !user) {
      setIsLoading(false); // Si no hay token, no podemos cargar nada
      return;
    }

    const fetchHistory = async () => {
      setIsLoading(true);
      try {
        const endpoint =
          user.role === "ADMIN" || user.role === "MANAGER"
            ? "/requests/all"
            : "/requests/my";

        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}${endpoint}`, // [MODIFICADO]
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!res.ok) {
          throw new Error("Error al cargar el historial de peticiones");
        }

        const data = await res.json();

        // Mapear los datos del backend al formato del frontend
        const mappedData = (data.data as BackendRequest[]).map(
          mapBackendRequest
        );
        setHistoryItems(mappedData);
      } catch (error) {
        console.error(error);
        // Aquí podrías mostrar un toast de error
      } finally {
        setIsLoading(false);
      }
    };

    fetchHistory();
  }, [token]); // El efecto se ejecuta cuando el token esté disponible

  // Handlers para las acciones
  const handleViewDetails = (item: RequestHistoryItem) => {
    setSelectedItem(item);
    setDetailsModalOpen(true);
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
            <h1 className="text-3xl font-bold text-gray-900">
              Historial de Retiros
            </h1>
          </div>

          <WithdrawalHistory
            requests={historyItems}
            isLoading={isLoading} // El componente usará este estado
            onViewDetails={handleViewDetails}
          />
        </div>
      </main>

      {/* --- Modal de Detalles (sin cambios) --- */}
      <Modal isOpen={isDetailsModalOpen} onClose={closeDetailsModal}>
        <Modal.Header onClose={closeDetailsModal}>
          Detalles del Retiro
        </Modal.Header>
        <Modal.Body>
          {selectedItem ? (
            <div className="space-y-4">
              <p>
                <strong>ID Petición:</strong> {selectedItem.id}
              </p>
              <p>
                <strong>Paciente:</strong> {selectedItem.patientName}
              </p>
              <p>
                <strong>Solicitante:</strong> {selectedItem.requesterName}
              </p>
              <p>
                <strong>Fecha Solicitud:</strong>{" "}
                {new Date(selectedItem.createdAt).toLocaleString("es-CL")}
              </p>
              <p>
                <strong>Fecha Retiro:</strong>{" "}
                {selectedItem.completedAt
                  ? new Date(selectedItem.completedAt).toLocaleString("es-CL")
                  : "N/A"}
              </p>

              <hr className="my-4" />
              <h4 className="font-semibold">Insumos Solicitados:</h4>
              <ul className="list-disc list-inside space-y-1 text-gray-700">
                {selectedItem.items.map((item) => (
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
    </div>
  );
};

export default HistoryPage;

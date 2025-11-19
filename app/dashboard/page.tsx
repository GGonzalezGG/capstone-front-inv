"use client";
import React, { useState, useMemo, useEffect } from "react";
import InventoryTable, {
  InventoryItem,
} from "../components/features/InventoryTable";
import InventorySummaryChart from "../components/features/InventorySummaryChart";
import RecentActivityFeed, {
  ActivityItem,
} from "../components/features/RecentActivityFeed";
import StatCard from "../components/ui/StatCard";
import Button from "../components/ui/Button";
import Modal from "../components/ui/Modal";
import Card from "../components/ui/Card";
import InventoryForm from "../components/features/InventoryForm";
import SearchBar from "../components/ui/SearchBar";
import Header from "../components/ui/Header";
import { useAuth } from "../contexts/AuthContext";
import Spinner from "../components/ui/Spinner";

// --- NUEVO: Definición del tipo de item como llega del Backend ---
// Basado en el schema.prisma
interface BackendInventoryItem {
  id: string;
  name: string;
  category: string;
  quantityInStock: number;
  lowStockThreshold: number;
  expiryDate: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  description: string | null;
}

// --- NUEVO: Función para mapear datos del Backend al Frontend ---
/**
 * Transforma un item del backend al formato que espera InventoryTable.
 * Deriva el 'status' basado en la lógica de negocio.
 */
const mapBackendItemToFrontend = (
  item: BackendInventoryItem
): InventoryItem => {
  let status: InventoryItem["status"] = "available";
  const now = new Date();
  const expiry = item.expiryDate ? new Date(item.expiryDate) : null;

  if (expiry && expiry < now) {
    status = "expired";
  } else if (item.quantityInStock <= 0) {
    status = "expired";
  } else if (item.quantityInStock < item.lowStockThreshold) {
    status = "low_stock";
  }

  return {
    id: item.id,
    name: item.name,
    category: item.category,
    quantity: item.quantityInStock,
    status: status,
    expiryDate: item.expiryDate || undefined,

    // --- CAMPOS AÑADIDOS ---
    description: item.description, //
    lowStockThreshold: item.lowStockThreshold, //
  };
};

// --- (Iconos - Sin cambios) ---
const BoxIcon = () => (
  <svg
    className="h-6 w-6"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"
    />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M3.27 6.96L12 12.01l8.73-5.05M12 22.08V12"
    />
  </svg>
);
const AlertIcon = () => (
  <svg
    className="h-6 w-6"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
    />
  </svg>
);
const CheckIcon = () => (
  <svg
    className="h-6 w-6"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
    />
  </svg>
);

const ClockIcon = () => (
  <svg
    className="h-6 w-6"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
    />
  </svg>
);

// --- (Tipos del Dashboard - Sin cambios) ---
interface DashboardStats {
  lowStock: number;
  totalItems: number;
  pendingRequests: number;
  expiringSoon: number;
}
interface ChartDataItem {
  name: string;
  quantity: number;
}

const DashboardInventoryPage = () => {
  const [activeTab, setActiveTab] = useState<"dashboard" | "inventory">(
    "dashboard"
  );

  // --- Estados de la pestaña "Inventario" ---
  const [isLoadingInventory, setIsLoadingInventory] = useState(true); // --- NUEVO ---
  const [items, setItems] = useState<InventoryItem[]>([]); // --- NUEVO: Inicia vacío ---
  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
  const [isEditModalOpen, setEditModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // --- Estados de la pestaña "Dashboard" (de la etapa anterior) ---
  const [isLoadingDashboard, setIsLoadingDashboard] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({
    lowStock: 0,
    totalItems: 0,
    pendingRequests: 0,
    expiringSoon: 0,
  });
  const [chartData, setChartData] = useState<ChartDataItem[]>([]);
  const [activityData, setActivityData] = useState<ActivityItem[]>([]);

  const { token } = useAuth(); // Obtiene el token del contexto

  // --- NUEVO: Función para LEER (GET) el inventario ---
  const fetchInventory = async () => {
    if (!token) return; // No hacer nada si no hay token

    setIsLoadingInventory(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/inventory`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Error al cargar el inventario");

      const result = await res.json();
      const backendItems: BackendInventoryItem[] = result.data;

      // Mapear los datos del backend al formato del frontend
      setItems(backendItems.map(mapBackendItemToFrontend));
    } catch (error) {
      console.error(error);
      // Aquí mostrar un toast de error
    } finally {
      setIsLoadingInventory(false);
    }
  };

  // --- Efecto para cargar datos del Dashboard (de la etapa anterior) ---
  useEffect(() => {
    if (token && activeTab === "dashboard") {
      const fetchDashboardData = async () => {
        setIsLoadingDashboard(true);
        try {
          const res = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/dashboard`,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );
          if (!res.ok)
            throw new Error("Error al cargar los datos del dashboard");
          const data = await res.json();
          setStats(data.data.stats);
          setChartData(data.data.chartData);
          setActivityData(data.data.recentActivities);
        } catch (error) {
          console.error(error);
        } finally {
          setIsLoadingDashboard(false);
        }
      };
      fetchDashboardData();
    }
  }, [token, activeTab]);

  // --- NUEVO: Efecto para cargar datos de Inventario ---
  useEffect(() => {
    if (token && activeTab === "inventory") {
      fetchInventory();
    }
  }, [token, activeTab]); // Se recarga si el token cambia o si el usuario cambia a esta pestaña

  // --- (Lógica de filtrado - Sin cambios) ---
  const filteredItems = useMemo(() => {
    if (!searchTerm) return items;
    return items.filter(
      (item) =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.category.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [items, searchTerm]);

  // --- (Handlers de Modales - Sin cambios) ---
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
  const closeEditModal = () => {
    setSelectedItem(null);
    setEditModalOpen(false);
  };

  // --- NUEVO: Handler para CREAR (POST) y ACTUALIZAR (PUT) ---
  const handleSubmitForm = async (
    data: Omit<InventoryItem, "id" | "status">
  ) => {
    setIsSubmitting(true);

    // 1. Transformar datos del formulario al formato del Backend DTO
    const payload = {
      name: data.name,
      category: data.category,
      quantityInStock: Number(data.quantity),
      expiryDate: data.expiryDate
        ? new Date(data.expiryDate).toISOString()
        : null,
      description: data.description || null, // Enviar null si está vacío
      lowStockThreshold: Number(data.lowStockThreshold),
    };

    const isEditing = !!selectedItem;
    const url = isEditing
      ? `${process.env.NEXT_PUBLIC_API_URL}/inventory/${selectedItem.id}`
      : `${process.env.NEXT_PUBLIC_API_URL}/inventory`;
    const method = isEditing ? "PUT" : "POST";

    try {
      const res = await fetch(url, {
        method: method,
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(
          err.message ||
            `Error al ${isEditing ? "actualizar" : "crear"} el insumo`
        );
      }

      // Éxito
      closeEditModal();
      await fetchInventory(); // Recargar la lista de insumos
      // Aquí mostrar un toast de éxito
    } catch (error: any) {
      console.error(error);
      // Aquí mostrar un toast de error (quizás en el modal)
      // setFormError(error.message); // Necesitarías un estado de error en el form
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- NUEVO: Handler para ELIMINAR (DELETE) ---
  const confirmDelete = async () => {
    if (!selectedItem) return;

    setIsSubmitting(true); // Re-usamos isSubmitting para el modal de delete
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/inventory/${selectedItem.id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!res.ok) {
        throw new Error("Error al eliminar el insumo");
      }

      // Éxito
      closeDeleteModal();
      await fetchInventory(); // Recargar la lista
      // Aquí mostrar un toast de éxito
    } catch (error) {
      console.error(error);
      // Aquí mostrar un toast de error
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header with Tabs */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">
            Sistema de Inventario
          </h1>
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab("dashboard")}
                className={`
                  py-4 px-1 border-b-2 font-medium text-sm transition-colors
                  ${
                    activeTab === "dashboard"
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }
                `}
              >
                Dashboard
              </button>
              <button
                onClick={() => setActiveTab("inventory")}
                className={`
                  py-4 px-1 border-b-2 font-medium text-sm transition-colors
                  ${
                    activeTab === "inventory"
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }
                `}
              >
                Gestión de Inventario
              </button>
            </nav>
          </div>
        </div>

        {/* Dashboard View (Conectado) */}
        {activeTab === "dashboard" && (
          <>
            {isLoadingDashboard ? (
              <div className="flex justify-center items-center h-96">
                <Spinner label="Cargando Dashboard..." size="lg" />
              </div>
            ) : (
              <div className="space-y-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  <StatCard
                    title="Stock Bajo"
                    value={stats.lowStock}
                    icon={<AlertIcon />}
                    color="yellow"
                  />
                  <StatCard
                    title="Próx. a Vencer"
                    value={stats.expiringSoon}
                    icon={<ClockIcon />}
                    color="red" 
                    description="En los próx. 7 días"
                  />
                  <StatCard
                    title="Total de Insumos"
                    value={stats.totalItems}
                    icon={<BoxIcon />}
                    color="blue"
                  />
                  <StatCard
                    title="Peticiones Pendientes"
                    value={stats.pendingRequests}
                    icon={<CheckIcon />}
                    color="lime"
                  />
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2">
                    <InventorySummaryChart
                      data={chartData}
                      title="Insumos Principales"
                    />
                  </div>
                  <div className="lg:col-span-1">
                    <RecentActivityFeed activities={activityData} />
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {/* Inventory View (AHORA CONECTADO) */}
        {activeTab === "inventory" && (
          <div>
            <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <Button onClick={handleCreateNew} className="sm:w-auto w-full">
                + Añadir Insumo
              </Button>
            </div>
            <Card>
              <Card.Header>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <h2 className="text-xl font-semibold">Insumos en Bodega</h2>
                  <div className="w-full sm:w-80">
                    <SearchBar
                      placeholder="Buscar por nombre o categoría..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>
              </Card.Header>
              <Card.Body>
                {/* --- NUEVO: Usar isLoadingInventory --- */}
                {isLoadingInventory ? (
                  <div className="flex justify-center items-center h-64">
                    <Spinner label="Cargando inventario..." />
                  </div>
                ) : filteredItems.length === 0 && searchTerm ? (
                  <div className="text-center py-12">
                    <p className="text-gray-500">
                      No se encontraron insumos que coincidan con "{searchTerm}"
                    </p>
                  </div>
                ) : (
                  <InventoryTable
                    items={filteredItems}
                    isLoading={false} // La carga principal ya se manejó arriba
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                  />
                )}
              </Card.Body>
            </Card>
          </div>
        )}
      </div>

      {/* Delete Modal (Ahora usa isSubmitting) */}
      <Modal isOpen={isDeleteModalOpen} onClose={closeDeleteModal}>
        <Modal.Header onClose={closeDeleteModal}>
          Confirmar Eliminación
        </Modal.Header>
        <Modal.Body>
          <p className="text-gray-700">
            ¿Estás seguro de que deseas eliminar el insumo{" "}
            <span className="font-semibold">{selectedItem?.name}</span>?
          </p>
          <p className="text-sm text-gray-600 mt-2">
            Esta acción marcará el insumo como inactivo (soft delete).
          </p>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={closeDeleteModal}
            disabled={isSubmitting}
          >
            Cancelar
          </Button>
          <Button
            variant="danger"
            onClick={confirmDelete}
            disabled={isSubmitting}
          >
            {isSubmitting ? <Spinner size="sm" /> : "Eliminar"}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Edit/Create Modal (Formulario se pasa aquí, no en el body) */}
      <Modal isOpen={isEditModalOpen} onClose={closeEditModal}>
        <Modal.Header onClose={closeEditModal}>
          {selectedItem?.id ? "Editar Insumo" : "Crear Nuevo Insumo"}
        </Modal.Header>
        {/* --- MODIFICADO: Pasamos el formulario como hijo directo del Modal --- */}
        <InventoryForm
          itemToEdit={selectedItem}
          onSubmit={handleSubmitForm}
          onCancel={closeEditModal}
          isSubmitting={isSubmitting}
        />
      </Modal>
    </div>
  );
};

export default DashboardInventoryPage;

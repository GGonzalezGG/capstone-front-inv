"use client"; // Este componente incluye interactividad (botones)

import React from "react";
import Table, { ColumnDef } from "../ui/Table"; // Importa la tabla genérica y su tipo de columna
import Badge from "../ui/Badge";
import Button from "../ui/Button";
import Spinner from "../ui/Spinner";

// 1. Define el tipo de dato para un insumo del inventario
type InventoryItemStatus = "available" | "low_stock" | "expired";

export interface InventoryItem {
  id: string;
  name: string;
  category: string;
  quantity: number;
  status: InventoryItemStatus;
  expiryDate?: string;
  description?: string | null;
  lowStockThreshold: number;
}

// 2. Define las props del componente
interface InventoryTableProps {
  items: InventoryItem[];
  isLoading: boolean;
  onEdit: (item: InventoryItem) => void; // Función para manejar clic en "Editar"
  onDelete: (item: InventoryItem) => void; // Función para manejar clic en "Eliminar"
}

// Mapeo de status a las props del Badge para consistencia
const statusConfig: Record<
  InventoryItemStatus,
  { variant: "success" | "warning" | "danger"; text: string }
> = {
  available: { variant: "success", text: "Disponible" },
  low_stock: { variant: "warning", text: "Stock Bajo" },
  expired: { variant: "danger", text: "Vencido" },
};

/**
 * Un componente "feature" que implementa la tabla genérica
 * para mostrar y gestionar el inventario de insumos.
 */
const InventoryTable: React.FC<InventoryTableProps> = ({
  items,
  isLoading,
  onEdit,
  onDelete,
}) => {
  // 3. Define las columnas para la tabla genérica
  const columns: ColumnDef<InventoryItem>[] = [
    {
      header: "Nombre",
      accessor: "name",
      render: (item) => (
        <span className="font-medium text-gray-900">{item.name}</span>
      ),
    },
    {
      header: "Categoría",
      accessor: "category",
    },
    {
      header: "Cantidad",
      accessor: "quantity",
      render: (item) => (
        <span
          className={`${
            item.status === "low_stock" ? "text-yellow-600 font-semibold" : ""
          } ${item.status === "expired" ? "text-red-600 font-semibold" : ""}`}
        >
          {item.quantity} uds.
        </span>
      ),
    },
    {
      header: "Estado",
      accessor: "status",
      render: (item) => {
        const config = statusConfig[item.status] || statusConfig.available;
        return <Badge variant={config.variant}>{config.text}</Badge>;
      },
    },
    {
      header: "Vencimiento",
      accessor: "expiryDate",
      render: (item) =>
        item.expiryDate ? (
          new Date(item.expiryDate).toLocaleDateString("es-CL")
        ) : (
          <span className="text-gray-400">N/A</span>
        ),
    },
    {
      header: "Acciones",
      accessor: "id", // Usamos 'id' como accessor aunque no lo mostremos
      render: (item) => (
        <div className="flex space-x-2">
          <Button
            variant="secondary"
            onClick={() => onEdit(item)}
            className="py-1 px-3 text-sm" // Asumiendo que Button acepta className para override
          >
            Editar
          </Button>
          <Button
            variant="danger"
            onClick={() => onDelete(item)}
            className="py-1 px-3 text-sm"
          >
            Eliminar
          </Button>
        </div>
      ),
    },
  ];

  // 4. Renderiza el Spinner o la Tabla
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner label="Cargando inventario..." />
      </div>
    );
  }

  return (
    <Table
      columns={columns}
      data={items}
      emptyStateMessage="No se encontraron insumos en el inventario."
    />
  );
};

export default InventoryTable;

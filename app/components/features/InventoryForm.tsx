"use client";

import React, { useState, useEffect } from "react";
import { InventoryItem } from "./InventoryTable"; // Importa el tipo actualizado
import Input from "../ui/Input";
import Button from "../ui/Button";
import Spinner from "../ui/Spinner";

// El tipo InventoryItem ahora tiene (casi) todo lo que necesitamos.
// Solo excluimos 'id' y 'status' (ya que status es derivado).
type InventoryFormData = Omit<InventoryItem, "id" | "status">;

interface InventoryFormProps {
  itemToEdit?: InventoryItem | null;
  onSubmit: (data: InventoryFormData) => void;
  onCancel: () => void;
  isSubmitting: boolean;
}

// Estado inicial actualizado
const initialState: InventoryFormData = {
  name: "",
  category: "",
  quantity: 0,
  expiryDate: "",
  description: "", // Añadido
  lowStockThreshold: 10, // Añadido
};

const InventoryForm: React.FC<InventoryFormProps> = ({
  itemToEdit,
  onSubmit,
  onCancel,
  isSubmitting,
}) => {
  const [formData, setFormData] = useState<InventoryFormData>(initialState);
  const [quantityInput, setQuantityInput] = useState<string>(
    initialState.quantity.toString()
  );
  // --- NUEVO ---
  const [lowStockInput, setLowStockInput] = useState<string>(
    initialState.lowStockThreshold.toString()
  );
  const [errors, setErrors] = useState<
    Partial<Record<keyof InventoryFormData, string>>
  >({});

  // Efecto actualizado para llenar el formulario
  useEffect(() => {
    if (itemToEdit) {
      const formattedDate = itemToEdit.expiryDate
        ? new Date(itemToEdit.expiryDate).toISOString().split("T")[0]
        : "";

      setFormData({
        name: itemToEdit.name,
        category: itemToEdit.category,
        quantity: itemToEdit.quantity,
        expiryDate: formattedDate,
        description: itemToEdit.description || "", // Campo añadido
        lowStockThreshold: itemToEdit.lowStockThreshold, // Campo añadido
      });
      setQuantityInput(itemToEdit.quantity.toString());
      setLowStockInput(itemToEdit.lowStockThreshold.toString()); // Campo añadido
      setErrors({});
    } else {
      setFormData(initialState);
      setQuantityInput(initialState.quantity.toString());
      setLowStockInput(initialState.lowStockThreshold.toString()); // Campo añadido
      setErrors({});
    }
  }, [itemToEdit]);

  // Manejador de cambios actualizado
  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;

    if (name === "quantity") {
      const stringValue = value.replace(/[^0-9]/g, "");
      setQuantityInput(stringValue);
      setFormData((prev) => ({
        ...prev,
        quantity: parseInt(stringValue) || 0,
      }));
    } else if (name === "lowStockThreshold") {
      // --- NUEVO ELSE IF ---
      const stringValue = value.replace(/[^0-9]/g, "");
      setLowStockInput(stringValue);
      setFormData((prev) => ({
        ...prev,
        lowStockThreshold: parseInt(stringValue) || 0,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }

    if (errors[name as keyof InventoryFormData]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  // Validación actualizada
  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof InventoryFormData, string>> = {};
    if (!formData.name.trim()) {
      newErrors.name = "El nombre es obligatorio.";
    }
    if (!formData.category.trim()) {
      newErrors.category = "La categoría es obligatoria.";
    }
    if (formData.quantity < 0) {
      newErrors.quantity = "La cantidad no puede ser negativa.";
    }
    // --- NUEVO ---
    if (formData.lowStockThreshold < 0) {
      newErrors.lowStockThreshold = "El umbral no puede ser negativo.";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      // El 'status' ya no es parte del formulario
      const { ...dataToSend } = formData;
      onSubmit(dataToSend);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 p-6 text-zinc-700">
      {" "}
      {/* Añadido padding aquí */}
      <Input
        id="name"
        label="Nombre del Insumo"
        name="name"
        value={formData.name}
        onChange={handleChange}
        error={errors.name}
        disabled={isSubmitting}
        required
      />
      {/* --- NUEVO: Campo de Descripción --- */}
      <div>
        <label htmlFor="description" className="block text-sm font-medium mb-1">
          Descripción (Opcional)
        </label>
        <textarea
          id="description"
          name="description"
          value={formData.description || ""}
          onChange={handleChange}
          disabled={isSubmitting}
          rows={3}
          className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-700 focus:border-blue-700 sm:text-sm"
        />
      </div>
      <Input
        id="category"
        label="Categoría"
        name="category"
        value={formData.category}
        onChange={handleChange}
        error={errors.category}
        disabled={isSubmitting}
        required
      />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          id="quantity"
          label="Cantidad"
          name="quantity"
          type="number"
          value={quantityInput}
          onChange={handleChange}
          error={errors.quantity}
          disabled={isSubmitting}
        />

        {/* --- NUEVO: Umbral de Stock Bajo --- */}
        <Input
          id="lowStockThreshold"
          label="Umbral Stock Bajo"
          name="lowStockThreshold"
          type="number"
          value={lowStockInput}
          onChange={handleChange}
          error={errors.lowStockThreshold}
          disabled={isSubmitting}
        />
      </div>
      {/* --- CAMPO DE STATUS ELIMINADO --- */}
      <Input
        id="expiryDate"
        label="Fecha de Vencimiento (Opcional)"
        name="expiryDate"
        type="date"
        value={formData.expiryDate}
        onChange={handleChange}
        disabled={isSubmitting}
      />
      {/* Botones de acción (Movidos del modal al formulario) */}
      <div className="pt-4 border-t border-gray-200 flex justify-end space-x-3">
        <Button
          type="button"
          variant="secondary"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Cancelar
        </Button>
        <Button type="submit" variant="primary" disabled={isSubmitting}>
          {isSubmitting ? <Spinner size="sm" /> : "Guardar Cambios"}
        </Button>
      </div>
    </form>
  );
};

export default InventoryForm;

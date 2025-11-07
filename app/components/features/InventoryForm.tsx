"use client";

import React, { useState, useEffect } from 'react';
import { InventoryItem } from './InventoryTable'; // Importa el tipo de InventoryTable
import Input from '../ui/Input';
import Button from '../ui/Button';
import Spinner from '../ui/Spinner';

// Omitimos 'id' ya que no es parte del formulario (se genera en el backend o se pasa por separado)
type InventoryFormData = Omit<InventoryItem, 'id'>;

interface InventoryFormProps {
  // Opcional: El insumo a editar. Si es nulo, es un formulario de "Crear".
  itemToEdit?: InventoryItem | null;
  // Callback que se llama al enviar el formulario con los datos.
  onSubmit: (data: InventoryFormData) => void;
  // Callback para cerrar el formulario/modal.
  onCancel: () => void;
  // Indica si el formulario está en proceso de envío (e.g., esperando API).
  isSubmitting: boolean;
}

// Estado inicial vacío para el formulario
const initialState: InventoryFormData = {
  name: '',
  category: '',
  quantity: 0,
  status: 'available',
  expiryDate: '',
};

/**
 * Formulario para crear o editar un insumo del inventario.
 * Gestiona su propio estado y validación.
 */
const InventoryForm: React.FC<InventoryFormProps> = ({
  itemToEdit,
  onSubmit,
  onCancel,
  isSubmitting,
}) => {
  const [formData, setFormData] = useState<InventoryFormData>(initialState);
  const [quantityInput, setQuantityInput] = useState<string>(initialState.quantity.toString());
  const [errors, setErrors] = useState<Partial<Record<keyof InventoryFormData, string>>>({}); 

  // Efecto para llenar el formulario cuando 'itemToEdit' cambia
  useEffect(() => {
    if (itemToEdit) {
      // Formatea la fecha para el input type="date" (YYYY-MM-DD)
      const formattedDate = itemToEdit.expiryDate
        ? new Date(itemToEdit.expiryDate).toISOString().split('T')[0]
        : '';

      setFormData({
        name: itemToEdit.name,
        category: itemToEdit.category,
        quantity: itemToEdit.quantity,
        status: itemToEdit.status,
        expiryDate: formattedDate,
      });
      setQuantityInput(itemToEdit.quantity.toString());
      setErrors({}); // Limpia errores al cargar un nuevo ítem
    } else {
      setFormData(initialState); // Resetea si no hay ítem (modo "Crear")
      setQuantityInput(initialState.quantity.toString()); // Reseteamos el estado del string del input.
      setErrors({});
    }
  }, [itemToEdit]);

  // Manejador genérico para cambios en los inputs
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (name === 'quantity') {
      // Filtra cualquier cosa que no sea un número
      const stringValue = value.replace(/[^0-9]/g, '');
      // Actualiza el estado del string (lo que ve el usuario)
      setQuantityInput(stringValue);
      
      // Actualiza el estado del formulario (el número real),
      // tratando un string vacío como 0.
      setFormData(prev => ({
        ...prev,
        quantity: parseInt(stringValue) || 0,
      }));

    } else {
      // Manejo normal para los otros inputs
      setFormData(prev => ({
        ...prev,
        [name]: value,
      }));
    }

    // Limpia el error del campo al empezar a escribir
    if (errors[name as keyof InventoryFormData]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  // Validación simple
  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof InventoryFormData, string>> = {};
    if (!formData.name.trim()) {
      newErrors.name = 'El nombre es obligatorio.';
    }
    if (!formData.category.trim()) {
      newErrors.category = 'La categoría es obligatoria.';
    }
    if (formData.quantity < 0) {
      newErrors.quantity = 'La cantidad no puede ser negativa.';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Manejador del envío
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
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
          value={quantityInput} //El valor se bindea al estado 'string'
          onChange={handleChange}
          error={errors.quantity}
          disabled={isSubmitting}
        />
        
        {/* Usamos un <select> nativo estilizado para el estado */}
        <div>
          <label htmlFor="status" className="block text-sm font-medium text-gray-700">
            Estado
          </label>
          <select
            id="status"
            name="status"
            value={formData.status}
            onChange={handleChange}
            disabled={isSubmitting}
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md shadow-sm"
          >
            <option value="available">Disponible</option>
            <option value="low_stock">Stock Bajo</option>
            <option value="expired">Vencido</option>
          </select>
        </div>
      </div>
      
      <Input
        id="expiryDate"
        label="Fecha de Vencimiento (Opcional)"
        name="expiryDate"
        type="date"
        value={formData.expiryDate}
        onChange={handleChange}
        disabled={isSubmitting}
      />

      {/* Botones de acción (se pasarían como children al Modal.Footer) */}
      <div className="pt-4 border-t border-gray-200 flex justify-end space-x-3">
        <Button 
          type="button" 
          variant="secondary" 
          onClick={onCancel} 
          disabled={isSubmitting}
        >
          Cancelar
        </Button>
        <Button 
          type="submit" 
          variant="primary" 
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <Spinner size="sm" />
          ) : (
            'Guardar Cambios'
          )}
        </Button>
      </div>
    </form>
  );
};

export default InventoryForm;


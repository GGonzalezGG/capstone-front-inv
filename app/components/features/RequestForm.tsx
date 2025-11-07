"use client";

import React, { useState } from 'react';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Spinner from '../ui/Spinner';
import Card from '../ui/Card';

// 1. Definir los tipos de datos
export interface AvailableStockItem {
  id: string;
  name: string;
  stock: number;
}

export interface Patient {
  id: string;
  name: string;
}

interface RequestLine {
  id: string;
  itemId: string;
  name: string;
  quantity: number;
  stock: number;
}

export interface RequestFormData {
  patientId: string; // ID del paciente asociado
  items: {
    itemId: string;
    quantity: number;
  }[];
}

// 2. Definir las props del componente
interface RequestFormProps {
  availableItems: AvailableStockItem[];
  patients: Patient[]; // Nueva prop para la lista de pacientes
  onSubmit: (data: RequestFormData) => void;
  onCancel: () => void;
  isSubmitting: boolean;
}

/**
 * Formulario para crear una nueva petición de insumos,
 * asociándola a un paciente.
 */
const RequestForm: React.FC<RequestFormProps> = ({
  availableItems,
  patients,
  onSubmit,
  onCancel,
  isSubmitting,
}) => {
  const [requestLines, setRequestLines] = useState<RequestLine[]>([]);
  
  // Nuevos estados para el paciente y el formulario de item
  const [selectedPatientId, setSelectedPatientId] = useState<string>('');
  const [selectedItemId, setSelectedItemId] = useState<string>('');
  const [currentQuantity, setCurrentQuantity] = useState<string>("1");
  const [error, setError] = useState<string | null>(null);

  // 3. Handlers para el formulario
  
  const handleAddItem = () => {
    setError(null);

    const quantityNumber = parseInt(currentQuantity) || 0;

    if (!selectedItemId) {
      setError('Por favor, selecciona un insumo.');
      return;
    }
    if (quantityNumber <= 0) {
      setError('La cantidad debe ser mayor a 0.');
      return;
    }
    if (requestLines.some(line => line.itemId === selectedItemId)) {
      setError('Este insumo ya ha sido añadido a la lista.');
      return;
    }

    const itemDetails = availableItems.find(i => i.id === selectedItemId);
    if (!itemDetails) return;

    if (quantityNumber > itemDetails.stock) {
      setError(`Stock insuficiente. Solo quedan ${itemDetails.stock} unidades de "${itemDetails.name}".`);
      return;
    }

    const newRequestLine: RequestLine = {
      id: crypto.randomUUID(),
      itemId: itemDetails.id,
      name: itemDetails.name,
      quantity: quantityNumber,
      stock: itemDetails.stock,
    };
    setRequestLines(prevLines => [...prevLines, newRequestLine]);

    setSelectedItemId('');
    setCurrentQuantity("1");
  };

  const handleRemoveItem = (lineId: string) => {
    setRequestLines(prevLines => prevLines.filter(line => line.id !== lineId));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validar que se haya seleccionado un paciente
    if (!selectedPatientId) {
      setError('Debes asociar la petición a un paciente.');
      return;
    }

    if (requestLines.length === 0) {
      setError('Debes añadir al menos un insumo a la petición.');
      return;
    }
    
    // Formatear los datos para el backend
    const formattedData: RequestFormData = {
      patientId: selectedPatientId,
      items: requestLines.map(line => ({
        itemId: line.itemId,
        quantity: line.quantity,
      })),
    };
    
    onSubmit(formattedData);
  };

  return (
    <Card>
      <form onSubmit={handleSubmit}>
        <Card.Header>
          <p className="text-3xl text-bold">Crear Petición de Insumos</p>
        </Card.Header>
        
        <Card.Body>
          {/* --- Sección de Paciente --- */}
          <fieldset className="space-y-2 mb-6" disabled={isSubmitting}>
            <label htmlFor="patientSelect" className="block text-sm font-medium text-gray-900">
              Asociar Petición a Paciente (Obligatorio)
            </label>
            <select
              id="patientSelect"
              value={selectedPatientId}
              onChange={(e) => setSelectedPatientId(e.target.value)}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md shadow-sm"
            >
              <option value="" disabled>Selecciona un paciente...</option>
              {patients.map(patient => (
                <option key={patient.id} value={patient.id}>
                  {patient.name}
                </option>
              ))}
            </select>
          </fieldset>

          {/* --- Línea divisoria --- */}
          <hr className="my-6 border-gray-200" />

          {/* --- Sección para Añadir Items --- */}
          <fieldset className="space-y-4" disabled={isSubmitting}>
            <p className="text-sm text-gray-600">Añade los insumos que necesitas.</p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
              {/* Selector de Insumos */}
              <div className="md:col-span-2">
                <label htmlFor="itemSelect" className="block text-sm font-medium text-gray-700">Insumo</label>
                <select
                  id="itemSelect"
                  value={selectedItemId}
                  onChange={(e) => setSelectedItemId(e.target.value)}
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md shadow-sm"
                >
                  <option value="" disabled>Selecciona un insumo...</option>
                  {availableItems.map(item => (
                    <option key={item.id} value={item.id}>
                      {item.name} (Stock: {item.stock})
                    </option>
                  ))}
                </select>
              </div>
              
              {/* Input de Cantidad */}
              <div>
                <Input
                  label="Cantidad"
                  id="quantity"
                  name="quantity"
                  type="number"
                  value={currentQuantity}
                  onChange={(e) => {
                    // Solo permite números (o un string vacío)
                    const val = e.target.value.replace(/[^0-9]/g, '');
                    setCurrentQuantity(val);
                  }}
                />
              </div>
            </div>
            
            <Button type="button" variant="secondary" onClick={handleAddItem}>
              Añadir a la Petición
            </Button>
          </fieldset>
          
          {/* --- Sección de Items a Solicitar --- */}
          <div className="space-y-3 mt-6">
            <h3 className="text-lg font-medium text-gray-800">Insumos en esta Petición</h3>
            {requestLines.length === 0 ? (
              <p className="text-gray-500 text-sm">Aún no has añadido insumos.</p>
            ) : (
              <ul className="divide-y divide-gray-200">
                {requestLines.map(line => (
                  <li key={line.id} className="flex items-center justify-between py-3">
                    <div>
                      <p className="font-semibold text-gray-900">{line.name}</p>
                      <p className="text-sm text-gray-600">Cantidad: <span className="font-medium text-blue-700">{line.quantity}</span></p>
                    </div>
                    <Button 
                      type="button" 
                      variant="danger" 
                      onClick={() => handleRemoveItem(line.id)}
                      className="py-1 px-2 text-sm"
                      disabled={isSubmitting}
                    >
                      Quitar
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </Card.Body>

        {/* --- Acciones del Formulario --- */}
        <Card.Footer>
          <div className="flex flex-col sm:flex-row justify-between items-center sm:space-x-3">
            {/* Mensaje de Error General */}
            <div className="w-full sm:w-auto mb-3 sm:mb-0">
              {error && <p className="text-sm text-red-600">{error}</p>}
            </div>
            
            {/* Botones */}
            <div className="flex space-x-3 self-end">
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
                disabled={isSubmitting || requestLines.length === 0 || !selectedPatientId}
              >
                {isSubmitting ? <Spinner size="sm" /> : 'Enviar Petición'}
              </Button>
            </div>
          </div>
        </Card.Footer>
      </form>
    </Card>
  );
};

export default RequestForm;


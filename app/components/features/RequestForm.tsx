"use client";

import React, { useState, useMemo } from 'react'; // Importa useMemo
import Button from '../ui/Button';
import Input from '../ui/Input';
import Spinner from '../ui/Spinner';
import Card from '../ui/Card';
import SearchableSelect, { SearchableOption } from '../ui/SearchableSelect'; // 1. Importa el nuevo componente

// (Tus tipos de datos: AvailableStockItem, Patient, RequestLine, etc. permanecen igual)
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
  patientId: string;
  items: {
    itemId: string;
    quantity: number;
  }[];
}

interface RequestFormProps {
  availableItems: AvailableStockItem[];
  patients: Patient[];
  onSubmit: (data: RequestFormData) => void;
  onCancel: () => void;
  isSubmitting: boolean;
}


const RequestForm: React.FC<RequestFormProps> = ({
  availableItems,
  patients,
  onSubmit,
  onCancel,
  isSubmitting,
}) => {
  const [requestLines, setRequestLines] = useState<RequestLine[]>([]);
  
  const [selectedPatientId, setSelectedPatientId] = useState<string>('');
  const [selectedItemId, setSelectedItemId] = useState<string>('');
  const [currentQuantity, setCurrentQuantity] = useState<string>("1");
  const [error, setError] = useState<string | null>(null);

  // 2. Transforma los datos de props al formato que espera SearchableSelect
  // Usamos useMemo para que esto no se recalcule en cada render
  const patientOptions: SearchableOption[] = useMemo(() =>
    patients.map(patient => ({
      value: patient.id,
      label: patient.name,
    })),
  [patients]);

  const itemOptions: SearchableOption[] = useMemo(() =>
    availableItems.map(item => ({
      value: item.id,
      label: `${item.name} (Stock: ${item.stock})`,
    })),
  [availableItems]);


  // (El resto de tus Handlers: handleAddItem, handleRemoveItem, handleSubmit... permanecen igual)
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
    setSelectedItemId(''); // Resetea el select de insumos
    setCurrentQuantity("1");
  };

  const handleRemoveItem = (lineId: string) => {
    setRequestLines(prevLines => prevLines.filter(line => line.id !== lineId));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!selectedPatientId) {
      setError('Debes asociar la petición a un paciente.');
      return;
    }
    if (requestLines.length === 0) {
      setError('Debes añadir al menos un insumo a la petición.');
      return;
    }
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
          {/* --- 3. REEMPLAZO: Sección de Paciente --- */}
          <fieldset className="space-y-2 mb-6" disabled={isSubmitting}>
            <SearchableSelect
              id="patientSelect"
              label="Asociar Petición a Paciente (Obligatorio)"
              options={patientOptions}
              value={selectedPatientId}
              onChange={(value) => setSelectedPatientId(value)} // Actualiza el ID
              placeholder="Escribe para buscar un paciente..."
              disabled={isSubmitting}
            />
          </fieldset>

          <hr className="my-6 border-gray-200" />

          <fieldset className="space-y-4" disabled={isSubmitting}>
            <p className="text-sm text-gray-600">Añade los insumos que necesitas.</p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
              {/* --- 4. REEMPLAZO: Selector de Insumos --- */}
              <div className="md:col-span-2">
                <SearchableSelect
                  id="itemSelect"
                  label="Insumo"
                  options={itemOptions}
                  value={selectedItemId}
                  onChange={(value) => setSelectedItemId(value)} // Actualiza el ID
                  placeholder="Escribe para buscar un insumo..."
                  disabled={isSubmitting}
                />
              </div>
              
              <div>
                <Input
                  label="Cantidad"
                  id="quantity"
                  name="quantity"
                  type="number"
                  value={currentQuantity}
                  onChange={(e) => {
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
          
          {/* (El resto del componente: lista de insumos y Card.Footer) permanece igual */}
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

        <Card.Footer>
          <div className="flex flex-col sm:flex-row justify-between items-center sm:space-x-3">
            <div className="w-full sm:w-auto mb-3 sm:mb-0">
              {error && <p className="text-sm text-red-600">{error}</p>}
            </div>
            
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
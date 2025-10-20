"use client";
import React from 'react';

import Card from '../components/ui/Card';
  import Button from '../components/ui/Button'; // Asumiendo que tienes un componente Button

  const InventoryItem = () => {
    return (
      <div className="p-10 bg-gray-100">
        <Card className="max-w-md mx-auto">
          <Card.Header>
            Insumo: Jeringas Desechables 5ml
          </Card.Header>
          <Card.Body>
            <p className="mb-2">
              Cantidad disponible: <span className="font-bold text-lime-700">150 unidades</span>
            </p>
            <p>
              Próximo vencimiento: <span className="font-medium text-gray-800">25/12/2025</span>
            </p>
          </Card.Body>
          <Card.Footer>
            <div className="flex justify-end w-full space-x-3">
                {/* Asumiendo que tienes un componente Button */}
               <Button variant="secondary">Ver Detalles</Button>
               <Button variant="primary">Solicitar Insumo</Button>
               <p className="text-sm text-gray-500">Acciones</p>
            </div>
          </Card.Footer>
        </Card>
      </div>
    );
  }

export default InventoryItem;
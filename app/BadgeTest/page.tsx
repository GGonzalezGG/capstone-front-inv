'use client';
  import React from 'react';
  import Badge from '../components/ui/Badge';

  const BadgeExample = () => {
    return (
      <div className="p-10 bg-gray-50 flex flex-wrap items-start gap-4">
        <h2 className="w-full text-xl font-bold text-blue-700 mb-2">Ejemplos de Badges</h2>
        
        <div>
            <p className="text-sm text-gray-600 mb-2">Default:</p>
            <Badge>Insumo General</Badge>
        </div>

        <div>
            <p className="text-sm text-gray-600 mb-2">Success:</p>
            <Badge variant="success">En Stock</Badge>
        </div>

        <div>
            <p className="text-sm text-gray-600 mb-2">Info:</p>
            <Badge variant="info">Nuevo Pedido</Badge>
        </div>

        <div>
            <p className="text-sm text-gray-600 mb-2">Warning:</p>
            <Badge variant="warning">Stock Bajo</Badge>
        </div>
        
        <div>
            <p className="text-sm text-gray-600 mb-2">Danger:</p>
            <Badge variant="danger">Vencido</Badge>
        </div>

      </div>
    );
  }

  export default BadgeExample;
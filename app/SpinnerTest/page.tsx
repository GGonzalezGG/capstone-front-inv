"use client";
import React from 'react';
  import Spinner from '../components/ui/Spinner';

  const SpinnerExample = () => {
    return (
      <div className="p-10 bg-gray-50">
        <h2 className="w-full text-xl font-bold text-blue-700 mb-6">Ejemplos de Spinners</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center text-center">
            
          <div>
            <p className="text-sm text-gray-600 mb-4">Pequeño (sm):</p>
            <Spinner size="sm" />
          </div>

          <div>
            <p className="text-sm text-gray-600 mb-4">Mediano (md) con texto:</p>
            <Spinner size="md" label="Cargando..." />
          </div>

          <div>
            <p className="text-sm text-gray-600 mb-4">Grande (lg):</p>
            <Spinner size="lg" />
          </div>

        </div>

        <div className="mt-12">
             <h3 className="text-lg font-semibold text-gray-800 mb-4">Ejemplo de Superposición de Carga</h3>
             <div className="relative w-full h-48 bg-white border border-gray-200 rounded-lg flex items-center justify-center">
                <p className="text-gray-700">Contenido de la página...</p>

                {/* Overlay layer */}
                <div className="absolute inset-0 bg-white bg-opacity-80 backdrop-blur-sm flex items-center justify-center">
                    <Spinner size="lg" label="Cargando datos de la tabla..." />
                </div>
             </div>
        </div>
      </div>
    );
  }

    export default SpinnerExample;
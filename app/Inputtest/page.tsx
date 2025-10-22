  'use client';
  import React, { useState } from 'react';
  import Input from '../components/ui/Input';

  const FormExample = () => {
    const [nombreInsumo, setNombreInsumo] = useState('');
    const [cantidad, setCantidad] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (parseInt(cantidad) < 1) {
        setError('La cantidad debe ser mayor a 0.');
      } else {
        setError('');
        alert(`Insumo: ${nombreInsumo}, Cantidad: ${cantidad}`);
      }
    };
    
    // Example icon (using Heroicons syntax)
    const SearchIcon = (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
        </svg>
    );


    return (
      <form onSubmit={handleSubmit} className="p-10 bg-gray-100 space-y-6">
        <h2 className="text-xl font-bold text-blue-700">Formulario de Insumos</h2>
        
        <Input
          id="nombre-insumo"
          label="Nombre del Insumo"
          name="nombre"
          type="text"
          placeholder="Ej: Jeringas Desechables"
          value={nombreInsumo}
          onChange={(e) => setNombreInsumo(e.target.value)}
          icon={SearchIcon}
        />

        <Input
          id="cantidad-insumo"
          label="Cantidad a Solicitar"
          name="cantidad"
          type="number"
          placeholder="0"
          value={cantidad}
          onChange={(e) => {
            setCantidad(e.target.value);
            if (error) setError(''); // Clear error on change
          }}
          error={error}
        />

        <Input
          id="fecha-vencimiento"
          label="Fecha de Vencimiento"
          name="fechaVencimiento"
          type="date"
        />

        <Input
          id="disabled-input"
          label="Campo Deshabilitado"
          name="disabled"
          type="text"
          defaultValue="No se puede editar"
          disabled
        />
        
        <button type="submit" className="px-4 py-2 bg-lime-700 text-white rounded-md hover:bg-lime-800">
            Guardar Insumo
        </button>
      </form>
      );
  }

export default FormExample;
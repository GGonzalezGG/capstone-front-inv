"use client";

import React from 'react';
  import Table, { ColumnDef } from '../components/ui/Table';
  import Button from '../components/ui/Button'; // Asumiendo que tienes un componente Button

  // 1. Define the type for your data
  interface Insumo {
    id: number;
    nombre: string;
    cantidad: number;
    stockMinimo: number;
    fechaVencimiento: string;
  }

  // 2. Create some sample data
  const sampleData: Insumo[] = [
    { id: 1, nombre: 'Jeringas Desechables 5ml', cantidad: 150, stockMinimo: 50, fechaVencimiento: '2026-10-15' },
    { id: 2, nombre: 'Gasas Estériles', cantidad: 45, stockMinimo: 100, fechaVencimiento: '2025-08-20' },
    { id: 3, nombre: 'Alcohol Desinfectante 1L', cantidad: 80, stockMinimo: 30, fechaVencimiento: '2027-01-30' },
    { id: 4, nombre: 'Guantes de Nitrilo (Caja)', cantidad: 25, stockMinimo: 20, fechaVencimiento: '2025-12-01' },
  ];

  const InventoryPage = () => {
    // 3. Define the columns for the table
    const columns: ColumnDef<Insumo>[] = [
      {
        header: 'Nombre del Insumo',
        accessor: 'nombre',
      },
      {
        header: 'Cantidad Disponible',
        accessor: 'cantidad',
        // Custom render to show a warning badge if stock is low
        render: (item) => (
          <div className="flex items-center space-x-2">
            <span>{item.cantidad}</span>
            {item.cantidad < item.stockMinimo && (
              <span className="px-2 py-0.5 text-xs font-semibold text-red-800 bg-red-100 rounded-full">
                Stock Bajo
              </span>
            )}
          </div>
        )
      },
      {
        header: 'Fecha de Vencimiento',
        accessor: 'fechaVencimiento',
      },
      {
        header: 'Acciones',
        accessor: 'actions', // A special accessor for non-data columns
        render: (item) => (
          <div className="flex space-x-2">
            <Button variant="secondary" onClick={() => alert(`Editando ${item.nombre}`)}>
              Editar
            </Button>
            <Button variant="danger" onClick={() => alert(`Eliminando ${item.nombre}`)}>
              Eliminar
            </Button>
          </div>
        ),
      },
    ];

    return (
      <div className="p-10 bg-gray-100">
        <h1 className="text-2xl font-bold text-blue-700 mb-6">Gestión de Inventario</h1>
        <Table data={sampleData} columns={columns} />
      </div>
    );
  }

export default InventoryPage;
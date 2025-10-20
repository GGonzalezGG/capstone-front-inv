import React from 'react';

// Define the shape of a column.
// We use a generic <T> to make this component work with any data type.
export interface ColumnDef<T> {
  // The key from the data object to display in this column.
  accessor: keyof T | 'actions';
  // The text to display in the table header.
  header: string;
  // Optional: A custom render function for the cell content.
  // This is useful for formatting data or adding buttons.
  render?: (item: T) => React.ReactNode;
}

// Define the props for the main Table component.
// It requires a data array and a columns array.
// The data items must have an 'id' for React's key prop.
interface TableProps<T extends { id: string | number }> {
  data: T[];
  columns: ColumnDef<T>[];
  // Optional message to show when there is no data.
  emptyStateMessage?: string;
}

/**
 * A generic and reusable Table component.
 * It's strongly typed and configurable via props.
 *
 * @param {TableProps<T>} props
 */
const Table = <T extends { id: string | number }>({
  data,
  columns,
  emptyStateMessage = "No hay datos para mostrar."
}: TableProps<T>) => {
  return (
    <div className="w-full overflow-hidden border border-gray-200 rounded-lg shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.header}
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-bold text-blue-700 uppercase tracking-wider"
                >
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.length > 0 ? (
              data.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                  {columns.map((column) => (
                    <td
                      key={`${item.id}-${String(column.accessor)}`}
                      className="px-6 py-4 whitespace-nowrap text-sm text-gray-700"
                    >
                      {/* If a custom render function is provided, use it. Otherwise, display the data directly. */}
                      {column.render
                        ? column.render(item)
                        : (item[column.accessor as keyof T] as React.ReactNode)}
                    </td>
                  ))
                  }
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length} className="px-6 py-12 text-center text-gray-500">
                  {emptyStateMessage}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Table;

/*
  -----------------------------
  --- EJEMPLO DE USO ---
  -----------------------------
  
  import React from 'react';
  import Table, { ColumnDef } from './components/ui/Table';
  import Button from './components/ui/Button'; // Asumiendo que tienes un componente Button

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
*/

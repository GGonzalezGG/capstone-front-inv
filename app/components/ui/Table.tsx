import React from 'react';
import { Database } from 'lucide-react';

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
 * An enhanced, generic and reusable Table component with modern styling.
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
    <div className="w-full overflow-hidden border border-gray-200 rounded-xl shadow-md">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          {/* Enhanced header with gradient background */}
          <thead className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.header}
                  scope="col"
                  className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider"
                >
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          
          <tbody className="bg-white divide-y divide-gray-100">
            {data.length > 0 ? (
              data.map((item, index) => (
                <tr 
                  key={item.id} 
                  className={`
                    transition-all duration-200 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50
                    ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}
                  `}
                >
                  {columns.map((column) => (
                    <td
                      key={`${item.id}-${String(column.accessor)}`}
                      className="px-6 py-4 text-sm text-gray-700 font-medium"
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
                <td colSpan={columns.length} className="px-6 py-16">
                  <div className="flex flex-col items-center justify-center text-center space-y-4">
                    <div className="bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full p-6">
                      <Database className="w-12 h-12 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">
                        No hay datos disponibles
                      </h3>
                      <p className="text-gray-500 text-sm">
                        {emptyStateMessage}
                      </p>
                    </div>
                  </div>
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
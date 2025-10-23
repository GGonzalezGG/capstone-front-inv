"use client"; // ¡Importante! Los gráficos de recharts son componentes de cliente.

import React from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import Card from '../ui/Card'; // Ajusta la ruta a tu componente Card

// Definimos la estructura de los datos que recibirá el gráfico
interface ChartData {
  name: string; // Nombre del insumo (e.g., "Jeringas")
  quantity: number; // Cantidad actual
}

interface InventorySummaryChartProps {
  data: ChartData[];
  title: string;
}

/**
 * Un componente de gráfico de barras para el dashboard,
 * envuelto en un Card para consistencia visual.
 * Muestra un resumen de las cantidades de insumos.
 */
const InventorySummaryChart: React.FC<InventorySummaryChartProps> = ({ data, title }) => {
  return (
    <Card>
      <Card.Header>
        {title}
      </Card.Header>
      <Card.Body>
        {/* El div con altura es necesario para que ResponsiveContainer funcione */}
        <div style={{ width: '100%', height: 350 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{
                top: 5,
                right: 20,
                left: -10, // Ajusta el margen si los números del eje Y son grandes
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.5} />
              <XAxis 
                dataKey="name" 
                fontSize={12} 
                tickLine={false} 
                axisLine={false}
              />
              <YAxis 
                fontSize={12} 
                tickLine={false} 
                axisLine={false} 
                allowDecimals={false}
              />
              <Tooltip
                cursor={{ fill: 'rgba(239, 246, 255, 0.5)' }} // Color blue-50 con opacidad
                contentStyle={{ 
                  backgroundColor: '#ffffff', 
                  border: '1px solid #e0e0e0', 
                  borderRadius: '0.5rem',
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                }}
              />
              <Bar 
                dataKey="quantity" 
                fill="#1D4ED8" // Este es el color blue-700
                radius={[4, 4, 0, 0]} // Esquinas superiores redondeadas
                name="Cantidad"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card.Body>
    </Card>
  );
};

export default InventorySummaryChart;

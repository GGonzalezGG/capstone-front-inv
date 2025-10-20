import React from 'react';

const Card = ({ children, className = '' }: { children?: React.ReactNode; className?: string }) => {
  return (
    <div
      className={`
        bg-white rounded-lg shadow-md overflow-hidden 
        border-t-4 border-blue-800 
        transition-all duration-300 hover:shadow-xl
        ${className}
      `}
    >
      {children}
    </div>
  );
};

const Header = ({ children, className = '' }: { children?: React.ReactNode; className?: string }) => {
  return (
    <div className={`p-4 bg-blue-700 border-b border-gray-200 ${className}`}>
      {/* The main title text uses the blue-700 color */}
      <h3 className="text-lg font-semibold text-stone-100 tracking-wide">{children}</h3>
    </div>
  );
};


const Body = ({ children, className = '' }: { children?: React.ReactNode; className?: string }) => {
  return <div className={`p-4 text-gray-700 ${className}`}>{children}</div>;
};

const Footer = ({ children, className = '' }: { children?: React.ReactNode; className?: string }) => {
  return (
    <div className={`bg-gray-50 p-4 border-t border-gray-200 flex items-center ${className}`}>
      {children}
    </div>
  );
};

// Attaching the sub-components to the main Card component
// This is the core of the Compound Component pattern.
Card.Header = Header;
Card.Body = Body;
Card.Footer = Footer;

export default Card;

/*
  -----------------------------
  --- EJEMPLO DE USO ---
  -----------------------------
  Así es como puedes usar este componente en tus páginas.

  import Card from './components/ui/Card';
  import Button from './components/ui/Button'; // Asumiendo que tienes un componente Button

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
               // Asumiendo que tienes un componente Button
               // <Button variant="secondary">Ver Detalles</Button>
               // <Button variant="primary">Solicitar Insumo</Button>
               <p className="text-sm text-gray-500">Acciones</p>
            </div>
          </Card.Footer>
        </Card>
      </div>
    );
  }
*/


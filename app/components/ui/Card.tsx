import React from 'react';

const Card = ({ children, className = '' }: { children?: React.ReactNode; className?: string }) => {
  return (
    <div
      className={`
        bg-white rounded-lg shadow-md overflow-hidden 
        border-t-4 border-lime-700 
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

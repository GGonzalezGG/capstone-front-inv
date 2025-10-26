import React from 'react';

const Card = ({ children, className = '' }: { children?: React.ReactNode; className?: string }) => {
  return (
    <div
      className={`
        bg-white rounded-xl shadow-md overflow-hidden
        border border-gray-200
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
    <div className={`px-5 py-4 bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 ${className}`}>
      {children}
    </div>
  );
};

const Body = ({ children, className = '' }: { children?: React.ReactNode; className?: string }) => {
  return <div className={`px-5 py-5 text-gray-700 ${className}`}>{children}</div>;
};

const Footer = ({ children, className = '' }: { children?: React.ReactNode; className?: string }) => {
  return (
    <div className={`px-5 py-4 bg-gradient-to-r from-gray-50 to-blue-50/50 border-t border-gray-200 ${className}`}>
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
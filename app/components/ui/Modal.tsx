import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  className?: string;
}

interface ModalSubComponentProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * Header sub-component
 */
const Header: React.FC<ModalSubComponentProps & { onClose?: () => void }> = ({ children, className = '', onClose }) => {
  return (
    <div className={`flex items-center justify-between p-4 border-b border-gray-200 ${className}`}>
      <h3 className="text-lg font-semibold text-blue-700">{children}</h3>
      {onClose && (
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="Cerrar modal"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  );
};

/**
 * Body sub-component
 */
const Body: React.FC<ModalSubComponentProps> = ({ children, className = '' }) => {
  return <div className={`p-6 text-gray-700 ${className}`}>{children}</div>;
};

/**
 * Footer sub-component
 */
const Footer: React.FC<ModalSubComponentProps> = ({ children, className = '' }) => {
  return (
    <div className={`bg-gray-50 p-4 border-t border-gray-200 flex justify-end space-x-3 ${className}`}>
      {children}
    </div>
  );
};

type ModalType = React.FC<ModalProps> & {
  Header: typeof Header;
  Body: typeof Body;
  Footer: typeof Footer;
};

/**
 * The main Modal component.
 * Uses a React Portal and Tailwind's transition classes for a smooth entrance animation.
 */
const Modal = (({ isOpen, onClose, children, className = '' }: ModalProps) => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // When the modal is told to open, we trigger the animation after a tiny delay
      const timer = setTimeout(() => setShow(true), 10);
      return () => clearTimeout(timer);
    } else {
      // When closing, immediately hide for the next open
      setShow(false);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    if (isOpen) document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  return ReactDOM.createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className={`
          bg-white rounded-lg shadow-2xl w-full max-w-lg mx-4 overflow-hidden
          transform transition-all duration-200 ease-out
          ${show ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}
          ${className}
        `}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>,
    document.body
  );
}) as ModalType;

Modal.Header = Header;
Modal.Body = Body;
Modal.Footer = Footer;

export default Modal;


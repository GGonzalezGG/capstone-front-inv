import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import { X } from 'lucide-react';

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
 * Header sub-component with gradient background
 */
const Header: React.FC<ModalSubComponentProps & { onClose?: () => void }> = ({ children, className = '', onClose }) => {
  return (
    <div className={`flex items-center justify-between px-6 py-4 bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 ${className}`}>
      <h3 className="text-xl font-bold text-white">{children}</h3>
      {onClose && (
        <button
          onClick={onClose}
          className="text-white/80 hover:text-white hover:bg-white/20 transition-all duration-200 rounded-lg p-1.5 active:scale-95"
          aria-label="Cerrar modal"
        >
          <X className="w-5 h-5" />
        </button>
      )}
    </div>
  );
};

/**
 * Body sub-component with enhanced styling
 */
const Body: React.FC<ModalSubComponentProps> = ({ children, className = '' }) => {
  return <div className={`p-6 text-gray-700 max-h-[60vh] overflow-y-auto ${className}`}>{children}</div>;
};

/**
 * Footer sub-component with gradient background
 */
const Footer: React.FC<ModalSubComponentProps> = ({ children, className = '' }) => {
  return (
    <div className={`bg-gradient-to-r from-gray-50 to-blue-50/50 px-6 py-4 border-t border-gray-200 flex justify-end space-x-3 ${className}`}>
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
 * Enhanced Modal component with smooth animations and blur backdrop.
 * Uses a React Portal and Tailwind's transition classes for smooth entrance animation.
 */
const Modal = (({ isOpen, onClose, children, className = '' }: ModalProps) => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
      // Trigger animation after a tiny delay
      const timer = setTimeout(() => setShow(true), 10);
      return () => {
        clearTimeout(timer);
        document.body.style.overflow = 'unset';
      };
    } else {
      // When closing, immediately hide for the next open
      setShow(false);
      document.body.style.overflow = 'unset';
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
      className={`
        fixed inset-0 z-50 flex items-center justify-center
        bg-black/40 backdrop-blur-md
        transition-all duration-300 ease-out
        ${show ? 'opacity-100' : 'opacity-0'}
      `}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className={`
          bg-white rounded-xl shadow-2xl w-full max-w-2xl mx-4 overflow-hidden
          border border-gray-200
          transform transition-all duration-300 ease-out
          ${show ? 'scale-100 opacity-100 translate-y-0' : 'scale-95 opacity-0 translate-y-4'}
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
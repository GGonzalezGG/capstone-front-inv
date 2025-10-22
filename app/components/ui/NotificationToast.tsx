"use client";
import React, { useState, useEffect } from 'react';

// Define the variants for the notification toast.
type NotificationVariant = 'success' | 'error' | 'info';

// Define the props for the NotificationToast component.
export interface NotificationToastProps {
  // A unique identifier for the toast.
  id: string | number;
  // The main title of the notification.
  title: string;
  // A more detailed message for the notification.
  message: string;
  // The visual style of the toast. Defaults to 'info'.
  variant?: NotificationVariant;
  // The duration in milliseconds before the toast automatically dismisses. Defaults to 5000ms.
  duration?: number;
  // Callback function to dismiss the notification, passing its id.
  onDismiss: (id: string | number) => void;
}

// Icons for each variant
const Iicons = {
  success: (
    <svg className="w-6 h-6 text-lime-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  error: (
    <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  info: (
    <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
};

/**
 * A NotificationToast component to display brief, auto-expiring messages.
 * It's designed to be used within a notification container that manages its state.
 */
const NotificationToast: React.FC<NotificationToastProps> = ({
  id,
  title,
  message,
  variant = 'info',
  duration = 5000,
  onDismiss,
}) => {
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    // Set a timer to start the exit animation
    const exitTimer = setTimeout(() => {
      setIsExiting(true);
    }, duration);

    return () => {
      clearTimeout(exitTimer);
    };
  }, [duration]);

  useEffect(() => {
    if (isExiting) {
      // Set a timer to call onDismiss after the exit animation completes
      const dismissTimer = setTimeout(() => {
        onDismiss(id);
      }, 400); // This duration should match the exit animation duration

      return () => {
        clearTimeout(dismissTimer);
      };
    }
  }, [isExiting, id, onDismiss]);

  const handleClose = () => {
    setIsExiting(true);
  };

  // Base styles and variant-specific styles
  const baseClasses = 'w-full max-w-sm bg-white shadow-lg rounded-lg pointer-events-auto ring-1 ring-black ring-opacity-5 overflow-hidden';
  const transitionClasses = `transition-all duration-300 ease-in-out transform ${
    isExiting ? 'opacity-0 translate-x-full' : 'opacity-100 translate-x-0'
  }`;

  return (
    <div className={`${baseClasses} ${transitionClasses}`}>
      <div className="p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0">{Iicons[variant]}</div>
          <div className="ml-3 w-0 flex-1 pt-0.5">
            <p className="text-sm font-semibold text-gray-900">{title}</p>
            <p className="mt-1 text-sm text-gray-600">{message}</p>
          </div>
          <div className="ml-4 flex-shrink-0 flex">
            <button
              onClick={handleClose}
              className="bg-white rounded-md inline-flex text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <span className="sr-only">Close</span>
              <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationToast;


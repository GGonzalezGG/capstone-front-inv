import React from 'react';

// Rely on @types/react to provide proper JSX IntrinsicElements types.

// Define the props for the Input component.
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  // A unique identifier for the input and its label.
  id: string;
  // The text to display in the label associated with the input.
  label: string;
  // Optional: An error message to display below the input.
  error?: string;
  // Optional: An icon to display inside the input field.
  icon?: React.ReactNode;
  // Optional: Custom CSS classes for the container div.
  containerClassName?: string;
  // Optional: Custom CSS classes for the input element.
  className?: string;
}

/**
 * A reusable and accessible Input component with label, error handling, and icon support.
 * It forwards all standard HTML input attributes like 'name', 'type', 'placeholder', etc.
 */
const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ id, label, error, icon, className = '', containerClassName = '', ...props }: InputProps, ref: React.Ref<HTMLInputElement>) => {
    
    // Base styles for the input element
    const baseInputClasses = `
      block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm
      focus:outline-none focus:ring-1 
      transition duration-150 ease-in-out sm:text-sm
    `;

    // Conditional styles
    const focusClasses = 'focus:ring-blue-700 focus:border-blue-700';
    const errorClasses = 'border-red-500 text-red-900 placeholder-red-300 focus:ring-red-500 focus:border-red-500';
    const disabledClasses = 'bg-gray-100 cursor-not-allowed';
    const iconPaddingClass = icon ? 'pl-10' : '';

    const combinedInputClassName = `
      ${baseInputClasses}
      ${error ? errorClasses : focusClasses}
      ${props.disabled ? disabledClasses : ''}
      ${iconPaddingClass}
      ${className}
    `.trim();

    const errorId = `${id}-error`;

    return (
      <div className={`w-full ${containerClassName}`}>
        <label htmlFor={id} className="block text-sm font-medium mb-1">
          {label}
        </label>
        <div className="relative">
          {icon && (
            <div className="pointer-events-none absolute inset-y-0 left-0 pl-3 flex items-center">
              <span className={`h-5 w-5 ${error ? 'text-red-500' : 'text-gray-400'}`}>
                {icon}
              </span>
            </div>
          )}
          <input
            id={id}
            ref={ref}
            className={combinedInputClassName}
            aria-invalid={!!error}
            aria-describedby={error ? errorId : undefined}
            {...props}
          />
        </div>
        {error && (
          <p id={errorId} className="mt-2 text-sm text-red-600">
            {error}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;

import React from 'react';

/**
 * @typedef {'primary' | 'secondary' | 'danger'} ButtonVariant - The visual style of the button.
 */

/**
 * @typedef {object} ButtonProps
 * @property {import('react').ReactNode} children - The text or icon inside the button.
 * @property {() => void} [onClick] - The function to execute on click.
 * @property {ButtonVariant} [variant='primary'] - The button's visual style.
 * @property {'button' | 'submit' | 'reset'} [type='button'] - The native HTML button type.
 * @property {boolean} [disabled=false] - If true, the button will be disabled.
 * @property {string} [className] - Optional additional CSS classes for custom styling.
 */

/**
 * A versatile Button component with multiple variants.
 */
type ButtonVariant = 'primary' | 'secondary' | 'danger';

interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: ButtonVariant;
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
  className?: string;
}

const Button = ({
  children,
  onClick,
  variant = 'primary',
  type = 'button',
  disabled = false,
  className = '',
}: ButtonProps) => {
  // Base styles for all buttons
  const baseStyles = `
    inline-flex items-center justify-center px-4 py-2 rounded-md font-semibold 
    tracking-wide text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 
    transition-all duration-200 ease-in-out shadow-sm disabled:cursor-not-allowed
  `;

  // Styles specific to each variant
  const variantStyles = {
    primary: `
      bg-lime-700 text-white border border-transparent 
      hover:bg-lime-800 focus:ring-lime-500 disabled:bg-lime-300
    `,
    secondary: `
      bg-transparent text-blue-700 border border-blue-700 
      hover:bg-blue-50 focus:ring-blue-500 
      disabled:border-gray-300 disabled:text-gray-400 disabled:bg-gray-100
    `,
    danger: `
      bg-red-600 text-white border border-transparent 
      hover:bg-red-700 focus:ring-red-500 disabled:bg-red-300
    `,
  };

  const combinedClassName = `${baseStyles} ${variantStyles[variant]} ${className}`;

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={combinedClassName.trim()}
    >
      {children}
    </button>
  );
};

export default Button;

/*
  -----------------------------
  --- EJEMPLO DE USO ---
  -----------------------------

  import Button from './components/ui/Button';

  const ButtonShowcase = () => {
    return (
      <div className="p-10 bg-gray-100 flex flex-wrap gap-4 items-center">
        
        <div>
          <p className="font-mono text-sm mb-1">Primary</p>
          <Button onClick={() => alert('Primary Clicked!')}>
            Acción Principal
          </Button>
        </div>

        <div>
          <p className="font-mono text-sm mb-1">Secondary</p>
          <Button variant="secondary" onClick={() => alert('Secondary Clicked!')}>
            Acción Secundaria
          </Button>
        </div>

        <div>
          <p className="font-mono text-sm mb-1">Danger</p>
          <Button variant="danger" onClick={() => alert('Danger Clicked!')}>
            Eliminar Insumo
          </Button>
        </div>
        
        <div>
          <p className="font-mono text-sm mb-1">Disabled</p>
          <Button disabled>
            Botón Deshabilitado
          </Button>
        </div>

      </div>
    );
  }
*/

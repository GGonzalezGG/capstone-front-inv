import React from 'react';

/**
 * @typedef {'primary' | 'secondary' | 'danger' | 'success'} ButtonVariant - The visual style of the button.
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
 * An enhanced Button component with vibrant colors and smooth interactions.
 */
type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'success';

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
  // Base styles with enhanced effects
  const baseStyles = `
    inline-flex items-center justify-center px-4 py-2 rounded-lg font-semibold
    tracking-wide text-sm focus:outline-none focus:ring-2 focus:ring-offset-2
    transition-all duration-200 ease-in-out shadow-md
    disabled:cursor-not-allowed disabled:opacity-50
    active:scale-95 transform
  `;

  // Enhanced variant styles with brighter, modern colors
  const variantStyles = {
    primary: `
      bg-gradient-to-r from-lime-600 to-lime-700 text-white border border-transparent
      hover:from-lime-700 hover:to-lime-800 hover:shadow-lg
      focus:ring-lime-500 focus:ring-offset-2
      disabled:from-lime-300 disabled:to-lime-300 disabled:shadow-none
    `,
    secondary: `
      bg-gradient-to-r from-blue-500 to-blue-600 text-white border border-transparent
      hover:from-blue-600 hover:to-blue-700 hover:shadow-lg
      focus:ring-blue-500 focus:ring-offset-2
      disabled:from-blue-300 disabled:to-blue-300 disabled:shadow-none
    `,
    danger: `
      bg-gradient-to-r from-red-500 to-red-600 text-white border border-transparent
      hover:from-red-600 hover:to-red-700 hover:shadow-lg
      focus:ring-red-500 focus:ring-offset-2
      disabled:from-red-300 disabled:to-red-300 disabled:shadow-none
    `,
    success: `
      bg-gradient-to-r from-emerald-500 to-emerald-600 text-white border border-transparent
      hover:from-emerald-600 hover:to-emerald-700 hover:shadow-lg
      focus:ring-emerald-500 focus:ring-offset-2
      disabled:from-emerald-300 disabled:to-emerald-300 disabled:shadow-none
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
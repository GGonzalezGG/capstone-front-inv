import React from 'react';

// Define the possible variants for the badge.
type BadgeVariant = 'success' | 'warning' | 'danger' | 'info' | 'default';

// Define the props for the Badge component.
interface BadgeProps {
  // The content to be displayed inside the badge.
  children: React.ReactNode;
  // The visual style of the badge. Defaults to 'default'.
  variant?: BadgeVariant;
  // Optional custom CSS classes to apply to the badge.
  className?: string;
}

/**
 * A reusable Badge component to display status, counts, or labels.
 * It comes with several pre-defined color variants.
 */
const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  className = ''
}) => {
  // Base styles for all badges
  const baseClasses = 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold';

  // Variant-specific styles
  const getVariantClasses = (variant: BadgeVariant): string => {
    switch (variant) {
      case 'success':
        return 'bg-lime-100 text-lime-800';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800';
      case 'danger':
        return 'bg-red-100 text-red-800';
      case 'info':
        return 'bg-blue-100 text-blue-800';
      case 'default':
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const combinedClassName = `
    ${baseClasses}
    ${getVariantClasses(variant)}
    ${className}
  `.trim();

  return (
    <span className={combinedClassName}>
      {children}
    </span>
  );
};

export default Badge;

import React from 'react';

// Define the possible sizes for the spinner.
type SpinnerSize = 'sm' | 'md' | 'lg';

// Define the props for the Spinner component.
interface SpinnerProps {
  // The size of the spinner. Defaults to 'md'.
  size?: SpinnerSize;
  // Optional text label to display below the spinner.
  label?: string;
  // Optional custom CSS classes for the container div.
  className?: string;
}

/**
 * A simple and elegant SVG spinner component to indicate loading states.
 * It's customizable in size and can display an optional label.
 */
const Spinner: React.FC<SpinnerProps> = ({
  size = 'md',
  label,
  className = ''
}) => {
  // Define size-specific classes for the SVG
  const getSizeClasses = (spinnerSize: SpinnerSize): string => {
    switch (spinnerSize) {
      case 'sm':
        return 'h-5 w-5';
      case 'md':
        return 'h-8 w-8';
      case 'lg':
        return 'h-16 w-16';
      default:
        return 'h-8 w-8';
    }
  };

  const containerClasses = `flex flex-col items-center justify-center gap-2 ${className}`;
  const svgSizeClass = getSizeClasses(size);

  return (
    <div className={containerClasses} role="status" aria-label={label || 'Cargando'}>
      <svg
        className={`animate-spin text-blue-700 ${svgSizeClass}`}
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        ></circle>
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        ></path>
      </svg>
      {label && <span className="text-sm text-gray-600">{label}</span>}
    </div>
  );
};

export default Spinner;


import React, { ReactNode } from 'react';

// Define the semantic colors for the card's icon.
type StatColor = 'lime' | 'blue' | 'red' | 'yellow';

// Define the props for the StatCard component.
interface StatCardProps {
  // The main title/label for the statistic (e.g., "Stock Bajo").
  title: string;
  // The main value of the statistic (e.g., 15 or "$1.200.000").
  value: string | number;
  // An icon to be displayed. Recommended size is h-6 w-6 or h-8 w-8.
  icon: ReactNode;
  // An optional short description or trend (e.g., "+5% vs. mes anterior").
  description?: string;
  // The color variant, used for the icon's background. Defaults to 'blue'.
  color?: StatColor;
  // Optional custom CSS classes for the card.
  className?: string;
}

// Map color variants to their corresponding Tailwind CSS classes.
const colorMap: Record<StatColor, string> = {
  lime: 'bg-lime-100 text-lime-700',
  blue: 'bg-blue-100 text-blue-700',
  red: 'bg-red-100 text-red-700',
  yellow: 'bg-yellow-100 text-yellow-700',
};

/**
 * A StatCard component, ideal for dashboards.
 * It displays a key performance indicator (KPI) with a title, value, and a prominent icon.
 */
const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon,
  description,
  color = 'blue',
  className = ''
}) => {
  // Get the appropriate color classes for the icon background.
  const iconColorClasses = colorMap[color] || colorMap.blue;

  return (
    <div className={`bg-white shadow-lg rounded-xl p-5 ${className}`}>
      <div className="flex items-start justify-between">
        {/* Left side content (Title, Value, Description) */}
        <div>
          <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">
            {title}
          </p>
          <p className="text-3xl font-semibold text-gray-900 mt-1">
            {value}
          </p>
          {description && (
            <p className="text-sm text-gray-500 mt-2">
              {description}
            </p>
          )}
        </div>
        
        {/* Right side icon */}
        <div className={`flex-shrink-0 p-3 rounded-full ${iconColorClasses}`}>
          {icon}
        </div>
      </div>
    </div>
  );
};

export default StatCard;
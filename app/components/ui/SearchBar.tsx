"use client";

import React, { InputHTMLAttributes, useId } from 'react';
import Input from './Input'; // Asume que Input está en el mismo directorio

// --- Icono de Búsqueda ---
// En una app real, importarías esto desde lucide-react o similar
const SearchIcon = ({ className = 'w-5 h-5' }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
    />
  </svg>
);
// --- Fin Icono ---

// Extiende las props de un input nativo para que acepte 'onChange', 'value', 'placeholder', etc.
interface SearchBarProps extends InputHTMLAttributes<HTMLInputElement> {
  // value y onChange vendrán de InputHTMLAttributes
  // No necesitamos re-definirlos si extendemos.
}

/**
 * Un componente SearchBar que es un wrapper estilizado
 * alrededor del componente Input, con un ícono de búsqueda.
 */
// Corregido: Se elimina React.FC para evitar que 'children' se cuele en '...props'
const SearchBar = ({
  className = '',
  ...props // 'props' ahora es puramente InputHTMLAttributes
}: SearchBarProps) => {
  // Extrae id y placeholder para asegurar que no queden como possibly-undefined
  const { id: providedId, placeholder, ...rest } = props;
  const generatedId = useId();
  const id = providedId ?? `search-${generatedId}`;

  return (
    <div className={`relative ${className}`}>
      <Input
        id={id}
        type="search" // Usar type="search" es semánticamente correcto
        className="w-full" // Asegura que el input ocupe todo el wrapper
        // Corregido: Se añade el label requerido por Input, usando el placeholder
        // Asumimos que el componente Input ocultará visualmente este label
        // o lo mostrará. En cualquier caso, es requerido para accesibilidad.
        label={placeholder ?? 'Buscar'}
        icon={<SearchIcon className="w-5 h-5 text-gray-400" />}
        {...rest}
      />
    </div>
  );
};

export default SearchBar;


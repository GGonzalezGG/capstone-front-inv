"use client";

import React, { useState, useMemo, useRef, useEffect } from 'react';
import Input from './Input'; // Usamos tu componente Input
import Card from './Card'; // Usamos Card para el pop-up

// Define la estructura de las opciones que recibirá
export interface SearchableOption {
  value: string; // El ID
  label: string; // El texto a mostrar y buscar
}

interface SearchableSelectProps {
  options: SearchableOption[];
  value: string; // El valor (ID) seleccionado actualmente
  onChange: (value: string) => void; // Función para notificar el cambio
  id: string;
  label: string;
  placeholder?: string;
  disabled?: boolean;
}

/**
 * Un componente de "Select Buscable" (Combobox) que permite
 * escribir para filtrar una larga lista de opciones.
 */
const SearchableSelect: React.FC<SearchableSelectProps> = ({
  options,
  value,
  onChange,
  id,
  label,
  placeholder,
  disabled = false
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Encuentra la opción seleccionada para mostrar su 'label' cuando el input no está en foco
  const selectedOption = useMemo(() => 
    options.find(opt => opt.value === value),
  [options, value]);

  // Filtra las opciones basándose en lo que el usuario escribe
  const filteredOptions = useMemo(() => 
    options.filter(opt => 
      opt.label.toLowerCase().includes(searchTerm.toLowerCase())
    ),
  [options, searchTerm]);

  // Hook para cerrar el dropdown si se hace clic fuera
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchTerm(''); // Limpia la búsqueda al cerrar
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [wrapperRef]);

  // Maneja el cambio en el input de búsqueda
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setIsOpen(true); // Abre el dropdown al escribir
  };

  // Maneja el clic en una opción del dropdown
  const handleOptionClick = (option: SearchableOption) => {
    onChange(option.value); // Notifica el cambio
    setSearchTerm('');      // Limpia la búsqueda
    setIsOpen(false);     // Cierra el dropdown
  };

  // Determina qué mostrar en el input:
  const displayValue = isOpen 
    ? searchTerm 
    : (selectedOption?.label || '');

  return (
    <div className="relative w-full" ref={wrapperRef}>
      <Input
        id={id}
        label={label}
        type="text"
        value={displayValue}
        onChange={handleInputChange}
        onClick={() => setIsOpen(true)} // Abre al hacer clic
        placeholder={placeholder}
        disabled={disabled}
        autoComplete="off"
        containerClassName={label ? '' : 'mt-5'} 
      />

      {isOpen && (
        <div className="absolute z-10 w-full mt-1">
          <Card className="max-h-60 overflow-y-auto shadow-lg">
            <Card.Body className="p-2">
              {filteredOptions.length > 0 ? (
                filteredOptions.map(option => (
                  <div
                    key={option.value}
                    className={`px-4 py-2 text-sm text-gray-800 rounded-md hover:bg-blue-100 cursor-pointer ${
                      option.value === value ? 'bg-blue-100 font-semibold' : ''
                    }`}
                    onClick={() => handleOptionClick(option)}
                  >
                    {option.label}
                  </div>
                ))
              ) : (
                <p className="px-4 py-2 text-sm text-gray-500">No se encontraron resultados.</p>
              )}
            </Card.Body>
          </Card>
        </div>
      )}
    </div>
  );
};

export default SearchableSelect;
"use client";
  import React, { useState } from 'react';
  import RequestForm, { AvailableStockItem, Patient, RequestFormData } from '../components/features/RequestForm';
  
  // Datos simulados del inventario disponible
  const mockAvailableItems: AvailableStockItem[] = [
    { id: '1', name: 'Jeringas 5ml', stock: 150 },
    { id: '2', name: 'Guantes de Nitrilo (M)', stock: 45 },
    { id: '3', name: 'Gasas Estériles', stock: 300 },
    { id: '4', name: 'Mascarillas KN95', stock: 200 },
  ];

  // Datos simulados de pacientes
  const mockPatients: Patient[] = [
    { id: 'p1', name: 'Juan Pérez' },
    { id: 'p2', name: 'María González' },
    { id: 'p3', name: 'Carlos Sánchez' },
  ];

  const NewRequestPage = () => {
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = (data: RequestFormData) => {
      setIsSubmitting(true);
      console.log('Enviando Petición:', data);

      // Simular llamada a API
      setTimeout(() => {
        setIsSubmitting(false);
        console.log('Petición enviada con éxito');
        // Aquí podrías mostrar un NotificationToast de éxito
        // y redirigir al usuario (ej: con router.push('/dashboard/requests'))
      }, 2000);
    };

    const handleCancel = () => {
      // Lógica para volver a la página anterior
      console.log('Petición cancelada');
      // router.back();
    };

    return (
      <div className="p-8 bg-gray-100 min-h-screen">
        <div className="max-w-3xl mx-auto">
          <RequestForm
            availableItems={mockAvailableItems}
            patients={mockPatients} // Pasar la lista de pacientes
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            isSubmitting={isSubmitting}
          />
        </div>
      </div>
    );
  };

  export default NewRequestPage;
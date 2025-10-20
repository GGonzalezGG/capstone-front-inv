"use client";
import React, { useState } from 'react';
  import Modal from '../components/ui/Modal';
  import Button from '../components/ui/Button'; // Asumiendo que tienes un componente Button

  const MyPageComponent = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);

    const openModal = () => setIsModalOpen(true);
    const closeModal = () => setIsModalOpen(false);

    return (
      <div className="p-10">
        <Button onClick={openModal}>Abrir Modal</Button>

        <Modal isOpen={isModalOpen} onClose={closeModal}>
          <Modal.Header onClose={closeModal}>
            Confirmar Acción
          </Modal.Header>
          <Modal.Body>
            <p>¿Estás seguro de que deseas solicitar 50 unidades de "Jeringas Desechables"?</p>
            <p className="text-sm text-gray-500 mt-2">Esta acción registrará una nueva petición de insumos y no se puede deshacer.</p>
          </Modal.Body>
          <Modal.Footer>
            <Button onClick={closeModal} variant="secondary">
              Cancelar
            </Button>
            <Button onClick={() => {
              // Lógica para confirmar la acción
              console.log('Acción confirmada');
              closeModal();
            }}>
              Confirmar Solicitud
            </Button>
          </Modal.Footer>
        </Modal>
      </div>
    );
  }

  export default MyPageComponent;
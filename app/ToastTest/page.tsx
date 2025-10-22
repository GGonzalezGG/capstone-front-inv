 "use client";
 import React, { useState } from 'react';
  import NotificationToast, { NotificationToastProps } from '../components/ui/NotificationToast';
  import Button from '../components/ui/Button'; // Asumiendo que tienes un componente Button

  const NotificationExample = () => {
    const [notifications, setNotifications] = useState<Omit<NotificationToastProps, 'onDismiss'>[]>([]);

    const addNotification = (variant: 'success' | 'error' | 'info') => {
      const newNotification = {
        id: new Date().getTime(),
        title: '',
        message: '',
        variant,
      };

      switch (variant) {
        case 'success':
          newNotification.title = '¡Éxito!';
          newNotification.message = 'El insumo ha sido agregado al inventario correctamente.';
          break;
        case 'error':
          newNotification.title = 'Error de Conexión';
          newNotification.message = 'No se pudo guardar el cambio. Revisa tu conexión.';
          break;
        case 'info':
          newNotification.title = 'Stock Bajo';
          newNotification.message = 'Quedan menos de 10 unidades de "Jeringas".';
          break;
      }

      setNotifications(prev => [...prev, newNotification]);
    };

    const removeNotification = (id: string | number) => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    };

    return (
      <div className="p-10 bg-gray-50">
        <h2 className="w-full text-xl font-bold text-blue-700 mb-4">Ejemplos de Notificaciones</h2>
        <div className="flex space-x-4">
          <Button onClick={() => addNotification('success')}>Notificación de Éxito</Button>
          <Button onClick={() => addNotification('error')} variant="danger">Notificación de Error</Button>
          <Button onClick={() => addNotification('info')} variant="secondary">Notificación de Información</Button>
        </div>

        {/* --- Notification Container --- */}
        <div
          aria-live="assertive"
          className="fixed inset-0 flex items-end px-4 py-6 pointer-events-none sm:p-6 sm:items-start"
        >
          <div className="w-full flex flex-col items-center space-y-4 sm:items-end">
            {notifications.map((notif) => (
              <NotificationToast
                key={notif.id}
                {...notif}
                onDismiss={removeNotification}
              />
            ))}
          </div>
        </div>
      </div>
    );
  };

    export default NotificationExample;
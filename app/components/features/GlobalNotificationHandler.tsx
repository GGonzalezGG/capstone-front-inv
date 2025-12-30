"use client";

import React, { useState, useEffect } from "react";
import { io, Socket } from "socket.io-client";
import { useAuth } from "@/app/contexts/AuthContext";
import NotificationToast, {
  NotificationToastProps,
} from "../ui/NotificationToast";

// 1. Definir el tipo de notificación que esperamos del backend
interface BackendNotification {
  id: string | number;
  type: "REQUEST" | "LOW_STOCK" | string; // Tipos que envía el backend
  title: string;
  message: string;
}

// 2. Definir el tipo que espera el NotificationToast
type ToastNotification = Omit<NotificationToastProps, "onDismiss">;

const GlobalNotificationHandler: React.FC = () => {
  const [notifications, setNotifications] = useState<ToastNotification[]>([]);
  const { token } = useAuth(); // Obtenemos el token de nuestro AuthContext

  useEffect(() => {
    // Solo intentar conectar si tenemos un token
    if (!token) {
      return;
    }

    // 3. Conectar al servidor de Socket.IO (en la URL base del backend)
    // Pasamos el token en 'auth' como requiere tu middleware
    const socket: Socket = io(process.env.NEXT_PUBLIC_SOCKET_URL, {
      auth: {
        token: token,
      },
    });

    socket.on("connect", () => {
      console.log("Socket.IO conectado con ID:", socket.id);
    });

    // 4. Escuchar el evento 'new_notification' que definiste en el backend
    socket.on("new_notification", (notification: BackendNotification) => {
      console.log("Nueva notificación recibida:", notification);
      addNotification(notification);
    });

    socket.on("disconnect", () => {
      console.log("Socket.IO desconectado");
    });

    socket.on("connect_error", (err) => {
      console.error("Error de conexión Socket.IO:", err.message);
    });

    // 5. Limpieza: Desconectar el socket cuando el componente se desmonte o el token cambie
    return () => {
      socket.disconnect();
    };
  }, [token]); // Este efecto se re-ejecuta si el token cambia (ej. login/logout)

  // 6. Función para añadir notificaciones al estado
  const addNotification = (notification: BackendNotification) => {
    // Mapear el 'type' del backend al 'variant' del frontend
    let variant: "success" | "error" | "info" = "info";
    if (notification.type === "REQUEST") {
      variant = "success"; // Usamos 'success' para nuevas peticiones
    } else if (notification.type === "LOW_STOCK") {
      variant = "error"; // Usamos 'error' para alertas de stock (más urgente)
    } else if (notification.type === "EXPIRY_ALERT") {
      variant = "info";
    }

    const newNotification: ToastNotification = {
      id: new Date().getTime(), // ID único para el toast
      title: notification.title,
      message: notification.message,
      variant: variant,
    };

    setNotifications((prev) => [...prev, newNotification]);
  };

  // 7. Función para eliminar notificaciones del estado
  const removeNotification = (id: string | number) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  // 8. Renderizar el contenedor de Toasts (markup de ToastTest/page.tsx)
  return (
    <div
      aria-live="assertive"
      className="fixed inset-0 flex items-end px-4 py-6 pointer-events-none sm:p-6 sm:items-start z-50"
    >
      <div className="w-full flex flex-col items-center space-y-4 sm:items-end">
        {notifications.map((notif) => (
          <NotificationToast
            key={notif.id}
            {...notif}
            onDismiss={removeNotification}
            duration={600000}
          />
        ))}
      </div>
    </div>
  );
};

export default GlobalNotificationHandler;

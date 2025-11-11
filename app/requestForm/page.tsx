"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import RequestForm, {
  AvailableStockItem,
  Patient,
  RequestFormData,
} from "../components/features/RequestForm";
import Header from "../components/ui/Header";
import { useAuth } from "../contexts/AuthContext"; // 1. Importar Auth
import Spinner from "../components/ui/Spinner"; // 2. Importar Spinner

// Tipos del backend
interface BackendItem {
  id: string;
  name: string;
  quantityInStock: number;
}
interface BackendPatient {
  id: string;
  name: string;
}

const NewRequestPage = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true); // 3. Estado de carga
  const [availableItems, setAvailableItems] = useState<AvailableStockItem[]>(
    []
  );
  const [patients, setPatients] = useState<Patient[]>([]);
  const { token } = useAuth(); // 4. Obtener token
  const router = useRouter();

  // 5. useEffect para cargar datos (Insumos y Pacientes)
  useEffect(() => {
    if (!token) return;

    const fetchData = async () => {
      setIsLoadingData(true);
      try {
        // Cargar Insumos (GET /api/v1/inventory)
        const itemsRes = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/inventory`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        if (!itemsRes.ok) throw new Error("Error al cargar insumos");
        const itemsData = await itemsRes.json();
        const formattedItems = (itemsData.data as BackendItem[]).map(
          (item) => ({
            id: item.id,
            name: item.name,
            stock: item.quantityInStock, // Mapeo de campos
          })
        );
        setAvailableItems(formattedItems);

        // Cargar Pacientes (GET /api/v1/patients)
        const patientsRes = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/patients`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        if (!patientsRes.ok) throw new Error("Error al cargar pacientes");
        const patientsData = await patientsRes.json();
        setPatients(patientsData.data as BackendPatient[]);
      } catch (error) {
        console.error(error);
        // Aquí mostrar un toast de error
      } finally {
        setIsLoadingData(false);
      }
    };

    fetchData();
  }, [token]);

  // 6. handleSubmit actualizado para llamar al backend
  const handleSubmit = async (data: RequestFormData) => {
    setIsSubmitting(true);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/requests`, {
        //
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data), // El 'data' del formulario ya coincide con el DTO
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || "Error al crear la petición");
      }

      // Éxito
      console.log("Petición enviada con éxito");
      // Aquí mostrar un NotificationToast de éxito
      router.push("/requestList"); // Redirigir a la lista de peticiones
    } catch (error: any) {
      console.error(error);
      setIsSubmitting(false);
      // Aquí mostrar un toast de error con error.message
    }
  };

  const handleCancel = () => {
    router.back(); // Volver a la página anterior
  };

  return (
    <div className="p-8 bg-gray-100 min-h-screen">
      <Header />
      <div className="max-w-3xl mx-auto py-16">
        {" "}
        {/* Añadido py-16 para el header fijo */}
        {/* 7. Mostrar Spinner mientras se cargan los datos iniciales */}
        {isLoadingData ? (
          <div className="flex justify-center items-center h-64">
            <Spinner label="Cargando datos..." />
          </div>
        ) : (
          <RequestForm
            availableItems={availableItems}
            patients={patients}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            isSubmitting={isSubmitting}
          />
        )}
      </div>
    </div>
  );
};

export default NewRequestPage;

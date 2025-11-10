import axios from 'axios';

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
});

// 1. Interceptor de Solicitud (Request)
// Se ejecuta ANTES de que cada solicitud se envíe.
apiClient.interceptors.request.use(
  (config) => {
    // Obtiene el token de localStorage (o de donde lo guardes)
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 2. Interceptor de Respuesta (Response)
// Maneja errores globales, especialmente el 401 (No Autorizado)
apiClient.interceptors.response.use(
  (response) => response, // Simplemente retorna la respuesta si es exitosa
  (error) => {
    if (error.response && error.response.status === 401) {
      // Si el token es inválido o expiró
      localStorage.removeItem('authToken');
      localStorage.removeItem('authUser');
      
      // Redirige al login. Usamos window.location para asegurarnos
      // que se refresque el estado de la app.
      window.location.href = '/login'; 
    }
    return Promise.reject(error);
  }
);

export default apiClient;
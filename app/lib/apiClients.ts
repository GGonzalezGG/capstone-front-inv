import axios from 'axios';

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true, // <-- LA MAGIA: Le dice al navegador "envía las cookies seguras"
});

// Ya NO necesitamos el Interceptor de Solicitud (Request) para el token.
// El navegador adjuntará la cookie HttpOnly de forma automática e invisible.

// Interceptor de Respuesta (Response) para manejar el 401
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Si el backend nos rechaza (cookie expirada o inválida)
      localStorage.removeItem('authUser'); // Solo limpiamos los datos de UI
      window.location.href = '/login'; 
    }
    return Promise.reject(error);
  }
);

export default apiClient;
import axios from 'axios';
import { API_URL } from '../config/api'; // Tu archivo con la IP local

// Instancia de Axios usando tu configuración existente
const api = axios.create({
  baseURL: API_URL,
});

// Interceptor para inyectar tus credenciales en cada petición
api.interceptors.request.use(async (config) => {
  // Aquí tu lógica actual para recuperar el token del almacenamiento del celular
  // const token = await ...
  
  config.headers.Authorization = `Bearer TU_TOKEN_DE_LOGIN`; 
  config.headers['negocioId'] = '1'; // Obligatorio para el tenantMiddleware del backend
  return config;
});

export const chatService = {
  // 1. Integración con GET /api/chat/conversaciones (Devuelve el array [])
  getConversaciones: async () => {
    const response = await api.get('/chat/conversaciones');
    return response.data;
  },

  // 2. Integración con GET /api/chat/mensajes/:jid
  getMensajes: async (jid: string) => {
    const response = await api.get(`/chat/mensajes/${jid}`);
    return response.data;
  },

  // 3. Integración con POST /api/chat/enviar/:jid
  enviarMensaje: async (jid: string, texto: string) => {
    const response = await api.post(`/chat/enviar/${jid}`, { texto });
    return response.data;
  }
};
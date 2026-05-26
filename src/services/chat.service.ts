import axios from 'axios';
import { API_URL } from '../config/api'; 
// Si usas Expo/React Native, descombenta tu librería de almacenamiento preferida:
// import AsyncStorage from '@react-native-async-storage/async-storage'; 

const api = axios.create({
  baseURL: API_URL,
});

// Interceptor asíncrono para inyectar credenciales reales del dispositivo
api.interceptors.request.use(async (config) => {
  try {
    // 1. Recuperar el token real guardado en el celular (ejemplo con AsyncStorage)
    // const token = await AsyncStorage.getItem('userToken');
    // if (token) {
    //   config.headers.Authorization = `Bearer ${token}`;
    // }
    
    // Por ahora dejamos tu boceto limpio, pero dinámico:
    config.headers.Authorization = `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiZW1haWwiOiJhZG1pbkB0ZXN0LmNvbSIsInJvbCI6IkFETUlOIiwibmVnb2Npb0lkIjoxLCJpYXQiOjE3Nzk2NjI5NDksImV4cCI6MTc4MDI2Nzc0OX0.A9bvfbbtw696uWsUP1CtuKJF1ePcZoacUtjN0O_VO9w`; 

    // 2. Inyectar el negocioId para el tenantMiddleware
    config.headers['negocioid'] = '1'; // Es buena práctica usar minúsculas en HTTP headers
    
  } catch (error) {
    console.error('Error recuperando credenciales en interceptor:', error);
  }
  return config;
});

export const chatService = {
  // 1. Obtener lista de conversaciones
  getConversaciones: async () => {
    const response = await api.get('/chat/conversaciones');
    return response.data;
  },

  // 2. Obtener mensajes (Protegido con encodeURIComponent)
  getMensajes: async (jid: string) => {
    const jidCodificado = encodeURIComponent(jid);
    const response = await api.get(`/chat/mensajes/${jidCodificado}`);
    return response.data;
  },

  // 3. Enviar mensaje manual (Protegido con encodeURIComponent)
  enviarMensaje: async (jid: string, texto: string) => {
    const jidCodificado = encodeURIComponent(jid);
    const response = await api.post(`/chat/enviar/${jidCodificado}`, { texto });
    return response.data;
  }
};
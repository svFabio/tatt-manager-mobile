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
    config.headers.Authorization = `Bearer TU_TOKEN_DE_LOGIN`; 

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
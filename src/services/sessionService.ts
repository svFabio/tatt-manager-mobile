import axios from 'axios';
import { API_URL } from '../config/api';

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 10000,
});

export interface Session {
  id: number;
  nombre: string;
  telefono: string;
  zona: string;
  horas?: number;
  fecha: string;
  horario: string;
  cotizacion: number;
  estado?: string;
}

export const sessionService = {
  // Obtener todas las sesiones
  getAll: async (negocioId: number = 1): Promise<Session[]> => {
    try {
      const response = await api.get(`/sessions?negocioId=${negocioId}`);
      return response.data;
    } catch (error: any) {
      console.error('Error getAll:', error);
      throw new Error(error.response?.data?.error || 'Error al obtener sesiones');
    }
  },

  // Crear nueva sesión
  create: async (data: any): Promise<Session> => {
    try {
      const response = await api.post('/sessions', {
        nombre: data.nombre,
        telefono: data.telefono,
        zona: data.zona,
        horas: data.horas,
        fecha: data.fecha,
        horario: data.horario,
        cotizacion: data.cotizacion,
        negocioId: 1
      });
      return response.data.session;
    } catch (error: any) {
      console.error('Error create:', error);
      throw new Error(error.response?.data?.error || 'Error al crear sesión');
    }
  },

  // Actualizar sesión
  update: async (id: number, data: any): Promise<Session> => {
    try {
      const response = await api.put(`/sessions/${id}`, {
        nombre: data.nombre,
        telefono: data.telefono,
        zona: data.zona,
        horas: data.horas,
        fecha: data.fecha,
        horario: data.horario,
        cotizacion: data.cotizacion,
        estado: 'CONFIRMADA'
      });
      return response.data.session;
    } catch (error: any) {
      console.error('Error update:', error);
      throw new Error(error.response?.data?.error || 'Error al actualizar sesión');
    }
  },

  // Eliminar sesión
  delete: async (id: number): Promise<void> => {
    try {
      console.log(`📡 Enviando DELETE a /sessions/${id}`);
      const response = await api.delete(`/sessions/${id}`);
      console.log('✅ DELETE response:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ Error delete:', error);
      throw new Error(error.response?.data?.error || 'Error al eliminar la sesión');
    }
  },
};

export default sessionService;
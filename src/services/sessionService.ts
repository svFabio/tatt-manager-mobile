import api from '../api/axios';
import type { AxiosError } from 'axios';

const axiosMsg = (error: unknown, fallback: string): string => {
  const e = error as AxiosError<{ error?: string }>;
  return e?.response?.data?.error ?? fallback;
};

export interface Session {
  id: number;
  nombre: string;
  telefono: string;
  zona: string;
  tamano?: string;
  horas?: number;
  fecha: string;
  horario: string;
  cotizacion: number;
  estado?: string;
}

export interface CreateSessionDTO {
  nombre: string;
  telefono: string;
  zona: string;
  tamano?: string;
  horas?: number;
  fecha: string;
  horario: string;
  cotizacion: number;
}

export interface UpdateSessionDTO extends CreateSessionDTO {}

export const sessionService = {
  // Obtener todas las sesiones
  getAll: async (): Promise<Session[]> => {
    try {
      const response = await api.get('/sessions');
      return response.data;
    } catch (error: unknown) {
      throw new Error(axiosMsg(error, 'Error al obtener sesiones'));
    }
  },

  // Crear nueva sesión
  create: async (data: CreateSessionDTO): Promise<Session> => {
    try {
      const response = await api.post('/citas/admin', {
        clienteNombre: data.nombre,
        clienteTelefono: data.telefono,
        zonaDelCuerpo: data.zona,
        tamanoEnCm: data.tamano,
        duracionEnHoras: data.horas,
        fecha: data.fecha,
        horario: data.horario,
        cotizacion: data.cotizacion
      });
      return response.data;
    } catch (error: unknown) {
      throw new Error(axiosMsg(error, 'Error al crear sesión'));
    }
  },

  // Actualizar sesión
  update: async (id: number, data: UpdateSessionDTO): Promise<Session> => {
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
    } catch (error: unknown) {
      throw new Error(axiosMsg(error, 'Error al actualizar sesión'));
    }
  },

  // Eliminar sesión
  delete: async (id: number): Promise<void> => {
    try {
      const response = await api.delete(`/sessions/${id}`);
      return response.data;
    } catch (error: unknown) {
      throw new Error(axiosMsg(error, 'Error al eliminar la sesión'));
    }
  },
};

export default sessionService;
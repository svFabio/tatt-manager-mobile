import api from './axios';

export interface Negocio {
  id: number;
  nombre: string;
}

export interface Configuracion {
  horaApertura: string;
  horaCierre: string;
}

export interface CitaConflicto {
  id: number;
  cliente: string;
  inicio: string;
  fin: string;
}

export interface ConfiguracionResponse {
  config: Configuracion;
  advertencia: {
    mensaje: string;
    citas: CitaConflicto[];
  } | null;
}

export interface ConfiguracionQR {
  qrContenido: string;
  qrContenido_publicId: string | null;
}

export const ConfiguracionAPI = {
  actualizarNombreEstudio: (nombre: string): Promise<Negocio> =>
    api.patch<{ negocio: Negocio }>('/negocio/nombre', { nombre }).then(r => r.data.negocio),

  actualizarHorario: (
    datos: Partial<Pick<Configuracion, 'horaApertura' | 'horaCierre'>>
  ): Promise<ConfiguracionResponse> =>
    api.patch<ConfiguracionResponse>('/configuracion', datos).then(r => r.data),

  subirQR: (imagen: { uri: string; mimeType?: string }): Promise<ConfiguracionQR> => {
    const formData = new FormData();
    formData.append('foto', {
      uri: imagen.uri,
      type: imagen.mimeType ?? 'image/jpeg',
      name: 'qr.jpg',
    } as any);
    return api
      .patch<{ config: ConfiguracionQR }>('/configuracion/qr', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 60000,
      })
      .then(r => r.data.config);
  },

  eliminarQR: (): Promise<ConfiguracionQR> =>
    api.delete<{ config: ConfiguracionQR }>('/configuracion/qr').then(r => r.data.config),
};
